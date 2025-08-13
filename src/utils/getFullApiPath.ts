import { SHOPEE_BASE_URL, SHOPEE_PARTNER_ID } from "../config";

export const getFullApiPath = (apiPath: string, timestamp?: number, sign?: string, shopId?: number, accessToken?: string) => {
    if (timestamp) {
        return `${SHOPEE_BASE_URL}${apiPath}?partner_id=${SHOPEE_PARTNER_ID}&timestamp=${timestamp}&sign=${sign}&shop_id=${shopId}&access_token=${accessToken}`;
    } else {
        return `${SHOPEE_BASE_URL}${apiPath}`;
    }
}