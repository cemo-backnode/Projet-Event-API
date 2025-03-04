import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//  Lister tous les utilisateurs
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, nom: true, email: true, role: true } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs." });
  }
};

//  Supprimer un utilisateur
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Utilisateur supprimé avec succès." });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression de l'utilisateur." });
  }
};

//  Voir tous les événements
export const getAllEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({ include: { organisateur: true, typeEvenement: true } });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des événements." });
  }
};

//  Voir toutes les réservations
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({ include: { participant: true, événement: true } });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des réservations." });
  }
};

//  Voir tous les paiements
export const getAllPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({ include: { réservation: { include: { événement: true } } } });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des paiements." });
  }
};

// Dashboard des statistiques
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalEvents = await prisma.event.count();
    const totalBookings = await prisma.booking.count();
    const totalPayments = await prisma.payment.count();

    res.json({ totalUsers, totalEvents, totalBookings, totalPayments });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des statistiques." });
  }
};
