import { Request, Response } from "express";
import { fetchGetAllShops } from "../../api/shops/get_shops_by_partner.api";
import { prisma } from "../../prisma";
import { getTimestamp } from "../../utils/getTimeStamp";
import { generateSign } from "../../utils/sign";

export const getShopController = async (req: Request, res: Response) => {
    const timestamp = getTimestamp().toString()
    const urlPath = '/api/v2/public/get_shops_by_partner';
    const sign = generateSign({ timestamp, urlPath })
    const responseData = await fetchGetAllShops({ sign, timestamp })

    if (!responseData) return res.status(400).json({ message: "get shops failed" });

    const foundUser = await prisma.user.findUnique({
        where: {
            id: req.user?.id
        },
        include: {
            shops: true
        }
    })

    if (!foundUser) return res.status(400).json({ message: "usernotfound" });

    const shopsUser = foundUser.shops
    const filteredShops = responseData.authed_shop_list.filter((shop) => {
        return shopsUser.some(userShop => userShop.shopId === shop.shop_id)
    })

    console.log({filteredShops})

    res.json({
        timestamps: getTimestamp(),
        statusCode: 200,
        data: filteredShops
    });
}