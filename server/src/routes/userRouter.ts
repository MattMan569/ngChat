import express from 'express';

import userControllers from './controllers/userController';
import isAuthorized from './../middleware/isAuthorized';

export const router = express.Router();

router.post('/signup', userControllers.createUser);

router.post('/login', userControllers.loginUser);

router.post('/delete', isAuthorized, userControllers.deleteUser);

export default router;
