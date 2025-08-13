import axios from 'axios';
import { BaseResponse } from '../../types/data.type';

type ParamsGetTrackingNumber = {
    fullApiPath: string
    params: {
        access_token: string;
        shop_id: number;
        sign: string;
        timestamp: number;
        partner_id: number
        order_sn: string
    }
}

type ResGetTrackingNumber = {
    "response": {
        "tracking_number": "MY200448706479IT",
        "first_mile_tracking_number": "CNF877146678717210312",
        hint: string;
    },
} & BaseResponse

/**
 * Fungsi ini bertanggung jawab HANYA untuk memanggil endpoint get_order_list Shopee.
 * @param payload - GET
 * @returns Data respons dari API Shopee.
 */

export const fetchGetTrackingNumber = async (
    payload: ParamsGetTrackingNumber
): Promise<ResGetTrackingNumber> => {
    const { fullApiPath, params } = payload
    const shopeeResponse = await axios.get<ResGetTrackingNumber>(fullApiPath, { params });

    return shopeeResponse.data
};
