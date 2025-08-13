export interface GetLogisticsResponse {
  error: string;
  message: string;
  request_id: string;
  response: {
    logistics_channel_list: LogisticsChannel[];
  };
}

export interface LogisticsChannel {
  block_seller_cover_shipping_fee: boolean;
  cod_enabled: boolean;
  enabled: boolean;
  fee_type: string;
  force_enable: boolean;
  item_max_dimension: ItemMaxDimension;
  logistics_capability: LogisticsCapability;
  logistics_channel_id: number;
  logistics_channel_name: string;
  logistics_description: string;
  mask_channel_id: number;
  seller_logistic_has_configuration: any | null;
  size_list: any[];
  support_cross_border: boolean;
  volume_limit: VolumeLimit;
  weight_limit: WeightLimit;
  support_pre_order: boolean;
}

export interface ItemMaxDimension {
  dimension_sum: number;
  height: number;
  length: number;
  unit: string;
  width: number;
}

export interface LogisticsCapability {
  seller_logistics: boolean;
}

export interface VolumeLimit {
  item_max_volume: number;
  item_min_volume: number;
}

export interface WeightLimit {
  item_max_weight: number;
  item_min_weight: number;
}
