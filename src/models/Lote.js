import mongoose from 'mongoose';

const loteSchema = new mongoose.Schema(
  {
    nombre: { type: String },
    hectareas: { type: Number },
    productorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Productor' },
    ubicacion: { type: String },
  },
  { versionKey: false }
);


export function validate(data) {
  const errors = [];

  if (!data.nombre) {
    errors.push('El nombre del lote es obligatorio');
  }
  if (!data.hectareas || data.hectareas <= 0) {
    errors.push('Las hectáreas deben ser un número mayor a 0');
  }
  if (!data.productorId) {
    errors.push('El lote debe pertenecer a un productor (productorId)');
  }

  return errors;
}

export default mongoose.model('Lote', loteSchema);
