import express from 'express';

import isAuthorized from '../middleware/isAuthorized';
import roomControllers from './controllers/roomControllers';

export const router = express.Router();

router.post('/', isAuthorized, roomControllers.createRoom);

router.patch('/:id', isAuthorized, roomControllers.updateRoom);

router.get('/', roomControllers.getRooms);

router.get('/:id', roomControllers.getRoom);

router.delete('/:id', isAuthorized);

export default router;
