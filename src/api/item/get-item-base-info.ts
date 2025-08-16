import axios from 'axios';
import { BaseResponse } from '../../types/data.type';

type ParamsGetItemBaseInfo = {
    fullApiPath: string
    params: {
        item_id_list: string
    }
}

type ResGetItemBaseInfo = {
    "response": {
        "item_list": [
            {
                "item_id": 844096391,
                "category_id": 301176,
                "item_name": "READY TANAMAN SALAM",
                "description": "item description test description test",
                "item_sku": "-",
                "create_time": 1755163881,
                "update_time": 1755163881,
                "price_info": [
                    {
                        "currency": "IDR",
                        "original_price": 100000,
                        "current_price": 100000
                    }
                ],
                "image": {
                    "image_id_list": [
                        "sg-11134201-7r98o-mdef9xg819vnaf"
                    ],
                    "image_url_list": [
                        "https://cf.shopee.co.id/file/sg-11134201-7r98o-mdef9xg819vnaf"
                    ],
                    "image_ratio": "1:1"
                },
                "weight": "1.1",
                "dimension": {
                    "package_length": 11,
                    "package_width": 11,
                    "package_height": 11
                },
                "logistic_info": [
                    {
                        "logistic_id": 81017,
                        "logistic_name": "Sandbox-J&T Express(Don't modify)",
                        "enabled": true,
                        "size_id": 0,
                        "is_free": false,
                        "estimated_shipping_fee": 12000
                    }
                ],
                "pre_order": {
                    "is_pre_order": true,
                    "days_to_ship": 3
                },
                "condition": "NEW",
                "size_chart": "",
                "item_status": "NORMAL",
                "has_model": false,
                "promotion_id": 0,
                "brand": {
                    "brand_id": 0,
                    "original_brand_name": "NoBrand"
                },
                "item_dangerous": 0,
                "description_type": "normal",
                "stock_info_v2": {
                    "summary_info": {
                        "total_reserved_stock": 0,
                        "total_available_stock": 995
                    },
                    "seller_stock": [
                        {
                            "location_id": "IDZ",
                            "stock": 995,
                            "if_saleable": true
                        }
                    ],
                    "shopee_stock": [
                        {
                            "location_id": "",
                            "stock": 0
                        }
                    ],
                    "advance_stock": {
                        "sellable_advance_stock": 0,
                        "in_transit_advance_stock": 0
                    }
                },
                "size_chart_id": 0,
                "promotion_image": {
                    "image_id_list": [
                        "sg-11134201-7r98o-mdef9xg819vnaf"
                    ],
                    "image_url_list": [
                        "https://cf.shopee.co.id/file/sg-11134201-7r98o-mdef9xg819vnaf"
                    ]
                },
                "deboost": "FALSE",
                "compatibility_info": {},
                "authorised_brand_id": 0,
                "is_fulfillment_by_shopee": false,
                "tag": {
                    "kit": false
                }
            }
        ]
    }
} & BaseResponse

/**
 * Fungsi ini bertanggung jawab HANYA untuk memanggil endpoint get_order_list Shopee.
 * @param params - Semua parameter yang dibutuhkan untuk panggilan API.
 * @returns Data respons dari API Shopee.
 */
export const fetchGetItemBaseInfo = async (
    payload: ParamsGetItemBaseInfo
): Promise<ResGetItemBaseInfo> => {
    const { fullApiPath, params } = payload
    const shopeeResponse = await axios.get<ResGetItemBaseInfo>(fullApiPath, { params });

    return shopeeResponse.data
}