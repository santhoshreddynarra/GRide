const express = require("express");
const router = express.Router();
const { createPayment, getPaymentForJob } = require("../controllers/paymentController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

router.use(protect);

// POST /api/payments — initiate (simulated) payment
router.post("/", restrictTo("provider"), createPayment);

// GET /api/payments/job/:jobId — get payment details for a job
router.get("/job/:jobId", getPaymentForJob);

module.exports = router;
