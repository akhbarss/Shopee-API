import { Router } from 'express';
import { createShippingDocumentController, downloadShippingDocumentController, getAddressListController, getChannelList, getMassShippingParameterController, getMassTrackingNumberController, getShippingDocumentParameter, getShippingDocumentResultController, getShippingParameterController, getTrackingNumberController, shipOrderController } from '../controller/logistics.controller';
import { errorHandler } from '../middleware/error-handler.middleware';

const router = Router();


// ✅
router.get('/get-channel-list', getChannelList);
router.get("/get-address-list", getAddressListController)
router.get("/get-shipping-parameter", getShippingParameterController)
router.post("/get-mass-shipping-parameter", getMassShippingParameterController)
router.post("/ship-order", shipOrderController)
router.get("/get-tracking-number", getTrackingNumberController)
router.post("/get-mass-tracking-number", getMassTrackingNumberController)
router.post("/get-shipping-document-parameter", getShippingDocumentParameter)



// ✅
router.post("/create-shipping-document", createShippingDocumentController)
router.post("/get-shipping-document-result", getShippingDocumentResultController)
router.post("/download-shipping-document", downloadShippingDocumentController)



router.use(errorHandler)
export { router as logisticsRoute };

