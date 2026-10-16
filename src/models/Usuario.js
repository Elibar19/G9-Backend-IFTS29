import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema(
  {
    usuario: { type: String, unique: true },
    // Sin encriptacion por ahora
    password: { type: String },
    role: { type: String, enum: ['admin', 'usuario'], default: 'usuario' },
    nombre: { type: String },
  },
  { versionKey: false }
);

export default mongoose.model('Usuario', usuarioSchema);
