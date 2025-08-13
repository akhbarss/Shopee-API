import dayjs from 'dayjs';
import 'dotenv/config';
import { NextFunction, Request, Response } from "express";
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from "uuid";
import z from 'zod';
import { fetchCreateShippingDocument } from "../api/logistics/create-ship-doc.api";
import { fetchDownloadShippingDocument } from "../api/logistics/download-shipping-socument";
import { fetchGetAddressList } from '../api/logistics/get-address-list.api';
import { fetchGetChannelList } from "../api/logistics/get-channel-list";
import { getMassShippingParameter } from '../api/logistics/get-mass-shipping-parameter';
import { fetchgetShippingDocumentResult } from "../api/logistics/get-shipping-document-result.api";
import { fetchGetShippingParameter } from '../api/logistics/get-shipping-parameter';
import { fetchShipOrder } from '../api/logistics/ship-order.api';
import { SHOPEE_BASE_URL, SHOPEE_PARTNER_ID } from '../config';
import { orderSnObjectSchema, packageNumberObjectSchema, zodOrderSnSchema, zodPackageNumberSchema, zodShippingDocumentTypeEnum, zodShopIdSchema, zodTrackingNumberSchema } from "../schema/zod";
import { authenticatedShopeeRequest } from "../utils/authenticatedShopeeRequest";
import { getFullApiPath } from "../utils/getFullApiPath";
import { getTimestamp } from "../utils/getTimeStamp";
import { generateSign } from "../utils/sign";
import { fetchGetTrackingNumber } from '../api/logistics/get-tracking-number.api';
import { fetchGetMassTrackingNumber } from '../api/logistics/get-mass-tracking-number';
import { fetchGetShippingDocumentParam } from '../api/logistics/get-shipping-document-param';

// /api/v2/logistics/get_channel_list✅ : GET
export const getChannelList = async (req: Request, res: Response, next: NextFunction) => {
    const apiPath = '/api/v2/logistics/get_channel_list';
    const getChannelListSchema = z.object({
        shop_id: zodShopIdSchema
    })

    const url = req.originalUrl
    console.log({ url })

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
// v2.logistics.get_address_list : GET ✅
export const getAddressListController = async (req: Request, res: Response, next: NextFunction) => {
    const apiPath = '/api/v2/logistics/get_address_list';
    const reqQueryValidation = z.object({
        shop_id: zodShopIdSchema,
    })

    try {
        const result = reqQueryValidation.safeParse(req.query)
        if (!result.success) {
            return next(result.error)
        }

        const { shop_id: shopId, } = result.data
        const timestamp = getTimestamp()
        const responseData = await authenticatedShopeeRequest(shopId, async (accessToken) => {
            const sign = generateSign({ urlPath: apiPath, timestamp, accessToken, shopId })
            const fullApiPath = getFullApiPath(apiPath, timestamp, sign, shopId, accessToken)
            return fetchGetAddressList({ fullApiPath })
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
// v2.logistics.get_shipping_parameter : GET ✅
export const getShippingParameterController = async (req: Request, res: Response, next: NextFunction) => {
    const apiPath = '/api/v2/logistics/get_shipping_parameter';
    const validation = orderSnObjectSchema.extend({
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
            .array(packageNumberObjectSchema)
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
// v2.logistics.ship_order : POST ✅
export const shipOrderController = async (req: Request, res: Response, next: NextFunction) => {
    const apiPath = '/api/v2/logistics/ship_order';
    const reqBodyValidation = orderSnObjectSchema.extend({
        shop_id: zodShopIdSchema,
        package_number: z.string(),
        pickup: z.object({
            address_id: z.number(),
            pickup_time_id: z.string().optional(),
            tracking_number: z.string().optional(),
        }).optional(),
        dropoff: z.object({
            branch_id: z.number().optional(),
            sender_real_name: z.string().optional(),
            tracking_number: z.string().optional(),
            slug: z.string().optional(),
        }).optional(),
        non_integrated: z.object({
            tracking_number: z.string().optional(),
        }).optional()
    })

    try {
        const result = reqBodyValidation.safeParse(req.body);
        if (!result.success) {
            return next(result.error)
        }
        const { shop_id: shopId, order_sn, dropoff, pickup, non_integrated, package_number } = result.data

        const responseData = await authenticatedShopeeRequest(shopId, async (access_token) => {
            const timestamp = getTimestamp()
            const sign = generateSign({ timestamp, urlPath: apiPath, accessToken: access_token, shopId: shopId })
            const fullUrl = getFullApiPath(apiPath, timestamp, sign, shopId, access_token)
            const data = {
                dropoff, pickup, order_sn, package_number
            }
            return fetchShipOrder({ data, fullUrl })
        })

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
            data: responseData
        })
    } catch (error) {
        next(error)
    }
};
// v2.logistics.get_tracking_number : GET ✅
export const getTrackingNumberController = async (req: Request, res: Response, next: NextFunction) => {
    const apiPath = '/api/v2/logistics/get_tracking_number';
    const validation = orderSnObjectSchema.extend({
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

            return fetchGetTrackingNumber({
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
// v2.logistics.get_mass_tracking_number : POST ✅
export const getMassTrackingNumberController = async (req: Request, res: Response, next: NextFunction) => {
    const apiPath = '/api/v2/logistics/get_mass_tracking_number';

    const validation = z.object({
        shop_id: zodShopIdSchema,
        package_list: z
            .array(packageNumberObjectSchema)
            .nonempty("package_list harus berisi minimal 1 package_number"),
        response_optional_fields: z.enum(["first_mile_tracking_number", "last_mile_tracking_number"])
    })

    try {
        const result = validation.safeParse(req.body);
        if (!result.success) {
            return next(result.error)
        }
        const { package_list, response_optional_fields, shop_id: shopId } = result.data

        const responseData = await authenticatedShopeeRequest(shopId, async (access_token) => {
            const timestamp = getTimestamp()
            const sign = generateSign({ timestamp, urlPath: apiPath, accessToken: access_token, shopId: shopId })
            const fullUrl = getFullApiPath(apiPath, timestamp, sign, shopId, access_token)
            const data = { package_list, response_optional_fields }
            return fetchGetMassTrackingNumber({ data, fullUrl })
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
// v2.logistics.get_shipping_document_parameter : POST ✅
export const getShippingDocumentParameter = async (req: Request, res: Response, next: NextFunction) => {
    const apiPath = '/api/v2/logistics/get_shipping_document_parameter';

    const validation = z.object({
        shop_id: zodShopIdSchema,
        order_list: z.array(z.object({ ...orderSnObjectSchema.shape, ...packageNumberObjectSchema.shape }))
    })

    try {
        const result = validation.safeParse(req.body);
        if (!result.success) {
            return next(result.error)
        }
        const { order_list, shop_id: shopId } = result.data

        const responseData = await authenticatedShopeeRequest(shopId, async (access_token) => {
            const timestamp = getTimestamp()
            const sign = generateSign({ timestamp, urlPath: apiPath, accessToken: access_token, shopId: shopId })
            const fullUrl = getFullApiPath(apiPath, timestamp, sign, shopId, access_token)
            const data = { order_list }
            return fetchGetShippingDocumentParam({ data, fullUrl })
        })

        if (responseData?.error || responseData?.message) {
            console.error('Shopee API Error:', responseData);
            return res.status(500).json({
                message: responseData.message,
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



// ### Document Label
// v2.logistics.create_shipping_document : POST✅
export const createShippingDocumentController = async (req: Request, res: Response, next: NextFunction) => {
    const apiPath = '/api/v2/logistics/create_shipping_document';

    try {
        const downloadDocSchema = z.object({
            order_list: z
                .array(
                    z.object({
                        order_sn: zodOrderSnSchema,
                        package_number: zodPackageNumberSchema.optional(),
                        tracking_number: zodTrackingNumberSchema.optional(),
                        shipping_document_type: zodShippingDocumentTypeEnum,
                    }))
                .nonempty("order_list harus berisi minimal 1 order"),
            shop_id: zodShopIdSchema
        })

        const result = downloadDocSchema.safeParse(req.body);
        if (!result.success) {
            return next(result.error)
        }
        const { order_list, shop_id: shopId } = result.data

        const responseData = await authenticatedShopeeRequest(shopId, async (access_token) => {
            const timestamp = getTimestamp().toString()
            const sign = generateSign({ timestamp, urlPath: apiPath, accessToken: access_token, shopId: shopId })
            const fullUrl = `${SHOPEE_BASE_URL}${apiPath}?partner_id=${SHOPEE_PARTNER_ID}&timestamp=${timestamp}&sign=${sign}&shop_id=${shopId}&access_token=${access_token}`;

            return fetchCreateShippingDocument({ data: { order_list, }, fullUrl })
        })

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
export const getShippingDocumentResultController = async (req: Request, res: Response, next: NextFunction) => {
    const apiPath = '/api/v2/logistics/get_shipping_document_result';
    const getShippingSchema = z.object({
        order_list: z
            .array(
                z.object({
                    order_sn: zodOrderSnSchema,
                    package_number: zodPackageNumberSchema.optional(),
                    shipping_document_type: zodShippingDocumentTypeEnum.optional(),
                })
            )
            .nonempty("order_list harus berisi minimal 1 order"),
        shipping_document_type: zodShippingDocumentTypeEnum,
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
                message: 'Gagal mendapatkan data dari Shopee: ' + responseData.message,
                error: responseData
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
            .array(orderSnObjectSchema)
            .nonempty("order_list harus berisi minimal 1 order"),
        shipping_document_type: zodShippingDocumentTypeEnum,
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