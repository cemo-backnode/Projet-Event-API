import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Réserver un événement
export const createBooking = async (req, res) => {
  try {
    const { eventId } = req.body;
    const participantId = req.user.id;

    // Vérifier si l'événement existe
    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
    });
    if (!event) return res.status(404).json({ error: "Événement non trouvé." });

    // Vérifier si l'événement a encore des places
    const reservations = await prisma.booking.count({
      where: { eventId: parseInt(eventId) },
    });
    if (reservations >= event.capaciteMax) {
      return res.status(400).json({ error: "Plus de places disponibles." });
    }

    // Vérifier si le participant est déjà inscrit
    const existingBooking = await prisma.booking.findFirst({
      where: { eventId: parseInt(eventId), participantId },
    });
    if (existingBooking)
      return res.status(400).json({ error: "Déjà inscrit à cet événement." });

    // Déterminer le statut de la réservation
    const statut = event.payant && event.prix > 0 ? "en_attente" : "confirmee";

    // Créer la réservation
    const booking = await prisma.booking.create({
      data: {
        eventId: parseInt(eventId),
        participantId,
        statut,
      },
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error("ERREUR SERVER :", error); // Log l'erreur complète
    res.status(500).json({ error: "Erreur lors de la réservation." });
  }
};

// Voir ses réservations
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { participantId: req.user.id },
      include: { event: true },
    });
    res.json(bookings);
  } catch (error) {
    console.error("ERREUR SERVER :", error); // Log l'erreur complète
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des réservations." });
  }
};

// Annuler une réservation
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const participantId = req.user.id;

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
    });
    if (!booking)
      return res.status(404).json({ error: "Réservation non trouvée." });

    if (booking.participantId !== participantId) {
      return res
        .status(403)
        .json({ error: "Vous ne pouvez pas annuler cette réservation." });
    }

    await prisma.booking.delete({ where: { id: parseInt(id) } });

    res.json({ message: "Réservation annulée avec succès." });
  } catch (error) {
    console.error("ERREUR SERVER :", error); // Log l'erreur complète
    res
      .status(500)
      .json({ error: "Erreur lors de l'annulation de la réservation." });
  }
};
