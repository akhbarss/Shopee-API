// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Menambahkan properti 'user' ke interface Request bawaan Express
interface AuthRequest extends Request {
  user?: string | jwt.JwtPayload;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction, whiteList: string[]) => {
  console.log(whiteList)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Mengambil token dari "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'A token is required for authentication' });
  }

  try {
    // Verifikasi token menggunakan ACCESS_TOKEN_SECRET
    // Pastikan Anda sudah mengaturnya di file .env
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);
    req.user = decoded; // Simpan payload token di request untuk digunakan nanti
  } catch (err) {
    // Jika token kedaluwarsa atau tidak valid, jwt.verify akan melempar error
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  return next(); // Lanjutkan ke handler rute berikutnya jika token valid
};