import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import authMiddleware from "../middleware/authMiddleware.js";

const prisma = new PrismaClient();
const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

// Inscription
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

// Connexion
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

// Récupération du profil
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

// Rafraîchissement du token
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
