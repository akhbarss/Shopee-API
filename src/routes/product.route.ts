import { Router } from 'express';
import { getProductByShopId } from '../controller/product.controller';

const router = Router();

router.get('/get-by-shopid', getProductByShopId);

export { router as productRoute };