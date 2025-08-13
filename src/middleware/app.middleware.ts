import express from 'express';
import cors from 'cors';
import path from 'path';

/**
 * Mengatur semua middleware level aplikasi untuk instance Express.
 * @param app - Instance aplikasi Express.
 */
export const setupMiddleware = (app: express.Application): void => {
  // 1. Middleware untuk mem-parsing body JSON
  app.use(express.json());

  // 2. Middleware untuk menangani Cross-Origin Resource Sharing (CORS)
  app.use(cors({
    // Ganti dengan origin production Anda jika diperlukan
    // origin: 'https://your-production-domain.com',
    origin: 'http://localhost:5173', // Asal React dev server
    credentials: true,
  }));

  // 3. Middleware logger sederhana untuk setiap request
  app.use((req, res, next) => {
    // Memberikan log untuk setiap request yang masuk untuk memudahkan debugging
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} url:${req.url} baseUrl:${req.baseUrl} originalUrl:${req.originalUrl} - IP: ${req.ip}`);
    next();
  });

  // 4. Middleware untuk menyajikan file statis (misal: gambar) dari folder 'public'
  app.use(express.static(path.join(__dirname, '..', 'public')));
};