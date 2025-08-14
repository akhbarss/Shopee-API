import { NextFunction, Request, Response } from "express";
import z from "zod";
import { fetchGetOrderDetail } from "../../api/order/get_order_detail.api";
import { fetchGetOrderList } from "../../api/order/get_order_list.api";
import { fetchGetShipmentList } from "../../api/order/get_shipment_list";
import { fetchSearchPackageList } from "../../api/order/search_package_list.api";
import { zodQueryNumber } from "../../schema/zod";
import { OrderStatus } from "../../types/order.type";
import { authenticatedShopeeRequest } from "../../utils/authenticatedShopeeRequest";
import { getFullApiPath } from "../../utils/getFullApiPath";
import { getTimestamp } from "../../utils/getTimeStamp";
import { generateSign } from "../../utils/sign";
import { prisma } from "../../prisma";

const zodorderSnListSchema = z.string().nonempty()
const orderStatusSchema = z.object({ status: z.enum(OrderStatus) });

// v2.order.get_order_list : GET ✅
export const getOrderListController = async (req: Request, res: Response, next: NextFunction) => {
    const apiPath = '/api/v2/order/get_order_list';
    const validation = orderStatusSchema.extend({
        shop_id: zodQueryNumber
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
        const schem = z.object({ shop_id: zodQueryNumber, order_sn_list: zodorderSnListSchema })
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
        const schem = z.object({ shop_id: zodQueryNumber, page_size: zodQueryNumber })
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
        shop_id: zodQueryNumber,
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

export const getAllNewOrderDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1. Ambil user dan shop yang terkait
        const foundUser = await prisma.user.findUnique({
            where: { id: req.user?.id },
            select: {
                shops: {
                    select: {
                        shopId: true,
                        shopName: true,
                    }
                }
            }
        });

        if (!foundUser) return res.status(400).json({ message: "User tidak ditemukan" });

        const shopsAvailable = foundUser.shops;

        if (!shopsAvailable || shopsAvailable.length === 0) {
            return res.status(400).json({ message: "User tidak memiliki toko" });
        }

        // 2. Ambil status order dari query params (default PROCESSED)
        const status = (req.query.status as string) || "PROCESSED";

        // 3. Ambil order untuk semua shop secara paralel
        const allOrders = await Promise.all(
            shopsAvailable.map(shop =>
                authenticatedShopeeRequest(shop.shopId, async access_token => {
                    const apiPathGetOrderList = "/api/v2/order/get_order_list";
                    const apiPathGetOrderDetail = '/api/v2/order/get_order_detail';
                    const timestamp = getTimestamp();
                    const signOrderList = generateSign({ urlPath: apiPathGetOrderList, timestamp, accessToken: access_token, shopId: shop.shopId });
                    const signOrderDetail = generateSign({ urlPath: apiPathGetOrderDetail, timestamp, accessToken: access_token, shopId: shop.shopId });

                    const ordersData = await fetchGetOrderList({
                        access_token,
                        shop_id: shop.shopId,
                        sign: signOrderList,
                    timestamp,
                        status: OrderStatus.READY_TO_SHIP
                    });

                    // Ambil order_sn list
                    const orderSnList = ordersData.response.order_list.map(o => o.order_sn).join(",");
                    if (!orderSnList) return [];

                    // Ambil detail order
                    const orderDetailData = await fetchGetOrderDetail({
                        // shopId: shop.shop_id,
                        access_token,
                        shop_id: shop.shopId,
                        sign: signOrderDetail,
                        timestamp,
                        order_sn_list: orderSnList
                    });

                    // Format data
                    return orderDetailData.response.order_list.map(order => {
                        const { buyer_username, create_time, item_list, order_sn, order_status, pay_time, payment_method, package_list,
                            total_amount, shipping_carrier, update_time, ship_by_date, pickup_done_time, region, currency,
                            recipient_address: { city, district, full_address, name, phone, state, }, } = order;


                        return {
                            key: pay_time,
                            shop_detail: shop,
                            item_list: item_list.map((item) => ({ ...item, currency })),
                            order_sn, order_status, pay_time, payment_method,
                            buyer_username,
                            create_time,
                            total_amount, shipping_carrier, update_time, ship_by_date, pickup_done_time,
                            city, district, full_address, name, phone, region, state, currency, package_list
                        };
                    });
                })
            )
        );

        // 4. Flatten array hasil fetch semua shop
        const formattedData = allOrders.flat();

        return res.json({
            timestamp: getTimestamp(),
            statusCode: 200,
            data: formattedData
        });

    } catch (error) {
        next(error);
    }
};