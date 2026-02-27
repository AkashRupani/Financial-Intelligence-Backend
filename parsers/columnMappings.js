module.exports = {
    HDFC: {
        date: ["Date", "Value Dt"],
        description: ["Narration"],
        debit: ["Withdrawal Amt.", "Withdrawal Amt"],
        credit: ["Deposit Amt.", "Deposit Amt"],
        balance: ["Closing Balance"]
    },

    ICICI: {
        date: ["Transaction Date"],
        description: ["Transaction Remarks", "Description"],
        debit: ["Debit"],
        credit: ["Credit"],
        balance: ["Balance"]
    }
};
