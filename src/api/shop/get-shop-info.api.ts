import axios from 'axios';
import { BaseResponse } from '../../types/data.type';

type ParamsGetShopInfo = {
    fullApiPath: string
}

type ResGetShopInfo = {
    "shop_name": "OpenSANDBOX90192062dce99c309ec",
    "region": "ID",
    "status": "NORMAL",
    "is_sip": false,
    "is_cb": false,
    "request_id": "e3e3e7f33c6aae92a747915015ae0f01",
    "auth_time": 1755277744,
    "expire_time": 1786899599,
    "error": "",
    "message": "",
    "is_upgraded_cbsc": false,
    "merchant_id": null,
    "shop_fulfillment_flag": "Others",
    "is_main_shop": false,
    "is_direct_shop": false,
    "linked_main_shop_id": 0,
    "linked_direct_shop_list": [],
    "is_one_awb": false
} & BaseResponse

/**
 * Fungsi ini bertanggung jawab HANYA untuk memanggil endpoint get_order_list Shopee.
 * @param payload - GET
 * @returns Data respons dari API Shopee.
 */

export const fetchGetShopInfo = async (
    payload: ParamsGetShopInfo
): Promise<ResGetShopInfo> => {
    const { fullApiPath, } = payload
    const shopeeResponse = await axios.get<ResGetShopInfo>(fullApiPath);

    return shopeeResponse.data
};
