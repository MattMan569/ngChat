import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwtUtil from '../util/jwt';

import User from './../../models/userModel';
import ISignupData from 'types/signupData';
import ITokenPayload from 'types/tokenPayload';

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

    const token = jwtUtil.encodeAccessToken(user.username, user.email, user._id);

    const response = {
      token,
      payload: {
        username: user.username,
        email: user.email,
        _id: user._id,
      } as ITokenPayload,
    };

    res.json(response);
  } catch (error) {
    // TODO
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
    // TODO
    console.error(error);
    res.status(500).json(error);
  }
};

export default {
  createUser,
  loginUser,
  deleteUser,
};
