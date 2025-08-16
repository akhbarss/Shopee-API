export interface BaseResponse {
  error: string;
  message: string;
  request_id: string;
  more?: boolean;
  warning?: string;
  debug_message?: string;
}

export interface ResponseOrderShopee<T> extends BaseResponse {
  response: T;
}