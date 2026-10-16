import mongoose from 'mongoose';
import Observacion, { validate as validateObservacion } from '../models/Observacion.js';
import Lote from '../models/Lote.js';
import Productor from '../models/Productor.js';
import Tecnico from '../models/Tecnico.js';
import TipoCultivo from '../models/TipoCultivo.js';
import { ALERT_LEVELS, CROP_STATUSES } from '../constants/alertas.js';
import { mapId } from '../utils/dto.js';

// Buscar observaciones de un lote y devolver el nivel de alerta de la más reciente.
async function getCurrentAlert(loteId) {
  const ultima = await Observacion.find({ loteId }).sort({ fecha: -1 }).limit(1).lean();

  if (ultima.length === 0) {
    return 'Sin registros';
  }

  return ultima[0].nivelAlerta;
}

// GET /  (página de inicio)
export async function home(req, res) {
  const lotesBase = (await Lote.find().lean()).map(mapId);
  const lotes = await Promise.all(
    lotesBase.map(async (lote) => ({ ...lote, nivelAlertaActual: await getCurrentAlert(lote.id) }))
  );

  const ultimasObservaciones = (
    await Observacion.find().sort({ fecha: -1 }).limit(5).lean()
  ).map(mapId);

  const [totalProductores, totalTecnicos, totalObservaciones] = await Promise.all([
    Productor.countDocuments(),
    Tecnico.countDocuments(),
    Observacion.countDocuments(),
  ]);

  res.render('index', {
    title: 'Inicio',
    totals: {
      productores: totalProductores,
      lotes: lotes.length,
      tecnicos: totalTecnicos,
      observaciones: totalObservaciones,
    },
    lotes,
    observaciones: ultimasObservaciones,
  });
}

// GET /lotes (página de lotes)
export async function lots(req, res) {
  const lotesBase = (await Lote.find().lean()).map(mapId);
  const productores = (await Productor.find().lean()).map(mapId);
  const porId = new Map(productores.map((productor) => [productor.id, productor]));

  const listaLotes = await Promise.all(
    lotesBase.map(async (lote) => {
      const productor = lote.productorId ? porId.get(String(lote.productorId)) : null;
      return {
        ...lote,
        productorNombre: productor ? productor.nombre : 'Sin productor',
        nivelAlertaActual: await getCurrentAlert(lote.id),
      };
    })
  );

  res.render('lotes/index', {
    title: 'Lotes',
    lotes: listaLotes,
  });
}

// GET /lotes/:id (página de detalle de un lote)
export async function lotDetail(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).render('error', {
      title: 'Error',
      statusCode: 404,
      message: 'Lote no encontrado',
    });
  }

  const loteDoc = await Lote.findById(req.params.id).lean();

  if (!loteDoc) {
    return res.status(404).render('error', {
      title: 'Error',
      statusCode: 404,
      message: 'Lote no encontrado',
    });
  }

  const lote = mapId(loteDoc);
  const productorDoc = lote.productorId
    ? await Productor.findById(lote.productorId).lean()
    : null;
  const productor = productorDoc ? mapId(productorDoc) : null;

  const tecnicos = (await Tecnico.find().lean()).map(mapId);
  const tiposCultivo = (await TipoCultivo.find().lean()).map(mapId);

  const historialBase = await Observacion.find({ loteId: loteDoc._id }).sort({ fecha: -1 }).lean();

  const historial = historialBase.map(mapId).map((observacion) => {
    const tecnico = tecnicos.find((item) => item.id === String(observacion.tecnicoId));
    const tipoCultivo = tiposCultivo.find((item) => item.id === String(observacion.tipoCultivoId));
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
    nivelAlertaActual: await getCurrentAlert(lote.id),
  });
}

// GET /observaciones (página de observaciones)
export async function observations(req, res) {
  const tecnicos = (await Tecnico.find().lean()).map(mapId);
  const tiposCultivo = (await TipoCultivo.find().lean()).map(mapId);
  const todosLosLotes = (await Lote.find().lean()).map(mapId);

  const listaBase = await Observacion.find().sort({ fecha: -1 }).lean();

  const listaObservaciones = listaBase.map(mapId).map((observacion) => {
    const lote = todosLosLotes.find((item) => item.id === String(observacion.loteId));
    const tecnico = tecnicos.find((item) => item.id === String(observacion.tecnicoId));
    const tipoCultivo = tiposCultivo.find((item) => item.id === String(observacion.tipoCultivoId));
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
export async function newObservationForm(req, res) {
  res.render('observaciones/nueva', {
    title: 'Nueva observación',
    lotes: (await Lote.find().lean()).map(mapId),
    tecnicos: (await Tecnico.find().lean()).map(mapId),
    tiposCultivo: (await TipoCultivo.find().lean()).map(mapId),
    nivelesAlerta: ALERT_LEVELS,
    estadosCultivo: CROP_STATUSES,
  });
}

// POST /observaciones (guardar la nueva observación)
export async function createObservation(req, res) {
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
    return res.status(400).render('error', {
      title: 'Error',
      statusCode: 400,
      message: errors.join('. '),
    });
  }

  const loteExiste =
    mongoose.isValidObjectId(datos.loteId) && (await Lote.exists({ _id: datos.loteId }));
  if (!loteExiste) {
    return res.status(400).render('error', {
      title: 'Error',
      statusCode: 400,
      message: 'No existe el lote indicado',
    });
  }

  const nuevaObservacion = await Observacion.create(datos);
  res.redirect(`/lotes/${nuevaObservacion.loteId}`);
}
