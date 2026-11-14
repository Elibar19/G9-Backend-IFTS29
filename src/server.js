import 'dotenv/config';
import mongoose from 'mongoose';
import { port, mongoUri, isProduction } from './config.js';

if (isProduction && !process.env.SESSION_SECRET) {
  console.error('FATAL: SESSION_SECRET no está definido; es obligatorio con NODE_ENV=production.');
  process.exit(1);
}

try {
  await mongoose.connect(mongoUri);
  console.log('Conectado a MongoDB');

  const { default: app } = await import('./app.js');
  app.listen(port, () => {
    console.log(`AgroTec API escuchando en http://localhost:${port}`);
    console.log(`Vistas Pug: http://localhost:${port}`);
    console.log(`API REST:   http://localhost:${port}/api/health`);
  });
} catch (err) {
  console.error('No se pudo conectar a MongoDB');
  console.error(err.message);
  process.exit(1);
}
