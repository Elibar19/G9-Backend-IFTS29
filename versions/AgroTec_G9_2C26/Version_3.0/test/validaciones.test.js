// Pruebas unitarias de las validaciones de los modelos (reglas RF07/RF08 y altas de cada recurso).
// No necesitan MongoDB: validate() es una función pura.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { validate as validateObservacion } from '../src/models/Observacion.js';
import { validate as validateLote } from '../src/models/Lote.js';
import { validate as validateProductor } from '../src/models/Productor.js';
import { validate as validateTecnico } from '../src/models/Tecnico.js';
import { validate as validateTipoCultivo } from '../src/models/TipoCultivo.js';

const observacionValida = {
  loteId: '65a000000000000000000001',
  tecnicoId: '65a000000000000000000002',
  tipoCultivoId: '65a000000000000000000003',
  fecha: '2026-11-01',
  estadoCultivo: 'Bueno',
  nivelAlerta: 'Normal',
  observaciones: 'Sin novedades',
};

describe('Observación (RF07 / RF08)', () => {
  test('una observación completa no tiene errores', () => {
    assert.deepEqual(validateObservacion(observacionValida), []);
  });

  test('rechaza una observación sin fecha', () => {
    const errors = validateObservacion({ ...observacionValida, fecha: undefined });
    assert.ok(errors.some((e) => e.includes('fecha válida')));
  });

  test('rechaza una fecha con formato inválido', () => {
    const errors = validateObservacion({ ...observacionValida, fecha: 'no-es-fecha' });
    assert.ok(errors.some((e) => e.includes('fecha válida')));
  });

  test('rechaza un nivel de alerta fuera de Normal/Atención/Crítico', () => {
    const errors = validateObservacion({ ...observacionValida, nivelAlerta: 'Alta' });
    assert.ok(errors.some((e) => e.includes('nivel de alerta')));
  });

  test('rechaza un estado de cultivo inválido', () => {
    const errors = validateObservacion({ ...observacionValida, estadoCultivo: 'Excelente' });
    assert.ok(errors.some((e) => e.includes('estado del cultivo')));
  });

  test('un objeto vacío acumula todos los errores', () => {
    assert.equal(validateObservacion({}).length, 7);
  });
});

describe('Lote (RF03)', () => {
  test('lote válido', () => {
    assert.deepEqual(validateLote({ nombre: 'Lote 1', hectareas: 10, productorId: 'x' }), []);
  });

  test('hectáreas en 0 o negativas son inválidas (caso límite)', () => {
    assert.equal(validateLote({ nombre: 'L', hectareas: 0, productorId: 'x' }).length, 1);
    assert.equal(validateLote({ nombre: 'L', hectareas: -5, productorId: 'x' }).length, 1);
  });

  test('un lote sin productor es inválido', () => {
    const errors = validateLote({ nombre: 'L', hectareas: 5 });
    assert.ok(errors.some((e) => e.includes('productorId')));
  });
});

describe('Productor, Técnico y Tipo de cultivo (RF01 / RF06)', () => {
  test('productor válido', () => {
    const data = { nombre: 'Ana', cuit: '20-1-3', email: 'ana@campo.com', localidad: 'Pergamino' };
    assert.deepEqual(validateProductor(data), []);
  });

  test('productor con email sin @ es inválido', () => {
    const data = { nombre: 'Ana', cuit: '20-1-3', email: 'ana.campo.com', localidad: 'Pergamino' };
    assert.equal(validateProductor(data).length, 1);
  });

  test('técnico sin especialidad es inválido', () => {
    assert.equal(validateTecnico({ nombre: 'Juan' }).length, 1);
  });

  test('tipo de cultivo sin nombre es inválido', () => {
    assert.equal(validateTipoCultivo({}).length, 1);
  });
});
