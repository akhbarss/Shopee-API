export type ShopeeRefreshTokenResponse = {
  refresh_token: string;
  access_token: string;
  expire_in: number;
  request_id: string;
  error: string | number;   // karena di contoh error bisa "" (string kosong) atau bisa angka error code
  message: string;
};

