import axios from 'axios';
import { SHOPEE_BASE_URL, SHOPEE_PARTNER_ID } from '../../config';
import { ResponseOrderShopee } from '../../types/data.type';
import { ShopeeOrder } from '../../types/order.type';

type ResGetOrdersDetail = {
    order_list: ShopeeOrder[];
}

interface FetchOrdersParams {
    access_token: string;
    shop_id: number;
    sign: string;
    timestamp: number;
}

type GetOrderDetailParams = {
    order_sn_list: string
}

/**
 * Fungsi ini bertanggung jawab HANYA untuk memanggil endpoint get_order_list Shopee.
 * @param params - Semua parameter yang dibutuhkan untuk panggilan API.
 * @returns Data respons dari API Shopee.
 */
export const fetchGetOrderDetail = async (
    params: FetchOrdersParams & GetOrderDetailParams
): Promise<ResponseOrderShopee<ResGetOrdersDetail>> => {
    const urlPath = '/api/v2/order/get_order_detail';
    const { access_token, shop_id, sign, timestamp, order_sn_list, } = params

    const apiParams = {
        partner_id: SHOPEE_PARTNER_ID,
        shop_id,
        timestamp,
        order_sn_list,
        access_token,
        sign,
        // request_order_status_pending: true,
        response_optional_fields: "buyer_user_id,buyer_username,estimated_shipping_fee,recipient_address,actual_shipping_fee ,goods_to_declare,note,note_update_time,item_list,pay_time,dropshipper, dropshipper_phone,split_up,buyer_cancel_reason,cancel_by,cancel_reason,actual_shipping_fee_confirmed,buyer_cpf_id,fulfillment_flag,pickup_done_time,package_list,shipping_carrier,payment_method,total_amount,buyer_username,invoice_data,order_chargeable_weight_gram,return_request_due_date,edt"
        // response_optional_fields: "item_list"
    };

    const response = await axios.get<ResponseOrderShopee<ResGetOrdersDetail>>(`${SHOPEE_BASE_URL}${urlPath}`, {
        params: apiParams,
    });

    console.log("################")
    console.log({ data: response.data })
    return response.data;
};