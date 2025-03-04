import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getAllUsers,
  deleteUser,
  getAllEvents,
  getAllBookings,
  getAllPayments,
  getAdminStats,
} from "../controllers/adminController.js";

const router = express.Router();

//  Routes réservées aux administrateurs

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Récupérer tous les utilisateurs
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès
 *       401:
 *         description: Non autorisé
 */
router.get("/users", authMiddleware, getAllUsers);

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur à supprimer
 *     responses:
 *       200:
 *         description: Utilisateur supprimé avec succès
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Utilisateur non trouvé
 */
router.delete("/users/:id", authMiddleware, deleteUser);

/**
 * @swagger
 * /admin/events:
 *   get:
 *     summary: Récupérer tous les événements
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Liste des événements récupérée avec succès
 *       401:
 *         description: Non autorisé
 */
router.get("/events", authMiddleware, getAllEvents);

/**
 * @swagger
 * /admin/bookings:
 *   get:
 *     summary: Récupérer toutes les réservations
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Liste des réservations récupérée avec succès
 *       401:
 *         description: Non autorisé
 */
router.get("/bookings", authMiddleware, getAllBookings);

/**
 * @swagger
 * /admin/payments:
 *   get:
 *     summary: Récupérer tous les paiements
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Liste des paiements récupérée avec succès
 *       401:
 *         description: Non autorisé
 */
router.get("/payments", authMiddleware, getAllPayments);

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Récupérer les statistiques administratives
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 *       401:
 *         description: Non autorisé
 */
router.get("/stats", authMiddleware, getAdminStats);

export default router;
