import { Router } from 'express';
import { logisticsRoute } from './logistics.route';
import { orderRoute } from './order.route';
import { productRoute } from './product.route';
import { publicRoute } from './public.routes';

const router = Router();

router.get("/test", (req, res) => res.json({ message: "Hello world" }))

// Kelompokkan semua route versi 1 di bawah '/v1'
router.use('/product', productRoute);
router.use('/order', orderRoute);
router.use('/logistics', logisticsRoute);
router.use('/public', publicRoute);

export { router as apiRoute };
