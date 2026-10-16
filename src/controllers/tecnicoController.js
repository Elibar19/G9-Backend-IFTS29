import mongoose from 'mongoose';
import Tecnico, { validate as validateTecnico } from '../models/Tecnico.js';
import { mapId } from '../utils/dto.js';

// GET /api/tecnicos (obtener lista de técnicos)
export async function list(req, res) {
  const tecnicos = (await Tecnico.find().lean()).map(mapId);
  res.json({ success: true, total: tecnicos.length, data: tecnicos });
}

// GET /api/tecnicos/:id (obtener un técnico por su id)
export async function getById(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Técnico no encontrado' });
  }

  const tecnico = await Tecnico.findById(req.params.id).lean();

  if (!tecnico) {
    return res.status(404).json({ success: false, message: 'Técnico no encontrado' });
  }

  res.json({ success: true, data: mapId(tecnico) });
}

// POST /api/tecnicos (crear un nuevo técnico)
export async function create(req, res) {
  const datos = {
    nombre: req.body.nombre,
    especialidad: req.body.especialidad,
    email: req.body.email,
    telefono: req.body.telefono,
  };

  const errors = validateTecnico(datos);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join('. ') });
  }

  const nuevoTecnico = mapId((await Tecnico.create(datos)).toObject());
  res.status(201).json({ success: true, data: nuevoTecnico });
}
