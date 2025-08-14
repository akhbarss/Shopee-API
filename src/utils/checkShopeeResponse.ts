export function checkShopeeResponse<T>(responseData: any): T {
    if (responseData?.error || responseData?.message) {
        const err = new Error(responseData.message || 'Shopee API Error');
        (err as any).details = responseData;
        throw err;
    }
    return responseData as T;
}