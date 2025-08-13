import axios from 'axios';
import { SHOPEE_BASE_URL, SHOPEE_PARTNER_ID } from '../../config';
import { BaseResponse, ResponseOrderShopee } from '../../types/data.type';
import { FetchAuthParams } from '../../types/order.type';

type ResGetSearchPackageList = {
    response: {}
    // order_list: {
    //     order_sn: string;
    //     package_number: string;
    // }[],
    // more: boolean,
    // next_cursor: string
} & BaseResponse

type FIlterSearch = {
    "package_status": number
    "logistics_channel_ids": number[],
    "fulfillment_type": number,
    "product_location_ids"?: string[],
    "invoice_pending"?: boolean
}

type PaginationSearch = {
    "page_size": number
    "cursor"?: string
}
type SortSearch = {
    "sort_type": number
    "ascending"?: boolean
}

type PayloadGetShipmentList = {
    fullUrl: string;
    data: {
        filter: FIlterSearch,
        "pagination": PaginationSearch
        "sort": SortSearch
    }
}

/**
 * Fungsi ini bertanggung jawab HANYA untuk memanggil endpoint get_order_list Shopee.
 * @param params - Semua parameter yang dibutuhkan untuk panggilan API.
 * @returns Data respons dari API Shopee.
 */

export const fetchSearchPackageList = async (
    payload: PayloadGetShipmentList
): Promise<ResGetSearchPackageList> => {
    // const urlPath = '/api/v2/order/search_package_list';
    const { data, fullUrl } = payload

    const shopeeResponse = await axios.post<ResGetSearchPackageList>(
        `${fullUrl}`,
        data
    );
    console.log({ data: shopeeResponse.data.response })

    return shopeeResponse.data
};
