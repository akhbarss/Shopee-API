import axios, { AxiosResponse } from 'axios';
import { BaseResponse } from '../../types/data.type';

type ResDownloadShipingDocument = AxiosResponse<string>

type PayloadDownloadShipingDocument = {
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

export const fetchDownloadShippingDocument = async (
    payload: PayloadDownloadShipingDocument
): Promise<ResDownloadShipingDocument> => {
    const { data, fullUrl } = payload
    const shopeeResponse = await axios.post(fullUrl, data, {
        headers: {
            'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer'
    })
    return shopeeResponse
};
