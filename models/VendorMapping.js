const mongoose = require("mongoose");

const vendorMappingSchema = new mongoose.Schema({
    vendorFingerprint: {
        type: String,
        required: true,
        index: true
    },
    category: {
        type: String,
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("VendorMapping", vendorMappingSchema);