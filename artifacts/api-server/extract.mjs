import { ReplitConnectors } from "@replit/connectors-sdk";
import { writeFileSync, mkdirSync } from "node:fs";
const connectors = new ReplitConnectors();
const SHEET_ID = "1V_IHJn3ZAyVMdJo9oX3skYt2xunid37naSRN3_L2ohs";
const SHEET_NAME = "lista de alumnos";
const range = encodeURIComponent(`${SHEET_NAME}!A1:I1500`);
const resp = await connectors.proxy("google-sheet", `/v4/spreadsheets/${SHEET_ID}/values/${range}`, { method: "GET" });
const data = await resp.json();
const rows = data.values || [];
const header = rows[0] || [];
const emailIdx = header.indexOf("email");
const emails = new Set();
for (let i = 1; i < rows.length; i++) {
  const e = (rows[i][emailIdx] || "").trim().toLowerCase();
  if (e && e.includes("@")) emails.add(e);
}
const sorted = [...emails].sort();
const target = "/home/runner/workspace/artifacts/api-server/data/allowed-emails.csv";
mkdirSync("/home/runner/workspace/artifacts/api-server/data", { recursive: true });
writeFileSync(target, "email\n" + sorted.join("\n") + "\n");
console.log("Saved", sorted.length, "emails to", target);
