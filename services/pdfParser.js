function detectCategory(description) {
    const text = description.toLowerCase();

    if (text.includes("swiggy") || text.includes("zomato")) return "Food";
    if (text.includes("uber") || text.includes("ola")) return "Travel";
    if (text.includes("netflix") || text.includes("spotify")) return "Entertainment";
    if (text.includes("amazon") || text.includes("flipkart")) return "Shopping";
    if (text.includes("electricity") || text.includes("water") || text.includes("bill"))
        return "Bills";

    return "Others";
}
function parseDate(dateStr) {
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day);
}

function parseTransactionsFromText(text) {
    const lines = text.split("\n");
    const transactions = [];

    for (const line of lines) {
        // Simple regex for: date description amount
        const match = line.match(
        /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(-?\d+\.\d{2})/
    );


    if (!match) continue;

    const [, dateStr, description, amount] = match;
        const parsedDate = parseDate(dateStr);

    transactions.push({
        type: "expense",
        category: detectCategory(description),
        amount: Math.abs(Number(amount)),
        description,
        date: parsedDate
    });
    }

    return transactions;
}
module.exports = parseTransactionsFromText;
