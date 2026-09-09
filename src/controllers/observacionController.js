const Observacion = require('../models/Observacion');
const storage = require('../storage');
const { generateId } = require('../utils/id');
const { ALERT_LEVELS } = require('../constants/alertas');

// Agregar nombres de lote, técnico y tipo de cultivo para que la observación se muestre completa.
function withExtraInfo(observacion) {
  const lote = storage.lotes.findById(observacion.loteId);
  const tecnico = storage.tecnicos.findById(observacion.tecnicoId);
  const tipoCultivo = storage.tiposCultivo.findById(observacion.tipoCultivoId);

  return {
    id: observacion.id,
    fecha: observacion.fecha,
    estadoCultivo: observacion.estadoCultivo,
    observaciones: observacion.observaciones,
    nivelAlerta: observacion.nivelAlerta,
    lote: lote ? { id: lote.id, nombre: lote.nombre } : null,
    tecnico: tecnico ? { id: tecnico.id, nombre: tecnico.nombre } : null,
    tipoCultivo: tipoCultivo ? { id: tipoCultivo.id, nombre: tipoCultivo.nombre } : null,
  };
}

// GET /api/observaciones (obtener lista de observaciones)
function list(req, res) {
  const alerta = req.query.alerta;
  const tecnicoId = req.query.tecnicoId;
  const loteId = req.query.loteId;

  let observaciones = storage.observaciones.findAll();

  if (tecnicoId) {
    observaciones = observaciones.filter((observacion) => observacion.tecnicoId === tecnicoId);
  }
  if (loteId) {
    observaciones = observaciones.filter((observacion) => observacion.loteId === loteId);
  }
  if (alerta) {
    if (!ALERT_LEVELS.includes(alerta)) {
      return res.status(400).json({
        success: false,
        message: 'El nivel de alerta debe ser: ' + ALERT_LEVELS.join(', '),
      });
    }
    observaciones = observaciones.filter((observacion) => observacion.nivelAlerta === alerta);
  }

  observaciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  const data = observaciones.map(withExtraInfo);

  res.json({ success: true, total: data.length, data });
}

// GET /api/observaciones/:id (obtener una observación por su id)
function getById(req, res) {
  const observacion = storage.observaciones.findById(req.params.id);

  if (!observacion) {
    return res.status(404).json({ success: false, message: 'Observación no encontrada' });
  }

  res.json({ success: true, data: withExtraInfo(observacion) });
}

// POST /api/observaciones (crear una nueva observación)
function create(req, res) {
  const nuevaObservacion = new Observacion(
    generateId('obs'),
    req.body.loteId,
    req.body.tecnicoId,
    req.body.fecha,
    req.body.tipoCultivoId,
    req.body.estadoCultivo,
    req.body.observaciones,
    req.body.nivelAlerta
  );

  const errors = nuevaObservacion.validate();
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join('. ') });
  }

  if (!storage.lotes.findById(nuevaObservacion.loteId)) {
    return res.status(400).json({ success: false, message: 'No existe el lote indicado' });
  }
  if (!storage.tecnicos.findById(nuevaObservacion.tecnicoId)) {
    return res.status(400).json({ success: false, message: 'No existe el técnico indicado' });
  }
  if (!storage.tiposCultivo.findById(nuevaObservacion.tipoCultivoId)) {
    return res.status(400).json({ success: false, message: 'No existe el tipo de cultivo indicado' });
  }

  storage.observaciones.insert(nuevaObservacion);
  res.status(201).json({ success: true, data: withExtraInfo(nuevaObservacion) });
}

// PUT /api/observaciones/:id (actualizar una observación)
function update(req, res) {
  const observacionExistente = storage.observaciones.findById(req.params.id);

  if (!observacionExistente) {
    return res.status(404).json({ success: false, message: 'Observación no encontrada' });
  }

  const observacionActualizada = new Observacion(
    observacionExistente.id,
    req.body.loteId,
    req.body.tecnicoId,
    req.body.fecha,
    req.body.tipoCultivoId,
    req.body.estadoCultivo,
    req.body.observaciones,
    req.body.nivelAlerta
  );

  const errors = observacionActualizada.validate();
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join('. ') });
  }

  if (!storage.lotes.findById(observacionActualizada.loteId)) {
    return res.status(400).json({ success: false, message: 'No existe el lote indicado' });
  }
  if (!storage.tecnicos.findById(observacionActualizada.tecnicoId)) {
    return res.status(400).json({ success: false, message: 'No existe el técnico indicado' });
  }
  if (!storage.tiposCultivo.findById(observacionActualizada.tipoCultivoId)) {
    return res.status(400).json({ success: false, message: 'No existe el tipo de cultivo indicado' });
  }

  storage.observaciones.update(observacionActualizada.id, observacionActualizada);
  res.json({ success: true, data: withExtraInfo(observacionActualizada) });
}

// DELETE /api/observaciones/:id (eliminar una observación)
// Regla de negocio: las observaciones no se eliminan físicamente, se conservan como historial del lote
function deleteObservacion(req, res) {
  const observacion = storage.observaciones.findById(req.params.id);

  if (!observacion) {
    return res.status(404).json({ success: false, message: 'Observación no encontrada' });
  }

  res.status(403).json({
    success: false,
    message: 'Las observaciones no se eliminan físicamente: se conservan como historial del lote',
  });
}

module.exports = {
  list,
  getById,
  create,
  update,
  delete: deleteObservacion,
};
