import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createBooking,
  getUserBookings,
  cancelBooking,
} from "../controllers/bookingController.js";

const router = express.Router();

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Réserver un événement
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Réservation créée avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.post("/", authMiddleware, createBooking);

/**
 * @swagger
 * /bookings/mine:
 *   get:
 *     summary: Voir mes réservations
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: Liste des réservations récupérée avec succès
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get("/mine", authMiddleware, getUserBookings);

/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     summary: Annuler une réservation
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la réservation à annuler
 *     responses:
 *       200:
 *         description: Réservation annulée avec succès
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Réservation non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.delete("/:id", authMiddleware, cancelBooking);

export default router;
