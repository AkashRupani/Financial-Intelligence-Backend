const columnMappings = require("./columnMappings");
const { categorizeTransaction } = require("../categorization/categorizationEngine");

function normalizeHeader(header) {
  return header
    .replace(/\uFEFF/g, "")
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
function parseDateSafe(value) {
  if (value === null || value === undefined || value === "") return null;

  // Convert numeric strings to numbers
  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    value = Number(value.trim());
  }

  // Excel serial date (number)
  if (typeof value === "number") {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const millis = value * 86400000;
    return new Date(excelEpoch.getTime() + millis);
  }

  if (typeof value === "string") {
    const cleaned = value.trim();

    // DD-MM-YYYY or DD/MM/YYYY
    const match = cleaned.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
    if (match) {
      const day = Number(match[1]);
      const month = Number(match[2]) - 1;
      const year = Number(match[3]);

      return new Date(Date.UTC(year, month, day));
    }

    // Sometimes CSV exports DD-MM-YY
    const shortMatch = cleaned.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{2})$/);
    if (shortMatch) {
      const day = Number(shortMatch[1]);
      const month = Number(shortMatch[2]) - 1;
      const year = 2000 + Number(shortMatch[3]);

      return new Date(Date.UTC(year, month, day));
    }

    // ISO fallback only
    if (/^\d{4}-\d{2}-\d{2}/.test(cleaned)) {
      const parsed = new Date(cleaned);
      if (!isNaN(parsed)) return parsed;
    }
  }

  return null;
}

function getValue(row, possibleColumns) {
  const normalizedRow = {};

  for (const key of Object.keys(row)) {
    normalizedRow[normalizeHeader(key)] = row[key];
  }

  for (const col of possibleColumns) {
    const normalizedCol = normalizeHeader(col);
    if (
      normalizedRow[normalizedCol] !== undefined &&
      normalizedRow[normalizedCol] !== ""
    ) {
      return normalizedRow[normalizedCol];
    }
  }

  return null;
}
function isSummaryRow(row) {
  const text = Object.values(row)
    .join(" ")
    .toLowerCase();

  const summaryKeywords = [
    "statement summary",
    "opening balance",
    "closing balance",
    "closing bal",
    "debits",
    "credits",
    "total",
  ];

  return summaryKeywords.some(keyword => text.includes(keyword));
}

async function parseStatement(rows, bank) {
  const mapping = columnMappings[bank];
  if (!mapping) throw new Error("Unsupported bank format");

  const transactions = [];

  for (const row of rows) {
    if (isSummaryRow(row)) continue;
    const rawDate = getValue(row, mapping.date);
    const date = parseDateSafe(rawDate);

    // 🔴 CRITICAL SAFETY CHECK
    if (!date) continue;

    const debit = Number(getValue(row, mapping.debit)) || 0;
    const credit = Number(getValue(row, mapping.credit)) || 0;

    // Skip rows that are not real transactions
    if (!debit && !credit) continue;

    const { category, fingerprint } =
    await categorizeTransaction(description);

    transactions.push({
      date,
      description,
      vendorFingerprint: fingerprint,
      category,
      type: debit > 0 ? "expense" : "income",
      amount: debit > 0 ? debit : credit,
      balance: Number(getValue(row, mapping.balance)) || 0,
      bank
    });
  }

  return transactions;
}

module.exports = parseStatement;
