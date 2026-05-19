// backend/src/modules/offers/offer.routes.ts
import { Router } from 'express';
import { offerController } from './offers.controller';

const router = Router();

router.get('/', offerController.getAll);

export default router;