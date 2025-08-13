import { Router } from 'express';
import { getOrderDetail, getOrderListController, getSearchPackageListController, getShipmentListController } from '../controller/order.controller';
import { errorHandler } from '../middleware/error-handler.middleware';

const router = Router();

router.get('/get-order-list', getOrderListController);
router.get('/get-order-detail', getOrderDetail);
router.get('/get-shipment-list', getShipmentListController);
router.get('/search-package-list', getSearchPackageListController);

router.use(errorHandler)

export { router as orderRoute };

