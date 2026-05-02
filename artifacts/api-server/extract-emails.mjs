import { ReplitConnectors } from "@replit/connectors-sdk";
import { writeFileSync } from "node:fs";
const connectors = new ReplitConnectors();
const SHEET_ID = "1V_IHJn3ZAyVMdJo9oX3skYt2xunid37naSRN3_L2ohs";
const SHEET_NAME = "lista de alumnos";

const range = encodeURIComponent(`${SHEET_NAME}!A1:I1500`);
const resp = await connectors.proxy("google-sheet", `/v4/spreadsheets/${SHEET_ID}/values/${range}`, { method: "GET" });
const data = await resp.json();
const rows = data.values || [];
const header = rows[0] || [];
const emailIdx = header.indexOf("email");
console.log("Email column index:", emailIdx);

const emails = new Set();
for (let i = 1; i < rows.length; i++) {
  const e = (rows[i][emailIdx] || "").trim().toLowerCase();
  if (e && e.includes("@")) emails.add(e);
}
const sorted = [...emails].sort();
console.log("Unique emails extracted:", sorted.length);
console.log("First 5:", sorted.slice(0, 5));

writeFileSync("data/allowed-emails.csv", "email\n" + sorted.join("\n") + "\n");
console.log("Saved to data/allowed-emails.csv");
