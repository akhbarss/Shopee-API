import { Router } from 'express';
import { GetAllItems, getAttributeTreeController, getItemBaseInfo, getItemList, getProductCategoryController } from '../controller/products/product.controller';

const router = Router();

router.get('/get-category', getProductCategoryController);
router.get('/get-atrribute-tree', getAttributeTreeController);
router.get('/get-item-list', getItemList);
router.get('/get-item-base-info', getItemBaseInfo);

router.get('/get-items', GetAllItems);


export { router as itemRoute };