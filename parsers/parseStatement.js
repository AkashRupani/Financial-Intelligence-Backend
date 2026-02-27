const columnMappings = require("./columnMappings");

function normalizeHeader(header) {
  return header
    .replace(/\uFEFF/g, "")
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// function parseDate(dateStr) {
//   if (!dateStr) return null;

//   const parts = dateStr.split(/[\/\-]/);
//   if (parts.length !== 3) return null;

//   const [day, month, year] = parts.map(Number);
//   const date = new Date(year, month - 1, day);

//   return isNaN(date.getTime()) ? null : date;
// }
function parseDateSafe(value) {
  if (!value) return null;

  // Case 1: Already a Date object
  if (value instanceof Date && !isNaN(value)) {
    return value;
  }

  // Case 2: Excel serial number (e.g. 45123)
  if (typeof value === "number") {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const parsed = new Date(excelEpoch.getTime() + value * 86400000);
    return isNaN(parsed) ? null : parsed;
  }

  // Case 3: String dates (DD/MM/YYYY or DD-MM-YYYY)
  if (typeof value === "string") {
    const cleaned = value.trim();

    const match = cleaned.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (match) {
      const day = Number(match[1]);
      const month = Number(match[2]) - 1;
      const year = Number(match[3]);

      const parsed = new Date(Date.UTC(year, month, day));
      return isNaN(parsed) ? null : parsed;
    }

    // Case 4: ISO string
    const iso = new Date(cleaned);
    if (!isNaN(iso)) return iso;
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

function parseStatement(rows, bank) {
  const mapping = columnMappings[bank];
  if (!mapping) throw new Error("Unsupported bank format");

  const transactions = [];

  for (const row of rows) {
    const rawDate = getValue(row, mapping.date);
    const date = parseDateSafe(rawDate);

    // 🔴 CRITICAL SAFETY CHECK
    if (!date) continue;

    const debit = Number(getValue(row, mapping.debit)) || 0;
    const credit = Number(getValue(row, mapping.credit)) || 0;

    // Skip rows that are not real transactions
    if (!debit && !credit) continue;

    transactions.push({
      date,
      description: getValue(row, mapping.description) || "N/A",
      type: debit > 0 ? "expense" : "income",
      amount: debit > 0 ? debit : credit,
      balance: Number(getValue(row, mapping.balance)) || 0,
      bank,
    });
  }

  return transactions;
}

module.exports = parseStatement;
