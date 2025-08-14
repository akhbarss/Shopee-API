import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import z from "zod";
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../../config";
import { CustomJwtPayload } from "../../types/JwtPayload";
import { validRefreshTokens } from "./login.controller";

const refreshTokenSchema = z.object({
    refresh_token: z.string().min(1, { message: "Refresh token tidak boleh kosong" }),
});
export const refreshController = async (req: Request, res: Response) => {
    const result = refreshTokenSchema.safeParse(req.body);

    if (!result.success) {
        const pretty = z.prettifyError(result.error); // Only use if needed, after checking result.success
        return res.status(400).json({ error: pretty });
    }

    const { refresh_token } = result.data;
    if (!validRefreshTokens.has(refresh_token)) return res.status(403).json({ message: 'Refresh token tidak valid' })

    try {
        const decoded = jwt.verify(refresh_token, REFRESH_TOKEN_SECRET as string) as CustomJwtPayload

        const newAccessToken = jwt.sign({ id: decoded.id, name: decoded.name, email: decoded.email }, ACCESS_TOKEN_SECRET as string, {
            expiresIn: '1d',
        });

        res.json({
            access_token: newAccessToken
        });
    } catch (err) {
        return res.status(403).json({ message: 'Refresh token tidak valid atau kedaluwarsa' });
    }
}