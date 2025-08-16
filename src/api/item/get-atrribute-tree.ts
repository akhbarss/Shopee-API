import axios from 'axios';
import { BaseResponse } from '../../types/data.type';


type ParamsGetAtributeTree = {
    fullApiPath: string
    params: {
        category_id_list: string
    }
}


type ResGetAtributeTree = {
   "response": {
		"list": [
			{
				"attribute_tree": [
					{
						"attribute_id": 0,
						"mandatory": true,
						"name": "-",
						"attribute_value_list": [
							{
								"value_id": 0,
								"name": "-",
								"value_unit": "-",
								"child_attribute_list": [
									{}
								],
								"multi_lang": [
									{
										"language": "-",
										"value": "-"
									}
								]
							}
						],
						"attribute_info": {
							"input_type": 0,
							"input_validation_type": 0,
							"format_type": 0,
							"date_format_type": 0,
							"attribute_unit_list": [
								"-"
							],
							"max_value_count": 0
						},
						"multi_lang": [
							{
								"language": "-",
								"value": "-"
							}
						]
					}
				],
				"category_id": 0
			}
		]
	}
} & BaseResponse

/**
 * Fungsi ini bertanggung jawab HANYA untuk memanggil endpoint get_order_list Shopee.
 * @param payload - GET
 * @returns Data respons dari API Shopee.
 * 
 */

export const fetchGetAtributeTree = async (
    payload: ParamsGetAtributeTree
): Promise<ResGetAtributeTree> => {
    const { fullApiPath, params } = payload
    const shopeeResponse = await axios.get<ResGetAtributeTree>(fullApiPath, { params });

    return shopeeResponse.data
};
