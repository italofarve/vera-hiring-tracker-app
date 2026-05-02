import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ReplitConnectors } from "@replit/connectors-sdk";
import { logger } from "./logger";

const SHEET_ID =
  process.env.ALLOWED_EMAILS_SHEET_ID ||
  "1V_IHJn3ZAyVMdJo9oX3skYt2xunid37naSRN3_L2ohs";
const SHEET_NAME = process.env.ALLOWED_EMAILS_SHEET_NAME || "lista de alumnos";
const EMAIL_COLUMN_HEADER =
  process.env.ALLOWED_EMAILS_COLUMN_HEADER || "email";
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

const __dirname = (() => {
  try {
    return dirname(fileURLToPath(import.meta.url));
  } catch {
    return process.cwd();
  }
})();

const CSV_FALLBACK_PATHS = [
  resolve(__dirname, "../../data/allowed-emails.csv"),
  resolve(__dirname, "../data/allowed-emails.csv"),
  resolve(process.cwd(), "data/allowed-emails.csv"),
  resolve(process.cwd(), "artifacts/api-server/data/allowed-emails.csv"),
  "/app/data/allowed-emails.csv",
];

interface CacheState {
  emails: Set<string>;
  source: "google-sheet" | "csv-fallback" | "empty";
  loadedAt: number;
}

let cache: CacheState | null = null;
let inflight: Promise<CacheState> | null = null;

function readCsvFallback(): Set<string> {
  for (const csvPath of CSV_FALLBACK_PATHS) {
    if (!existsSync(csvPath)) continue;
    try {
      const raw = readFileSync(csvPath, "utf8");
      const lines = raw.split(/\r?\n/);
      const header = (lines[0] || "").toLowerCase().trim();
      const startIdx = header === "email" ? 1 : 0;
      const set = new Set<string>();
      for (let i = startIdx; i < lines.length; i++) {
        const e = lines[i].trim().toLowerCase();
        if (e && e.includes("@")) set.add(e);
      }
      logger.info({ csvPath, count: set.size }, "Loaded allowed emails from CSV fallback");
      return set;
    } catch (err) {
      logger.warn({ err, csvPath }, "Failed to read CSV fallback");
    }
  }
  return new Set();
}

async function fetchFromGoogleSheet(): Promise<Set<string>> {
  const connectors = new ReplitConnectors();
  const range = encodeURIComponent(`${SHEET_NAME}!A1:Z2000`);
  const resp = await connectors.proxy(
    "google-sheet",
    `/v4/spreadsheets/${SHEET_ID}/values/${range}`,
    { method: "GET" },
  );
  if (!resp.ok) {
    throw new Error(
      `Google Sheets request failed: ${resp.status} ${resp.statusText}`,
    );
  }
  const data = (await resp.json()) as { values?: string[][] };
  const rows = data.values || [];
  if (rows.length === 0) return new Set();

  const header = rows[0].map((h) => (h || "").toLowerCase().trim());
  let emailIdx = header.indexOf(EMAIL_COLUMN_HEADER.toLowerCase());
  if (emailIdx === -1) {
    // fallback: try columns containing "@" sample in second row
    if (rows[1]) {
      emailIdx = rows[1].findIndex(
        (cell) => typeof cell === "string" && cell.includes("@"),
      );
    }
  }
  if (emailIdx === -1) {
    throw new Error(
      `Could not locate "${EMAIL_COLUMN_HEADER}" column in sheet "${SHEET_NAME}"`,
    );
  }

  const set = new Set<string>();
  for (let i = 1; i < rows.length; i++) {
    const e = (rows[i][emailIdx] || "").trim().toLowerCase();
    if (e && e.includes("@")) set.add(e);
  }
  return set;
}

async function loadFromSource(): Promise<CacheState> {
  try {
    const emails = await fetchFromGoogleSheet();
    if (emails.size > 0) {
      logger.info(
        { count: emails.size, sheetId: SHEET_ID },
        "Loaded allowed emails from Google Sheet",
      );
      return { emails, source: "google-sheet", loadedAt: Date.now() };
    }
    logger.warn("Google Sheet returned 0 emails, falling back to CSV");
  } catch (err) {
    logger.warn(
      { err: (err as Error).message },
      "Could not fetch from Google Sheet, using CSV fallback",
    );
  }

  const fallback = readCsvFallback();
  return {
    emails: fallback,
    source: fallback.size > 0 ? "csv-fallback" : "empty",
    loadedAt: Date.now(),
  };
}

async function getCache(forceRefresh = false): Promise<CacheState> {
  const now = Date.now();
  if (
    !forceRefresh &&
    cache &&
    now - cache.loadedAt < REFRESH_INTERVAL_MS &&
    cache.emails.size > 0
  ) {
    return cache;
  }
  if (inflight) return inflight;

  inflight = loadFromSource()
    .then((next) => {
      cache = next;
      return next;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export async function isEmailAllowed(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes("@")) return false;
  const state = await getCache();
  if (state.source === "empty") {
    logger.error("Allowed emails list is empty — denying access");
    return false;
  }
  return state.emails.has(normalized);
}

export async function getAllowedEmailsStatus(): Promise<{
  count: number;
  source: CacheState["source"];
  loadedAt: number;
}> {
  const state = await getCache();
  return {
    count: state.emails.size,
    source: state.source,
    loadedAt: state.loadedAt,
  };
}

export async function refreshAllowedEmails(): Promise<{
  count: number;
  source: CacheState["source"];
}> {
  const state = await getCache(true);
  return { count: state.emails.size, source: state.source };
}
