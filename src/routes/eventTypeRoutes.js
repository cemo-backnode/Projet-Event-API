import express from "express";
import { PrismaClient } from "@prisma/client";
import authMiddleware from "../middleware/authMiddleware.js";

const prisma = new PrismaClient();
const router = express.Router();

// Ajouter un type d'événement (Admin uniquement)
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "administrateur") {
      return res
        .status(403)
        .json({
          error:
            "Seuls les administrateurs peuvent ajouter un type d'événement.",
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

// Lire tous les types d'événements avec filtres, recherche, tri et pagination
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
    res
      .status(500)
      .json({
        error: "Erreur lors de la récupération des types d'événements.",
      });
  }
});

// Mettre à jour un type d'événement (Admin uniquement)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "administrateur") {
      return res
        .status(403)
        .json({
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

// Supprimer un type d'événement (Admin uniquement)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "administrateur") {
      return res
        .status(403)
        .json({
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
