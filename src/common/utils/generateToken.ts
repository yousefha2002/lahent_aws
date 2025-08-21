import * as jwt from 'jsonwebtoken';

export const generateAccessToken = (payload: any) => {
  return jwt.sign(payload, 'token', { expiresIn: '1d' }); 
};

export const generateRefreshToken = (payload: any) => {
  return jwt.sign(payload, 'refresh_token', { expiresIn: '365d' });
};