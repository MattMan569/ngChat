// Type returned by jwt.verify
export interface IToken {
  username: string;
  email: string;
  _id: string;
  iat: number; // Issued at
  exp: number; // Expires
}

export default IToken;
