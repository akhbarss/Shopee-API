import axios from 'axios';
import { BaseResponse } from '../../types/data.type';

type ResShipOrder = {} & BaseResponse

type PayloadShipOrder = {
    fullUrl: string;
    data: {
        dropoff?: {},
        pickup?: {},
        order_sn: any,
        package_number: string
    }
}

/**
 * Fungsi ini bertanggung jawab HANYA untuk memanggil endpoint get_order_list Shopee.
 * @param payload - POST
 * @returns Data respons dari API Shopee.
 */

export const fetchShipOrder = async (
    payload: PayloadShipOrder
): Promise<ResShipOrder> => {
    const { data, fullUrl } = payload
    const apiResponse = await axios.post<ResShipOrder>(fullUrl, data, {
        headers: {
            'Content-Type': 'application/json',
        },
    })
    return apiResponse.data
};
