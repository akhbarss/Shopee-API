export interface BaseResponse {
  error: string
  message: string
  request_id: string
  more?: boolean
}

export interface ResponseOrderShopee<T> extends BaseResponse {
  response: T;
}