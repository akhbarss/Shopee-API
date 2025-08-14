import axios, { AxiosResponse } from 'axios';
import { BaseResponse } from '../../types/data.type';

type ResUpdateChannel = {

} & BaseResponse

type PayloadUpdateChannel = {
    fullUrl: string;
    data: {
        logistics_channel_id: number;
        enabled: boolean;
        cod_enabled: boolean;
    }
}

/**
 * Fungsi ini bertanggung jawab HANYA untuk memanggil endpoint get_order_list Shopee.
 * @param payload - POST
 * @returns Data respons dari API Shopee.
 */

export const fetchUpdateChannel = async (
    payload: PayloadUpdateChannel
): Promise<ResUpdateChannel> => {
    const { data, fullUrl } = payload
    const apiResponse = await axios.post<ResUpdateChannel>(fullUrl, data, {
        headers: {
            'Content-Type': 'application/json',
        },
    })

    console.log({ data: apiResponse.data })
    return apiResponse.data
};
