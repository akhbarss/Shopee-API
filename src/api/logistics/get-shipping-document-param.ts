import axios, { AxiosResponse } from 'axios';
import { BaseResponse } from '../../types/data.type';

type ResGetShippingDocumentParam = {
    "response": {
        "result_list": [
            {
                order_sn: "201201E81SYYKE",
                package_number?: "60489687088750",
                suggest_shipping_document_type?: "THERMAL_AIR_WAYBILL",
                selectable_shipping_document_type?: [
                    "THERMAL_AIR_WAYBILL"
                ]
            },
            {
                order_sn: "201201V81SYYDG",
                fail_error?: "logistics.order_not_exist",
                fail_message?: "The order_sn 201201V81SYYDG you provided is not exist. Please check"
            }
        ]
    },
    "warning": [
        {
            "order_sn": "201201V81SYYDG"
        }
    ],
} & BaseResponse

type PayloadGetShippingDocumentParam = {
    fullUrl: string;
    data: {
        order_list: { package_number: string, order_sn: string }[],
    }
}

/**
 * Fungsi ini bertanggung jawab HANYA untuk memanggil endpoint get_order_list Shopee.
 * @param payload - POST
 * @returns Data respons dari API Shopee.
 */

export const fetchGetShippingDocumentParam = async (
    payload: PayloadGetShippingDocumentParam
): Promise<ResGetShippingDocumentParam> => {
    const { data, fullUrl } = payload
    const apiResponse = await axios.post<ResGetShippingDocumentParam>(fullUrl, data, {
        headers: {
            'Content-Type': 'application/json',
        },
    })

    console.log({ data: apiResponse.data })
    return apiResponse.data
};
