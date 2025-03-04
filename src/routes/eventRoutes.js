import express from "express";
import { PrismaClient } from "@prisma/client";
import authMiddleware from "../middleware/authMiddleware.js";

const prisma = new PrismaClient();
const router = express.Router();

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Créer un événement (Organisateur)
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titre:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               heureDebut:
 *                 type: string
 *                 format: date-time
 *               heureFin:
 *                 type: string
 *                 format: date-time
 *               lieu:
 *                 type: string
 *               prix:
 *                 type: number
 *               capaciteMax:
 *                 type: number
 *               payant:
 *                 type: boolean
 *               typeEvenementId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Événement créé avec succès
 *       400:
 *         description: Le type d'événement est requis ou invalide
 *       403:
 *         description: Seuls les organisateurs peuvent créer un événement
 *       500:
 *         description: Erreur lors de la création de l'événement
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      titre,
      description,
      date,
      heureDebut,
      heureFin,
      lieu,
      prix,
      capaciteMax,
      payant,
      typeEvenementId,
    } = req.body;

    // Vérifier que seul un organisateur peut créer un événement
    if (req.user.role !== "organisateur") {
      return res
        .status(403)
        .json({ error: "Seuls les organisateurs peuvent créer un événement." });
    }

    // Vérifier si le type d'événement est fourni et existe
    if (!typeEvenementId) {
      return res.status(400).json({ error: "Le type d'événement est requis." });
    }

    const typeExists = await prisma.eventType.findUnique({
      where: { id: parseInt(typeEvenementId) },
    });

    if (!typeExists) {
      return res.status(400).json({ error: "Type d'événement invalide." });
    }

    // Création de l'événement
    const event = await prisma.event.create({
      data: {
        titre,
        description,
        date: new Date(date),
        heureDebut: new Date(heureDebut),
        heureFin: new Date(heureFin),
        lieu,
        prix,
        capaciteMax,
        payant,
        organisateurId: req.user.id,
        typeEvenementId: parseInt(typeEvenementId),
      },
    });

    res.status(201).json(event);
  } catch (error) {
    console.error("❌ ERREUR SERVER :", error); // Log l'erreur complète
    res
      .status(500)
      .json({ error: "Erreur lors de la création de l'événement." });
  }
});

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Récupérer tous les événements avec filtres & pagination
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: integer
 *         description: Filtrer par type d'événement
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrer par date
 *       - in: query
 *         name: lieu
 *         schema:
 *           type: string
 *         description: Filtrer par lieu
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de la page pour la pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'éléments par page pour la pagination
 *     responses:
 *       200:
 *         description: Liste des événements récupérée avec succès
 *       500:
 *         description: Erreur lors de la récupération des événements
 */
router.get("/", async (req, res) => {
  try {
    const { type, date, lieu, page = 1, limit = 10 } = req.query;
    const filters = {};

    if (type) filters.typeEvenementId = parseInt(type);
    if (date) filters.date = new Date(date);
    if (lieu) filters.lieu = { contains: lieu, mode: "insensitive" };

    const events = await prisma.event.findMany({
      where: filters,
      skip: (page - 1) * limit,
      take: parseInt(limit),
      orderBy: { date: "asc" },
      include: {
        typeEvenement: true,
        organisateur: { select: { nom: true, email: true } },
      },
    });

    res.json(events);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des événements." });
  }
});

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Modifier un événement (Organisateur)
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'événement à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titre:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               heureDebut:
 *                 type: string
 *                 format: date-time
 *               heureFin:
 *                 type: string
 *                 format: date-time
 *               lieu:
 *                 type: string
 *               prix:
 *                 type: number
 *               capaciteMax:
 *                 type: number
 *               payant:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Événement modifié avec succès
 *       403:
 *         description: Vous n'êtes pas autorisé à modifier cet événement
 *       404:
 *         description: Événement non trouvé
 *       500:
 *         description: Erreur lors de la modification de l'événement
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titre,
      description,
      date,
      heureDebut,
      heureFin,
      lieu,
      prix,
      capaciteMax,
      payant,
    } = req.body;

    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
    });

    if (!event) return res.status(404).json({ error: "Événement non trouvé." });

    if (event.organisateurId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Vous n'êtes pas autorisé à modifier cet événement." });
    }

    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(id) },
      data: {
        titre,
        description,
        date: new Date(date),
        heureDebut: new Date(heureDebut),
        heureFin: new Date(heureFin),
        lieu,
        prix,
        capaciteMax,
        payant,
      },
    });

    res.json(updatedEvent);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la modification de l'événement." });
  }
});

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Supprimer un événement (Organisateur)
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'événement à supprimer
 *     responses:
 *       200:
 *         description: Événement supprimé avec succès
 *       403:
 *         description: Vous n'êtes pas autorisé à supprimer cet événement
 *       404:
 *         description: Événement non trouvé
 *       500:
 *         description: Erreur lors de la suppression de l'événement
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
    });

    if (!event) return res.status(404).json({ error: "Événement non trouvé." });

    if (event.organisateurId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Vous n'êtes pas autorisé à supprimer cet événement." });
    }

    await prisma.event.delete({ where: { id: parseInt(id) } });

    res.json({ message: "Événement supprimé avec succès." });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la suppression de l'événement." });
  }
});

export default router;
