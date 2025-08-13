import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { bigintReplacer } from '../utils/bigIntReplacer.utils';

export const getDashboardController = async (req: Request, res: Response) => {

    const storedTokens = await prisma.token.findMany(); // <-
    res.send(`
        <h1>NEW APP</h1>
        <h1>Aplikasi Otorisasi Shopee</h1>
        <p>Klik tombol di bawah untuk memulai proses otorisasi Shopee.</p>
        <button onclick="window.location.href='/api/v1/auth/shopee-oauth-redirect'">Otorisasi Aplikasi dengan Shopee</button>
        <h2>Token Tersimpan:</h2>
          <pre>${JSON.stringify(storedTokens, bigintReplacer, 2)}</pre>
        <p>Setelah otorisasi, token akan muncul di sini (refresh halaman).</p>
        <p>Access Token biasanya berlaku 4 jam. Refresh Token berlaku 30 hari.</p>
        <p>Aplikasi ini akan mencoba me-refresh token jika mendekati kadaluarsa saat ada permintaan GET /check-token</p>
        <button onclick="window.location.href='/api/v1/auth/check-token'">Cek & Refresh Token Tersimpan (Simulasi)</button>
    `);
}