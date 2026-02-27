const fs = require("fs");
const pdfParse = require("pdf-parse");
const Transaction = require("../models/Transaction");
const parseTransactionsFromText = require("../services/pdfParser");

exports.uploadBankStatement = async (req, res) => {
try {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const pdfBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(pdfBuffer);

    const transactions = parseTransactionsFromText(pdfData.text);

    await Transaction.insertMany(transactions);

    res.json({
        message: "Bank statement processed successfully",
        transactionsInserted: transactions.length
    });

}catch (error) {
    res.status(500).json({ error: error.message });
}
};
