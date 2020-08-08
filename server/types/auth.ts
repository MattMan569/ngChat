/** Auth model document type */
export interface IAuth {
  /** Document's id */
  _id: string | any;

  /** User's id */
  user: string;

  /** User's current jwt refresh token */
  refreshToken: string;
}

export default IAuth;
