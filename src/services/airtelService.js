import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const AIRTEL_BASE_URL = process.env.AIRTEL_BASE_URL;
const CLIENT_ID = process.env.AIRTEL_CLIENT_ID;
const CLIENT_SECRET = process.env.AIRTEL_CLIENT_SECRET;

// Obtenir un token OAuth2
export const getAirtelToken = async () => {
  try {
    const response = await axios.post(
      `${AIRTEL_BASE_URL}/auth/oauth2/token`,
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "client_credentials",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error("Erreur OAuth2 :", error.response?.data || error.message);
    throw new Error("Impossible d'obtenir un token Airtel.");
  }
};
