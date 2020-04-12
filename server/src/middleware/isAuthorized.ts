import { Response, Request, NextFunction } from 'express';

// User is authorized only if the session object is
// present on the request from the session middleware
export const isAuthorized = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session) {
    return res.status(401).json('You must be logged in to do that');
  }

  next();
};

export default isAuthorized;
