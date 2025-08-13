import dayjs from 'dayjs';
import 'dotenv/config';
import { NextFunction, Request, Response } from "express";
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from "uuid";
import z from 'zod';
import { fetchCreateShippingDocument } from "../api/logistics/create-ship-doc.api";
import { fetchDownloadShippingDocument } from "../api/logistics/download-shipping-socument";
import { fetchGetChannelList } from "../api/logistics/get-channel-list";
import { fetchgetShippingDocumentResult } from "../api/logistics/get-shipping-document-result.api";
import { SHOPEE_BASE_URL, SHOPEE_PARTNER_ID } from '../config';
import { orderSnSchema, packageNumberSchema, ShippingDocumentTypeEnum, zodShopIdSchema } from "../schema/zod";
import { authenticatedShopeeRequest } from "../utils/authenticatedShopeeRequest";
import { getFullApiPath } from "../utils/getFullApiPath";
import { getTimestamp } from "../utils/getTimeStamp";
import { generateSign } from "../utils/sign";
import { fetchGetShippingParameter } from '../api/logistics/get-shipping-parameter';
import { getMassShippingParameter } from '../api/logistics/get-mass-shipping-parameter';


// v2.logistics.get_shipping_parameter : GET ✅
export const getShippingParameterController = async (req: Request, res: Response, next: NextFunction) => {
    const apiPath = '/api/v2/logistics/get_shipping_parameter';
    const validation = orderSnSchema.extend({
        shop_id: zodShopIdSchema,
    })

    try {
        const result = validation.safeParse(req.query)
        if (!result.success) {
            return next(result.error)
        }

        const { shop_id: shopId, order_sn: orderSn } = result.data
        const timestamp = getTimestamp()
        const responseData = await authenticatedShopeeRequest(shopId, async (accessToken) => {
            const sign = generateSign({ urlPath: apiPath, timestamp, accessToken, shopId })
            const fullApiPath = getFullApiPath(apiPath)

            return fetchGetShippingParameter({
                fullApiPath,
                params: {
                    sign,
                    timestamp,
                    shop_id: shopId,
                    access_token: accessToken,
                    partner_id: SHOPEE_PARTNER_ID,
                    order_sn: orderSn
                }
            })
        })

        return res.json({
            timestamp,
            statusCode: 200,
            data: responseData.response
        })
    } catch (error) {
        next(error)
    }
}

// v2.logistics.get_mass_shipping_parameter : POST ✅
export const getMassShippingParameterController = async (req: Request, res: Response, next: NextFunction) => {
    const apiPath = '/api/v2/logistics/get_mass_shipping_parameter';

    const validation = z.object({
        shop_id: zodShopIdSchema,
        logistics_channel_id: z.number().optional(),
        product_location_id: z.string().optional(),
        package_list: z
            .array(packageNumberSchema)
            .nonempty("package_list harus berisi minimal 1 package_number"),
    })

    try {
        const result = validation.safeParse(req.body);
        if (!result.success) {
            return next(result.error)
        }
        const { package_list, logistics_channel_id, product_location_id, shop_id: shopId } = result.data

        const responseData = await authenticatedShopeeRequest(shopId, async (access_token) => {
            const timestamp = getTimestamp().toString()
            const sign = generateSign({ timestamp, urlPath: apiPath, accessToken: access_token, shopId: shopId })
            const fullUrl = `${SHOPEE_BASE_URL}${apiPath}?partner_id=${SHOPEE_PARTNER_ID}&timestamp=${timestamp}&sign=${sign}&shop_id=${shopId}&access_token=${access_token}`;
            const data = { package_list, logistics_channel_id, product_location_id }
            return getMassShippingParameter({ data, fullUrl })
        })

        // // 7. Cek jika ada error dari API Shopee
        if (responseData?.error || responseData?.message) {
            console.error('Shopee API Error:', responseData);
            return res.status(500).json({
                message: 'Gagal mendapatkan dari Shopee.',
                error: responseData
            });
        }

        return res.json({
            timestamp: getTimestamp(),
            status_code: 200,
            data: responseData.response
        })
    } catch (error) {
        next(error)
    }
};
// v2.logistics.create_shipping_document : POST✅
export const createShippingDocumentController = async (req: Request, res: Response, next: NextFunction) => {

    const apiPath = '/api/v2/logistics/create_shipping_document';

    const downloadDocSchema = z.object({
        order_list: z
            .array(orderSnSchema)
            .nonempty("order_list harus berisi minimal 1 order"),
        shipping_document_type: ShippingDocumentTypeEnum,
        shop_id: zodShopIdSchema
    })

    try {
        const result = downloadDocSchema.safeParse(req.body);
        if (!result.success) {
            return next(result.error)
        }
        const { order_list, shipping_document_type, shop_id: shopId } = result.data

        const responseData = await authenticatedShopeeRequest(shopId, async (access_token) => {
            const timestamp = getTimestamp().toString()
            const sign = generateSign({ timestamp, urlPath: apiPath, accessToken: access_token, shopId: shopId })
            const fullUrl = `${SHOPEE_BASE_URL}${apiPath}?partner_id=${SHOPEE_PARTNER_ID}&timestamp=${timestamp}&sign=${sign}&shop_id=${shopId}&access_token=${access_token}`;
            const data = { order_list, shipping_document_type }
            return fetchCreateShippingDocument({ data, fullUrl })
        })

        // // 7. Cek jika ada error dari API Shopee
        if (responseData.error || responseData.message) {
            console.error('Shopee API Error:', responseData);
            return res.status(500).json({
                message: 'Gagal mendapatkan dari Shopee.',
                error: responseData
            });
        }

        return res.json({
            timestamp: getTimestamp(),
            status_code: 200,
            data: responseData.response
        })
    } catch (error) {
        next(error)
    }
};

// /api/v2/logistics/get_shipping_document_result✅ : POST
export const getShippingDocumentResult = async (req: Request, res: Response, next: NextFunction) => {
    const apiPath = '/api/v2/logistics/get_shipping_document_result';
    const getShippingSchema = z.object({
        order_list: z
            .array(orderSnSchema)
            .nonempty("order_list harus berisi minimal 1 order"),
        shipping_document_type: ShippingDocumentTypeEnum,
        shop_id: zodShopIdSchema
    });

    try {
        const result = getShippingSchema.safeParse(req.body);
        if (!result.success) {
            return next(result.error)
        }

        const { order_list, shipping_document_type, shop_id } = result.data

        const responseData = await authenticatedShopeeRequest(shop_id, async (access_token) => {
            const timestamp = getTimestamp().toString()
            const sign = generateSign({ timestamp, urlPath: apiPath, accessToken: access_token, shopId: shop_id + "" })
            const fullUrl = `${SHOPEE_BASE_URL}${apiPath}?partner_id=${SHOPEE_PARTNER_ID}&timestamp=${timestamp}&sign=${sign}&shop_id=${shop_id}&access_token=${access_token}`;
            const data = { order_list, shipping_document_type }
            return fetchgetShippingDocumentResult({ data, fullUrl })
        })

        if (responseData.error || responseData.message) {
            console.error('Shopee API Error:', responseData.error);
            return res.status(500).json({
                message: 'Gagal mendapatkan data dari Shopee.',
                error: responseData.error
            });
        }

        return res.status(200).json({
            timestamp: getTimestamp(),
            status_code: 200,
            data: responseData.response
        })
    } catch (error) {
        next(error)
    }
}

// v2.logistics.download_shipping_document  : POST ✅
export const downloadShippingDocumentController = async (req: Request, res: Response, next: NextFunction) => {
    const apiPath = '/api/v2/logistics/download_shipping_document';

    const downloadDocSchema = z.object({
        order_list: z
            .array(orderSnSchema)
            .nonempty("order_list harus berisi minimal 1 order"),
        shipping_document_type: ShippingDocumentTypeEnum,
        shop_id: zodShopIdSchema
    });

    try {
        const result = downloadDocSchema.safeParse(req.body);
        if (!result.success) {
            return next(result.error)
        }
        const { order_list, shipping_document_type, shop_id: shopId } = result.data

        const responseData = await authenticatedShopeeRequest(shopId, async (access_token) => {
            const timestamp = getTimestamp().toString()
            const sign = generateSign({ timestamp, urlPath: apiPath, accessToken: access_token, shopId: shopId })
            const fullUrl = `${SHOPEE_BASE_URL}${apiPath}?partner_id=${SHOPEE_PARTNER_ID}&timestamp=${timestamp}&sign=${sign}&shop_id=${shopId}&access_token=${access_token}`;
            const data = { order_list, shipping_document_type }
            return fetchDownloadShippingDocument({ data, fullUrl })
        })

        if (responseData.headers['content-type'] !== 'application/pdf') {
            const errorMsg = responseData.data.toString();
            return res.status(500).json({ message: 'Gagal download PDF dari Shopee', error: errorMsg });
        }

        // // Buat struktur path sesuai format
        const uuid = uuidv4();
        // const tanggal = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
        const fileName = `${uuid}.pdf`;
        const tanggal = dayjs().format('YYYY-MM-DD').replace(/-/g, ''); // Hasil: "20250808";

        // console.log({ tanggal })
        // // Simpan di folder: /public/temp/label/<user_id>/<tanggal>/
        const relativePath = path.join('temp', 'label', `${shopId}`, tanggal, fileName);
        const savePath = path.join(__dirname, '..', 'public', relativePath);

        // // Buat folder jika belum ada
        fs.mkdirSync(path.dirname(savePath), { recursive: true });

        // // Simpan file
        fs.writeFileSync(savePath, responseData.data);

        // // URL akses file
        // const fileUrl = `/public/${relativePath}`; // jika akses file public diatur langsung ke /public
        const fileUrl = `/temp/label/${shopId}/${tanggal}/${fileName}`;

        res.status(200).json({
            file_url: fileUrl,
            timestamp: getTimestamp(),
            status_code: 200,
        });

    } catch (error) {
        next(error)
    }
};


// /api/v2/logistics/get_channel_list✅ : GET
export const getChannelList = async (req: Request, res: Response, next: NextFunction) => {
    const apiPath = '/api/v2/logistics/get_channel_list';
    const getChannelListSchema = z.object({
        shop_id: zodShopIdSchema
    })

    const url = req.originalUrl
    console.log({url})

    try {
        const result = getChannelListSchema.safeParse(req.query)
        if (!result.success) {
            return next(result.error)
        }

        const { shop_id: shopId } = result.data
        const timestamp = getTimestamp()
        const responseData = await authenticatedShopeeRequest(shopId, async (accessToken) => {
            const sign = generateSign({ urlPath: apiPath, timestamp, accessToken, shopId })
            const fullApiPath = getFullApiPath(apiPath)

            return fetchGetChannelList({
                fullApiPath,
                params: {
                    sign,
                    timestamp,
                    shop_id: shopId,
                    access_token: accessToken,
                    partner_id: SHOPEE_PARTNER_ID
                }
            })
        })

         if (responseData.error || responseData.message) {
            console.error('Shopee API Error:', responseData.error);
            return res.status(500).json({
                message: responseData.message,
                error: responseData.error
            });
        }

        console.log({ responseData })

        return res.json({
            timestamp,
            statusCode: 200,
            data: responseData.response.logistics_channel_list
        })
    } catch (error) {
        next(error)
    }
}