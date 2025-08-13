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

export const orderSnSchema = z.object({
    order_sn: z.string().nonempty("order_sn wajib diisi"),
});
export const packageNumberSchema = z.object({
    package_number: z.string().nonempty("package_number wajib diisi"),
});

export const ShippingDocumentTypeEnum = z.enum([
    "NORMAL_AIR_WAYBILL",
    "THERMAL_AIR_WAYBILL",
    "NORMAL_JOB_AIR_WAYBILL",
    "THERMAL_JOB_AIR_WAYBILL",
    "THERMAL_UNPACKAGED_LABEL"
]);
