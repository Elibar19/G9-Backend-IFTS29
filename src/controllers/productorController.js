import mongoose from 'mongoose';
import Productor, { validate as validateProductor } from '../models/Productor.js';
import Lote from '../models/Lote.js';
import { mapId } from '../utils/dto.js';
import { escapeRegex } from '../utils/regex.js';

// GET /api/productores (obtener lista de productores)
export async function list(req, res) {
  const localidad = req.query.localidad;

  const query = localidad ? { localidad: { $regex: escapeRegex(localidad), $options: 'i' } } : {};
  const productores = (await Productor.find(query).lean()).map(mapId);

  res.json({ success: true, total: productores.length, data: productores });
}

// GET /api/productores/:id (obtener un productor por su id)
export async function getById(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Productor no encontrado' });
  }

  const productor = await Productor.findById(req.params.id).lean();

  if (!productor) {
    return res.status(404).json({ success: false, message: 'Productor no encontrado' });
  }

  res.json({ success: true, data: mapId(productor) });
}

// GET /api/productores/:id/lotes (obtener lista de lotes de un productor)
export async function listLots(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Productor no encontrado' });
  }

  const productor = await Productor.findById(req.params.id).lean();

  if (!productor) {
    return res.status(404).json({ success: false, message: 'Productor no encontrado' });
  }

  const lotes = (await Lote.find({ productorId: productor._id }).lean()).map(mapId);

  res.json({ success: true, total: lotes.length, data: lotes });
}

// POST /api/productores (crear un nuevo productor)
export async function create(req, res) {
  const datos = {
    nombre: req.body.nombre,
    cuit: req.body.cuit,
    email: req.body.email,
    telefono: req.body.telefono,
    localidad: req.body.localidad,
  };

  const errors = validateProductor(datos);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join('. ') });
  }

  const alreadyExists = await Productor.exists({ cuit: datos.cuit });
  if (alreadyExists) {
    return res.status(409).json({ success: false, message: 'Ya existe un productor con ese CUIT' });
  }

  const nuevoProductor = mapId((await Productor.create(datos)).toObject());
  res.status(201).json({ success: true, data: nuevoProductor });
}

// PUT /api/productores/:id (actualizar un productor)
export async function update(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Productor no encontrado' });
  }

  const productorExistente = await Productor.findById(req.params.id).lean();

  if (!productorExistente) {
    return res.status(404).json({ success: false, message: 'Productor no encontrado' });
  }

  const datos = {
    nombre: req.body.nombre,
    cuit: req.body.cuit,
    email: req.body.email,
    telefono: req.body.telefono,
    localidad: req.body.localidad,
  };

  const errors = validateProductor(datos);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join('. ') });
  }

  const duplicateCuit = await Productor.exists({ cuit: datos.cuit, _id: { $ne: productorExistente._id } });
  if (duplicateCuit) {
    return res.status(409).json({ success: false, message: 'Ya existe un productor con ese CUIT' });
  }

  await Productor.updateOne({ _id: productorExistente._id }, datos);
  const productorActualizado = mapId({ _id: productorExistente._id, ...datos });
  res.json({ success: true, data: productorActualizado });
}

// DELETE /api/productores/:id (eliminar un productor)
export async function deleteProductor(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Productor no encontrado' });
  }

  const productor = await Productor.findById(req.params.id).lean();

  if (!productor) {
    return res.status(404).json({ success: false, message: 'Productor no encontrado' });
  }

  const hasLots = await Lote.exists({ productorId: productor._id });
  if (hasLots) {
    return res.status(409).json({
      success: false,
      message: 'No se puede eliminar el productor porque tiene lotes asociados',
    });
  }

  await Productor.deleteOne({ _id: productor._id });
  res.json({ success: true, message: 'Productor eliminado' });
}

export { deleteProductor as delete };
