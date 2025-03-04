import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { createAirtelPayment, checkAirtelPaymentStatus, refundAirtelPayment } from "../controllers/paymentController.js";

const router = express.Router();

// Effectuer un paiement Airtel Money
router.post("/airtel", authMiddleware, createAirtelPayment);

// Vérifier le statut d’un paiement
router.get("/airtel/:transactionId", authMiddleware, checkAirtelPaymentStatus);

// Rembourser un paiement
router.post("/airtel/refund/:transactionId", authMiddleware, refundAirtelPayment);

export default router;
