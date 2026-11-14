class Productor {
  constructor(id, nombre, cuit, email, telefono, localidad) {
    this.id = id;
    this.nombre = nombre;
    this.cuit = cuit;
    this.email = email;
    this.telefono = telefono;
    this.localidad = localidad;
  }

  validate() {
    const errors = [];

    if (!this.nombre) {
      errors.push('El nombre es obligatorio');
    }
    if (!this.cuit) {
      errors.push('El CUIT es obligatorio');
    }
    if (!this.email || !this.email.includes('@')) {
      errors.push('El email es obligatorio y debe ser válido');
    }
    if (!this.localidad) {
      errors.push('La localidad es obligatoria');
    }

    return errors;
  }
}

module.exports = Productor;
