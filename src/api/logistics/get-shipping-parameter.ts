import axios from 'axios';
import { LogisticsChannel } from '../../types/logistics.type';
import { BaseResponse } from '../../types/data.type';


type ParamsGetShippingParameter = {
    fullApiPath: string
    params: {
        access_token: string;
        shop_id: number;
        sign: string;
        timestamp: number;
        partner_id: number
        order_sn: string
    }
}

type ResGetShippingParameter = {
   "response": {
            "info_needed": {
                "pickup": [
                    "address_id",
                    "pickup_time_id"
                ]
            },
            "pickup": {
                "address_list": [
                    {
                        "address_id": 200371773,
                        "region": "ID",
                        "state": "JAWA BARAT",
                        "city": "KOTA BEKASI",
                        "district": "MUSTIKA JAYA",
                        "town": "",
                        "address": "Taman Alamanda 2, Jl. Cemp. 4 No.14 blok.ec4, RT.004/RW.010, Mustikasari, Kec. Mustika Jaya, Kota Bks, Jawa Barat 17157 (No. 14)",
                        "zipcode": "17157",
                        "address_flag": [],
                        "time_slot_list": [
                            {
                                "date": 1755075600,
                                "time_text": "08:00 - 10:00",
                                "pickup_time_id": "1755075600_1",
                                "flags": [
                                    "recommended"
                                ]
                            },
                            {
                                "date": 1755075600,
                                "time_text": "10:00 - 13:00",
                                "pickup_time_id": "1755075600_2",
                                "flags": []
                            },
                            {
                                "date": 1755075600,
                                "time_text": "13:00 - 15:00",
                                "pickup_time_id": "1755075600_3",
                                "flags": []
                            },
                            {
                                "date": 1755075600,
                                "time_text": "15:00 - 17:00",
                                "pickup_time_id": "1755075600_4",
                                "flags": []
                            }
                        ]
                    }
                ]
            }
        }
} & BaseResponse

/**
 * Fungsi ini bertanggung jawab HANYA untuk memanggil endpoint get_order_list Shopee.
 * @param payload - GET
 * @returns Data respons dari API Shopee.
 */

export const fetchGetShippingParameter = async (
    payload: ParamsGetShippingParameter
): Promise<ResGetShippingParameter> => {
    const { fullApiPath, params } = payload
    const shopeeResponse = await axios.get<ResGetShippingParameter>(fullApiPath, { params });

    return shopeeResponse.data
};
