import axios from "axios";
import crypto from 'node:crypto';

import { SHOPEE_BASE_URL, SHOPEE_PARTNER_ID, SHOPEE_PARTNER_KEY } from "../config";
import { prisma } from "../prisma";

interface ShopeeRefreshResponse {
    access_token: string;
    refresh_token: string;
    expire_in: number;
    partner_id: number;
    shop_id: number;
}


export const refreshShopeeToken = async (shopId: number, currentRefreshToken: string): Promise<string> => {
    console.log("🔥refreshShopeeToken- START")
    console.log(`Mencoba me-refresh token untuk shop_id: ${shopId}`);

    const path = '/api/v2/auth/access_token/get';
    const timestamp = Math.floor(Date.now() / 1000);

    // BaseString untuk refresh token hanya butuh partner_id, path, dan timestamp
    const baseString = `${SHOPEE_PARTNER_ID}${path}${timestamp}`;
    const sign = crypto
        .createHmac('sha256', SHOPEE_PARTNER_KEY)
        .update(baseString)
        .digest('hex');

    const body = {
        refresh_token: currentRefreshToken,
        partner_id: SHOPEE_PARTNER_ID,
        shop_id: shopId,
    };

    try {
        const response = await axios.post<ShopeeRefreshResponse>(
            `${SHOPEE_BASE_URL}${path}?partner_id=${SHOPEE_PARTNER_ID}&timestamp=${timestamp}&sign=${sign}`,
            body,
            { headers: { 'Content-Type': 'application/json' } }
        );

        const { access_token: newAccessToken, refresh_token: newRefreshToken } = response.data;
        console.log(`Token berhasil di-refresh untuk shop_id: ${shopId}. Menyimpan ke database...`);

        // ✅ SANGAT PENTING: Update database dengan token yang baru
        await prisma.token.update({
            where: { shopId: shopId },
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken, // Shopee biasanya juga memberikan refresh token baru
            },
        });

        // Kembalikan access token yang baru
        return newAccessToken;
    } catch (error) {
        console.log(`refreshShopeeToken - END -Gagal total me-refresh token untuk shop_id: ${shopId}`);
        // Jika refresh token itu sendiri gagal, kita harus melempar error agar proses berhenti
        throw new Error('Gagal memperbarui token otorisasi Shopee.');
    }
};