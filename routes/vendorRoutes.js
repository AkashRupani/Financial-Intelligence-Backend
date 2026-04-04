const express = require("express");
const router = express.Router();

const VendorMapping = require("../models/VendorMapping");

router.post("/learn", async (req, res) => {

  const transactions = req.body.transactions;

  try {

    for (const tx of transactions) {

      if (!tx.vendorFingerprint) continue;

      await VendorMapping.updateOne(
        { vendorFingerprint: tx.vendorFingerprint },
        { category: tx.category },
        { upsert: true }
      );

    }

    res.json({ success: true });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});

module.exports = router;