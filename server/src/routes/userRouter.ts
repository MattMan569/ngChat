import express from 'express';
import multer from 'multer';

import userControllers from './controllers/userController';
import isAuthorized from './../middleware/isAuthorized';

export const router = express.Router();

router.post('/signup', userControllers.createUser);

router.post('/login', userControllers.loginUser);

router.post('/delete', isAuthorized, userControllers.deleteUser);

router.post('/token', userControllers.newAccessToken);

router.post('/bio', userControllers.changeBio);

router.post('/avatar', isAuthorized, multer().single('avatar'), userControllers.changeAvatar);

router.get('/avatar/:id', userControllers.getAvatar);

router.get('/username/:id', userControllers.getUsername);

router.get('/:id', userControllers.getUser);

export default router;
