import { Router } from 'express';
import { getDashboardController } from '../controller/dashboard.controller';

const router = Router();

router.get('/', getDashboardController);

export {router as dashboardRoute};