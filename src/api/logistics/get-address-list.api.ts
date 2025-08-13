import axios from 'axios';
import { BaseResponse } from '../../types/data.type';

type ParamsGetAddressList = {
    fullApiPath: string
}

type ResGetAddressList = {
    "response": {
        "show_pickup_address": false,
        "address_list": {
            "address_id": 200234953,
            "region": "ID",
            "state": "JAWA BARAT",
            "city": "KOTA BEKASI",
            "address": "Original Flora, Jalan Mustika Juya Gang Ubi Cilembu, RT.2/RW.11, Mustikajaya (pohon sukun besar)",
            "zipcode": "17158",
            "district": "MUSTIKA JAYA",
            "town": "",
            "address_type": [
                "DEFAULT_ADDRESS",
                "PICKUP_ADDRESS",
                "RETURN_ADDRESS"
            ]
        }[]
    },
} & BaseResponse

/**
 * Fungsi ini bertanggung jawab HANYA untuk memanggil endpoint get_order_list Shopee.
 * @param payload - GET
 * @returns Data respons dari API Shopee.
 */

export const fetchGetAddressList = async (
    payload: ParamsGetAddressList
): Promise<ResGetAddressList> => {
    const { fullApiPath, } = payload
    const shopeeResponse = await axios.get<ResGetAddressList>(fullApiPath);

    return shopeeResponse.data
};
