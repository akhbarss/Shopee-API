// src/middleware/errorHandler.ts

import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import z, { ZodError } from 'zod';

// Middleware ini memiliki 4 argumen, inilah yang membuatnya spesial
// Express tahu bahwa middleware dengan 4 argumen adalah untuk menangani error
export const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log('--- ❌Error Handler Middleware❌ ---');

    if(error instanceof ZodError) {
        const flattenErr = z.flattenError(error)
        return res.status(400).json({error: flattenErr})
    }

    // Logic yang sama seperti sebelumnya, kini ada di satu tempat
    if (axios.isAxiosError(error)) {
        if (error.response) {
            // Error dari respons API (4xx, 5xx dari service lain)
            console.error('API Error:', error.response.data);
            return res.status(error.response.status).json(error.response.data);
        } else {
            // Error jaringan (service tidak terjangkau)
            console.error('Network Error:', error.message);
            // 503 Service Unavailable adalah status yang cocok di sini
            return res.status(503).json({ message: 'Layanan eksternal tidak tersedia.' });
        }
    }

    // Untuk error lainnya yang tidak terduga (error coding, dll.)
    console.error('Internal Server Error:', error.message);
    return res.status(500).json({
        message: 'Terjadi kesalahan pada server.',
        details: error.message
    });
};