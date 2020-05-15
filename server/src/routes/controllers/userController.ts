import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwtUtil from '../../util/jwt';

import User from './../../models/userModel';
import ISignupData from 'types/signupData';
import ILoginResponse from 'types/loginResponse';

export const createUser = async (req: Request, res: Response) => {
  try {
    const signupData = req.body as ISignupData;
    const password = await bcrypt.hash(signupData.password, 12);

    // TODO file upload

    const user = await User.create({
      username: signupData.username,
      email: signupData.email,
      password,
      // TODO avatarPath
    });

    res.status(201).json(user);
  } catch (error) {
    // TODO
    console.error(error);
    res.status(500).json(error);
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({
      username: req.body.username,
    });

    if (!user) {
      return res.status(404).json('No user with that username exists');
    }

    const result = await bcrypt.compare(req.body.password, user.password);

    if (!result) {
      return res.status(401).json('Password is incorrect');
    }

    if (!process.env.JWT_EXPIRES_IN) {
      throw new Error('Environment variable JWT_EXPIRES_IN is undefined.');
    }

    const token = jwtUtil.encodeAccessToken(user.username, user.email, user._id);
    const expires = new Date(Date.now() + parseInt(process.env.JWT_EXPIRES_IN, 10)).toISOString();

    const response: ILoginResponse = {
      token,
      payload: {
        username: user.username,
        email: user.email,
        _id: user._id,
        expires,
      },
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.session?._id).exec();

    if (!user) {
      return res.status(404).json('User not found');
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};

export default {
  createUser,
  loginUser,
  deleteUser,
};
