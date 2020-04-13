export interface ITokenPayload {
  username: string;
  email: string;
  _id: string;
  expires: string; // ISO string format of JS Date
}

export default ITokenPayload;
