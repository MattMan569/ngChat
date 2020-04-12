import ITokenPayload from "../../types/tokenPayload";

// Extend the Request object with the session data
declare module 'express' {
  interface Request {
    session?: ITokenPayload;
  }
}
