import { Request, Response } from "express";
import { getAccessToken } from "../../utils/token";
import { CustomJwtPayload } from "../../types/JwtPayload";

export const callbackController = async (req: Request, res: Response) => {
    console.log("callbackController")
    const code = req.query.code as string;
    const shop_id = req.query.shop_id as string;
    const user_id = req.query.user_id as string;
    const error = req.query.error as string;
    const message = req.query.message as string;

    if (error) {
        console.error(`[CALLBACK] Error dari Shopee: ${error} - ${message}`);
        return res.send(`<h2>Error Otorisasi Shopee:</h2><p>${message || error}</p>`);
    }

    if (!code || !shop_id) {
        return res.send('<h2>Parameter "code" atau "shop_id" tidak ditemukan.</h2>');
    }

    console.log(`[CALLBACK] Menerima code: ${code} dan shop_id: ${shop_id} dan user_id: ${user_id}`);

    // Panggil fungsi getAccessToken segera setelah menerima code
    const tokens = await getAccessToken(code, parseInt(shop_id), parseInt(user_id)); // Pastikan shop_id adalah integer
    console.log("🔥" + JSON.stringify(tokens) + user_id)
    console.log("🔥" + {tokens} +{ user_id})
    if (tokens) {
        return res.json({ message: "success" })
    } else {
        return res.status(400).json({ message: "error getAccessToken" })

    }
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