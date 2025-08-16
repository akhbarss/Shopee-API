import { Router } from 'express';
import { getProfileController, getShopInfoController } from '../controller/shop/shop.controller';

const router = Router();

// ✅
router.get('/get-shop-info', getShopInfoController);
router.get('/get-profile', getProfileController);

export { router as shopRoute };

