import express from 'express';

import isAuthorized from '../middleware/isAuthorized';
import roomControllers from './controllers/roomControllers';

export const router = express.Router();

router.post('/', isAuthorized, roomControllers.createRoom);

router.post('/join/:id', isAuthorized, roomControllers.joinRoom);

router.patch('/:id', isAuthorized, roomControllers.updateRoom);

router.get('/search', roomControllers.search);

router.get('/', roomControllers.getRooms);

router.get('/:id', roomControllers.getRoom);

router.get('/owned/:id', roomControllers.getOwnedRooms);

router.delete('/:id', isAuthorized, roomControllers.deleteRoom);

export default router;
