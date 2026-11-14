const { ALERT_LEVELS, CROP_STATUSES } = require('../constants/alertas');

class Observacion {
  constructor(id, loteId, tecnicoId, fecha, tipoCultivoId, estadoCultivo, observaciones, nivelAlerta) {
    this.id = id;
    this.loteId = loteId;
    this.tecnicoId = tecnicoId;
    this.fecha = fecha;
    this.tipoCultivoId = tipoCultivoId;
    this.estadoCultivo = estadoCultivo;
    this.observaciones = observaciones;
    this.nivelAlerta = nivelAlerta;
  }

  validate() {
    const errors = [];

    if (!this.loteId) {
      errors.push('La observación debe estar asociada a un lote (loteId)');
    }
    if (!this.tecnicoId) {
      errors.push('El técnico es obligatorio (tecnicoId)');
    }
    if (!this.fecha || isNaN(new Date(this.fecha).getTime())) {
      errors.push('No se puede registrar una observación sin una fecha válida');
    }
    if (!this.tipoCultivoId) {
      errors.push('El tipo de cultivo es obligatorio (tipoCultivoId)');
    }
    if (!CROP_STATUSES.includes(this.estadoCultivo)) {
      errors.push('El estado del cultivo debe ser: ' + CROP_STATUSES.join(', '));
    }
    if (!ALERT_LEVELS.includes(this.nivelAlerta)) {
      errors.push('El nivel de alerta debe ser: ' + ALERT_LEVELS.join(', '));
    }
    if (!this.observaciones) {
      errors.push('El texto de observaciones es obligatorio');
    }

    return errors;
  }
}

module.exports = Observacion;
