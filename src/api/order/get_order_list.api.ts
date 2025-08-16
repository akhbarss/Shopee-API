import axios from 'axios';
import { SHOPEE_BASE_URL, SHOPEE_PARTNER_ID } from '../../config';
import { FetchAuthParams, OrderStatus } from '../../types/order.type';
import { ResponseOrderShopee } from '../../types/data.type';
import { getTimestamp } from '../../utils/getTimeStamp';

type OrderList = {
    order_sn: string
    booking_sn: string
    order_status: string
}

type ResGetOrderList = {
    more: false
    next_cursor: string
    order_list: OrderList[]
}

type PayloadFetchGetOrderList = {
    access_token: string;
    shop_id: number;
    sign: string;
    timestamp: number;
    status?: OrderStatus

    time_to?: number | string;
    partner_id?: number;
    time_range_field?: string;
    page_size?: number;
    time_from?: number;
    response_optional_fields?: string;
}

/**
 * Fungsi ini bertanggung jawab HANYA untuk memanggil endpoint get_order_list Shopee.
 * @param params - Semua parameter yang dibutuhkan untuk panggilan API.
 * @returns Data respons dari API Shopee.
 */
export const fetchGetOrderList = async (
    {
        access_token,
        shop_id,
        sign,
        status,
        timestamp,
        page_size = 50,
        partner_id = SHOPEE_PARTNER_ID,
        time_from = timestamp - (14 * 24 * 60 * 60),
        time_range_field = "create_time",
        time_to = getTimestamp(),
        // response_optional_fields = "order_status",
    }: PayloadFetchGetOrderList
): Promise<ResponseOrderShopee<ResGetOrderList>> => {
    const urlPath = '/api/v2/order/get_order_list';

    const apiParams = {
        timestamp,
        access_token,
        shop_id,
        sign,
        order_status: status,
        time_to,
        partner_id,
        time_range_field,
        page_size,
        time_from,
        // response_optional_fields,
    };

    const response = await axios.get<ResponseOrderShopee<ResGetOrderList>>(`${SHOPEE_BASE_URL}${urlPath}`, {
        params: apiParams,
    });
    console.log("################")
    console.log({ data: response.data })
    return response.data;
};