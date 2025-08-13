import { Router } from 'express';
import { createShippingDocumentController, downloadShippingDocumentController, getChannelList, getMassShippingParameterController, getShippingDocumentResult, getShippingParameterController } from '../controller/logistics.controller';
import { errorHandler } from '../middleware/error-handler.middleware';

const router = Router();

router.post("/get-mass-shipping-parameter", getMassShippingParameterController)

// ✅
router.get("/get-shipping-parameter", getShippingParameterController)
router.get('/get-channel-list', getChannelList);
router.post("/get-shipping-document-result", getShippingDocumentResult)
router.post("/download-shipping-document", downloadShippingDocumentController)
router.post("/create-shipping-document", createShippingDocumentController)



router.use(errorHandler)
export { router as logisticsRoute };

