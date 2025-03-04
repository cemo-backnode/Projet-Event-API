import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import eventTypeRoutes from "./routes/eventTypeRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js"; // Importer les routes de paiement
import adminRoutes from "./routes/adminRoutes.js"; // Importer les routes d'administration
import setupSwagger from "./config/swagger.js"; // Importer Swagger

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/event-types", eventTypeRoutes);
app.use("/bookings", bookingRoutes);
app.use("/payments", paymentRoutes); // Ajouter les routes de paiement
app.use("/admin", adminRoutes); // Ajouter les routes d'administration

setupSwagger(app); // Activer Swagger

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`)
);
