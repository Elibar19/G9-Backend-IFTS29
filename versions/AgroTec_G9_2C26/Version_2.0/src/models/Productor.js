import mongoose from 'mongoose';

const productorSchema = new mongoose.Schema(
  {
    nombre: { type: String },
    cuit: { type: String },
    email: { type: String },
    telefono: { type: String },
    localidad: { type: String },
  },
  { versionKey: false }
);


export function validate(data) {
  const errors = [];

  if (!data.nombre) {
    errors.push('El nombre es obligatorio');
  }
  if (!data.cuit) {
    errors.push('El CUIT es obligatorio');
  }
  if (!data.email || !data.email.includes('@')) {
    errors.push('El email es obligatorio y debe ser válido');
  }
  if (!data.localidad) {
    errors.push('La localidad es obligatoria');
  }

  return errors;
}

export default mongoose.model('Productor', productorSchema);
