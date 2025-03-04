import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import authMiddleware from "../middleware/authMiddleware.js";

const prisma = new PrismaClient();
const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Créer un compte utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               email:
 *                 type: string
 *               motDePasse:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Email déjà utilisé
 */
router.post("/signup", async (req, res) => {
  const { nom, email, motDePasse, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(motDePasse, 10);
    const user = await prisma.user.create({
      data: { nom, email, motDePasse: hashedPassword, role },
    });
    res.json({ message: "Utilisateur créé !" });
  } catch (error) {
    res.status(400).json({ error: "Email déjà utilisé !" });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               motDePasse:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       401:
 *         description: Identifiants incorrects
 */
router.post("/login", async (req, res) => {
  const { email, motDePasse } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(motDePasse, user.motDePasse))) {
      return res.status(401).json({ error: "Identifiants incorrects" });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
      expiresIn: "2h",
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Récupérer le profil de l'utilisateur connecté
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Profil utilisateur récupéré avec succès
 *       404:
 *         description: Utilisateur non trouvé
 */
router.get("/me", authMiddleware, async (req, res) => {
  console.log("Utilisateur authentifié :", req.user);
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, nom: true, email: true, role: true },
    });

    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * @swagger
 * /auth/me:
 *   put:
 *     summary: Mettre à jour le profil de l'utilisateur connecté
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               email:
 *                 type: string
 *               motDePasse:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profil mis à jour avec succès
 *       400:
 *         description: Email déjà utilisé
 *       500:
 *         description: Erreur serveur
 */
router.put("/me", authMiddleware, async (req, res) => {
  const { nom, email, motDePasse } = req.body;
  try {
    const data = {};
    if (nom) data.nom = nom;
    if (email) data.email = email;
    if (motDePasse) data.motDePasse = await bcrypt.hash(motDePasse, 10);

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
    });

    res.json(user);
  } catch (error) {
    if (error.code === "P2002") {
      res.status(400).json({ error: "Email déjà utilisé !" });
    } else {
      res.status(500).json({ error: "Erreur serveur" });
    }
  }
});

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Rafraîchir le token d'authentification
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token rafraîchi avec succès
 *       401:
 *         description: Token manquant
 *       403:
 *         description: Token invalide
 */
router.post("/refresh-token", async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(401).json({ error: "Token manquant" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY, { ignoreExpiration: true });
    const newToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      SECRET_KEY,
      { expiresIn: "2h" }
    );
    res.json({ token: newToken });
  } catch (error) {
    res.status(403).json({ error: "Token invalide" });
  }
});

export default router;
