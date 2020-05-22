import mongoose, { Document, Model, Schema } from 'mongoose';

import User from './userModel';
import IAuth from 'types/auth';

export interface IAuthDocument extends Document, IAuth {}

// TODO add static for adding a refresh token for a user
// if user exists, update refresh token,
// else create a new document
export interface IAuthModel extends Model<IAuthDocument> {}

const authSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: User,
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

export const Auth = mongoose.model <IAuthDocument, IAuthModel>('Auth', authSchema);

export default Auth;
