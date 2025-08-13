import axios from 'axios';
import { SHOPEE_BASE_URL, SHOPEE_PARTNER_ID } from '../../config';
import { FetchAuthParams } from '../../types/order.type';
import { ResponseOrderShopee } from '../../types/data.type';

type TrackingNumber = {
    order_sn: string
    booking_sn: string
    order_status: string
}

type ResGetTrackingNumber = {
    // more: false
    // next_cursor: string
    // order_list: TrackingNumber[]
}

/**
 * Fungsi ini bertanggung jawab HANYA untuk memanggil endpoint get_order_list Shopee.
 * @param params - Semua parameter yang dibutuhkan untuk panggilan API.
 * @returns Data respons dari API Shopee.
 */
export const fetchGetTrackingNumber = async (
    params: FetchAuthParams & { status: string }
): Promise<ResponseOrderShopee<ResGetTrackingNumber>> => {
    const urlPath = '/api/v2/order/get_order_list';

    const apiParams = {
        partner_id: SHOPEE_PARTNER_ID,
        shop_id: params.shop_id,
        timestamp: params.timestamp,
        sign: params.sign,
        access_token: params.access_token,
        page_size: 50,
        time_range_field: 'create_time',
        time_from: params.timestamp - (14 * 24 * 60 * 60),
        time_to: params.timestamp,
        order_status: params.status,
        response_optional_fields: "order_status",
    };

    const response = await axios.get<ResponseOrderShopee<ResGetTrackingNumber>>(`${SHOPEE_BASE_URL}${urlPath}`, {
        params: apiParams,
    });
    console.log("################")
    console.log({ data: response.data })
    return response.data;
};