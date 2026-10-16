import 'dotenv/config';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { mongoUri } from '../config.js';
import Productor, { validate as validateProductor } from '../models/Productor.js';
import Lote from '../models/Lote.js';
import Tecnico from '../models/Tecnico.js';
import TipoCultivo from '../models/TipoCultivo.js';
import Observacion from '../models/Observacion.js';
import Usuario from '../models/Usuario.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../../data');

function newId(oldId) {
  const hex = crypto.createHash('md5').update(String(oldId)).digest('hex').slice(0, 24);
  return new mongoose.Types.ObjectId(hex);
}

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, fileName), 'utf8'));
}

async function seed() {
  await mongoose.connect(mongoUri);
  console.log('Conectado a MongoDB para el seed');

  const productores = readJson('productores.json');
  const lotes = readJson('lotes.json');
  const tecnicos = readJson('tecnicos.json');
  const tiposCultivo = readJson('tiposCultivo.json');
  const observaciones = readJson('observaciones.json');
  const usuarios = readJson('usuarios.json');

  const ids = {};
  const remap = (doc) => {
    ids[doc.id] = newId(doc.id).toString();
    return ids[doc.id];
  };

  const productoresDocs = productores.map((item) => ({
    _id: remap(item),
    nombre: item.nombre,
    cuit: item.cuit,
    email: item.email,
    telefono: item.telefono,
    localidad: item.localidad,
  }));

  const lotesDocs = lotes.map((item) => ({
    _id: remap(item),
    nombre: item.nombre,
    hectareas: item.hectareas,
    productorId: ids[item.productorId] ? new mongoose.Types.ObjectId(ids[item.productorId]) : null,
    ubicacion: item.ubicacion,
  }));

  const tecnicosDocs = tecnicos.map((item) => ({
    _id: remap(item),
    nombre: item.nombre,
    especialidad: item.especialidad,
    email: item.email,
    telefono: item.telefono,
  }));

  const tiposCultivoDocs = tiposCultivo.map((item) => ({
    _id: remap(item),
    nombre: item.nombre,
  }));

  const observacionesDocs = observaciones.map((item) => ({
    _id: remap(item),
    loteId: ids[item.loteId] ? new mongoose.Types.ObjectId(ids[item.loteId]) : null,
    tecnicoId: ids[item.tecnicoId] ? new mongoose.Types.ObjectId(ids[item.tecnicoId]) : null,
    fecha: item.fecha,
    tipoCultivoId: ids[item.tipoCultivoId] ? new mongoose.Types.ObjectId(ids[item.tipoCultivoId]) : null,
    estadoCultivo: item.estadoCultivo,
    observaciones: item.observaciones,
    nivelAlerta: item.nivelAlerta,
  }));

  const usuariosDocs = usuarios.map((item) => ({
    _id: remap(item),
    usuario: item.usuario,
    password: item.password,
    role: item.role,
    nombre: item.nombre,
  }));

  await Promise.all([
    Productor.deleteMany({}),
    Lote.deleteMany({}),
    Tecnico.deleteMany({}),
    TipoCultivo.deleteMany({}),
    Observacion.deleteMany({}),
    Usuario.deleteMany({}),
  ]);

  await Productor.insertMany(productoresDocs);
  await Lote.insertMany(lotesDocs);
  await Tecnico.insertMany(tecnicosDocs);
  await TipoCultivo.insertMany(tiposCultivoDocs);
  await Observacion.insertMany(observacionesDocs);
  await Usuario.insertMany(usuariosDocs);

  console.log('Seed completo:');
  console.log(`  productores: ${productoresDocs.length}`);
  console.log(`  lotes: ${lotesDocs.length}`);
  console.log(`  tecnicos: ${tecnicosDocs.length}`);
  console.log(`  tiposCultivo: ${tiposCultivoDocs.length}`);
  console.log(`  observaciones: ${observacionesDocs.length}`);
  console.log(`  usuarios: ${usuariosDocs.length}`);
  console.log('\nIds viejos -> ObjectIds nuevos (deterministas):');
  for (const [oldId, newObjectId] of Object.entries(ids)) {
    console.log(`  ${oldId} -> ${newObjectId}`);
  }

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Error al sembrar la base:', err.message);
  process.exit(1);
});
