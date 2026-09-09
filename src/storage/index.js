const JsonStorage = require('./JsonStorage');

module.exports = {
  productores: new JsonStorage('productores.json'),
  lotes: new JsonStorage('lotes.json'),
  tecnicos: new JsonStorage('tecnicos.json'),
  observaciones: new JsonStorage('observaciones.json'),
  tiposCultivo: new JsonStorage('tiposCultivo.json'),
};
