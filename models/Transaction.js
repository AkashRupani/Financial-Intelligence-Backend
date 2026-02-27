const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        // Later this will come from auth
        userId: {
        type: String,
        required: false,
        },

        type: {
        type: String,
        enum: ["income", "expense"],
        required: true,
        },

        bank: {
        type: String,
        required: true,
        },

        amount: {
        type: Number,
        required: true,
        },
        
        balance: {
        type: Number,
        required: true,
        },

        description: {
        type: String,
        },

        date: {
        type: Date,
        required: true,
        },
    },
    {
        timestamps: true, // adds createdAt & updatedAt automatically
    }
);

module.exports = mongoose.model("Transaction", transactionSchema);
