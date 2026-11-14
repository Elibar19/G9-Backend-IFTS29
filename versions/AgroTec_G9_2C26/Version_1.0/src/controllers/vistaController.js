const storage = require('../storage');
const Observacion = require('../models/Observacion');
const { generateId } = require('../utils/id');
const { ALERT_LEVELS, CROP_STATUSES } = require('../constants/alertas');

// Buscar observaciones de un lote y devolver el nivel de alerta de la más reciente.
function getCurrentAlert(loteId) {
  const observacionesDelLote = storage.observaciones
    .findAll()
    .filter((observacion) => observacion.loteId === loteId);

  if (observacionesDelLote.length === 0) {
    return 'Sin registros';
  }

  observacionesDelLote.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  return observacionesDelLote[0].nivelAlerta;
}

// GET /  (página de inicio)
function home(req, res) {
  const lotes = storage.lotes.findAll().map((lote) => ({
    ...lote,
    nivelAlertaActual: getCurrentAlert(lote.id),
  }));

  let ultimasObservaciones = storage.observaciones.findAll();
  ultimasObservaciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  ultimasObservaciones = ultimasObservaciones.slice(0, 5);

  res.render('index', {
    title: 'Inicio',
    totals: {
      productores: storage.productores.findAll().length,
      lotes: lotes.length,
      tecnicos: storage.tecnicos.findAll().length,
      observaciones: storage.observaciones.findAll().length,
    },
    lotes,
    observaciones: ultimasObservaciones,
  });
}

// GET /lotes (página de lotes)
function lots(req, res) {
  const listaLotes = storage.lotes.findAll().map((lote) => {
    const productor = storage.productores.findById(lote.productorId);
    return {
      ...lote,
      productorNombre: productor ? productor.nombre : 'Sin productor',
      nivelAlertaActual: getCurrentAlert(lote.id),
    };
  });

  res.render('lotes/index', {
    title: 'Lotes',
    lotes: listaLotes,
  });
}

// GET /lotes/:id (página de detalle de un lote)
function lotDetail(req, res) {
  const lote = storage.lotes.findById(req.params.id);

  if (!lote) {
    return res.status(404).render('error', {
      title: 'Error',
      statusCode: 404,
      message: 'Lote no encontrado',
    });
  }

  const productor = storage.productores.findById(lote.productorId);
  const tecnicos = storage.tecnicos.findAll();
  const tiposCultivo = storage.tiposCultivo.findAll();

  let historial = storage.observaciones.findAll().filter((observacion) => observacion.loteId === lote.id);
  historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  historial = historial.map((observacion) => {
    const tecnico = tecnicos.find((item) => item.id === observacion.tecnicoId);
    const tipoCultivo = tiposCultivo.find((item) => item.id === observacion.tipoCultivoId);
    return {
      ...observacion,
      tecnicoNombre: tecnico ? tecnico.nombre : '—',
      cultivoNombre: tipoCultivo ? tipoCultivo.nombre : '—',
    };
  });

  res.render('lotes/detalle', {
    title: lote.nombre,
    lote,
    productor,
    historial,
    nivelAlertaActual: getCurrentAlert(lote.id),
  });
}

// GET /observaciones (página de observaciones)
function observations(req, res) {
  const tecnicos = storage.tecnicos.findAll();
  const tiposCultivo = storage.tiposCultivo.findAll();
  const todosLosLotes = storage.lotes.findAll();

  let listaObservaciones = storage.observaciones.findAll();
  listaObservaciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  listaObservaciones = listaObservaciones.map((observacion) => {
    const lote = todosLosLotes.find((item) => item.id === observacion.loteId);
    const tecnico = tecnicos.find((item) => item.id === observacion.tecnicoId);
    const tipoCultivo = tiposCultivo.find((item) => item.id === observacion.tipoCultivoId);
    return {
      ...observacion,
      loteNombre: lote ? lote.nombre : '—',
      tecnicoNombre: tecnico ? tecnico.nombre : '—',
      cultivoNombre: tipoCultivo ? tipoCultivo.nombre : '—',
    };
  });

  res.render('observaciones/index', {
    title: 'Observaciones',
    observaciones: listaObservaciones,
  });
}

// GET /observaciones/nueva (formulario de nueva observación)
function newObservationForm(req, res) {
  res.render('observaciones/nueva', {
    title: 'Nueva observación',
    lotes: storage.lotes.findAll(),
    tecnicos: storage.tecnicos.findAll(),
    tiposCultivo: storage.tiposCultivo.findAll(),
    nivelesAlerta: ALERT_LEVELS,
    estadosCultivo: CROP_STATUSES,
  });
}

// POST /observaciones (guardar la nueva observación)
function createObservation(req, res) {
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
    return res.status(400).render('error', {
      title: 'Error',
      statusCode: 400,
      message: errors.join('. '),
    });
  }

  if (!storage.lotes.findById(nuevaObservacion.loteId)) {
    return res.status(400).render('error', {
      title: 'Error',
      statusCode: 400,
      message: 'No existe el lote indicado',
    });
  }

  storage.observaciones.insert(nuevaObservacion);
  res.redirect(`/lotes/${nuevaObservacion.loteId}`);
}

module.exports = {
  home,
  lots,
  lotDetail,
  observations,
  newObservationForm,
  createObservation,
};
