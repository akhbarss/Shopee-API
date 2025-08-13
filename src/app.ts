import 'dotenv/config';
import express from "express";
import { setupMiddleware } from './middleware/app.middleware';
import { verifyToken } from './middleware/auth.middleware';
import { apiRoute } from './routes';
import { authRoute } from './routes/auth.route';
import { dashboardRoute } from './routes/dashboard.route';


const app = express();
setupMiddleware(app)
// app.get('/shopee-callback', callbackController);
app.use('/', dashboardRoute);
app.use('/api/v1/auth', authRoute);
app.use('/api/v1', verifyToken, apiRoute);

export default app