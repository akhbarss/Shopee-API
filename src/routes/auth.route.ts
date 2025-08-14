import { Router } from 'express';
import { authShopeeController, checkTokenController, getShopeeAuthUrl } from '../controller/auth/auth.controller';
import { loginController } from '../controller/auth/login.controller';
import { refreshController } from '../controller/auth/refresh.controller';
import { callbackController } from '../controller/auth/callback.controller';

const router = Router();

router.get('/shopee-oauth-redirect', authShopeeController);
router.get('/shopee-callback', callbackController);
router.get('/check-token', checkTokenController);
router.get('/get-auth-url', getShopeeAuthUrl);

router.post('/login', loginController);
router.post('/refresh-token', refreshController);

export { router as authRoute };

