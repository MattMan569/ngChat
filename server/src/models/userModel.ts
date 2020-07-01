import mongoose, { Document, Model } from 'mongoose';
import mongooseUniqueValidator from 'mongoose-unique-validator';
import validator from 'validator';

import IUser from 'types/user';

// Define document methods
interface IUserDocument extends Document, IUser {
}

// Define model statics
interface IUserModel extends Model<IUserDocument> {
}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: 5,
    maxlength: 32,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    validate(value: string): any {
      if (!validator.isEmail(value)) {
        throw new Error('Invalid email format');
      }
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 8,
  },
}, {
  timestamps: true,
});

userSchema.plugin(mongooseUniqueValidator);

export const User = mongoose.model<IUserDocument, IUserModel>('User', userSchema);

export default User;
