import axios, { AxiosResponse } from 'axios';
import { SHOPEE_BASE_URL, SHOPEE_PARTNER_ID } from "../config";
import { generateSign } from "./sign";
import { prisma } from '../prisma';
import { ShopeeRefreshTokenResponse } from '../types/authorizartion';
import { CustomJwtPayload } from '../types/JwtPayload';

// --- Penyimpanan Token Sementara (Dalam aplikasi nyata, ini di database) ---
// export let storedTokens = {} as any; // { shopId: { accessToken: '', refreshToken: '', expiresAt: 0 } }

async function callShopeeAPI<T>(
    method: "get" | "post",
    path: string,
    params: Record<string, any>,
    body?: Record<string, any>
): Promise<T> {
    const url = `${SHOPEE_BASE_URL}${path}`;
    const headers = { "Content-Type": "application/json" };
    const config = { params, headers };

    const response = method === "get"
        ? await axios.get<T>(url, config)
        : await axios.post<T>(url, body, config);

    return response.data;
}

async function getAccessToken(code: string, shopId: number, userId: number) {

    const timestamp = Math.floor(Date.now() / 1000);

    try {
        // --- Ambil Token ---
        const tokenPath = "/api/v2/auth/token/get";
        const signToken = generateSign({ urlPath: tokenPath, timestamp: timestamp.toString() });

        const tokenData = await callShopeeAPI<ShopeeRefreshTokenResponse>(
            "post",
            tokenPath,
            { partner_id: SHOPEE_PARTNER_ID, timestamp, sign: signToken },
            { code, shop_id: shopId, partner_id: SHOPEE_PARTNER_ID }
        );

        if (!tokenData?.access_token) throw new Error("Token tidak diterima dari Shopee");

        const expiresAt = Date.now() + tokenData.expire_in * 1000 - 5 * 60 * 1000;

        // --- Ambil Profil Toko ---
        const profilePath = "/api/v2/shop/get_profile";
        const signProfile = generateSign({
            urlPath: profilePath,
            timestamp: timestamp.toString(),
            accessToken: tokenData.access_token,
            shopId: shopId.toString(),
        });

        const profileData = await callShopeeAPI<any>(
            "get",
            profilePath,
            {
                partner_id: SHOPEE_PARTNER_ID,
                shop_id: shopId,
                timestamp,
                access_token: tokenData.access_token,
                sign: signProfile,
            }
        );

        const shopName = (profileData?.response?.shop_name as string) || "Unknown Shop";

        // --- Simpan ke DB ---
        // TOKEN
        await prisma.token.upsert({
            where: { shopId },
            update: {
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                expiresAt,
                shop: {
                    update: {
                        userId
                    }   
                }
            },
            create: {
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                expiresAt,
                shop: {
                    create: {
                        shopId,
                        shopName,
                        userId: userId
                    }
                }
            },
        });

        // Kalau mau simpan juga shopName:
        // await prisma.shop.upsert({
        //     where: { shopId },
        //     update: {  },
        //     create: {
        //         shopName: shopName,
        //         shopId: shopId,
        //         user: {}
        //     },
        // });

        console.log(`[GET_TOKEN] ✅ Berhasil untuk shop_id: ${shopId} (${shopName})`);
        return tokenData;

    } catch (err: any) {
        // console.log({ user })
        if (err.response?.data) {
            console.error("❌ Error dari API Shopee:", err.response.data);
        } else {
            console.error("❌ Error lokal/DB:", err.message);
        }
        return null;
    }
}


// async function getAccessToken(code: string, shopId: number, userId: number) {
//     const timestamp = Math.floor(Date.now() / 1000);
//     const urlPath = '/api/v2/auth/token/get';

//     const sign = generateSign({ urlPath, timestamp: timestamp + "" }); // Generate sign untuk API ini

//     const queryParams = {
//         partner_id: SHOPEE_PARTNER_ID,
//         timestamp: timestamp,
//         sign: sign,
//     };

//     const requestBody = {
//         code: code,
//         shop_id: shopId,
//         partner_id: SHOPEE_PARTNER_ID,
//     };

//     try {
//         console.log(`
//             ❗[GET_TOKEN] Meminta token baru untuk shop_id: ${shopId} dengan code: ${code}
//             `);
//         console.log({ requestBody })
//         console.log({ queryParams })
//         const response: AxiosResponse<ShopeeRefreshTokenResponse> = await axios.post(
//             `${SHOPEE_BASE_URL}${urlPath}`,
//             requestBody,
//             {
//                 params: queryParams,
//                 headers: {
//                     'Content-Type': 'application/json'
//                 }
//             }
//         );

//         const { access_token, refresh_token, expire_in }: ShopeeRefreshTokenResponse = response.data;
//         const expiresAt = Date.now() + (expire_in * 1000) - (5 * 60 * 1000); // Kadaluarsa 5 menit sebelum expire_in

//         console.log(`[GET_TOKEN] ✅ Token baru berhasil diambil untuk shop_id: ${shopId}`);

//         const shopProfileUrlPath = '/api/v2/shop/get_profile';
//         const shopProfileSign = generateSign({ urlPath: shopProfileUrlPath, timestamp: timestamp + "", accessToken: access_token, shopId: shopId.toString() });
//         const shopProfileResponse = await axios.get(`${SHOPEE_BASE_URL}${shopProfileUrlPath}`, {
//             params: {
//                 partner_id: SHOPEE_PARTNER_ID,
//                 shop_id: shopId,
//                 timestamp: timestamp,
//                 access_token: access_token,
//                 sign: shopProfileSign
//             }
//         });
//         if (!shopProfileResponse) {
//             throw Error("shopProfileResponse")
//         }
//         const shopName = shopProfileResponse.data.response.shop_name;
//         console.log({ data: shopProfileResponse.data })

//         await prisma.shop.upsert({
//             where: { shopId: shopId },
//             update: { shopName: shopName, userId },
//             create: {
//                 shopId: shopId, shopName: shopName,
//                 user: {

//                 }
//             },
//         });


//         await prisma.token.upsert({
//             where: { shopId: shopId },
//             update: {
//                 accessToken: access_token,
//                 refreshToken: refresh_token,
//                 expiresAt: expiresAt,
//             },
//             create: {
//                 shopId: shopId,
//                 accessToken: access_token,
//                 refreshToken: refresh_token,
//                 expiresAt: expiresAt,
//             },
//         });

//         return { access_token, refresh_token, expire_in };
//     } catch (error) {
//         console.log("❌ERROR START❌")
//         if ((error as any).response?.data) {
//             console.error("❌ Error dari API Shopee:", (error as any).response.data);
//         }
//         // Jika tidak ada, kemungkinan besar dari Prisma atau kode lokal
//         else {
//             console.error("❌ Error dari database atau kode:", (error as any).message);
//         }
//         console.error(`[GET_TOKEN] ❌ Gagal mengambil token untuk shop_id: ${shopId}:`, (error as any).response?.data || (error as any).message);
//         // Debugging info (opsional)
//         console.log("[GET_TOKEN] Debug Info - ", { queryParams, requestBody });
//         console.log("❌ERROR END❌")
//         // console.log("[GET_TOKEN] Debug Info - Request Body:", requestBody);
//         return null;
//     }
// }

// --- Fungsi untuk Mendapatkan Access Token Menggunakan Refresh Token ---

async function refreshAccessToken(shopId: number, refreshToken: string, idType = 'shop_id') {
    const timestamp = Math.floor(Date.now() / 1000);
    const urlPath = '/api/v2/auth/access_token/get';

    const sign = generateSign({ urlPath, timestamp: timestamp + "" });

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
