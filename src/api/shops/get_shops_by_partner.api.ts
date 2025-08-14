import axios from 'axios';
import { SHOPEE_BASE_URL, SHOPEE_PARTNER_ID } from '../../config';
import { BaseResponse, ResponseOrderShopee } from '../../types/data.type';
// import { ResGetShopsByPartner } from '../../types/response.type';

type ResGetShopsByPartner = {
    authed_shop_list: {
        "shop_id": 1044365033,
        "expire_time": 1786660488,
        "auth_time": 1755124489,
        "region": "ID",
        "sip_affi_shop_list": []
    }[],
} & BaseResponse

/**
 * Fungsi ini bertanggung jawab HANYA untuk memanggil endpoint get_order_list Shopee.
 * @param params - Semua parameter yang dibutuhkan untuk panggilan API.
 * @returns Data respons dari API Shopee.
 */
export const fetchGetAllShops = async (
    params: {
        timestamp: string;
        sign: string
    }
): Promise<ResGetShopsByPartner> => {
    const urlPath = '/api/v2/public/get_shops_by_partner';

    const apiParams = {
        partner_id: SHOPEE_PARTNER_ID,
        timestamp: params.timestamp,
        sign: params.sign,
    };

    const response = await axios.get<ResGetShopsByPartner>(`${SHOPEE_BASE_URL}${urlPath}`, { params: apiParams });
    return response.data;
};