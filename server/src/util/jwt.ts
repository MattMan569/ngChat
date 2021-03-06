import jwt from 'jsonwebtoken';
import { IToken } from 'types/token';

// Encode the user's information into the jwt and return it
export const encodeAccessToken = (
  username: string,
  email: string,
  id: string,
) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('Environment variable JWT_SECRET is undefined.');
  }

  if (!process.env.JWT_EXPIRES_IN) {
    throw new Error('Environment variable JWT_EXPIRES_IN is undefined.');
  }

  const token = jwt.sign({
    username,
    email,
    _id: id,
  } as IToken, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return token;
};

// Decode the token and return the payload on success, or false on failure
export const decodeAccessToken = (token: string): IToken | false => {
  if (!process.env.JWT_SECRET) {
    throw new Error('Environment variable JWT_SECRET is undefined.');
  }

  try {
    // Will throw if token is invalid or secret is wrong
    return jwt.verify(token, process.env.JWT_SECRET) as IToken;
  } catch (error) {
    return false;
  }
};

export const encodeRefreshToken = (
  id: string,
) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('Environment variable JWT_SECRET is undefined.');
  }

  const token = jwt.sign({
    _id: id,
  }, process.env.JWT_SECRET);

  return token;
};

/**
 * Returns the corresponding user's id if the token if valid,
 * false otherwise
 */
export const decodeRefreshToken = (token: string): string | false => {
  if (!process.env.JWT_SECRET) {
    throw new Error('Environment variable JWT_SECRET is undefined.');
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET) as string;
  } catch (error) {
    return false;
  }
};

export default {
  encodeAccessToken,
  decodeAccessToken,
  encodeRefreshToken,
  decodeRefreshToken,
};
