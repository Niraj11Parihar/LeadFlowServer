import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: process.env.PORT || '5000',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres@localhost:5433/leadflow?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'default_jwt_secret_leadflow',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};
