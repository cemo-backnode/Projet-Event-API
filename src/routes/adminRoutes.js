import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getAllUsers, deleteUser, getAllEvents, getAllBookings, getAllPayments, getAdminStats } from "../controllers/adminController.js";

const router = express.Router();

//  Routes réservées aux administrateurs
router.get("/users", authMiddleware, getAllUsers);
router.delete("/users/:id", authMiddleware, deleteUser);
router.get("/events", authMiddleware, getAllEvents);
router.get("/bookings", authMiddleware, getAllBookings);
router.get("/payments", authMiddleware, getAllPayments);
router.get("/stats", authMiddleware, getAdminStats);

export default router;
