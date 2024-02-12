import dotenv from 'dotenv';

dotenv.config();

export const AUTH = {
  username: '' || process.env['username'] as string,
  password: '' || process.env['password'] as string
};
//export const BASE_URL = (path: string) => `https://api.generativecore.ai/api/v2/${path}`;
// for production
export const BASE_URL = (path: string) => `https://dev-api.generativecore.ai/api/v2/${path}`;