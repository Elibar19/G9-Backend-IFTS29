import 'dotenv/config';
import mongoose from 'mongoose';
import { port, mongoUri } from './config.js';

// Primero se conecta a MongoDB y recién después se importa app.js:
// el store de sesiones (connect-mongo v6) necesita un client activo para reutilizar esta conexión.
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
