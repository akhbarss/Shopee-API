import { Router } from 'express';
import { getOrderByPesanan, getOrderByTrackingNumber, getOrderListController, getSearchPackageListController, getShipmentListController } from '../controller/order.controller';
import { errorHandler } from '../middleware/error-handler.middleware';

const router = Router();

router.get('/get-order-list', getOrderListController);
router.get('/get-shipment-list', getShipmentListController);

router.get('/get-order-by-tracking-number', getOrderByTrackingNumber);
router.get('/get-order-by-pesanan', getOrderByPesanan);
router.get('/search-package-list', getSearchPackageListController);
router.use(errorHandler)

export { router as orderRoute };
