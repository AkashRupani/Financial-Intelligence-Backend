const VendorMapping = require("../models/VendorMapping");

async function categorizeTransaction(description) {

    const fingerprint = extractVendorFingerprint(description);

    // 1️⃣ Check vendor memory
    const vendor = await VendorMapping.findOne({
        vendorFingerprint: fingerprint
    });

    if (vendor) {
        return {
        category: vendor.category,
        fingerprint
        };
    }

    // 2️⃣ Rule engine
    const ruleCategory = categorizeByRules(description);

    if (ruleCategory) {
        return {
        category: ruleCategory,
        fingerprint
        };
    }

    // 3️⃣ fallback
    return {
        category: "Uncategorized",
        fingerprint
    };
}

module.exports.categorizeTransaction = categorizeTransaction;

function extractVendorFingerprint(description = "") {
    const text = description.toLowerCase();

    // Extract UPI handle if present
    const upiMatch = text.match(/[a-z0-9._-]+@[a-z]+/);

    if (upiMatch) {
        return upiMatch[0];
    }

    // fallback: first meaningful words
    const cleaned = text
        .replace(/upi|payment|from|phone/g, "")
        .replace(/[^a-z0-9 ]/g, " ")
        .trim();

    const parts = cleaned.split(" ");

    return parts.slice(0, 2).join(" ");
}

module.exports.extractVendorFingerprint = extractVendorFingerprint;

const categoryRules = [
    {
        category: "Food",
        keywords: ["swiggy", "zomato", "dominos", "pizza", "restaurant"]
    },
    {
        category: "Travel",
        keywords: ["uber", "ola", "irctc", "metro"]
    },
    {
        category: "Shopping",
        keywords: ["amazon", "flipkart", "myntra"]
    },
    {
        category: "Bills",
        keywords: ["airtel", "electricity", "recharge", "gas"]
    },
    {
        category: "Subscriptions",
        keywords: ["netflix", "spotify"]
    }
];

function categorizeByRules(description = "") {
    const text = description.toLowerCase();

    for (const rule of categoryRules) {
        if (rule.keywords.some(k => text.includes(k))) {
        return rule.category;
        }
    }

    return null;
}

module.exports.categorizeByRules = categorizeByRules;