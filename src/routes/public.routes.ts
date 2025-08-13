import { Router } from 'express';
import { getShopController } from '../controller/public/get-shops.controller';
// import { createPrintLabelsController, downloadPrintLabelController, getChannelList, getPrintLabelController, } from '../controller/logistics.controller';

const router = Router();

router.get('/get_shops', getShopController);

export { router as publicRoute };

