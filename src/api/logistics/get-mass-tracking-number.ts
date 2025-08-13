import axios, { AxiosResponse } from 'axios';
import { BaseResponse } from '../../types/data.type';

type ResGetMassTrackingNumber = {
    "response": {
        "fail_list": [],
        "success_list": [
            {
                "first_mile_tracking_number": "",
                "hint": "",
                "package_number": "OFG121578896133442",
                "pickup_code": "",
                "tracking_number": "811000835390"
            }
        ]
    }
} & BaseResponse

type PayloadGetMassTrackingNumber = {
    fullUrl: string;
    data: {
        package_list: { package_number: string }[],
        logistics_channel_id?: number,
        product_location_id?: string
    }
}

/**
 * Fungsi ini bertanggung jawab HANYA untuk memanggil endpoint get_order_list Shopee.
 * @param payload - POST
 * @returns Data respons dari API Shopee.
 */

export const fetchGetMassTrackingNumber = async (
    payload: PayloadGetMassTrackingNumber
): Promise<ResGetMassTrackingNumber> => {
    const { data, fullUrl } = payload
    const apiResponse = await axios.post<ResGetMassTrackingNumber>(fullUrl, data, {
        headers: {
            'Content-Type': 'application/json',
        },
    })

    console.log({ data: apiResponse.data })
    return apiResponse.data
};
