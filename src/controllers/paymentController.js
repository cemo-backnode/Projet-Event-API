import axios from "axios";
import { PrismaClient } from "@prisma/client";
import { getAirtelToken } from "../services/airtelService.js";
import CryptoJS from "crypto-js";

const prisma = new PrismaClient();
const AIRTEL_BASE_URL = process.env.AIRTEL_BASE_URL;
const X_COUNTRY = process.env.AIRTEL_X_COUNTRY;
const X_CURRENCY = process.env.AIRTEL_X_CURRENCY;
const API_KEY = process.env.AIRTEL_API_KEY;
const API_SECRET = process.env.AIRTEL_API_SECRET;

// Fonction pour générer une signature (sécurité Airtel)
const generateSignature = (data) => {
  return CryptoJS.HmacSHA256(JSON.stringify(data), API_SECRET).toString(
    CryptoJS.enc.Base64
  );
};

// Effectuer un paiement Airtel Money (Cashin)
export const createAirtelPayment = async (req, res) => {
  try {
    const { bookingId, amount, msisdn, pin } = req.body;
    const participantId = req.user.id;

    // Vérifier si la réservation existe
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId), participantId },
    });
    if (!booking)
      return res.status(404).json({ error: "Réservation non trouvée." });

    // Obtenir un token OAuth2
    const token = await getAirtelToken();

    // Préparer les données de la transaction
    const transactionData = {
      subscriber: { msisdn },
      transaction: {
        amount,
        id: `TXN_${Date.now()}`,
      },
      reference: `REF_${Date.now()}`,
      pin, // Doit être encrypté côté frontend avant d’être envoyé
    };

    // Générer la signature pour la requête
    const signature = generateSignature(transactionData);

    // Envoyer la requête de paiement
    const response = await axios.post(
      `${AIRTEL_BASE_URL}/standard/v2/cashin/`,
      transactionData,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Country": X_COUNTRY,
          "X-Currency": X_CURRENCY,
          Authorization: `Bearer ${token}`,
          "X-Signature": signature,
          "X-Key": API_KEY,
        },
      }
    );

    if (response.data.status.success !== true) {
      return res.status(400).json({ error: "Échec du paiement Airtel Money." });
    }

    // Enregistrer le paiement en base
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        montant: amount,
        methodePaiement: "AIRTEL_MONEY",
        statut: "en_attente",
      },
    });

    res.json({ message: "Paiement en attente de confirmation", payment });
  } catch (error) {
    console.error(
      "❌ Erreur Paiement :",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Erreur lors du paiement Airtel Money." });
  }
};

// Vérifier le statut d’un paiement
export const checkAirtelPaymentStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const token = await getAirtelToken();

    const response = await axios.get(
      `${AIRTEL_BASE_URL}/standard/v1/cashin/${transactionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(
      "❌ Erreur Vérification Paiement :",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Impossible de vérifier le paiement." });
  }
};

// Rembourser un paiement
export const refundAirtelPayment = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const token = await getAirtelToken();

    const response = await axios.post(
      `${AIRTEL_BASE_URL}/merchant/v2/payments/refund`,
      {
        transaction: { id: transactionId },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.status.success !== true) {
      return res.status(400).json({ error: "Échec du remboursement." });
    }

    res.json({ message: "Paiement remboursé avec succès." });
  } catch (error) {
    console.error(
      "❌ Erreur Remboursement :",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Impossible de rembourser ce paiement." });
  }
};
