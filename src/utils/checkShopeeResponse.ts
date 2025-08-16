export function checkShopeeResponse<T>(responseData: T): T {
    if ((responseData as any)?.error || (responseData as any)?.message) {
        const err = new Error((responseData as any).message || 'Shopee API Error');
        (err as any).details = responseData;
        throw err;
    }
    return responseData;
}