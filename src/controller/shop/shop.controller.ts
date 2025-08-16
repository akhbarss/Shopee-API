import { NextFunction, Request, Response } from "express";
import z from 'zod';
import { fetchGetShopInfo } from '../../api/shop/get-shop-info.api';
import { zodQueryNumber } from "../../schema/zod";
import { authenticatedShopeeRequest } from "../../utils/authenticatedShopeeRequest";
import { checkShopeeResponse } from "../../utils/checkShopeeResponse";
import { getFullApiPath } from "../../utils/getFullApiPath";
import { getTimestamp } from "../../utils/getTimeStamp";
import { generateSign } from "../../utils/sign";
import { fetchGetProfile } from "../../api/shop/get-profile";

// v2.shop.get_shop_info : GET ✅
export const getShopInfoController = async (req: Request, res: Response, next: NextFunction) => {
    const apiPath = '/api/v2/shop/get_shop_info';
    const reqQueryValidation = z.object({
        shop_id: zodQueryNumber,
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
            return fetchGetShopInfo({ fullApiPath })
        })
        const shopeeRes = checkShopeeResponse(responseData)

        return res.json({
            timestamp,
            statusCode: 200,
            data: shopeeRes
        })
    } catch (error) {
        next(error)
    }
}

// v2.shop.get_profile : GET ✅
export const getProfileController = async (req: Request, res: Response, next: NextFunction) => {
    const apiPath = '/api/v2/shop/get_profile';
    const reqQueryValidation = z.object({
        shop_id: zodQueryNumber,
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
            return fetchGetProfile({ fullApiPath })
        })
        const shopeeRes = checkShopeeResponse(responseData)

        return res.json({
            timestamp,
            statusCode: 200,
            data: shopeeRes.response
        })
    } catch (error) {
        next(error)
    }
}