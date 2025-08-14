import axios from 'axios';
import { LogisticsChannel } from '../../types/logistics.type';
import { BaseResponse } from '../../types/data.type';


type ParamsGetProductCategory = {
    fullApiPath: string
    params: {
        access_token: string;
        shop_id: number;
        sign: string;
        timestamp: number | string;
        partner_id: number;
        language: string;
    }
}


type ResGetChanelList = {
    "response": {
        "category_list": [{
            "category_id": 123,
            "parent_category_id": 456,
            "original_category_name": "aaa",
            "display_category_name": "bbb",
            "has_children": false
        }]
    }
} & BaseResponse

/**
 * Fungsi ini bertanggung jawab HANYA untuk memanggil endpoint get_order_list Shopee.
 * @param payload - GET
 * @returns Data respons dari API Shopee.
 */

export const fetchGetProductCategory = async (
    payload: ParamsGetProductCategory
): Promise<ResGetChanelList> => {
    const { fullApiPath, params } = payload
    const shopeeResponse = await axios.get<ResGetChanelList>(fullApiPath, { params });

    return shopeeResponse.data
};
