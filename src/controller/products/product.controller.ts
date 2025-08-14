import { NextFunction, Request, Response } from "express";
import z from "zod";
import { fetchGetAtributeTree } from "../../api/product/get-atrribute-tree";
import { fetchGetItemList } from "../../api/product/get-item-list.api";
import { fetchGetProductCategory } from "../../api/product/get-product-category";
import { SHOPEE_PARTNER_ID } from "../../config";
import { zodQueryNumber } from "../../schema/zod";
import { StatusProduct } from "../../types/product.type";
import { authenticatedShopeeRequest } from "../../utils/authenticatedShopeeRequest";
import { checkShopeeResponse } from "../../utils/checkShopeeResponse";
import { getFullApiPath } from "../../utils/getFullApiPath";
import { getTimestamp } from "../../utils/getTimeStamp";
import { generateSign } from "../../utils/sign";

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
                    sign,
                    timestamp,
                    shop_id: shopId,
                    access_token: accessToken,
                    partner_id: SHOPEE_PARTNER_ID,
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
export const getProductByShopId = async (req: Request, res: Response, next: NextFunction) => {
    const apiPath = '/api/v2/product/get_item_list';
    const validation = z.object({
        shop_id: zodQueryNumber, // Validasi string dan ubah ke number
        offset: zodQueryNumber,
        page_size: zodQueryNumber,
        item_status: z.enum(StatusProduct)
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
                    sign,
                    timestamp,
                    shop_id: shopId,
                    access_token: accessToken,
                    item_status,
                    offset,
                    page_size
                }
            })
        })

        const shopeeResponse = checkShopeeResponse<typeof responseData>(responseData)
        return res.json({
            timestamp,
            statusCode: 200,
            data: shopeeResponse.response
        })

    } catch (error) {
        next(error)
    }

} 