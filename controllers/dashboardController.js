const Transaction = require("../models/Transaction");

exports.getDashboardData = async (req, res) => {
  try {
    // ⚠️ TEMP: no auth yet, so no userId filtering
    // Later you can re-add: const userId = req.user.id;

    const baseMatch = {
      date: { $type: "date" },
      amount: { $type: "number" }
    };

    // 1️⃣ Income Summary
    const income = await Transaction.aggregate([
      { $match: { ...baseMatch, type: "income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // 2️⃣ Expense Summary
    const expenses = await Transaction.aggregate([
      { $match: { ...baseMatch, type: "expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalIncome = income[0]?.total || 0;
    const totalExpense = expenses[0]?.total || 0;
    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome
      ? Math.round((balance / totalIncome) * 100)
      : 0;

    // 3️⃣ Category Breakdown
    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {...baseMatch,type: "expense"}
      },
      {
        $group: {_id: { $ifNull: ["$category", "Others"] },
        amount: { $sum: "$amount" }
        }
      }
    ]);

    // 4️⃣ Monthly Trend
    const monthlyTrend = await Transaction.aggregate([
      {
        $match: {
          ...baseMatch,
          type: "expense"
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            year: { $year: "$date" }
          },
          amount: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // 5️⃣ Insights (placeholder)
    const insights = [
      {
        type: "warning",
        message: "Your food expenses increased this month"
      }
    ];

    res.json({
      summary: {
        balance,
        income: totalIncome,
        expenses: totalExpense,
        savingsRate
      },
      categoryBreakdown: categoryBreakdown.map(c => ({
        category: c._id,
        amount: c.amount
      })),
      monthlyTrend: monthlyTrend.map(m => ({
        month: `${m._id.month}/${m._id.year}`,
        amount: m.amount
      })),
      insights
    });

  } catch (error) {
    console.error("DASHBOARD ERROR:", error);
    res.status(500).json({
      message: "Dashboard data error",
      error: error.message
    });
  }
};
