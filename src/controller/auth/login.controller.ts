import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import z from "zod";
import { prisma } from "../../prisma";
import { CustomJwtPayload } from "../../types/JwtPayload";
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../../config";
import { getTimestamp } from "../../utils/getTimeStamp";

export const validRefreshTokens: Set<string> = new Set();
const loginSchema = z.object({
    email: z.string().min(1, { message: "Username tidak boleh kosong" }),
    password: z.string().min(6, { message: "Password minimal 6 karakter" }),
});

export const loginController = async (req: Request, res: Response) => {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
        const pretty = z.prettifyError(result.error); // Only use if needed, after checking result.success
        return res.status(400).json({ error: pretty });
    }

    const { email, password } = result.data;
    const userData = await prisma.user.findUnique({
        where: { email, passwordHash: password }
    })

    if (!userData) {
        console.log("❌")
        return res.status(401).json({ message: 'Kredensial tidak valid' });
    }

    const userPayload: CustomJwtPayload = { id: userData.id, email: userData.email, name: userData.name };

    const accessToken = jwt.sign(userPayload, ACCESS_TOKEN_SECRET, {
        // expiresIn: '15m',
        expiresIn: '5h',
    });

    const refreshToken = jwt.sign(userPayload, REFRESH_TOKEN_SECRET, {
        expiresIn: '7d',
    });

    validRefreshTokens.add(refreshToken);

    res.json({
        data: {
            access_token: accessToken,
            refresh_token: refreshToken,
            timestamp: getTimestamp()
        }
    });
}