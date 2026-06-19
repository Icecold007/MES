const express = require("express");
const router = express.Router();
const drawController = require("../controllers/drawController");
const verifyToken = require("../middleware/authMiddleware");

router.post("/save", verifyToken, drawController.saveProductionEntry);
router.get(
  "/report/:barcodeId",
  verifyToken,
  drawController.getReportByBarcode,
);

module.exports = router;
