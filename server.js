const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("./config/db");
connectDB();


const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/test", require("./routes/testRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/upload", require("./routes/uploadCsvRoutes"));




app.get("/", (req, res) => {
    res.send("Finance API Running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
