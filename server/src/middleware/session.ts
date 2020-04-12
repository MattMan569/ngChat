import { Request, Response, NextFunction } from 'express';
import jwtUtil from '../routes/util/jwt';

// Parse the json web token, if present, and put its payload on req.session
export const session = (req: Request, res: Response, next: NextFunction) => {
  // Remove the 'Bearer' portion of the token
  const token = req.headers.authorization?.split(' ')[1];

  // No token provided
  if (!token) {
    next();
    return;
  }

  const payload = jwtUtil.decodeAccessToken(token);

  // Invalid token
  if (!payload) {
    next();
    return;
  }

  req.session = payload;
  next();
};

export default session;
