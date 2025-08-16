import { NextFunction, Request, Response } from "express";
import z from "zod";
import { fetchGetAtributeTree } from "../../api/item/get-atrribute-tree";
import { fetchGetItemList } from "../../api/item/get-item-list.api";
import { fetchGetProductCategory } from "../../api/item/get-items-category";
import { SHOPEE_PARTNER_ID } from "../../config";
import { zodQueryNumber } from "../../schema/zod";
import { StatusItem } from "../../types/item.type";
import { authenticatedShopeeRequest } from "../../utils/authenticatedShopeeRequest";
import { checkShopeeResponse } from "../../utils/checkShopeeResponse";
import { getFullApiPath } from "../../utils/getFullApiPath";
import { getTimestamp } from "../../utils/getTimeStamp";
import { generateSign } from "../../utils/sign";
import { OrderStatus } from "../../types/order.type";
import { getUserShops } from "../../service/order.service";
import { fetchGetItemBaseInfo } from "../../api/item/get-item-base-info";

// /api/v2/product/get_category : GET✅
export const getProductCategoryController = async (req: Request, res: Response, next: NextFunction) => {
    const apiPath = '/api/v2/product/get_category';
    const getChannelListSchema = z.object({
        shop_id: zodQueryNumber
    })

    try {
        const result = getChannelListSchema.safeParse(req.query)
        console.log(result.error)
        if (!result.success) {
            return next(result.error)
        }

        const { shop_id: shopId } = result.data
        const timestamp = getTimestamp()
        const responseData = await authenticatedShopeeRequest(shopId, async (accessToken) => {
            const sign = generateSign({ urlPath: apiPath, timestamp, accessToken, shopId })
            const fullApiPath = getFullApiPath(apiPath)

            return fetchGetProductCategory({
                fullApiPath,
                params: {
                    sign,
                    timestamp,
                    shop_id: shopId,
                    access_token: accessToken,
                    partner_id: SHOPEE_PARTNER_ID,
                    language: "en"
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
            data: responseData.response.category_list
        })
    } catch (error) {
        next(error)
    }
}

// /api/v2/product/v2.product.get_attribute_tree : GET
export const getAttributeTreeController = async (req: Request, res: Response, next: NextFunction) => {
    const apiPath = '/api/v2/product/get_attribute_tree';
    const getChannelListSchema = z.object({
        shop_id: zodQueryNumber,
        category_id_list: z.string().nonempty()
    })

    try {
        const result = getChannelListSchema.safeParse(req.query)
        console.log(result.error)
        if (!result.success) {
            return next(result.error)
        }

        const { shop_id: shopId, category_id_list } = result.data
        const timestamp = getTimestamp()
        const responseData = await authenticatedShopeeRequest(shopId, async (accessToken) => {
            const sign = generateSign({ urlPath: apiPath, timestamp, accessToken, shopId })
            const fullApiPath = getFullApiPath(apiPath)

            return fetchGetAtributeTree({
                fullApiPath,
                params: {
                    category_id_list
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

        return res.json({
            timestamp,
            statusCode: 200,
            data: responseData.response.list
        })
    } catch (error) {
        next(error)
    }
}

// /api/v2/product/v2.product.get_item_list : GET✅
export const getItemList = async (req: Request, res: Response, next: NextFunction) => {
    const apiPath = '/api/v2/product/get_item_list';
    const validation = z.object({
        shop_id: zodQueryNumber, // Validasi string dan ubah ke number
        offset: zodQueryNumber,
        page_size: zodQueryNumber,
        item_status: z.enum(StatusItem)
    });

    try {
        const result = validation.safeParse(req.query)
        if (!result.success) {
            return next(result.error)
        }

        const { shop_id: shopId, item_status, offset, page_size } = result.data
        const timestamp = getTimestamp()
        const responseData = await authenticatedShopeeRequest(shopId, async (accessToken) => {
            const sign = generateSign({ urlPath: apiPath, timestamp, accessToken, shopId })
            const fullApiPath = getFullApiPath(apiPath, timestamp, sign, shopId, accessToken)

            return fetchGetItemList({
                fullApiPath,
                params: {
                    item_status,
                    offset,
                    page_size
                }
            })
        })

        const { response: { item: items, ...pagination } } = checkShopeeResponse<typeof responseData>(responseData)
        const formattedData = items.map(item => ({ ...item, key: item.item_id }))

        return res.json({
            timestamp,
            statusCode: 200,
            data: { ...pagination, item: formattedData }
        })

    } catch (error) {
        console.log({ error })
        next(error)
    }

}

// /api/v2/product/v2.product.get_item_base_info : GET✅
export const getItemBaseInfo = async (req: Request, res: Response, next: NextFunction) => {
    const apiPath = '/api/v2/product/get_item_base_info';
    const validation = z.object({
        shop_id: zodQueryNumber, // Validasi string dan ubah ke number
        item_id_list: z.string().nonempty()
    });

    try {
        const result = validation.safeParse(req.query)
        if (!result.success) {
            return next(result.error)
        }

        const { shop_id: shopId, item_id_list } = result.data
        const timestamp = getTimestamp()
        const responseData = await authenticatedShopeeRequest(shopId, async (accessToken) => {
            const sign = generateSign({ urlPath: apiPath, timestamp, accessToken, shopId })
            const fullApiPath = getFullApiPath(apiPath, timestamp, sign, shopId, accessToken)

            return fetchGetItemBaseInfo({
                fullApiPath,
                params: {
                    item_id_list
                }
            })
        })

        const data = checkShopeeResponse<typeof responseData>(responseData)
        // const formattedData = items.map(item => ({ ...item, key: item.item_id }))

        return res.json({
            timestamp,
            statusCode: 200,
            data: data.response.item_list
        })

    } catch (error) {
        next(error)
    }

}

function chunkArray<T>(array: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}

export const GetAllItems = async (req: Request, res: Response, next: NextFunction) => {
    const validation = z.object({
        status: z.enum(StatusItem),
    });

    try {
        const result = validation.safeParse(req.query);
        if (!result.success) {
            return next(result.error);
        }
        const { status } = result.data;
        const userId = req.user?.id;
        const shopsAvailable = await getUserShops(userId!);

        const items = await Promise.all(
            shopsAvailable.map(({ shopId, shopName }) =>
                authenticatedShopeeRequest(shopId, async (accessToken) => {
                    console.log("START ✅", { shopName });

                    const apiPathGetItemList = "/api/v2/product/get_item_list";
                    const apiPathGetItemBaseInfo = "/api/v2/product/get_item_base_info";

                    const timestamp = getTimestamp();
                    const signItemList = generateSign({ urlPath: apiPathGetItemList, timestamp, accessToken, shopId });
                    const signItemBaseInfo = generateSign({ urlPath: apiPathGetItemBaseInfo, timestamp, accessToken, shopId });

                    const fullapiPathGetItemList = getFullApiPath(apiPathGetItemList, timestamp, signItemList, shopId, accessToken);
                    const fullapiPathGetItemBaseInfo = getFullApiPath(apiPathGetItemBaseInfo, timestamp, signItemBaseInfo, shopId, accessToken);

                    // 1️⃣ Ambil semua item list dengan pagination
                    let allItems: any[] = [];
                    let offset = 0;
                    const pageSize = 100;
                    console.log("1")
                    while (true) {
                        console.log("2")
                        const itemsData = await fetchGetItemList({
                            fullApiPath: fullapiPathGetItemList,
                            params: {
                                item_status: status,
                                offset,
                                page_size: pageSize,
                            },
                        });
                        console.log({itemsData, shopId, shopName})

                        console.log("3")
                        if (!itemsData.response.item || itemsData.response.item.length === 0) break;
                        console.log("4")

                        allItems.push(...itemsData.response.item);
                        console.log("5")
                        if (itemsData.response.item.length < pageSize) break; // Tidak ada page berikutnya
                        offset += pageSize;
                    }

                    // Kalau tidak ada item
                    if (allItems.length === 0) {
                        return [];
                    }
                    console.log("6")

                    // 2️⃣ Pecah item_id jadi batch max 50
                    const chunks = chunkArray(allItems.map((itm) => itm.item_id), 50);
                    console.log("7")

                    // 3️⃣ Ambil base info untuk tiap batch
                    const allBaseInfo = (
                        await Promise.all(
                            chunks.map((chunk) =>
                                fetchGetItemBaseInfo({
                                    fullApiPath: fullapiPathGetItemBaseInfo,
                                    params: { item_id_list: chunk.join(",") },
                                })
                            )
                        )
                    ).flatMap((res) =>
                        res.response.item_list.map((item) => {
                            console.log("8")

                            return {
                                key: item.item_id,
                                shop_info: { shopId, shopName },
                                ...item,
                                has_model: item.has_model + "",
                                is_fulfillment_by_shopee: item.is_fulfillment_by_shopee + ""
                            }
                        })
                    );
                    console.log("9")

                    console.log("END ✅", { shopName, total: allBaseInfo.length });
                    return allBaseInfo;
                })
            )
        );

        const formattedData = items.flat();

        return res.json({
            timestamp: getTimestamp(),
            statusCode: 200,
            data: formattedData,
        });
    } catch (error) {
        next(error);
    }
};