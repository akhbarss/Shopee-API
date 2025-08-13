import axios from 'axios';
import { SHOPEE_BASE_URL, SHOPEE_PARTNER_ID } from '../../config';
import { ResponseOrderShopee } from '../../types/data.type';
import { FetchAuthParams } from '../../types/order.type';

type ResGetShipmentList = {
    order_list: {
        order_sn: string;
        package_number: string;
    }[],
    more: boolean,
    next_cursor: string
}

type PayloadGetShipmentList = {
    page_size: number
}

/**
 * Fungsi ini bertanggung jawab HANYA untuk memanggil endpoint get_order_list Shopee.
 * @param params - Semua parameter yang dibutuhkan untuk panggilan API.
 * @returns Data respons dari API Shopee.
 */

export const fetchGetShipmentList = async (
  params: FetchAuthParams & PayloadGetShipmentList
): Promise<ResGetShipmentList> => {
  const urlPath = '/api/v2/order/get_shipment_list';
  const baseParams = {
    partner_id: SHOPEE_PARTNER_ID,
    shop_id: params.shop_id,
    timestamp: params.timestamp,
    sign: params.sign,
    access_token: params.access_token,
  };

  let allShipments: { order_sn: string; package_number: string }[] = [];
  let nextCursor: string | undefined;
  let more = false;

  do {
    const apiParams = {
      ...baseParams,
      page_size: Math.min(params.page_size, 100), // maksimal 100
      cursor: nextCursor,
    };

    const response = await axios.get<ResponseOrderShopee<ResGetShipmentList>>(
      `${SHOPEE_BASE_URL}${urlPath}`,
      { params: apiParams }
    );

    const { more: moreResponse, next_cursor, order_list } = response.data.response;

    if (order_list?.length) {
      allShipments.push(...order_list);
    }

    more = moreResponse && (params.page_size > allShipments.length);
    nextCursor = more ? next_cursor : undefined;
  } while (more);

  return {
    order_list: allShipments,
    more,
    next_cursor: nextCursor || '',
  };
};

