import z from "zod";

export const zodShopIdSchema = z
    .preprocess((val) => {
        if (typeof val === "string") {
            return Number.parseInt(val);
        }
        return val;
    },
        z.int()
    );

export const zodPackageNumberSchema = z.string().nonempty("package_number wajib diisi");
export const zodOrderSnSchema = z.string().nonempty("order_sn wajib diisi");
export const zodTrackingNumberSchema = z.string().nonempty("order_sn wajib diisi");

export const orderSnObjectSchema = z.object({
    order_sn: z.string().nonempty("order_sn wajib diisi"),
});
export const packageNumberObjectSchema = z.object({
    package_number: z.string().nonempty("package_number wajib diisi"),
});

export enum ShippingDocumentTypeEnum {
    NORMAL_AIR_WAYBILL = "NORMAL_AIR_WAYBILL",
    THERMAL_AIR_WAYBILL = "THERMAL_AIR_WAYBILL",
    NORMAL_JOB_AIR_WAYBILL = "NORMAL_JOB_AIR_WAYBILL",
    THERMAL_JOB_AIR_WAYBILL = "THERMAL_JOB_AIR_WAYBILL",
    THERMAL_UNPACKAGED_LABEL = "THERMAL_UNPACKAGED_LABEL"
}

export const zodShippingDocumentTypeEnum = z.enum(ShippingDocumentTypeEnum);
