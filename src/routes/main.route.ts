import { Request, Response, Router } from 'express';
import { logisticsRoute } from './logistics.route';
import { orderRoute } from './order.route';
import { itemRoute } from './product.route';
import { publicRoute } from './public.routes';
import { callbackController } from '../controller/auth/callback.controller';
import { errorHandler } from '../middleware/error-handler.middleware';
import { mediaspaceRoute } from './mediaspace.route';
import { shopRoute } from './shop.route';

const router = Router();

router.get("/test", (req, res) => res.json({ message: "Hello world" }))


router.get("/get-session", (req: Request, res: Response) => {
    return res.json({ userId: req.user?.id })
})

router.use('/item', itemRoute);
router.use('/order', orderRoute);
router.use('/logistics', logisticsRoute);
router.use('/public', publicRoute);
router.use('/shop', shopRoute);
// router.use('/media', mediaspaceRoute);
router.use(errorHandler)

export { router as apiRoute };
