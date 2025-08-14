import { Router } from 'express';
import { getAttributeTreeController, getProductByShopId, getProductCategoryController } from '../controller/products/product.controller';

const router = Router();

router.get('/get-category', getProductCategoryController);
router.get('/get-atrribute-tree', getAttributeTreeController);

router.get('/get-item-list', getProductByShopId);

export { router as productRoute };