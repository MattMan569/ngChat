import mongoose, { Document, Model, Schema } from 'mongoose';

import User from './userModel';
import IAuth from 'types/auth';

export interface IAuthDocument extends Document, IAuth {}

export interface IAuthModel extends Model<IAuthDocument> {
  authorizeUser(userId: string, refreshToken: string): Promise<IAuthDocument>;
}

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

authSchema.statics.authorizeUser = async (userId: string, refreshToken: string) => {
  const auth = await Auth.findOne({ user: userId });

  if (!auth) {
    // Verify the provided user ID
    if (!await User.findById(userId)) {
      throw new Error('Invalid user id');
    }

    return await Auth.create({
      user: userId,
      refreshToken,
    });
  } else {
    auth.refreshToken = refreshToken;
    return await auth.save();
  }
};

export const Auth = mongoose.model <IAuthDocument, IAuthModel>('Auth', authSchema);

export default Auth;
