import axios, { AxiosResponse } from 'axios';
import { BaseResponse } from '../../types/data.type';

type ResCreateShipingDocument = {
    "response": {
        "result_list": {
            "order_sn": string
            "fail_error": string
            "fail_message": string
        }[]
    },
} & BaseResponse

type PayloadCreateShipingDocument = {
    fullUrl: string;
    data: {
        order_list: {
            order_sn: string
            package_number?: string
        }[],
        shipping_document_type: string
    }
}

/**
 * Fungsi ini bertanggung jawab HANYA untuk memanggil endpoint get_order_list Shopee.
 * @param payload - POST
 * @returns Data respons dari API Shopee.
 */

export const fetchCreateShippingDocument = async (
    payload: PayloadCreateShipingDocument
): Promise<ResCreateShipingDocument> => {
    const { data, fullUrl } = payload
    const apiResponse = await axios.post<ResCreateShipingDocument>(fullUrl, data, {
        headers: {
            'Content-Type': 'application/json',
        },
    })
    return apiResponse.data
};
