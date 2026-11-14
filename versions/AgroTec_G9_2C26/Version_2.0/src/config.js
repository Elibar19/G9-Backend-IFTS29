export const port = process.env.PORT || 3001;
export const mongoUri =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/agrotec';
export const sessionSecret = process.env.SESSION_SECRET || 'agrotec-dev-secret';
