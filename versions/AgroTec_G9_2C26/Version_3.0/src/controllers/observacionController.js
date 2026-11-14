import mongoose from 'mongoose';
import Observacion, { validate as validateObservacion } from '../models/Observacion.js';
import Lote from '../models/Lote.js';
import Tecnico from '../models/Tecnico.js';
import TipoCultivo from '../models/TipoCultivo.js';
import { ALERT_LEVELS } from '../constants/alertas.js';

// Agregar nombres de lote, técnico y tipo de cultivo para que la observación se muestre completa.
async function withExtraInfo(observacion) {
  const lote = observacion.loteId ? await Lote.findById(observacion.loteId).lean() : null;
  const tecnico = observacion.tecnicoId ? await Tecnico.findById(observacion.tecnicoId).lean() : null;
  const tipoCultivo = observacion.tipoCultivoId
    ? await TipoCultivo.findById(observacion.tipoCultivoId).lean()
    : null;

  return {
    id: observacion._id.toString(),
    fecha: observacion.fecha,
    estadoCultivo: observacion.estadoCultivo,
    observaciones: observacion.observaciones,
    nivelAlerta: observacion.nivelAlerta,
    lote: lote ? { id: lote._id.toString(), nombre: lote.nombre } : null,
    tecnico: tecnico ? { id: tecnico._id.toString(), nombre: tecnico.nombre } : null,
    tipoCultivo: tipoCultivo ? { id: tipoCultivo._id.toString(), nombre: tipoCultivo.nombre } : null,
  };
}

// GET /api/observaciones (obtener lista de observaciones)
export async function list(req, res) {
  const alerta = req.query.alerta;
  const tecnicoId = req.query.tecnicoId;
  const loteId = req.query.loteId;

  if (alerta && !ALERT_LEVELS.includes(alerta)) {
    return res.status(400).json({
      success: false,
      message: 'El nivel de alerta debe ser: ' + ALERT_LEVELS.join(', '),
    });
  }
  if (tecnicoId && !mongoose.isValidObjectId(tecnicoId)) {
    return res.status(400).json({ success: false, message: 'El tecnicoId indicado no es válido' });
  }
  if (loteId && !mongoose.isValidObjectId(loteId)) {
    return res.status(400).json({ success: false, message: 'El loteId indicado no es válido' });
  }

  const query = {};
  if (tecnicoId) query.tecnicoId = tecnicoId;
  if (loteId) query.loteId = loteId;
  if (alerta) query.nivelAlerta = alerta;

  const observaciones = await Observacion.find(query).sort({ fecha: -1 }).lean();
  const data = await Promise.all(observaciones.map(withExtraInfo));

  res.json({ success: true, total: data.length, data });
}

// GET /api/observaciones/:id (obtener una observación por su id)
export async function getById(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Observación no encontrada' });
  }

  const observacion = await Observacion.findById(req.params.id).lean();

  if (!observacion) {
    return res.status(404).json({ success: false, message: 'Observación no encontrada' });
  }

  res.json({ success: true, data: await withExtraInfo(observacion) });
}

// POST /api/observaciones (crear una nueva observación)
export async function create(req, res) {
  const datos = {
    loteId: req.body.loteId,
    tecnicoId: req.body.tecnicoId,
    fecha: req.body.fecha,
    tipoCultivoId: req.body.tipoCultivoId,
    estadoCultivo: req.body.estadoCultivo,
    observaciones: req.body.observaciones,
    nivelAlerta: req.body.nivelAlerta,
  };

  const errors = validateObservacion(datos);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join('. ') });
  }

  if (!(await existeRef(Lote, datos.loteId))) {
    return res.status(400).json({ success: false, message: 'No existe el lote indicado' });
  }
  if (!(await existeRef(Tecnico, datos.tecnicoId))) {
    return res.status(400).json({ success: false, message: 'No existe el técnico indicado' });
  }
  if (!(await existeRef(TipoCultivo, datos.tipoCultivoId))) {
    return res.status(400).json({ success: false, message: 'No existe el tipo de cultivo indicado' });
  }

  const nuevaObservacion = await Observacion.create(datos);
  res.status(201).json({ success: true, data: await withExtraInfo(nuevaObservacion.toObject()) });
}

// PUT /api/observaciones/:id (actualizar una observación)
export async function update(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Observación no encontrada' });
  }

  const observacionExistente = await Observacion.findById(req.params.id).lean();

  if (!observacionExistente) {
    return res.status(404).json({ success: false, message: 'Observación no encontrada' });
  }

  const datos = {
    loteId: req.body.loteId,
    tecnicoId: req.body.tecnicoId,
    fecha: req.body.fecha,
    tipoCultivoId: req.body.tipoCultivoId,
    estadoCultivo: req.body.estadoCultivo,
    observaciones: req.body.observaciones,
    nivelAlerta: req.body.nivelAlerta,
  };

  const errors = validateObservacion(datos);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join('. ') });
  }

  if (!(await existeRef(Lote, datos.loteId))) {
    return res.status(400).json({ success: false, message: 'No existe el lote indicado' });
  }
  if (!(await existeRef(Tecnico, datos.tecnicoId))) {
    return res.status(400).json({ success: false, message: 'No existe el técnico indicado' });
  }
  if (!(await existeRef(TipoCultivo, datos.tipoCultivoId))) {
    return res.status(400).json({ success: false, message: 'No existe el tipo de cultivo indicado' });
  }

  await Observacion.updateOne({ _id: observacionExistente._id }, datos);
  const observacionActualizada = { _id: observacionExistente._id, ...datos };
  res.json({ success: true, data: await withExtraInfo(observacionActualizada) });
}

// DELETE /api/observaciones/:id (eliminar una observación)
// Regla de negocio: las observaciones no se eliminan físicamente, se conservan como historial del lote
export async function deleteObservacion(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Observación no encontrada' });
  }

  const observacion = await Observacion.findById(req.params.id).lean();

  if (!observacion) {
    return res.status(404).json({ success: false, message: 'Observación no encontrada' });
  }

  res.status(403).json({
    success: false,
    message: 'Las observaciones no se eliminan físicamente: se conservan como historial del lote',
  });
}

// Verifica que un id recibido por texto apunte a un documento existente.
async function existeRef(Model, id) {
  if (!mongoose.isValidObjectId(id)) {
    return false;
  }
  return Boolean(await Model.exists({ _id: id }));
}

export { deleteObservacion as delete };
