import axios from 'axios';
import { LogisticsChannel } from '../../types/logistics.type';
import { BaseResponse } from '../../types/data.type';


type ParamsGetChannelList = {
    fullApiPath: string
    params: {
        access_token: string;
        shop_id: number;
        sign: string;
        timestamp: number | string;
        partner_id: number
    }
}

type ResGetChanelList = {
    response: {
        logistics_channel_list: LogisticsChannel[]
    }
} & BaseResponse

/**
 * Fungsi ini bertanggung jawab HANYA untuk memanggil endpoint get_order_list Shopee.
 * @param payload - GET
 * @returns Data respons dari API Shopee.
 */

export const fetchGetChannelList = async (
    payload: ParamsGetChannelList
): Promise<ResGetChanelList> => {
    const { fullApiPath, params } = payload
    console.log({fullApiPath})
    console.log({params})
    const shopeeResponse = await axios.get<ResGetChanelList>(fullApiPath, { params });

    // console.log({ data: shopeeResponse.data })
    return shopeeResponse.data
};
