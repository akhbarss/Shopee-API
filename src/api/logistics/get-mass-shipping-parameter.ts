import axios, { AxiosResponse } from 'axios';
import { BaseResponse } from '../../types/data.type';

type ResGetMassShippingParameter = {
    "response": {
        "success_list": [
            {
                "package_number": "OFG190576613214356"
            }
        ],
        "fail_list": [
            {
                "fail_reason": "Package is not under the specified warehouse",
                "package_number": "OFG188728166212046"
            }
        ],
        "info_needed": {
            "dropoff": [],
            "pickup": [
                "address_id",
                "pickup_time_id"
            ]
        },
        "dropoff": {
            "branch_list": null
        },
        "pickup": {
            "address_list": [
                {
                    "address": "112 Nguyễn Du",
                    "address_flag": [],
                    "address_id": 200000001,
                    "city": "Quận 1",
                    "district": "Phường Bến Thành",
                    "region": "VN",
                    "state": "TP. Hồ Chí Minh",
                    "time_slot_list": [
                        {
                            "date": 1737018000,
                            "pickup_time_id": "1737018000"
                        }
                    ],
                    "town": "",
                    "zipcode": ""
                }
            ]
        },
    },
} & BaseResponse

type PayloadGetMassShippingParameter = {
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

export const getMassShippingParameter = async (
    payload: PayloadGetMassShippingParameter
): Promise<ResGetMassShippingParameter> => {
    const { data, fullUrl } = payload
    const apiResponse = await axios.post<ResGetMassShippingParameter>(fullUrl, data, {
        headers: {
            'Content-Type': 'application/json',
        },
    })

    console.log({ data: apiResponse.data })
    return apiResponse.data
};
