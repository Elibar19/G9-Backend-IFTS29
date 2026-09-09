const Productor = require('../models/Productor');
const storage = require('../storage');
const { generateId } = require('../utils/id');

// GET /api/productores (obtener lista de productores)
function list(req, res) {
  const localidad = req.query.localidad;
  let productores = storage.productores.findAll();

  if (localidad) {
    productores = productores.filter((item) =>
      item.localidad.toLowerCase().includes(localidad.toLowerCase())
    );
  }

  res.json({ success: true, total: productores.length, data: productores });
}

// GET /api/productores/:id (obtener un productor por su id)
function getById(req, res) {
  const productor = storage.productores.findById(req.params.id);

  if (!productor) {
    return res.status(404).json({ success: false, message: 'Productor no encontrado' });
  }

  res.json({ success: true, data: productor });
}

// GET /api/productores/:id/lotes (obtener lista de lotes de un productor)
function listLots(req, res) {
  const productor = storage.productores.findById(req.params.id);

  if (!productor) {
    return res.status(404).json({ success: false, message: 'Productor no encontrado' });
  }

  const lotes = storage.lotes.findAll().filter((lote) => lote.productorId === productor.id);

  res.json({ success: true, total: lotes.length, data: lotes });
}

// POST /api/productores (crear un nuevo productor)
function create(req, res) {
  const nuevoProductor = new Productor(
    generateId('prod'),
    req.body.nombre,
    req.body.cuit,
    req.body.email,
    req.body.telefono,
    req.body.localidad
  );

  const errors = nuevoProductor.validate();
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join('. ') });
  }

  const alreadyExists = storage.productores
    .findAll()
    .some((item) => item.cuit === nuevoProductor.cuit);
  if (alreadyExists) {
    return res.status(409).json({ success: false, message: 'Ya existe un productor con ese CUIT' });
  }

  storage.productores.insert(nuevoProductor);
  res.status(201).json({ success: true, data: nuevoProductor });
}

// PUT /api/productores/:id (actualizar un productor)
function update(req, res) {
  const productorExistente = storage.productores.findById(req.params.id);

  if (!productorExistente) {
    return res.status(404).json({ success: false, message: 'Productor no encontrado' });
  }

  const productorActualizado = new Productor(
    productorExistente.id,
    req.body.nombre,
    req.body.cuit,
    req.body.email,
    req.body.telefono,
    req.body.localidad
  );

  const errors = productorActualizado.validate();
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join('. ') });
  }

  const duplicateCuit = storage.productores
    .findAll()
    .some((item) => item.cuit === productorActualizado.cuit && item.id !== productorActualizado.id);
  if (duplicateCuit) {
    return res.status(409).json({ success: false, message: 'Ya existe un productor con ese CUIT' });
  }

  storage.productores.update(productorActualizado.id, productorActualizado);
  res.json({ success: true, data: productorActualizado });
}

// DELETE /api/productores/:id (eliminar un productor)
function deleteProductor(req, res) {
  const productor = storage.productores.findById(req.params.id);

  if (!productor) {
    return res.status(404).json({ success: false, message: 'Productor no encontrado' });
  }

  const hasLots = storage.lotes.findAll().some((lote) => lote.productorId === productor.id);
  if (hasLots) {
    return res.status(409).json({
      success: false,
      message: 'No se puede eliminar el productor porque tiene lotes asociados',
    });
  }

  storage.productores.delete(productor.id);
  res.json({ success: true, message: 'Productor eliminado' });
}

module.exports = {
  list,
  getById,
  listLots,
  create,
  update,
  delete: deleteProductor,
};
