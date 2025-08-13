import { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import z from 'zod';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../config';
import { authorizationController, callbackController, checkTokenController } from '../controller/auth.controller';

const router = Router();

router.get('/shopee-oauth-redirect', authorizationController);
router.get('/shopee-callback', callbackController);
router.get('/check-token', checkTokenController);

const validRefreshTokens: Set<string> = new Set();

const loginSchema = z.object({
    username: z.string().min(1, { message: "Username tidak boleh kosong" }),
    password: z.string().min(6, { message: "Password minimal 6 karakter" }),
});

const refreshTokenSchema = z.object({
    refresh_token: z.string().min(1, { message: "Refresh token tidak boleh kosong" }),
});

// RUTE: /auth/login dengan validasi Zod
router.post('/login', (req: Request, res: Response) => {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
        const pretty = z.prettifyError(result.error); // Only use if needed, after checking result.success
        return res.status(400).json({ error: pretty });
    }

    const { username, password } = result.data;

    if (username !== 'user' || password !== 'password') {
        return res.status(401).json({ message: 'Kredensial tidak valid' });
    }

    const userPayload = { id: 1, name: 'John Doe' };

    const accessToken = jwt.sign(userPayload, ACCESS_TOKEN_SECRET as string, {
        // expiresIn: '15m',
        expiresIn: '5h',
    });

    const refreshToken = jwt.sign(userPayload, REFRESH_TOKEN_SECRET as string, {
        expiresIn: '7d',
    });

    validRefreshTokens.add(refreshToken);

    res.json({
        data: {
            access_token: accessToken,
            refresh_token: refreshToken,
        }
    });
});

// RUTE: /auth/refresh-token dengan validasi Zod
router.post('/refresh-token', (req: Request, res: Response) => {
    const result = refreshTokenSchema.safeParse(req.body);

    if (!result.success) {
        const pretty = z.prettifyError(result.error); // Only use if needed, after checking result.success
        return res.status(400).json({ error: pretty });
    }

    const { refresh_token } = result.data;

    if (!validRefreshTokens.has(refresh_token)) {
        return res.status(403).json({ message: 'Refresh token tidak valid' });
    }

    try {
        const decoded = jwt.verify(refresh_token, REFRESH_TOKEN_SECRET as string) as { id: number; name: string };

        const newAccessToken = jwt.sign({ id: decoded.id, name: decoded.name }, ACCESS_TOKEN_SECRET as string, {
            expiresIn: '1d',
        });

        res.json({
            access_token: newAccessToken
        });
    } catch (err) {
        return res.status(403).json({ message: 'Refresh token tidak valid atau kedaluwarsa' });
    }
});


export { router as authRoute };
