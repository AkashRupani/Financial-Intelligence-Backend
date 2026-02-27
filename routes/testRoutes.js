const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");

router.get("/test-transaction", async (req, res) => {
    const tx = await Transaction.create({
        type: "expense",
        category: "Food",
        amount: 250,
        description: "Test transaction",
        date: new Date(),
    });

    res.json(tx);
});

module.exports = router;
