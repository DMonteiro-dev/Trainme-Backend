import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { IUser } from '../models/user.model.js';

interface TokenPayload {
  sub: string;
  role: IUser['role'];
}

export const generateAccessToken = (user: IUser) => {
  const payload: TokenPayload = {
    sub: user._id.toString(),
    role: user.role
  };
  const options: jwt.SignOptions = {};
  options.expiresIn = env.JWT_EXPIRES_IN as NonNullable<jwt.SignOptions['expiresIn']>;
  return jwt.sign(payload, env.JWT_SECRET as jwt.Secret, options);
};

export const generateRefreshToken = (user: IUser) => {
  const payload: TokenPayload = {
    sub: user._id.toString(),
    role: user.role
  };
  const options: jwt.SignOptions = {};
  options.expiresIn = env.JWT_REFRESH_EXPIRES_IN as NonNullable<jwt.SignOptions['expiresIn']>;
  return jwt.sign(payload, env.JWT_REFRESH_SECRET as jwt.Secret, options);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_SECRET as jwt.Secret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET as jwt.Secret) as TokenPayload;
};

export const generateMagicLinkToken = (user: IUser) => {
  const payload: TokenPayload = {
    sub: user._id.toString(),
    role: user.role
  };
  return jwt.sign(payload, env.JWT_SECRET as jwt.Secret, { expiresIn: '5m' });
};
