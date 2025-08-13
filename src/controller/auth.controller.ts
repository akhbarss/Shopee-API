import { Request, Response } from 'express';
import crypto from 'node:crypto';
import { APP_REDIRECT_URL, SHOPEE_BASE_URL, SHOPEE_PARTNER_ID, SHOPEE_PARTNER_KEY } from '../config';
import { getAccessToken, refreshAccessToken } from '../utils/token';
import { prisma } from '../prisma';

export const authorizationController = async (req: Request, res: Response) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const authPath = '/api/v2/shop/auth_partner'; // Endpoint untuk membuat URL otorisasi

    // baseString untuk URL Otorisasi: partner_id + path + timestamp
    const baseStringForAuth = `${SHOPEE_PARTNER_ID}${authPath}${timestamp}`;
    const signForAuth = crypto.createHmac('sha256', SHOPEE_PARTNER_KEY).update(baseStringForAuth).digest('hex');

    const authUrl = `${SHOPEE_BASE_URL}${authPath}?partner_id=${SHOPEE_PARTNER_ID}&timestamp=${timestamp}&sign=${signForAuth}&redirect=${encodeURIComponent(APP_REDIRECT_URL)}`;

    console.log(`[AUTH] Mengarahkan ke URL otorisasi: ${authUrl}`);
    res.redirect(authUrl);
}

export const callbackController = async (req: Request, res: Response) => {
    const code = req.query.code as string;
    const shop_id = req.query.shop_id as string;
    const error = req.query.error as string;
    const message = req.query.message as string;

    if (error) {
        console.error(`[CALLBACK] Error dari Shopee: ${error} - ${message}`);
        return res.send(`<h2>Error Otorisasi Shopee:</h2><p>${message || error}</p>`);
    }

    if (!code || !shop_id) {
        return res.send('<h2>Parameter "code" atau "shop_id" tidak ditemukan.</h2>');
    }

    console.log(`[CALLBACK] Menerima code: ${code} dan shop_id: ${shop_id}`);

    // Panggil fungsi getAccessToken segera setelah menerima code
    const tokens = await getAccessToken(code, parseInt(shop_id)); // Pastikan shop_id adalah integer

    if (tokens) {
        // console.log({ tokens })
        res.send(`
            <h2>Otorisasi Berhasil!</h2>
            <p>Access Token telah diambil dan disimpan. Anda bisa kembali ke halaman utama untuk melihatnya.</p>
            <a href="/">Kembali ke Halaman Utama</a>
        `);
    } else {
        res.send(`
            <h2>Otorisasi Gagal!</h2>
            <p>Gagal mengambil access token. Silakan cek log server untuk detailnya.</p>
            <a href="/">Kembali ke Halaman Utama</a>
        `);
    }
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

// get_shipment_list api proses