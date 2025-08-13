import axios, { AxiosResponse } from 'axios';
import { SHOPEE_BASE_URL, SHOPEE_PARTNER_ID } from "../config";
import { generateSign } from "./sign";
import { prisma } from '../prisma';
import { ShopeeRefreshTokenResponse } from '../types/authorizartion';

// --- Penyimpanan Token Sementara (Dalam aplikasi nyata, ini di database) ---
// export let storedTokens = {} as any; // { shopId: { accessToken: '', refreshToken: '', expiresAt: 0 } }

async function getAccessToken(code: string, shopId: number) {
    const timestamp = Math.floor(Date.now() / 1000);
    const urlPath = '/api/v2/auth/token/get';

    const sign = generateSign({ urlPath, timestamp: timestamp + "" }); // Generate sign untuk API ini

    const queryParams = {
        partner_id: SHOPEE_PARTNER_ID,
        timestamp: timestamp,
        sign: sign,
    };

    const requestBody = {
        code: code,
        shop_id: shopId,
        partner_id: SHOPEE_PARTNER_ID,
    };

    try {
        console.log(`[GET_TOKEN] Meminta token baru untuk shop_id: ${shopId} dengan code: ${code}`);
        const response: AxiosResponse<ShopeeRefreshTokenResponse> = await axios.post(
            `${SHOPEE_BASE_URL}${urlPath}`,
            requestBody,
            {
                params: queryParams,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        const { access_token, refresh_token, expire_in }: ShopeeRefreshTokenResponse = response.data;
        const expiresAt = Date.now() + (expire_in * 1000) - (5 * 60 * 1000); // Kadaluarsa 5 menit sebelum expire_in

        console.log(`[GET_TOKEN] ✅ Token baru berhasil diambil untuk shop_id: ${shopId}`);

        const shopProfileUrlPath = '/api/v2/shop/get_profile';
        const shopProfileSign = generateSign({ urlPath: shopProfileUrlPath, timestamp: timestamp + "", accessToken: access_token, shopId: shopId.toString() });
        const shopProfileResponse = await axios.get(`${SHOPEE_BASE_URL}${shopProfileUrlPath}`, {
            params: {
                partner_id: SHOPEE_PARTNER_ID,
                shop_id: shopId,
                timestamp: timestamp,
                access_token: access_token,
                sign: shopProfileSign
            }
        });
        const shopName = shopProfileResponse.data.response.shop_name;
        console.log({ data: shopProfileResponse.data })

        await prisma.shop.upsert({
            where: { shopId: shopId },
            update: { shopName: shopName },
            create: { shopId: shopId, shopName: shopName },
        });


        await prisma.token.upsert({
            where: { shopId: shopId },
            update: {
                accessToken: access_token,
                refreshToken: refresh_token,
                expiresAt: expiresAt,
            },
            create: {
                shopId: shopId,
                accessToken: access_token,
                refreshToken: refresh_token,
                expiresAt: expiresAt,
            },
        });

        return { access_token, refresh_token, expire_in };
    } catch (error) {
        if ((error as any).response?.data) {
            console.error("❌ Error dari API Shopee:", (error as any).response.data);
        }
        // Jika tidak ada, kemungkinan besar dari Prisma atau kode lokal
        else {
            console.error("❌ Error dari database atau kode:", (error as any).message);
        }
        console.error(`[GET_TOKEN] ❌ Gagal mengambil token untuk shop_id: ${shopId}:`, (error as any).response?.data || (error as any).message);
        // Debugging info (opsional)
        console.log("[GET_TOKEN] Debug Info - ", { queryParams, requestBody });
        // console.log("[GET_TOKEN] Debug Info - Request Body:", requestBody);
        return null;
    }
}

// --- Fungsi untuk Mendapatkan Access Token Menggunakan Refresh Token ---
async function refreshAccessToken(shopId: number, refreshToken: string, idType = 'shop_id') {
    const timestamp = Math.floor(Date.now() / 1000);
    const urlPath = '/api/v2/auth/access_token/get';

    const sign = generateSign({urlPath, timestamp:timestamp + ""});

    const queryParams = {
        partner_id: SHOPEE_PARTNER_ID,
        timestamp: timestamp,
        sign: sign,
    };

    const requestBody: {
        refresh_token: string;
        partner_id: number;
        shop_id?: number;
        merchant_id?: number;
    } = {
        refresh_token: refreshToken,
        partner_id: SHOPEE_PARTNER_ID,
    };

    if (idType === 'shop_id') {
        requestBody.shop_id = shopId;
    } else if (idType === 'merchant_id') {
        requestBody.merchant_id = shopId;
    } else {
        console.error('[REFRESH_TOKEN] ❌ Error: idType harus "shop_id" atau "merchant_id".');
        return null;
    }

    try {
        console.log(`[REFRESH_TOKEN] Mencoba refresh token untuk ${idType}: ${shopId}`);
        const response = await axios.post(
            `${SHOPEE_BASE_URL}${urlPath}`,
            requestBody,
            {
                params: queryParams,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        const { access_token, refresh_token: new_refresh_token, expire_in } = response.data;
        const expiresAt = BigInt(Date.now() + (expire_in * 1000) - (5 * 60 * 1000)); // Ubah ke BigInt

        console.log(`[REFRESH_TOKEN] ✅ Token berhasil di-refresh untuk ${idType}: ${shopId}`);
        console.log(`[REFRESH_TOKEN] New Access Token: ${access_token}`);
        console.log(`[REFRESH_TOKEN] New Refresh Token: ${new_refresh_token}`);
        console.log(`[REFRESH_TOKEN] New Expire In: ${expire_in} detik`);

        // === GANTI DENGAN PRISMA ===
        await prisma.token.update({
            where: { shopId: shopId },
            data: {
                accessToken: access_token,
                refreshToken: new_refresh_token,
                expiresAt: expiresAt,
            },
        });
        console.log(`[REFRESH_TOKEN] ✅ Token berhasil diperbarui di database untuk ${idType}: ${shopId}`);
        // ============================

        return { access_token, new_refresh_token, expire_in };
    } catch (error: unknown) {
        console.error(`[REFRESH_TOKEN] ❌ Gagal me-refresh token untuk ${idType}: ${shopId}:`, (error as any).response?.data || (error as any).message);
        // Hapus `delete storedTokens[shopId];` karena kita tidak lagi menggunakan memori
        return null;
    }
}
export { getAccessToken, refreshAccessToken };
