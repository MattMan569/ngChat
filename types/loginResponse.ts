import ITokenPayload from './tokenPayload';

export interface ILoginResponse {
  accessToken: string;
  refreshToken: string;
  payload: ITokenPayload;
}

export default ILoginResponse;
