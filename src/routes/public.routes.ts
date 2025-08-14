import { Router } from 'express';
import { getShopController } from '../controller/public/public.controller';

const router = Router();

router.get('/get_shops', getShopController);

export { router as publicRoute };

