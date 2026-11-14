const Tecnico = require('../models/Tecnico');
const storage = require('../storage');
const { generateId } = require('../utils/id');

// GET /api/tecnicos (obtener lista de técnicos)
function list(req, res) {
  const tecnicos = storage.tecnicos.findAll();
  res.json({ success: true, total: tecnicos.length, data: tecnicos });
}

// GET /api/tecnicos/:id (obtener un técnico por su id)
function getById(req, res) {
  const tecnico = storage.tecnicos.findById(req.params.id);

  if (!tecnico) {
    return res.status(404).json({ success: false, message: 'Técnico no encontrado' });
  }

  res.json({ success: true, data: tecnico });
}

// POST /api/tecnicos (crear un nuevo técnico)
function create(req, res) {
  const nuevoTecnico = new Tecnico(
    generateId('tec'),
    req.body.nombre,
    req.body.especialidad,
    req.body.email,
    req.body.telefono
  );

  const errors = nuevoTecnico.validate();
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join('. ') });
  }

  storage.tecnicos.insert(nuevoTecnico);
  res.status(201).json({ success: true, data: nuevoTecnico });
}

module.exports = {
  list,
  getById,
  create,
};
