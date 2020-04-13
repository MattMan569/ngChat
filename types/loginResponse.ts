import ITokenPayload from './tokenPayload';

export interface ILoginResponse {
  token: string;
  payload: ITokenPayload;
}

export default ILoginResponse;
