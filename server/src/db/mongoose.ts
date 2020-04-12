import mongoose from 'mongoose';

class Database {
  private error: any;

  constructor() {
    this.error = '';
  }

  async connect() {
    try {
      if (!process.env.MONGODB_URI) {
        throw new Error('Environment variable MONGODB_URI is undefined.');
      }

      await mongoose.connect(process.env.MONGODB_URI, {
        useCreateIndex: true,
        useFindAndModify: false,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      return true;
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  getError() {
    return this.error;
  }
}

export default new Database();
