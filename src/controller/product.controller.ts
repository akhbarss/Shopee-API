import axios from "axios";
import { Request, Response } from "express";
import z from "zod";
import { SHOPEE_BASE_URL, SHOPEE_PARTNER_ID } from "../config";
import { prisma } from "../prisma";
import { generateSign } from "../utils/sign";

// Definisikan skema validasi untuk query parameter


export const getProductByShopId = async (req: Request, res: Response) => {
    const shopIdSchema = z.object({
        shopid: z.string().transform(val => Number(val)), // Validasi string dan ubah ke number
    });

    try {
        const { shopid: queryShopId } = shopIdSchema.parse(req.query);

        // 1. Ambil token dari database
        const tokenInfo = await prisma.token.findFirst({ where: { shopId: queryShopId } });
        if (!tokenInfo) {
            return res.status(401).json({ error: "shop id tidak ditemukan." });
        }

        const { shopId, accessToken } = tokenInfo;
        const timestamp = Math.floor(Date.now() / 1000);

        // Ganti URL path ke endpoint produk
        const urlPath = '/api/v2/product/get_item_list';

        // 2. Generate sign dengan format yang benar
        const sign = generateSign({ urlPath, timestamp: timestamp.toString(), accessToken, shopId: shopId.toString() });

        // 3. Siapkan parameter API, sesuai dengan contoh produk
        const params = {
            partner_id: SHOPEE_PARTNER_ID,
            shop_id: shopId,
            timestamp: timestamp,
            access_token: accessToken,
            sign: sign,
            offset: 0,
            page_size: 50,
            item_status: 'NORMAL'
            // Anda bisa tambahkan parameter lain seperti 'update_time_from' dan 'update_time_to'
            // untuk mengambil produk yang diperbarui dalam rentang waktu tertentu.
        };

        // 4. Panggil API Shopee
        const response = await axios.get(`${SHOPEE_BASE_URL}${urlPath}`, {
            params: params
        });

        // 5. Kirim data produk sebagai respons
        res.json(response.data);

    } catch (error) {
        console.error('Gagal mengambil data produk:', (error as any).response?.data || (error as any).message);
        res.status(500).json({ error: 'Gagal mengambil data produk', details: (error as any).response?.data || (error as any).message });
    }

} 