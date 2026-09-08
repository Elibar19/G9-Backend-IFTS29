class Tecnico {
  constructor(id, nombre, especialidad, email, telefono) {
    this.id = id;
    this.nombre = nombre;
    this.especialidad = especialidad;
    this.email = email;
    this.telefono = telefono;
  }

  validate() {
    const errors = [];

    if (!this.nombre) {
      errors.push('El nombre del técnico es obligatorio');
    }
    if (!this.especialidad) {
      errors.push('La especialidad es obligatoria');
    }

    return errors;
  }
}

module.exports = Tecnico;
