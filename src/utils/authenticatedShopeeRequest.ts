import axios from 'axios';
import { prisma } from '../prisma';
import { refreshShopeeToken } from './refreshShopeeToken';

/**
 * Wrapper untuk menjalankan panggilan API Shopee dengan penanganan refresh token otomatis.
 * @param shopId ID toko yang akan dipanggil.
 * @param apiCall Fungsi yang melakukan panggilan API sebenarnya. Fungsi ini akan menerima access_token yang valid.
 * @returns Hasil dari panggilan apiCall.
 */
export const authenticatedShopeeRequest = async <T>(
    shopId: number,
    apiCall: (accessToken: string) => Promise<T>
): Promise<T> => {
    console.log("🔥 ---------------  START - authenticatedShopeeRequest  --------------- 🔥")
    try {
        // Percobaan Pertama: Ambil token dari DB dan jalankan panggilan API
        console.log("🔑 CEK TOKEN untuk shop id : ", shopId)
        const tokenInfo = await prisma.token.findUnique({ where: { shopId } });
        if (!tokenInfo) {
            throw new Error(`Token untuk shopId: ${shopId} tidak ditemukan.`);
        }
        console.log("🔑 CEK TOKEN - TOKEN DITEMUKAN : ", tokenInfo.accessToken)

        console.log(`authenticatedShopeeRequest: Mencoba panggilan API untuk shopId: ${shopId} (Percobaan 1)`);
        return await apiCall(tokenInfo.accessToken);

    } catch (error) {
        // Cek apakah ini error token kedaluwarsa
        if (axios.isAxiosError(error) && error.response?.data?.error === 'invalid_acceess_token') {
            console.log(`❗❗❗ - invalid_acceess_token - Token kedaluwarsa terdeteksi untuk shopId: ${shopId}. Memulai refresh...`);

            // Dapatkan refresh token dari DB
            const tokenToRefresh = await prisma.token.findUnique({ where: { shopId } });
            if (!tokenToRefresh) {
                throw new Error(`Tidak bisa me-refresh karena token untuk shopId: ${shopId} tidak ada.`);
            }

            // 1. Lakukan Refresh
            const newAccessToken = await refreshShopeeToken(shopId, tokenToRefresh.refreshToken);

            // 2. Lakukan Retry dengan token baru
            console.log(`Mencoba ulang panggilan API untuk shopId: ${shopId} dengan token baru (Percobaan 2)`);
            return await apiCall(newAccessToken);
        }

        // Jika error bukan karena token kedaluwarsa, lempar kembali agar ditangani oleh error handler utama
        // console.log("HandleError - throw error")
        console.log("🔥 --------------- END - authenticatedShopeeRequest ---------------  🔥")
        throw error;
    }
};