const express = require("express");
const multer = require("multer");
const fs = require("fs");
const csv = require("csv-parser");
const { Readable } = require("stream");

const findHeaderRow = require("../parsers/detectBank");
const parseStatement = require("../parsers/parseStatement");
const Transaction = require("../models/Transaction");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

/**
 * Reads file as raw text
 */
function readRawCsv(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

/**
 * Finds the CSV line index where the transaction table starts
 */
function findCsvHeaderLineIndex(lines) {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();

    if (
      line.includes("date") &&
      line.includes("narration") &&
      (line.includes("withdrawal") || line.includes("debit")) &&
      (line.includes("deposit") || line.includes("credit"))
    ) {
      return i;
    }
  }
  return -1;
}

router.post("/csv", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // 1️⃣ Read raw CSV text
    const rawText = readRawCsv(req.file.path);
    const lines = rawText.split(/\r?\n/);

    // 2️⃣ Find where the transaction table starts
    const headerLineIndex = findCsvHeaderLineIndex(lines);

    if (headerLineIndex === -1) {
      return res.status(400).json({
        error:
          "Could not locate transaction table. Please upload a bank-exported CSV file.",
      });
    }

    // 3️⃣ Rebuild CSV starting ONLY from header line
    const cleanCsvText = lines.slice(headerLineIndex).join("\n");

    // 4️⃣ Parse cleaned CSV into rows
    const rows = [];

    Readable.from(cleanCsvText)
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", async () => {
        if (!rows.length) {
          return res.status(400).json({
            error: "No transaction rows found in CSV",
          });
        }

        // 5️⃣ Detect bank & header row
        const { bank } = findHeaderRow(rows);

        if (bank === "UNKNOWN") {
          return res.status(400).json({
            error: "Unsupported bank format",
          });
        }

        // 6️⃣ Parse normalized transactions
        const transactions = parseStatement(rows, bank);

        if (!transactions.length) {
          return res.status(400).json({
            error: "No valid transactions parsed",
          });
        }

        // 7️⃣ Save to DB
        await Transaction.insertMany(transactions);

        res.json({
          bankDetected: bank,
          transactionsInserted: transactions.length,
        });
      });
  } catch (err) {
    console.error("CSV UPLOAD ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
router.post("/csv/preview", upload.single("file"), async (req, res) => {
  try {
    const rawText = fs.readFileSync(req.file.path, "utf8");
    const lines = rawText.split(/\r?\n/);

    const headerLineIndex = findCsvHeaderLineIndex(lines);
    if (headerLineIndex === -1) {
      return res.status(400).json({
        error: "Could not locate transaction table in CSV"
      });
    }

    const cleanCsvText = lines.slice(headerLineIndex).join("\n");

    const rows = [];
    Readable.from(cleanCsvText)
      .pipe(csv())
      .on("data", row => rows.push(row))
      .on("end", () => {
        const { bank } = findHeaderRow(rows);
        if (bank === "UNKNOWN") {
          return res.status(400).json({ error: "Unsupported bank format" });
        }

        const transactions = parseStatement(rows, bank);

        res.json({
          bank,
          totalTransactions: transactions.length,
          transactions
        });
      });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/csv/confirm", async (req, res) => {
  try {
    const { transactions } = req.body;

    if (!transactions || !transactions.length) {
      return res.status(400).json({ error: "No transactions to save" });
    }

    await Transaction.insertMany(transactions);

    res.json({
      message: "Transactions saved successfully",
      count: transactions.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
