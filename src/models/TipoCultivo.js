class TipoCultivo {
  constructor(id, nombre) {
    this.id = id;
    this.nombre = nombre;
  }

  validate() {
    const errors = [];

    if (!this.nombre) {
      errors.push('El nombre del tipo de cultivo es obligatorio');
    }

    return errors;
  }
}

module.exports = TipoCultivo;
