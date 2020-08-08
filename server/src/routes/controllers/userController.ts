import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import aws from 'aws-sdk';
import sharp from 'sharp';

import User from './../../models/userModel';
import Auth from './../../models/authModel';
import ISignupData from 'types/signupData';
import ILoginResponse from 'types/loginResponse';
import jwtUtil from '../../util/jwt';
import s3 from './../../db/s3';
import expires from './util/expires';

export const createUser = async (req: Request, res: Response) => {
  try {
    const signupData = req.body as ISignupData;
    const password = await bcrypt.hash(signupData.password, 12);

    const user = await User.create({
      username: signupData.username,
      email: signupData.email,
      password,
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

    await Auth.authorizeUser(user._id, refreshToken);

    const response: ILoginResponse = {
      accessToken,
      refreshToken,
      payload: {
        username: user.username,
        email: user.email,
        _id: user._id,
        expires: expires(),
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

export const newAccessToken = async (req: Request, res: Response) => {
  const refreshToken = req.body.jwt_refresh;

  // No token has been provided
  if (!refreshToken) {
    res.status(401).json();
    return;
  }

  const auth = await Auth.findOne({
    refreshToken,
  });

  // The provided refresh token is not currently authorized
  if (!auth) {
    res.status(403).json();
    return;
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

  res.json({ accessToken, expires: expires() });
};

export const changeBio = async (req: Request, res: Response) => {
  try {
    const user = await User.findOneAndUpdate({
      _id: req.session?._id,
    }, {
      bio: req.body.bio,
    }, {
      new: true,
    });

    if (!user) {
      res.status(400).json();
      return;
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json();
  }
};

export const changeAvatar = async (req: Request, res: Response) => {
  if (!process.env.S3_BUCKET_NAME) {
    throw new Error('Environment variable S3_BUCKET_NAME is undefined');
  }

  try {
    const img = await sharp(req.file.buffer)
      .resize({
        width: 250,
        height: 250,
        background: { r: 255, g: 255, b: 255, alpha: 0 },
        fit: 'inside',
      })
      .png()
      .toBuffer();

    const encodedImg = img.toString('base64');

    s3.upload({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `avatar/${req.session?._id}`,
      Body: img,
    }, (error: Error, data: aws.S3.ManagedUpload.SendData) => {
      if (error) {
        console.error('AWS S3 ERROR', error);
        res.status(500).json();
      } else {
        res.json(encodedImg);
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json();
  }
};

export const getAvatar = async (req: Request, res: Response) => {
  if (!process.env.S3_BUCKET_NAME) {
    throw new Error('Environment variable S3_BUCKET_NAME is undefined');
  }
  s3.getObject({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `avatar/${req.params.id}`,
  }, (error, data) => {
    if (error) {
      if (error.statusCode === 404) {
        // User has not uploaded their own profile picture, use the default one
        s3.getObject({
          Bucket: process.env.S3_BUCKET_NAME as string,
          Key: `avatar/default`,
        }, (error2, data2) => {
          if (error2) {
            console.error('AWS S3 GET error', error2);
            res.status(500).json();
          } else {
            res.json(data2.Body?.toString('base64'));
          }
        });
      } else {
      console.error('AWS S3 GET error', error);
      res.status(500).json();
      }
    } else {
      res.json(data.Body?.toString('base64'));
    }
  });
};

export const getUsername = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json();
      return;
    }

    res.json(user?.username);
  } catch (error) {
    console.error(error);
    res.status(500).json();
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json();
      return;
    }

    res.json({
      username: user.username,
      bio: user.bio,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json();
  }
};

export default {
  createUser,
  loginUser,
  deleteUser,
  newAccessToken,
  changeBio,
  changeAvatar,
  getAvatar,
  getUsername,
  getUser,
};
