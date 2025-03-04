import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createAirtelPayment,
  checkAirtelPaymentStatus,
  refundAirtelPayment,
} from "../controllers/paymentController.js";

const router = express.Router();

/**
 * @swagger
 * /payments/airtel:
 *   post:
 *     summary: Effectuer un paiement Airtel Money
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Paiement effectué avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.post("/airtel", authMiddleware, createAirtelPayment);

/**
 * @swagger
 * /payments/airtel/{transactionId}:
 *   get:
 *     summary: Vérifier le statut d’un paiement
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la transaction à vérifier
 *     responses:
 *       200:
 *         description: Statut du paiement récupéré avec succès
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Transaction non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get("/airtel/:transactionId", authMiddleware, checkAirtelPaymentStatus);

/**
 * @swagger
 * /payments/airtel/refund/{transactionId}:
 *   post:
 *     summary: Rembourser un paiement
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la transaction à rembourser
 *     responses:
 *       200:
 *         description: Paiement remboursé avec succès
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Transaction non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.post(
  "/airtel/refund/:transactionId",
  authMiddleware,
  refundAirtelPayment
);

export default router;
