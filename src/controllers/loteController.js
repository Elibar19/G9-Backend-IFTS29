const Lote = require('../models/Lote');
const storage = require('../storage');
const { generateId } = require('../utils/id');
const { ALERT_LEVELS } = require('../constants/alertas');

// Obtener observaciones de un lote y devolver el nivel de alerta de la más reciente.
function getCurrentAlert(loteId) {
  const observacionesDelLote = storage.observaciones
    .findAll()
    .filter((observacion) => observacion.loteId === loteId);

  if (observacionesDelLote.length === 0) {
    return null;
  }

  observacionesDelLote.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  return observacionesDelLote[0].nivelAlerta;
}

// Agregar datos del productor y el nivel de alerta actual para que el lote se muestre completo.
function withExtraInfo(lote) {
  const productor = storage.productores.findById(lote.productorId);

  return {
    id: lote.id,
    nombre: lote.nombre,
    hectareas: lote.hectareas,
    productorId: lote.productorId,
    ubicacion: lote.ubicacion,
    productor: productor ? { id: productor.id, nombre: productor.nombre } : null,
    nivelAlertaActual: getCurrentAlert(lote.id),
  };
}

// GET /api/lotes (obtener lista de lotes)
function list(req, res) {
  const alerta = req.query.alerta;
  const productorId = req.query.productorId;

  let lotes = storage.lotes.findAll();

  if (productorId) {
    lotes = lotes.filter((lote) => lote.productorId === productorId);
  }

  let result = lotes.map(withExtraInfo);

  if (alerta) {
    if (!ALERT_LEVELS.includes(alerta)) {
      return res.status(400).json({
        success: false,
        message: 'El nivel de alerta debe ser: ' + ALERT_LEVELS.join(', '),
      });
    }
    result = result.filter((lote) => lote.nivelAlertaActual === alerta);
  }

  res.json({ success: true, total: result.length, data: result });
}

// GET /api/lotes/:id (obtener un lote por su id)
function getById(req, res) {
  const lote = storage.lotes.findById(req.params.id);

  if (!lote) {
    return res.status(404).json({ success: false, message: 'Lote no encontrado' });
  }

  res.json({ success: true, data: withExtraInfo(lote) });
}

// GET /api/lotes/:id/observaciones (historial de observaciones)
function getHistory(req, res) {
  const lote = storage.lotes.findById(req.params.id);

  if (!lote) {
    return res.status(404).json({ success: false, message: 'Lote no encontrado' });
  }

  const tecnicos = storage.tecnicos.findAll();
  const tiposCultivo = storage.tiposCultivo.findAll();

  let observaciones = storage.observaciones.findAll().filter((observacion) => observacion.loteId === lote.id);
  observaciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  observaciones = observaciones.map((observacion) => {
    const tecnico = tecnicos.find((item) => item.id === observacion.tecnicoId);
    const tipoCultivo = tiposCultivo.find((item) => item.id === observacion.tipoCultivoId);

    return {
      id: observacion.id,
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
    lote: withExtraInfo(lote),
    total: observaciones.length,
    data: observaciones,
  });
}

// POST /api/lotes (crear un nuevo lote)
function create(req, res) {
  const nuevoLote = new Lote(
    generateId('lote'),
    req.body.nombre,
    Number(req.body.hectareas),
    req.body.productorId,
    req.body.ubicacion
  );

  const errors = nuevoLote.validate();
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join('. ') });
  }

  const productor = storage.productores.findById(nuevoLote.productorId);
  if (!productor) {
    return res.status(400).json({ success: false, message: 'No existe el productor indicado' });
  }

  storage.lotes.insert(nuevoLote);
  res.status(201).json({ success: true, data: withExtraInfo(nuevoLote) });
}

// PUT /api/lotes/:id (actualizar un lote)
function update(req, res) {
  const loteExistente = storage.lotes.findById(req.params.id);

  if (!loteExistente) {
    return res.status(404).json({ success: false, message: 'Lote no encontrado' });
  }

  const loteActualizado = new Lote(
    loteExistente.id,
    req.body.nombre,
    Number(req.body.hectareas),
    req.body.productorId,
    req.body.ubicacion
  );

  const errors = loteActualizado.validate();
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join('. ') });
  }

  const productor = storage.productores.findById(loteActualizado.productorId);
  if (!productor) {
    return res.status(400).json({ success: false, message: 'No existe el productor indicado' });
  }

  storage.lotes.update(loteActualizado.id, loteActualizado);
  res.json({ success: true, data: withExtraInfo(loteActualizado) });
}

// DELETE /api/lotes/:id (eliminar un lote)
function deleteLote(req, res) {
  const lote = storage.lotes.findById(req.params.id);

  if (!lote) {
    return res.status(404).json({ success: false, message: 'Lote no encontrado' });
  }

  const hasObservations = storage.observaciones
    .findAll()
    .some((observacion) => observacion.loteId === lote.id);

  if (hasObservations) {
    return res.status(409).json({
      success: false,
      message: 'No se puede eliminar el lote porque tiene observaciones en el historial',
    });
  }

  storage.lotes.delete(lote.id);
  res.json({ success: true, message: 'Lote eliminado' });
}

module.exports = {
  list,
  getById,
  getHistory,
  create,
  update,
  delete: deleteLote,
};
