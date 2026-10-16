import mongoose from 'mongoose';
import Lote, { validate as validateLote } from '../models/Lote.js';
import Observacion from '../models/Observacion.js';
import Productor from '../models/Productor.js';
import Tecnico from '../models/Tecnico.js';
import TipoCultivo from '../models/TipoCultivo.js';
import { ALERT_LEVELS } from '../constants/alertas.js';
import { mapId } from '../utils/dto.js';

// Obtener observaciones de un lote y devolver el nivel de alerta de la más reciente.
async function getCurrentAlert(loteId) {
  const ultima = await Observacion.find({ loteId }).sort({ fecha: -1 }).limit(1).lean();

  if (ultima.length === 0) {
    return null;
  }

  return ultima[0].nivelAlerta;
}

// Agregar datos del productor y el nivel de alerta actual para que el lote se muestre completo.
async function withExtraInfo(lote) {
  const productor = lote.productorId
    ? await Productor.findById(lote.productorId).lean()
    : null;

  return {
    id: lote.id,
    nombre: lote.nombre,
    hectareas: lote.hectareas,
    productorId: lote.productorId ? lote.productorId.toString() : null,
    ubicacion: lote.ubicacion,
    productor: productor ? { id: productor._id.toString(), nombre: productor.nombre } : null,
    nivelAlertaActual: await getCurrentAlert(lote.id),
  };
}

// GET /api/lotes (obtener lista de lotes)
export async function list(req, res) {
  const alerta = req.query.alerta;
  const productorId = req.query.productorId;

  if (alerta && !ALERT_LEVELS.includes(alerta)) {
    return res.status(400).json({
      success: false,
      message: 'El nivel de alerta debe ser: ' + ALERT_LEVELS.join(', '),
    });
  }
  if (productorId && !mongoose.isValidObjectId(productorId)) {
    return res.status(400).json({ success: false, message: 'El productorId indicado no es válido' });
  }

  const query = productorId ? { productorId } : {};
  const lotes = (await Lote.find(query).lean()).map(mapId);

  let result = await Promise.all(lotes.map(withExtraInfo));

  if (alerta) {
    result = result.filter((lote) => lote.nivelAlertaActual === alerta);
  }

  res.json({ success: true, total: result.length, data: result });
}

// GET /api/lotes/:id (obtener un lote por su id)
export async function getById(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Lote no encontrado' });
  }

  const lote = await Lote.findById(req.params.id).lean();

  if (!lote) {
    return res.status(404).json({ success: false, message: 'Lote no encontrado' });
  }

  res.json({ success: true, data: await withExtraInfo(mapId(lote)) });
}

// GET /api/lotes/:id/observaciones (historial de observaciones)
export async function getHistory(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Lote no encontrado' });
  }

  const lote = await Lote.findById(req.params.id).lean();

  if (!lote) {
    return res.status(404).json({ success: false, message: 'Lote no encontrado' });
  }

  const tecnicos = (await Tecnico.find().lean()).map(mapId);
  const tiposCultivo = (await TipoCultivo.find().lean()).map(mapId);

  let observaciones = await Observacion.find({ loteId: lote._id }).sort({ fecha: -1 }).lean();

  const data = observaciones.map((observacion) => {
    const tecnico = tecnicos.find((item) => item.id === String(observacion.tecnicoId));
    const tipoCultivo = tiposCultivo.find((item) => item.id === String(observacion.tipoCultivoId));

    return {
      id: observacion._id.toString(),
      fecha: observacion.fecha,
      estadoCultivo: observacion.estadoCultivo,
      observaciones: observacion.observaciones,
      nivelAlerta: observacion.nivelAlerta,
      tecnico: tecnico ? tecnico.nombre : null,
      tipoCultivo: tipoCultivo ? tipoCultivo.nombre : null,
    };
  });

  res.json({
    success: true,
    lote: await withExtraInfo(mapId(lote)),
    total: data.length,
    data,
  });
}

// POST /api/lotes (crear un nuevo lote)
export async function create(req, res) {
  const datos = {
    nombre: req.body.nombre,
    hectareas: Number(req.body.hectareas),
    productorId: req.body.productorId,
    ubicacion: req.body.ubicacion,
  };

  const errors = validateLote(datos);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join('. ') });
  }

  const productor = mongoose.isValidObjectId(datos.productorId)
    ? await Productor.findById(datos.productorId).lean()
    : null;
  if (!productor) {
    return res.status(400).json({ success: false, message: 'No existe el productor indicado' });
  }

  const nuevoLote = mapId((await Lote.create(datos)).toObject());
  res.status(201).json({ success: true, data: await withExtraInfo(nuevoLote) });
}

// PUT /api/lotes/:id (actualizar un lote)
export async function update(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Lote no encontrado' });
  }

  const loteExistente = await Lote.findById(req.params.id).lean();

  if (!loteExistente) {
    return res.status(404).json({ success: false, message: 'Lote no encontrado' });
  }

  const datos = {
    nombre: req.body.nombre,
    hectareas: Number(req.body.hectareas),
    productorId: req.body.productorId,
    ubicacion: req.body.ubicacion,
  };

  const errors = validateLote(datos);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join('. ') });
  }

  const productor = mongoose.isValidObjectId(datos.productorId)
    ? await Productor.findById(datos.productorId).lean()
    : null;
  if (!productor) {
    return res.status(400).json({ success: false, message: 'No existe el productor indicado' });
  }

  await Lote.updateOne({ _id: loteExistente._id }, datos);
  const loteActualizado = mapId({ _id: loteExistente._id, ...datos });
  res.json({ success: true, data: await withExtraInfo(loteActualizado) });
}

// DELETE /api/lotes/:id (eliminar un lote)
export async function deleteLote(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Lote no encontrado' });
  }

  const lote = await Lote.findById(req.params.id).lean();

  if (!lote) {
    return res.status(404).json({ success: false, message: 'Lote no encontrado' });
  }

  const hasObservations = await Observacion.exists({ loteId: lote._id });

  if (hasObservations) {
    return res.status(409).json({
      success: false,
      message: 'No se puede eliminar el lote porque tiene observaciones en el historial',
    });
  }

  await Lote.deleteOne({ _id: lote._id });
  res.json({ success: true, message: 'Lote eliminado' });
}

export { deleteLote as delete };
