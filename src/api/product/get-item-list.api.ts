import axios from 'axios';
import { LogisticsChannel } from '../../types/logistics.type';
import { BaseResponse } from '../../types/data.type';
import { StatusProduct } from '../../types/product.type';


type ParamsGetItemList = {
    fullApiPath: string
    params: {
        access_token: string;
        shop_id: number;
        sign: string;
        timestamp: number | string;
        offset: number,
        page_size: number,
        item_status: StatusProduct
    }
}


type ResGetItemList = {
    "response": {
        "item": [
            {
                "item_id": 2500139861,
                "item_status": "NORMAL",
                "tag": {
                    "kit": false
                },
                "update_time": 1608128470
            }
        ],
        "total_count": 19,
        "has_next_page": true,
        "next_offset": 10
    }
} & BaseResponse

/**
 * Fungsi ini bertanggung jawab HANYA untuk memanggil endpoint get_order_list Shopee.
 * @param payload - GET
 * @returns Data respons dari API Shopee.
 * 
 */


export const fetchGetItemList = async (
    payload: ParamsGetItemList
): Promise<ResGetItemList> => {
    const { fullApiPath, params } = payload
    const shopeeResponse = await axios.get<ResGetItemList>(fullApiPath, { params });

    return shopeeResponse.data
};
