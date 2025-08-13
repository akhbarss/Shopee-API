import axios from 'axios';
import { SHOPEE_BASE_URL, SHOPEE_PARTNER_ID } from '../../config';
import { ResponseOrderShopee } from '../../types/data.type';
import { ResGetShopsByPartner } from '../../types/response.type';


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
    console.log("################")
    console.log({ data: response.data , authed_shop_list: response.data.authed_shop_list})
    return response.data;
};