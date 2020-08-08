import ITokenPayload from './tokenPayload';

export interface ILoginResponse {
  accessToken: string;
  payload: ITokenPayload;
}

export default ILoginResponse;
