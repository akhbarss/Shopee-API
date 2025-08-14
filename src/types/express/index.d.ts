// Import interface yang baru kita buat
import { CustomJwtPayload } from '../JwtPayload';

declare global {
  namespace Express {
    export interface Request {
      // Tambahkan properti 'user' ke dalam interface Request
      // Kita beri tanda tanya (?) karena tidak semua request akan memiliki data user (misal: route login)
      user?: CustomJwtPayload;
    }
  }
}