import dotenv from 'dotenv';
dotenv.config()
// --- Konfigurasi dari .env ---
const SHOPEE_PARTNER_ID = parseInt(process.env.SHOPEE_PARTNER_ID ?? "0");
const SHOPEE_PARTNER_KEY = process.env.SHOPEE_PARTNER_KEY ?? "";
const SHOPEE_BASE_URL = process.env.SHOPEE_BASE_URL ?? ""
const APP_REDIRECT_URL = process.env.APP_REDIRECT_URL ?? ""; // URL callback aplikasi Anda

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET; // URL callback aplikasi Anda
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET; // URL callback aplikasi Anda

const config = {
    SHOPEE_PARTNER_ID, SHOPEE_PARTNER_KEY,
}

export { ACCESS_TOKEN_SECRET, APP_REDIRECT_URL, config, REFRESH_TOKEN_SECRET, SHOPEE_BASE_URL, SHOPEE_PARTNER_ID, SHOPEE_PARTNER_KEY };

