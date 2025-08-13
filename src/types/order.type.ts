export enum OrderStatus {
  UNPAID = "UNPAID",
  READY_TO_SHIP = "READY_TO_SHIP",
  PROCESSED = "PROCESSED",
  RETRY_SHIP = "RETRY_SHIP",
  SHIPPED = "SHIPPED",
  TO_CONFIRM_RECEIVE = "TO_CONFIRM_RECEIVE",
  IN_CANCEL = "IN_CANCEL",
  CANCELLED = "CANCELLED",
  TO_RETURN = "TO_RETURN",
  COMPLETED = "COMPLETED",
}


export interface FetchAuthParams {
    access_token: string;
    shop_id: number;
    sign: string;
    timestamp: number;
}


export type ShopeeOrder = {
    actual_shipping_fee_confirmed: boolean;
    advance_package: boolean;
    booking_sn: string;
    buyer_cancel_reason: string;
    buyer_cpf_id: string | null;
    buyer_user_id: number;
    buyer_username: string;
    cancel_by: string;
    cancel_reason: string;
    cod: boolean;
    create_time: number;
    currency: string;
    days_to_ship: number;
    dropshipper: string | null;
    edt_from: number;
    edt_to: number;
    estimated_shipping_fee: number;
    fulfillment_flag: string;
    goods_to_declare: boolean;
    invoice_data: unknown | null;
    item_list: ShopeeItem[];
    message_to_seller: string;
    note: string;
    note_update_time: number;
    order_chargeable_weight_gram: number;
    order_sn: string;
    order_status: string;
    package_list: ShopeePackage[];
    pay_time: number | null;
    payment_method: string;
    pickup_done_time: number;
    recipient_address: ShopeeAddress;
    region: string;
    reverse_shipping_fee: number;
    ship_by_date: number;
    shipping_carrier: string;
    split_up: boolean;
    total_amount: number;
    update_time: number;
};

type ShopeeItem = {
    add_on_deal: boolean;
    add_on_deal_id: number;
    image_info: {
        image_url: string;
    };
    is_b2c_owned_item: boolean;
    is_prescription_item: boolean;
    item_id: number;
    item_name: string;
    item_sku: string;
    main_item: boolean;
    model_discounted_price: number;
    model_id: number;
    model_name: string;
    model_original_price: number;
    model_quantity_purchased: number;
    model_sku: string;
    order_item_id: number;
    product_location_id: string[]; // kadang di package_list cuma string
    promotion_group_id: number;
    promotion_id: number;
    promotion_type: string;
    weight: number;
    wholesale: boolean;
};

type ShopeePackage = {
    package_number: string;
    group_shipment_id: string | null;
    logistics_status: string;
    shipping_carrier: string;
    item_list: {
        item_id: number;
        model_id: number;
        model_quantity: number;
        order_item_id: number;
        promotion_group_id: number;
        product_location_id: string;
    }[];
    parcel_chargeable_weight_gram: number;
    allow_self_design_awb: boolean;
    logistics_channel_id: number;
    sorting_group: string;
};

type ShopeeAddress = {
    name: string;
    phone: string;
    town: string;
    district: string;
    city: string;
    state: string;
    region: string;
    zipcode: string;
    full_address: string;
};
