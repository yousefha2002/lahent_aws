import * as jwt from 'jsonwebtoken';
import { RoleStatus } from '../enums/role_status';

export const generateAccessToken = (payload: any) => {
  return jwt.sign(payload, 'token', { expiresIn: '1d' }); 
};

export const generateRefreshToken = (payload: any) => {
  return jwt.sign(payload, 'refresh_token', { expiresIn: '30d' });
};

export function generateTokens(id: number, role: RoleStatus) {
  const payload = { id, role };
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}