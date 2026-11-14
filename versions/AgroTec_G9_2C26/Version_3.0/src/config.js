export const port = process.env.PORT || 3001;
export const mongoUri =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/agrotec';
export const sessionSecret = process.env.SESSION_SECRET || 'agrotec-dev-secret';
// NODE_ENV=production activa cookies seguras y trust proxy (necesario en Render).
export const nodeEnv = process.env.NODE_ENV || 'development';
export const isProduction = nodeEnv === 'production';
