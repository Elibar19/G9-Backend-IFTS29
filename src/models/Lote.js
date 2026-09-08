class Lote {
  constructor(id, nombre, hectareas, productorId, ubicacion) {
    this.id = id;
    this.nombre = nombre;
    this.hectareas = hectareas;
    this.productorId = productorId;
    this.ubicacion = ubicacion;
  }

  validate() {
    const errors = [];

    if (!this.nombre) {
      errors.push('El nombre del lote es obligatorio');
    }
    if (!this.hectareas || this.hectareas <= 0) {
      errors.push('Las hectáreas deben ser un número mayor a 0');
    }
    if (!this.productorId) {
      errors.push('El lote debe pertenecer a un productor (productorId)');
    }

    return errors;
  }
}

module.exports = Lote;
