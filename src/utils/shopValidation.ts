import { Request, Response } from "express";
import z from "zod";
import { SHOPEE_BASE_URL, SHOPEE_PARTNER_ID } from "../config";
import { prisma } from "../prisma";
import { generateSign } from "./sign";

type ShopValidationProps = {
    req: Request
    res: Response
    path: string
}

type ShopValidationResult = {
    fullUrl: string;
    shopId: number;
    accessToken: string;
    sign: string
    timestamp: number
};

export const shopValidation = async ({
    req,
    res,
    path

}: ShopValidationProps): Promise<ShopValidationResult> => {

    const shopIdSchema = z.object({
        shop_id: z.string().transform(val => Number(val)), // Validasi string dan ubah ke number
    });
    const { shop_id: queryShopId } = shopIdSchema.parse(req.query);

    const tokenInfo = await prisma.token.findFirst({ where: { shopId: queryShopId } });
    if (!tokenInfo) {
        const error = new Error("Toko tidak ditemukan atau belum terintegrasi.") as any;
        error.statusCode = 404; // Anda bisa menambahkan status code custom
        throw error;
    }
    const { accessToken, shopId, } = tokenInfo

    const timestamp = Math.floor(Date.now() / 1000);

    const sign = generateSign({ urlPath: path, timestamp: timestamp.toString(), accessToken })
    const fullUrl = `${SHOPEE_BASE_URL}${path}?partner_id=${SHOPEE_PARTNER_ID}&timestamp=${timestamp}&sign=${sign}&shop_id=${queryShopId}&access_token=${accessToken}`;

    return {
        fullUrl,
        shopId,
        accessToken,
        sign,
        timestamp
    }

}
