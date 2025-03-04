import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { createBooking, getUserBookings, cancelBooking } from "../controllers/bookingController.js";

const router = express.Router();

// Réserver un événement
router.post("/", authMiddleware, createBooking);

//  Voir mes réservations
router.get("/mine", authMiddleware, getUserBookings);

// Annuler une réservation
router.delete("/:id", authMiddleware, cancelBooking);

export default router;
