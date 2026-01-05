import mongoose from 'mongoose';
import { env, isTestEnv } from './env.js';

mongoose.set('strictQuery', true);

export const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  const connection = await mongoose.connect(env.MONGODB_URI, {
    autoIndex: env.NODE_ENV !== 'production'
  });

  if (!isTestEnv) {
    console.log('MongoDB connected');
  }
  return connection;
};

export const disconnectDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};
