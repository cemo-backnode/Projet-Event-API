import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");
  console.log("Authorization Header:", authHeader);

  const token = authHeader?.split(" ")[1];
  if (!token) {
    console.log("Token manquant");
    return res.status(401).json({ error: "Accès refusé" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token décodé:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.log("Token expiré");
      return res.status(401).json({ error: "Token expiré" });
    }
    console.log("Erreur de vérification du token:", error);
    res.status(403).json({ error: "Token invalide" });
  }
};

export default authMiddleware;
