const columnMappings = require("./columnMappings");

/**
 * Finds the row index where transaction table starts
 */
function findHeaderRow(rows) {
    for (let i = 0; i < rows.length; i++) {
        const headers = Object.keys(rows[i]);

        for (const bank in columnMappings) {
        const mapping = columnMappings[bank];

        const hasDate = mapping.date.some(col => headers.includes(col));
        const hasDescription = mapping.description.some(col => headers.includes(col));

        if (hasDate && hasDescription) {
            return { bank, headerRowIndex: i };
        }
        }
    }

    return { bank: "UNKNOWN", headerRowIndex: -1 };
}

module.exports = findHeaderRow;
