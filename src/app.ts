import 'dotenv/config';
import express from "express";
import { setupMiddleware } from './middleware/app.middleware';
import { verifyToken } from './middleware/auth.middleware';
import { apiRoute } from './routes/main.route';
import { authRoute } from './routes/auth.route';
import { dashboardRoute } from './routes/dashboard.route';
import { publicRoute } from './routes/public.routes';
import { mediaspaceRoute } from './routes/mediaspace.route';

const app = express();
setupMiddleware(app)
app.use('/', dashboardRoute);


app.use("/media", mediaspaceRoute)

app.use('/api/v1/auth', authRoute);
app.use('/api/v1', verifyToken, apiRoute);

export default app