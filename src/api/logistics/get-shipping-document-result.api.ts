import axios from 'axios';
import { BaseResponse } from '../../types/data.type';

type ResGetShipingDocumentResult = {
    response: {
        result_list: {
            order_sn: string,
            status: string
        }[]
    }
    warning: string
} & BaseResponse

type PayloadGetShipingDocumentResult = {
    fullUrl: string;
    data: {
        order_list: {
            order_sn: string
        }[],
        shipping_document_type: string
    }
}

/**
 * Fungsi ini bertanggung jawab HANYA untuk memanggil endpoint get_order_list Shopee.
 * @param payload - POST
 * @returns Data respons dari API Shopee.
 */

export const fetchgetShippingDocumentResult = async (
    payload: PayloadGetShipingDocumentResult
): Promise<ResGetShipingDocumentResult> => {
    const { data: { order_list, shipping_document_type }, fullUrl } = payload
    const data = {
        order_list: order_list.map(dt => ({ order_sn: dt.order_sn, shipping_document_type }))
    }

    const shopeeResponse = await axios.post<ResGetShipingDocumentResult>(fullUrl, data, { headers: { "Content-Type": "application/json" } })
    return shopeeResponse.data
};
