import { ReplitConnectors } from "@replit/connectors-sdk";
const connectors = new ReplitConnectors();
const SHEET_ID = "1V_IHJn3ZAyVMdJo9oX3skYt2xunid37naSRN3_L2ohs";

const meta = await connectors.proxy("google-sheet", `/v4/spreadsheets/${SHEET_ID}`, { method: "GET" });
const data = await meta.json();
console.log("Title:", data.properties?.title);
for (const s of data.sheets || []) {
  console.log(`Sheet: "${s.properties.title}" (gid=${s.properties.sheetId}) rows=${s.properties.gridProperties?.rowCount}`);
}

// Look at first sheet (or one with gid 1890673232)
const target = (data.sheets || []).find(s => s.properties.sheetId === 1890673232) || data.sheets[0];
const sheetName = target.properties.title;
console.log("\n--- Reading from sheet:", sheetName, "---");

const range = encodeURIComponent(`${sheetName}!A1:Z20`);
const valsResp = await connectors.proxy("google-sheet", `/v4/spreadsheets/${SHEET_ID}/values/${range}`, { method: "GET" });
const vals = await valsResp.json();
console.log("First rows:");
for (const row of (vals.values || []).slice(0, 10)) {
  console.log(JSON.stringify(row));
}
