const app = require('./app');
const { port } = require('./config');

app.listen(port, () => {
  console.log(`AgroTec API escuchando en http://localhost:${port}`);
  console.log(`Vistas Pug: http://localhost:${port}`);
  console.log(`API REST:   http://localhost:${port}/api/health`);
});
