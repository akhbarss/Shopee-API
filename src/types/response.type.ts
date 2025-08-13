import { BaseResponse } from "./data.type"

type ResAuthShopList = {
    shop_id: number
    expire_time: number
    auth_time: number
    region: string
    sip_affi_shop_list: []
}

export type ResGetShopsByPartner = {
    authed_shop_list: ResAuthShopList;
} & BaseResponse
