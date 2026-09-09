const TipoCultivo = require('../models/TipoCultivo');
const storage = require('../storage');
const { generateId } = require('../utils/id');

// GET /api/tipos-cultivo (obtener lista de tipos de cultivo)
function list(req, res) {
  const tiposCultivo = storage.tiposCultivo.findAll();
  res.json({ success: true, total: tiposCultivo.length, data: tiposCultivo });
}

// GET /api/tipos-cultivo/:id (obtener un tipo de cultivo por su id)
function getById(req, res) {
  const tipoCultivo = storage.tiposCultivo.findById(req.params.id);

  if (!tipoCultivo) {
    return res.status(404).json({ success: false, message: 'Tipo de cultivo no encontrado' });
  }

  res.json({ success: true, data: tipoCultivo });
}

// POST /api/tipos-cultivo (crear un nuevo tipo de cultivo)
function create(req, res) {
  const nuevoTipoCultivo = new TipoCultivo(generateId('cult'), req.body.nombre);

  const errors = nuevoTipoCultivo.validate();
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join('. ') });
  }

  const alreadyExists = storage.tiposCultivo
    .findAll()
    .some((tipoCultivo) => tipoCultivo.nombre.toLowerCase() === nuevoTipoCultivo.nombre.toLowerCase());
  if (alreadyExists) {
    return res.status(409).json({ success: false, message: 'Ya existe un tipo de cultivo con ese nombre' });
  }

  storage.tiposCultivo.insert(nuevoTipoCultivo);
  res.status(201).json({ success: true, data: nuevoTipoCultivo });
}

module.exports = {
  list,
  getById,
  create,
};
