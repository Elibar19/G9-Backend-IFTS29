// Pruebas unitarias de los middlewares de seguridad y de errores, con req/res simulados.
// Cubren RF11/RF12 (401/403) y RNF03/RNF04 (errores al errorHandler, JSON uniforme).
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { requireApiAuth, requireLogin, requireRole } from '../src/middleware/requireAuth.js';
import notFound from '../src/middleware/notFound.js';
import errorHandler from '../src/middleware/errorHandler.js';
import { asyncHandler } from '../src/utils/asyncHandler.js';
import { escapeRegex } from '../src/utils/regex.js';
import { mapId } from '../src/utils/dto.js';

// Request simulado: user = null representa un usuario sin sesión.
function fakeReq(user = null, originalUrl = '/api/lotes') {
  return { user, originalUrl, method: 'GET', isAuthenticated: () => user !== null };
}

// Response simulado que registra lo que el middleware respondio..
function fakeRes() {
  const res = { statusCode: 200, body: null, redirectedTo: null, view: null };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => { res.body = body; return res; };
  res.redirect = (url) => { res.redirectedTo = url; return res; };
  res.render = (view, locals) => { res.view = view; res.body = locals; return res; };
  return res;
}

const admin = { usuario: 'admin', role: 'admin' };
const lector = { usuario: 'lector', role: 'usuario' };

describe('requireApiAuth (API REST)', () => {
  test('sin sesión responde 401 JSON y no redirige', () => {
    const res = fakeRes();
    let nextCalled = false;
    requireApiAuth()(fakeReq(), res, () => { nextCalled = true; });
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.redirectedTo, null);
    assert.equal(nextCalled, false);
  });

  test('lectura: cualquier usuario con sesión pasa', () => {
    let nextCalled = false;
    requireApiAuth()(fakeReq(lector), fakeRes(), () => { nextCalled = true; });
    assert.equal(nextCalled, true);
  });

  test('escritura: el rol lector recibe 403 JSON', () => {
    const res = fakeRes();
    let nextCalled = false;
    requireApiAuth('admin')(fakeReq(lector), res, () => { nextCalled = true; });
    assert.equal(res.statusCode, 403);
    assert.equal(res.body.success, false);
    assert.equal(nextCalled, false);
  });

  test('escritura: admin pasa', () => {
    let nextCalled = false;
    requireApiAuth('admin')(fakeReq(admin), fakeRes(), () => { nextCalled = true; });
    assert.equal(nextCalled, true);
  });
});

describe('requireLogin / requireRole (panel)', () => {
  test('sin sesión el panel redirige a /login', () => {
    const res = fakeRes();
    requireLogin(fakeReq(null, '/'), res, () => {});
    assert.equal(res.redirectedTo, '/login');
  });

  test('lector en una pantalla de admin recibe la vista de error 403', () => {
    const res = fakeRes();
    requireRole('admin')(fakeReq(lector, '/observaciones/nueva'), res, () => {});
    assert.equal(res.statusCode, 403);
    assert.equal(res.view, 'error');
  });
});

describe('notFound y errorHandler', () => {
  test('ruta /api inexistente → 404 JSON uniforme', () => {
    const res = fakeRes();
    notFound(fakeReq(null, '/api/no-existe'), res);
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.success, false);
  });

  test('ruta del panel inexistente → vista de error 404', () => {
    const res = fakeRes();
    notFound(fakeReq(null, '/no-existe'), res);
    assert.equal(res.statusCode, 404);
    assert.equal(res.view, 'error');
  });

  test('error no controlado en la API → 500 JSON sin detalles internos', (t) => {
    t.mock.method(console, 'error', () => {}); // silenciar el log esperado
    const res = fakeRes();
    errorHandler(new Error('detalle interno'), fakeReq(admin), res, () => {});
    assert.equal(res.statusCode, 500);
    assert.equal(res.body.success, false);
    assert.ok(!JSON.stringify(res.body).includes('detalle interno'));
  });
});

describe('utilidades', () => {
  test('asyncHandler deriva el error de una promesa rechazada a next()', async () => {
    const boom = new Error('falla de Mongo');
    let received = null;
    await asyncHandler(async () => { throw boom; })({}, {}, (err) => { received = err; });
    assert.equal(received, boom);
  });

  test('escapeRegex neutraliza caracteres especiales (evita inyección en $regex)', () => {
    assert.equal(escapeRegex('a.*b'), 'a\\.\\*b');
    assert.ok(new RegExp(escapeRegex('(x)')).test('(x)'));
  });

  test('mapId convierte _id en id de texto', () => {
    const out = mapId({ _id: { toString: () => 'abc' }, nombre: 'L1' });
    assert.deepEqual(out, { id: 'abc', nombre: 'L1' });
  });
});
