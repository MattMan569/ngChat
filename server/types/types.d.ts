// import ITokenPayload from "../../types/tokenPayload";
import IToken from 'types/token';

// Extend the Request object with the session data
declare module 'express' {
  interface Request {
    session?: IToken;
  }
}
