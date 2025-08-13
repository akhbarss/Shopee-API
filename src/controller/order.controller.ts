import { NextFunction, Request, Response } from "express";
import z from "zod";
import { fetchGetOrderDetail } from "../api/order/get_order_detail.api";
import { fetchGetOrderList } from "../api/order/get_order_list.api";
import { fetchGetShipmentList } from "../api/order/get_shipment_list";
import { fetchSearchPackageList } from "../api/order/search_package_list.api";
import { zodShopIdSchema } from "../schema/zod";
import { OrderStatus } from "../types/order.type";
import { authenticatedShopeeRequest } from "../utils/authenticatedShopeeRequest";
import { getFullApiPath } from "../utils/getFullApiPath";
import { getTimestamp } from "../utils/getTimeStamp";
import { generateSign } from "../utils/sign";

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

// v2.order.get_order_detail : GET ✅
export const getOrderDetail = async (req: Request, res: Response, next: NextFunction) => {
    const urlPath = '/api/v2/order/get_order_detail';
    try {
        const schem = z.object({ shop_id: zodShopIdSchema, order_sn_list: zodorderSnListSchema })
        const result = schem.safeParse(req.query)
        if (!result.success) {
            return next(result.error)
        }

        const { order_sn_list, shop_id } = result.data
        const timestamp = getTimestamp()
        const responseData = await authenticatedShopeeRequest(shop_id, async (accessToken) => {
            const sign = generateSign({ urlPath, timestamp: timestamp.toString(), accessToken, shopId: shop_id.toString() });

            return fetchGetOrderDetail({
                access_token: accessToken,
                shop_id,
                sign,
                timestamp,
                order_sn_list,
            });
        });

        if (responseData.error || responseData.message) {
            console.error('Shopee API Error:', responseData.error);
            return res.status(500).json({
                message: 'Gagal mendapatkan data dari Shopee: ' + responseData.message,
                error: responseData
            });
        }

        res.json({
            timestamps: timestamp,
            data: responseData.response
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
    console.log({ url })
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
            sort_type: z.number().min(1).max(3),
            ascending: z.boolean()
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
            sort: { sort_type, ascending }
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
                    sort: { sort_type, ascending }
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