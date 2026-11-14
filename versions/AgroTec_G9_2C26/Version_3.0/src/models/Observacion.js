import mongoose from 'mongoose';
import { ALERT_LEVELS, CROP_STATUSES } from '../constants/alertas.js';

const observacionSchema = new mongoose.Schema(
  {
    loteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lote' },
    tecnicoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tecnico' },
    fecha: { type: String },
    tipoCultivoId: { type: mongoose.Schema.Types.ObjectId, ref: 'TipoCultivo' },
    estadoCultivo: { type: String },
    observaciones: { type: String },
    nivelAlerta: { type: String },
  },
  { versionKey: false }
);


export function validate(data) {
  const errors = [];

  if (!data.loteId) {
    errors.push('La observación debe estar asociada a un lote (loteId)');
  }
  if (!data.tecnicoId) {
    errors.push('El técnico es obligatorio (tecnicoId)');
  }
  if (!data.fecha || isNaN(new Date(data.fecha).getTime())) {
    errors.push('No se puede registrar una observación sin una fecha válida');
  }
  if (!data.tipoCultivoId) {
    errors.push('El tipo de cultivo es obligatorio (tipoCultivoId)');
  }
  if (!CROP_STATUSES.includes(data.estadoCultivo)) {
    errors.push('El estado del cultivo debe ser: ' + CROP_STATUSES.join(', '));
  }
  if (!ALERT_LEVELS.includes(data.nivelAlerta)) {
    errors.push('El nivel de alerta debe ser: ' + ALERT_LEVELS.join(', '));
  }
  if (!data.observaciones) {
    errors.push('El texto de observaciones es obligatorio');
  }

  return errors;
}

export default mongoose.model('Observacion', observacionSchema);
