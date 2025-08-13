import crypto from 'node:crypto';
import { SHOPEE_PARTNER_ID, SHOPEE_PARTNER_KEY } from '../config';

type GenerateSignProps = {
    urlPath: string;
    timestamp: string | number;
    accessToken?: string;
    shopId?: string | number;
}

export function generateSign({ urlPath, timestamp, accessToken = '', shopId = '' }: GenerateSignProps) {

    // Cek apakah accessToken dan shopId disediakan
    const baseString = (accessToken && shopId)
        // Jika ada, gunakan format yang lengkap untuk API Data
        ? `${SHOPEE_PARTNER_ID}${urlPath}${timestamp}${accessToken}${shopId}`
        // Jika tidak, gunakan format yang lebih sederhana untuk API Otorisasi
        : `${SHOPEE_PARTNER_ID}${urlPath}${timestamp}`;
    const sign = crypto.createHmac('sha256', SHOPEE_PARTNER_KEY).update(baseString).digest('hex');
    return sign;
}