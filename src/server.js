import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import { port, mongoUri } from './config.js';

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('Conectado a MongoDB');

    app.listen(port, () => {
      console.log(`AgroTec API escuchando en http://localhost:${port}`);
      console.log(`Vistas Pug: http://localhost:${port}`);
      console.log(`API REST:   http://localhost:${port}/api/health`);
    });
  })
  .catch((err) => {
    console.error('No se pudo conectar a MongoDB');
    console.error(err.message);
    process.exit(1);
  });
