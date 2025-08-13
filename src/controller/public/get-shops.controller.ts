import { Request, Response } from "express";
import { authenticatedShopeeRequest } from "../../utils/authenticatedShopeeRequest";
import { fetchGetAllShops } from "../../api/shops/get_shops_by_partner.api";
import { generateSign } from "../../utils/sign";
import { getTimestamp } from "../../utils/getTimeStamp";

export const getShopController = async (req: Request, res: Response) => {
    const timestamp = getTimestamp().toString()
    const urlPath = '/api/v2/public/get_shops_by_partner';
    const sign = generateSign({ timestamp, urlPath })
    const responseData = await fetchGetAllShops({ sign, timestamp })
    console.log({ responseData })
    res.json({
        timestamps: getTimestamp(),
        statusCode: 200,
        data: responseData.authed_shop_list
    });
}