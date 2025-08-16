import axios from 'axios';
import { BaseResponse } from '../../types/data.type';

type ParamsGetProfile = {
    fullApiPath: string
}

type ResGetProfile = {
    "response": {
        "shop_logo": "",
        "description": "",
        "shop_name": "OpenSANDBOX90192062dce99c309ec"
    }
} & BaseResponse

/**
 * Fungsi ini bertanggung jawab HANYA untuk memanggil endpoint get_order_list Shopee.
 * @param payload - GET
 * @returns Data respons dari API Shopee.
 */

export const fetchGetProfile = async (
    payload: ParamsGetProfile
): Promise<ResGetProfile> => {
    const { fullApiPath, } = payload
    const shopeeResponse = await axios.get<ResGetProfile>(fullApiPath);

    return shopeeResponse.data
};
