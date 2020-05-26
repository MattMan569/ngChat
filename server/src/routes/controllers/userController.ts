import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwtUtil from '../../util/jwt';

import User from './../../models/userModel';
import Auth from './../../models/authModel';
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
    if (error.name === 'ValidationError') {
      let errorMessage = '';

      if (error.errors.email?.kind === 'unique') {
        errorMessage += `Email ${error.errors.email.value} is taken`;
      }
      if (error.errors.username?.kind === 'unique') {
        if (errorMessage) { errorMessage += '\n'; }
        errorMessage += `Username ${error.errors.username.value} is taken`;
      }

      return res.status(400).json(errorMessage);
    }

    console.error(error);
    res.status(500).json();
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

    const accessToken = jwtUtil.encodeAccessToken(user.username, user.email, user._id);
    const refreshToken = jwtUtil.encodeRefreshToken(user._id);
    const expires = getExpires();

    await Auth.authorizeUser(user._id, refreshToken);

    const response: ILoginResponse = {
      accessToken,
      payload: {
        username: user.username,
        email: user.email,
        _id: user._id,
        expires,
      },
    };

    res.cookie('jwt_refresh', refreshToken, {
      httpOnly: true,
      signed: true,
    });

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

export const newAccessToken = async (req: Request, res: Response) => {
  // TODO give new refresh token
  // send logic to new function or db static

  const refreshToken = req.signedCookies.jwt_refresh;

  // No token has been provided
  if (!refreshToken) {
    res.status(401).json();
  }

  const auth = await Auth.findOne({
    refreshToken,
  });

  // The provided refresh token is not currently authorized
  if (!auth) {
    res.status(403).json();
  }

  const userId = jwtUtil.decodeRefreshToken(refreshToken);

  if (!userId) {
    console.error(`User authorized with invalid refresh token`);
    return res.status(500).json();
  }

  const user = await User.findById(userId);

  if (!user) {
    console.error(`User ID ${userId} with valid token, user not found in DB`);
    return res.status(500).json();
  }

  const accessToken = jwtUtil.encodeAccessToken(user.username, user.email, user._id);
  const expires = getExpires();

  res.json({ accessToken, expires });
};

/**
 * Convert the value specified in the environment variable to a Date ISO string
 */
const getExpires = () => {
  if (!process.env.JWT_EXPIRES_IN) {
    throw new Error('Environment variable JWT_EXPIRES_IN is undefined.');
  }

  return new Date(Date.now() + parseInt(process.env.JWT_EXPIRES_IN, 10)).toISOString();
};

export default {
  createUser,
  loginUser,
  deleteUser,
  newAccessToken,
};
