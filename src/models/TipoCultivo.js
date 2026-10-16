import mongoose from 'mongoose';

const tipoCultivoSchema = new mongoose.Schema(
  {
    nombre: { type: String },
  },
  { versionKey: false }
);


export function validate(data) {
  const errors = [];

  if (!data.nombre) {
    errors.push('El nombre del tipo de cultivo es obligatorio');
  }

  return errors;
}

export default mongoose.model('TipoCultivo', tipoCultivoSchema);
