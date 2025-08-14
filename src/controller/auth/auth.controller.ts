import { Request, Response } from 'express';
import crypto from 'node:crypto';
import { APP_REDIRECT_URL, SHOPEE_BASE_URL, SHOPEE_PARTNER_ID, SHOPEE_PARTNER_KEY } from '../../config';
import { prisma } from '../../prisma';
import { getAccessToken, refreshAccessToken } from '../../utils/token';

export const authShopeeController = async (req: Request, res: Response) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const authPath = '/api/v2/shop/auth_partner'; // Endpoint untuk membuat URL otorisasi

    // baseString untuk URL Otorisasi: partner_id + path + timestamp
    const baseStringForAuth = `${SHOPEE_PARTNER_ID}${authPath}${timestamp}`;
    const signForAuth = crypto.createHmac('sha256', SHOPEE_PARTNER_KEY).update(baseStringForAuth).digest('hex');

    const authUrl = `${SHOPEE_BASE_URL}${authPath}?partner_id=${SHOPEE_PARTNER_ID}&timestamp=${timestamp}&sign=${signForAuth}&redirect=${encodeURIComponent(APP_REDIRECT_URL)}`;

    console.log(`[AUTH] Mengarahkan ke URL otorisasi: ${authUrl}`);
    res.redirect(authUrl);
}


export const checkTokenController = async (req: Request, res: Response) => {
    console.log('\n--- Memulai Cek & Refresh Token ---');

    // Ambil semua token dari database
    const allTokens = await prisma.token.findMany();

    if (allTokens.length === 0) {
        return res.send(`
            <h2>Belum ada token tersimpan.</h2>
            <p>Silakan lakukan otorisasi terlebih dahulu.</p>
            <a href="/">Kembali ke Halaman Utama</a>
            `);
    }

    let refreshedCount = 0;
    for (const tokenInfo of allTokens) {
        const shopId = tokenInfo.shopId;
        // Cek jika token akan kadaluarsa dalam 10 menit ke depan
        const tenMinutesInMilliseconds = BigInt(10 * 60 * 1000);
        if (tokenInfo.expiresAt < BigInt(Date.now()) + tenMinutesInMilliseconds) {
            console.log(`[CHECK] Token untuk shop_id ${shopId} akan segera kedaluwarsa atau sudah. Mencoba merefresh...`);
            // Pastikan shopId dan refreshToken dikirim dengan benar ke fungsi
            const newTokens = await refreshAccessToken(shopId, tokenInfo.refreshToken);
            if (newTokens) {
                refreshedCount++;
                console.log(`[CHECK] Token untuk shop_id ${shopId} berhasil di-refresh.`);
            } else {
                console.log(`[CHECK] Gagal me-refresh token untuk shop_id ${shopId}. Mungkin perlu otorisasi ulang.`);
            }
        } else {
            console.log(`[CHECK] Token untuk shop_id ${shopId} masih valid.`);
        }
    }

    // Gunakan replacer untuk BigInt saat stringify
    const bigintReplacer = (key: string, value: any) =>
        typeof value === 'bigint' ? value.toString() : value;

    res.send(`
        <h2>Status Cek & Refresh Token:</h2>
        <p>Jumlah token yang di-refresh: ${refreshedCount}</p>
        <p>Lihat log konsol server untuk detail lebih lanjut.</p>
        <a href="/">Kembali ke Halaman Utama</a>
        <p> ${JSON.stringify(allTokens, bigintReplacer, 2)}</p>
    `);
}
export const getShopeeAuthUrl = (req: Request, res: Response) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const authPath = '/api/v2/shop/auth_partner'; // Endpoint untuk membuat URL otorisasi

    // baseString untuk URL Otorisasi: partner_id + path + timestamp
    const baseStringForAuth = `${SHOPEE_PARTNER_ID}${authPath}${timestamp}`;
    const signForAuth = crypto.createHmac('sha256', SHOPEE_PARTNER_KEY).update(baseStringForAuth).digest('hex');

    const authUrl = `${SHOPEE_BASE_URL}${authPath}?partner_id=${SHOPEE_PARTNER_ID}&timestamp=${timestamp}&sign=${signForAuth}&redirect=${encodeURIComponent(APP_REDIRECT_URL)}`;
    // https://account.seller.shopee.com/signin/oauth/accountchooser?client_id=221574d99f4b44ccd5ddbaf725e0ce12&lang=en&login_types=%5B1,4,2%5D&max_auth_age=3600&redirect_uri=https%3A%2F%2Fopen.shopee.com%2Fapi%2Fv1%2Foauth2%2Fcallback&region=SG&required_passwd=true&respond_code=code&scope=profile&sign=5377b6acb55533cd07cd7bbb0f842bd1&state=eyJub25jZSI6IjU4NmU0YWRkZmU4ZjU0YTQiLCJpZCI6ODQzMzY3LCJhdXRoX3Nob3AiOjEsIm5leHRfdXJsIjoiaHR0cHM6Ly9vcGVuLnNob3BlZS5jb20vYXV0aG9yaXplP2lzUmVkaXJlY3Q9dHJ1ZSIsImlzX2F1dGgiOjB9&timestamp=1755103323&title=sla_title_open_platform_app_login

    // https://account.seller.shopee.com/signin/oauth/accountchooser?client_id=221574d99f4b44ccd5ddbaf725e0ce12&lang=en&login_types=%5B1,4,2%5D&max_auth_age=3600&redirect_uri=https%3A%2F%2Fopen.shopee.com%2Fapi%2Fv1%2Foauth2%2Fcallback&region=SG&required_passwd=true&respond_code=code&scope=profile&sign=0014e134ce48c83f05914ceba020aee9&state=eyJub25jZSI6IjRiNzUyOTNhNTg4ZjM4ZGIiLCJpZCI6MjAxMjIzNywiYXV0aF9zaG9wIjoxLCJuZXh0X3VybCI6Imh0dHBzOi8vb3Blbi5zaG9wZWUuY29tL2F1dGhvcml6ZT9pc1JlZGlyZWN0PXRydWUiLCJpc19hdXRoIjowfQ%3D%3D&timestamp=1755103536&title=sla_title_open_platform_app_login

    //   const authUrl = `${baseUrl}/api/v2/shop/auth_partner?id=${partnerId}&redirect=${redirectUri}&timestamp=${timestamp}&sign=${sign}`;

    res.json({ url: authUrl });
};