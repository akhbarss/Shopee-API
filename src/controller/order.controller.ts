import axios from "axios";
import { NextFunction, Request, Response } from "express";
import z from "zod";
import { fetchGetOrderDetail } from "../api/order/get_order_detail.api";
import { fetchGetOrderList } from "../api/order/get_order_list.api";
import { fetchGetShipmentList } from "../api/order/get_shipment_list";
import { fetchSearchPackageList } from "../api/order/search_package_list.api";
import { SHOPEE_BASE_URL, SHOPEE_PARTNER_ID } from "../config";
import { prisma } from "../prisma";
import { OrderStatus } from "../types/order.type";
import { authenticatedShopeeRequest } from "../utils/authenticatedShopeeRequest";
import { getTimestamp } from "../utils/getTimeStamp";
import { generateSign } from "../utils/sign";
import { zodShopIdSchema } from "../schema/zod";
import { getFullApiPath } from "../utils/getFullApiPath";

const zodorderSnListSchema = z.string().nonempty()
const orderStatusSchema = z.object({ status: z.enum(OrderStatus) });

// v2.order.get_order_list : GET ✅
export const getOrderListController = async (req: Request, res: Response, next: NextFunction) => {
    const apiPath = '/api/v2/order/get_order_list';
    const validation = orderStatusSchema.extend({
        shop_id: zodShopIdSchema
    })

    try {
        const result = validation.safeParse(req.query)
        if (!result.success) {
            return next(result.error)
        }
        const { shop_id: shopId, status } = result.data
        const timestamp = getTimestamp()
        const responseData = await authenticatedShopeeRequest(shopId, async (access_token) => {
            const sign = generateSign({ urlPath: apiPath, timestamp, accessToken: access_token, shopId });
            return fetchGetOrderList({
                access_token,
                shop_id: shopId,
                sign,
                timestamp,
                status,

            });
        });

        return res.json({
            timestamps: getTimestamp(),
            statusCode: 200,
            data: responseData.response
        });

    } catch (error) {
        next(error);
    }
};

// v2.order.get_order_by_tracking_number : GET ✅
export const getOrderByTrackingNumber = async (req: Request, res: Response, next: NextFunction) => {
    const apiPath = '/api/v2/order/get_order_by_tracking_number';
    try {
        // Ambil shopId dan nomor resi dari query parameter
        // const requestedShopId = req.query.shopId;
        // const trackingNumber = req.query.resi;

        // if (!requestedShopId || !trackingNumber) {
        //     return res.status(400).send('Parameter shopId dan resi wajib disertakan.');
        // }

        // const parsedShopId = parseInt(requestedShopId as string, 10);
        // if (isNaN(parsedShopId)) {
        //     return res.status(400).send('shopId harus berupa angka.');
        // }

        // 1. Ambil token spesifik berdasarkan shopId
        // const tokenInfo = await prisma.token.findUnique({
        //     where: {
        //         shopId: parsedShopId,
        //     },
        // });

        // if (!tokenInfo) {
        //     return res.status(401).send(`Token untuk shopId ${parsedShopId} tidak ditemukan.`);
        // }

        // const { shopId, accessToken } = tokenInfo;
        const timestamp = getTimestamp()

        // Endpoint untuk mengambil order berdasarkan nomor resi

        // 2. Generate sign dengan format yang benar
        // const sign = generateSign({ urlPath: apiPath, timestamp: timestamp.toString(), accessToken, shopId: shopId.toString() });

        // 3. Siapkan parameter API
        const params = {
            partner_id: SHOPEE_PARTNER_ID,
            // shop_id: shopId,
            timestamp: timestamp,
            // access_token: accessToken,
            // sign: sign,
            // tracking_number: trackingNumber, // Parameter nomor resi
            response_optional_fields: 'order_status,payment_info' // Tambahan data yang ingin diambil
        };

        // 4. Panggil API Shopee
        const response = await axios.get(`${SHOPEE_BASE_URL}${apiPath}`, {
            params: params
        });

        // 5. Kirim data order sebagai respons
        res.json(response.data);

    } catch (error) {
        next(error)
    }
}
export const getOrderByPesanan = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // const { shop_id } = shopIdSchema.parse(req.query);
        // const { order_sn_list } = orderSnListSchema.parse(req.query);
        const schem = z.object({ shop_id: zodShopIdSchema, order_sn_list: zodorderSnListSchema })

        const { order_sn_list, shop_id } = schem.parse(req.query)


        const responseData = await authenticatedShopeeRequest(shop_id, async (accessToken) => {
            const urlPath = '/api/v2/order/get_order_detail';
            const timestamp = Math.floor(Date.now() / 1000);
            const sign = generateSign({ urlPath, timestamp: timestamp.toString(), accessToken, shopId: shop_id.toString() });

            return fetchGetOrderDetail({
                access_token: accessToken,
                shop_id,
                sign,
                timestamp,
                order_sn_list,
            });
        });

        const data = responseData.response
        res.json({
            timestamps: Math.floor(Date.now() / 1000),
            statusCode: 200,
            data
        });

    } catch (error) {
        next(error)
    }
}
export const getShipmentListController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const schem = z.object({ shop_id: zodShopIdSchema, page_size: zodShopIdSchema })
        const result = schem.safeParse(req.query);

        if (!result.success) {
            return next(result.error)
        }
        const { shop_id, page_size } = result.data

        const responseData = await authenticatedShopeeRequest(shop_id, async (accessToken) => {
            const urlPath = '/api/v2/order/get_shipment_list';
            const timestamp = getTimestamp()
            const sign = generateSign({ urlPath, timestamp: timestamp.toString(), accessToken, shopId: shop_id.toString() });

            return fetchGetShipmentList({
                access_token: accessToken,
                shop_id,
                sign,
                timestamp,
                page_size
            });
        });

        console.log({ responseData })

        const data = responseData
        res.json({
            timestamps: Math.floor(Date.now() / 1000),
            statusCode: 200,
            data
        });

    } catch (error) {
        next(error);
    }
}
export const getSearchPackageListController = async (req: Request, res: Response, next: NextFunction) => {
    const apiPath = '/api/v2/order/search_package_list';
    const url = req.url
    console.log({url})
    const schem = z.object({
        shop_id: zodShopIdSchema,
        filter: z.object({
            package_status: z.number().max(3),
            // product_location_ids
            logistics_channel_ids: z.array(z.number()),
            fulfillment_type: z.number().max(2),
            // invoice_pending: 

        }),
        pagination: z.object({
            page_size: z.number().min(1,).max(100),
            cursor: z.string().optional()
        }),
        sort: z.object({
            sort_type: z.number().min(1).max(3)
        })
    })

    try {
        const result = schem.safeParse(req.body);
        if (!result.success) {
            return next(result.error)
        }

        const {
            shop_id,
            filter: {
                fulfillment_type, logistics_channel_ids, package_status
            },
            pagination: { page_size, cursor },
            sort: { sort_type }
        } = result.data
        const timestamp = getTimestamp()
        const responseData = await authenticatedShopeeRequest(shop_id, async (accessToken) => {
            const sign = generateSign({ urlPath: apiPath, timestamp: timestamp.toString(), accessToken, shopId: shop_id.toString() });
            const fullUrl = getFullApiPath(apiPath, timestamp, sign, shop_id, accessToken)

            return fetchSearchPackageList({
                fullUrl,
                data: {
                    filter: {
                        fulfillment_type,
                        logistics_channel_ids,
                        package_status,
                    },
                    pagination: { cursor, page_size },
                    sort: { sort_type }
                },
            });
        });

        console.log({ responseData })


        res.json({
            timestamps: timestamp,
            statusCode: 200,
            data: responseData
        });

    } catch (error) {
        next(error);
    }
}