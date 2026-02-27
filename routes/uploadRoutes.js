const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadBankStatement } = require("../controllers/uploadController");

const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files allowed"));
    }
  }
});

router.post("/bank-statement", upload.single("file"), uploadBankStatement);

module.exports = router;
