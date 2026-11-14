import mongoose from 'mongoose';
import TipoCultivo, { validate as validateTipoCultivo } from '../models/TipoCultivo.js';
import { mapId } from '../utils/dto.js';
import { escapeRegex } from '../utils/regex.js';

// GET /api/tipos-cultivo (obtener lista de tipos de cultivo)
export async function list(req, res) {
  const tiposCultivo = (await TipoCultivo.find().lean()).map(mapId);
  res.json({ success: true, total: tiposCultivo.length, data: tiposCultivo });
}

// GET /api/tipos-cultivo/:id (obtener un tipo de cultivo por su id)
export async function getById(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Tipo de cultivo no encontrado' });
  }

  const tipoCultivo = await TipoCultivo.findById(req.params.id).lean();

  if (!tipoCultivo) {
    return res.status(404).json({ success: false, message: 'Tipo de cultivo no encontrado' });
  }

  res.json({ success: true, data: mapId(tipoCultivo) });
}

// POST /api/tipos-cultivo (crear un nuevo tipo de cultivo)
export async function create(req, res) {
  const datos = { nombre: req.body.nombre };

  const errors = validateTipoCultivo(datos);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join('. ') });
  }

  const alreadyExists = await TipoCultivo.exists({
    nombre: { $regex: '^' + escapeRegex(datos.nombre) + '$', $options: 'i' },
  });
  if (alreadyExists) {
    return res.status(409).json({ success: false, message: 'Ya existe un tipo de cultivo con ese nombre' });
  }

  const nuevoTipoCultivo = mapId((await TipoCultivo.create(datos)).toObject());
  res.status(201).json({ success: true, data: nuevoTipoCultivo });
}
