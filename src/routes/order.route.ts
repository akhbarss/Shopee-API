import { Router } from 'express';
import { getAllNewOrderDetail, getOrderDetail, getOrderListController, getSearchPackageListController, getShipmentListController } from '../controller/orders/order.controller';
import { errorHandler } from '../middleware/error-handler.middleware';

const router = Router();

router.get('/get-all-new-orders', getAllNewOrderDetail);

router.get('/get-order-list', getOrderListController);
router.get('/get-order-detail', getOrderDetail);
router.get('/get-shipment-list', getShipmentListController);
router.get('/search-package-list', getSearchPackageListController);

export { router as orderRoute };

