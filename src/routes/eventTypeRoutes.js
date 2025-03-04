import express from "express";
import { PrismaClient } from "@prisma/client";
import authMiddleware from "../middleware/authMiddleware.js";

const prisma = new PrismaClient();
const router = express.Router();

/**
 * @swagger
 * /event-types:
 *   post:
 *     summary: Ajouter un type d'événement (Admin uniquement)
 *     tags: [EventTypes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *     responses:
 *       201:
 *         description: Type d'événement ajouté avec succès
 *       403:
 *         description: Seuls les administrateurs peuvent ajouter un type d'événement
 *       500:
 *         description: Erreur lors de l'ajout du type d'événement
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "administrateur") {
      return res.status(403).json({
        error: "Seuls les administrateurs peuvent ajouter un type d'événement.",
      });
    }

    const { nom } = req.body;
    const newType = await prisma.eventType.create({ data: { nom } });

    res.status(201).json(newType);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de l'ajout du type d'événement." });
  }
});

/**
 * @swagger
 * /event-types:
 *   get:
 *     summary: Lire tous les types d'événements avec filtres, recherche, tri et pagination
 *     tags: [EventTypes]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Rechercher par nom
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: asc
 *         description: Trier par nom (asc ou desc)
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
 *         description: Liste des types d'événements récupérée avec succès
 *       500:
 *         description: Erreur lors de la récupération des types d'événements
 */
router.get("/", async (req, res) => {
  try {
    const { search, sort = "asc", page = 1, limit = 10 } = req.query;
    const filters = {};

    if (search) {
      filters.nom = { contains: search, mode: "insensitive" };
    }

    const eventTypes = await prisma.eventType.findMany({
      where: filters,
      orderBy: { nom: sort },
      skip: (page - 1) * limit,
      take: parseInt(limit),
    });

    res.json(eventTypes);
  } catch (error) {
    res.status(500).json({
      error: "Erreur lors de la récupération des types d'événements.",
    });
  }
});

/**
 * @swagger
 * /event-types/{id}:
 *   put:
 *     summary: Mettre à jour un type d'événement (Admin uniquement)
 *     tags: [EventTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du type d'événement à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *     responses:
 *       200:
 *         description: Type d'événement mis à jour avec succès
 *       403:
 *         description: Seuls les administrateurs peuvent mettre à jour un type d'événement
 *       500:
 *         description: Erreur lors de la mise à jour du type d'événement
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "administrateur") {
      return res.status(403).json({
        error:
          "Seuls les administrateurs peuvent mettre à jour un type d'événement.",
      });
    }

    const { id } = req.params;
    const { nom } = req.body;

    const updatedType = await prisma.eventType.update({
      where: { id: parseInt(id) },
      data: { nom },
    });

    res.json(updatedType);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la mise à jour du type d'événement." });
  }
});

/**
 * @swagger
 * /event-types/{id}:
 *   delete:
 *     summary: Supprimer un type d'événement (Admin uniquement)
 *     tags: [EventTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du type d'événement à supprimer
 *     responses:
 *       200:
 *         description: Type d'événement supprimé avec succès
 *       403:
 *         description: Seuls les administrateurs peuvent supprimer un type d'événement
 *       500:
 *         description: Erreur lors de la suppression du type d'événement
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "administrateur") {
      return res.status(403).json({
        error:
          "Seuls les administrateurs peuvent supprimer un type d'événement.",
      });
    }

    const { id } = req.params;

    await prisma.eventType.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Type d'événement supprimé avec succès." });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la suppression du type d'événement." });
  }
});

export default router;
