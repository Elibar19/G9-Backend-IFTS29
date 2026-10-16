import mongoose from 'mongoose';

const tecnicoSchema = new mongoose.Schema(
  {
    nombre: { type: String },
    especialidad: { type: String },
    email: { type: String },
    telefono: { type: String },
  },
  { versionKey: false }
);


export function validate(data) {
  const errors = [];

  if (!data.nombre) {
    errors.push('El nombre del técnico es obligatorio');
  }
  if (!data.especialidad) {
    errors.push('La especialidad es obligatoria');
  }

  return errors;
}

export default mongoose.model('Tecnico', tecnicoSchema);
