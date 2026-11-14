# AgroTec — Monitoreo de Lotes Agrícolas (API + Panel Web)

Segunda entrega (2° parcial) — Desarrollo Web Backend, IFTS 29 — Grupo 9.

## Descripción del Caso 4 — AgroTec

AgroTec es un sistema de monitoreo agrícola pensado para que técnicos de campo registren observaciones sobre el estado de los cultivos en distintos lotes, y para que productores y coordinadores puedan seguir esa información de forma centralizada.

El sistema permite:

- Gestionar **productores** y los **lotes** que les pertenecen.
- Registrar **técnicos** habilitados para hacer observaciones de campo.
- Definir **tipos de cultivo**.
- Cargar **observaciones** periódicas por lote (estado del cultivo, nivel de alerta, notas del técnico), que quedan como historial permanente — por regla de negocio, una observación **no se elimina** una vez creada.
- Calcular automáticamente el **nivel de alerta actual** de cada lote a partir de su observación más reciente.

El proyecto sigue una arquitectura **MVC**, persiste los datos en **MongoDB** mediante **Mongoose**, expone una **API REST** y además incluye un **panel web con vistas renderizadas en el servidor (SSR)** usando Pug.

## Requerimientos

### Funcionales

| Id | Requerimiento |
|---|---|
| RF01 | Listar, consultar, crear, modificar y eliminar productores. |
| RF02 | No permitir eliminar un productor que tenga lotes asociados. |
| RF03 | Listar, consultar, crear, modificar y eliminar lotes; cada lote pertenece a un productor existente. |
| RF04 | Filtrar lotes por nivel de alerta actual y por productor. |
| RF05 | No permitir eliminar un lote que tenga observaciones en su historial. |
| RF06 | Listar, consultar y crear técnicos y tipos de cultivo. |
| RF07 | Registrar observaciones de un lote con fecha, técnico, tipo de cultivo, estado del cultivo, nivel de alerta y notas. |
| RF08 | No permitir registrar una observación sin fecha válida ni nivel de alerta válido. |
| RF09 | Las observaciones no se eliminan: se conservan como historial (DELETE responde 403). |
| RF10 | Mostrar el nivel de alerta actual de cada lote según su observación más reciente. |
| RF11 | Panel web con login: cualquier usuario logueado consulta; solo el rol `admin` carga observaciones. |

### No funcionales

| Id | Requerimiento |
|---|---|
| RNF01 | Backend en Node.js 18+ con Express, organizado en MVC (rutas, controladores, modelos, vistas, middlewares). |
| RNF02 | Persistencia en MongoDB usando Mongoose; conexión configurable por `MONGODB_URI` (local o Atlas). |
| RNF03 | Código asincrónico con `async/await`; los errores no controlados llegan al middleware de errores. |
| RNF04 | Respuestas de la API en JSON con formato uniforme `{ success, data }` / `{ success, message }`. |
| RNF05 | Códigos HTTP correctos: 200, 201, 400, 403, 404, 409 y 500. |
| RNF06 | Configuración por variables de entorno (`.env`), sin datos sensibles en el código. |

## Tecnologías

| Tecnología | Uso |
|---|---|
| Node.js (ESM) | Entorno de ejecución, módulos `import`/`export` |
| Express 4 | Servidor HTTP, rutas y middlewares |
| MongoDB 7 (Docker) | Base de datos |
| Mongoose | Modelado de datos (schemas) y consultas |
| Pug | Vistas del panel web (SSR) |
| express-session + Passport (passport-local) | Login del panel web con dos roles |
| dotenv | Variables de entorno |
| nodemon | Reinicio automático en desarrollo |
| REST Client (VS Code) | Pruebas de la API (`request/agrotec.rest`) |

## Requisitos previos

- **Node.js 18 o superior** y npm
- **Docker** (para levantar MongoDB en local con `docker compose`), o una base en **MongoDB Atlas**

## Instalación y ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/Elibar19/G9-Backend-IFTS29.git
cd G9-Backend-IFTS29

# 2. Instalar dependencias
npm install

# 3. (Opcional) Copiar las variables de entorno y ajustarlas
cp .env.example .env

# 4. Levantar MongoDB (imagen mongo:7 en Docker)
docker compose up -d

# 5. Cargar los datos iniciales en MongoDB
npm run seed

# 6. Ejecutar el servidor
npm run dev      # desarrollo (nodemon)
npm start        # producción
```

El servidor levanta en `http://localhost:3001`. Para verificar que funciona: `GET http://localhost:3001/api/health`.

| Variable | Default | Descripción |
|---|---|---|
| `PORT` | `3001` | Puerto del servidor |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/agrotec` | Cadena de conexión (admite una URI de Atlas `mongodb+srv://...`) |
| `SESSION_SECRET` | `agrotec-dev-secret` | Secreto de la sesión del panel web |

| Comando | Descripción |
|---|---|
| `npm install` | Instala las dependencias |
| `docker compose up -d` | Levanta MongoDB 7 en un contenedor (puerto 27017, datos en un volumen) |
| `npm run seed` | Borra y vuelve a cargar las colecciones con los datos de `data/*.json` |
| `npm start` | Levanta el servidor con Node |
| `npm run dev` | Levanta el servidor con nodemon |

**Usuarios de prueba** (creados por el seed): `admin` / `admin123` (rol admin, puede cargar observaciones) y `lector` / `lector123` (rol usuario, solo lectura).

## Funcionamiento de la aplicación

1. **Arranque** (`src/server.js`): carga `.env`, se conecta a MongoDB con `mongoose.connect()` y, solo si la conexión es exitosa, levanta Express. Si MongoDB no está disponible, el proceso termina con un mensaje claro.
2. **Configuración de Express** (`src/app.js`): motor de vistas Pug, `express.json()` y `express.urlencoded()` para leer el body, archivos estáticos de `public/`, sesión y Passport, y el montaje de las rutas. Al final se registran los middlewares `notFound` (404) y `errorHandler` (500).
3. **Rutas** (`src/routes/`): cada recurso tiene su router (`/api/productores`, `/api/lotes`, etc.). Cada handler se envuelve con `asyncHandler`, que captura los errores de las funciones `async` y los pasa a `next()`.
4. **Controladores** (`src/controllers/`): reciben el request, validan los datos con la función `validate()` del modelo, verifican que existan las referencias (por ejemplo, que el `productorId` de un lote exista) y consultan la base con Mongoose (`find`, `findById`, `create`, `updateOne`, `deleteOne`, `exists`). Responden JSON (API) o renderizan una vista Pug (panel).
5. **Modelos** (`src/models/`): un schema de Mongoose por entidad + una función `validate(data)` con las validaciones simples de negocio.
6. **Alerta actual de un lote**: se busca la observación más reciente del lote (`Observacion.find({ loteId }).sort({ fecha: -1 }).limit(1)`) y se toma su `nivelAlerta`.
7. **Panel web**: el usuario inicia sesión en `/login`; todas las vistas exigen sesión (`requireLogin`) y el alta de observaciones exige rol `admin` (`requireRole('admin')`). La API REST queda sin login para poder probarla con REST Client.

## Panel web (SSR)

| Ruta | Acceso | Descripción |
|---|---|---|
| `GET /login` · `POST /login` · `POST /logout` | Público | Inicio y cierre de sesión |
| `GET /` | Logueado | Dashboard: métricas, lotes con su alerta actual y últimas observaciones |
| `GET /lotes` | Logueado | Listado de lotes con semáforo de alerta |
| `GET /lotes/:id` | Logueado | Detalle de un lote + historial de observaciones |
| `GET /observaciones` | Logueado | Listado de observaciones con lote, técnico y cultivo |
| `GET /observaciones/nueva` | Admin | Formulario para cargar una observación |
| `POST /observaciones` | Admin | Procesa el alta desde el formulario |

## Endpoints de la API REST

Formato de respuesta: `{ success, data }` (los listados agregan `total`) o `{ success, message }` ante error. Los ids son **ObjectId de MongoDB** en texto hexadecimal; un `:id` con formato inválido responde 404 y un filtro por query con id inválido responde 400.

### Productores — `/api/productores`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/productores` | Lista productores. Filtro: `?localidad=` (búsqueda parcial, sin distinguir mayúsculas) |
| GET | `/api/productores/:id` | Obtiene un productor (404 si no existe) |
| GET | `/api/productores/:id/lotes` | Lista los lotes del productor |
| POST | `/api/productores` | Crea un productor (nombre, CUIT, email y localidad obligatorios; 409 si el CUIT ya existe) |
| PUT | `/api/productores/:id` | Actualiza un productor |
| DELETE | `/api/productores/:id` | Elimina un productor (409 si tiene lotes) |

### Lotes — `/api/lotes`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/lotes` | Lista lotes. Filtros: `?alerta=` (Normal/Atención/Crítico) y `?productorId=` |
| GET | `/api/lotes/:id` | Obtiene un lote con su productor y alerta actual |
| GET | `/api/lotes/:id/observaciones` | Historial de observaciones del lote |
| POST | `/api/lotes` | Crea un lote (nombre, hectáreas > 0 y productor existente) |
| PUT | `/api/lotes/:id` | Actualiza un lote |
| DELETE | `/api/lotes/:id` | Elimina un lote (409 si tiene observaciones) |

### Observaciones — `/api/observaciones`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/observaciones` | Lista observaciones. Filtros: `?alerta=`, `?tecnicoId=`, `?loteId=` |
| GET | `/api/observaciones/:id` | Obtiene una observación |
| POST | `/api/observaciones` | Crea una observación (todos los campos obligatorios; fecha válida) |
| PUT | `/api/observaciones/:id` | Actualiza una observación |
| DELETE | `/api/observaciones/:id` | **403** — regla de negocio: no se eliminan |

### Técnicos — `/api/tecnicos`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/tecnicos` | Lista técnicos |
| GET | `/api/tecnicos/:id` | Obtiene un técnico |
| POST | `/api/tecnicos` | Crea un técnico (nombre y especialidad obligatorios) |

### Tipos de cultivo — `/api/tipos-cultivo`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/tipos-cultivo` | Lista tipos de cultivo |
| GET | `/api/tipos-cultivo/:id` | Obtiene un tipo de cultivo |
| POST | `/api/tipos-cultivo` | Crea un tipo de cultivo (409 si el nombre ya existe) |

### Salud del servicio

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Verifica que la API está en funcionamiento |

## Estructura de carpetas (arquitectura MVC)

```
G9-Backend-IFTS29/
├── data/                        # JSON con los datos iniciales que usa el seed
├── public/css/estilos.css       # Estilos del panel web
├── request/agrotec.rest         # Pruebas de la API y las vistas (REST Client)
├── views/                       # Vistas Pug (layout, index, login, error, lotes/, observaciones/)
├── docker-compose.yml           # MongoDB 7 en Docker
├── .env.example                 # Variables de entorno de ejemplo
└── src/
    ├── server.js                # Punto de entrada: conecta MongoDB y levanta Express
    ├── app.js                   # Configuración de Express (middlewares, vistas, rutas)
    ├── config.js                # Puerto, URI de MongoDB y secreto de sesión
    ├── config/passport.js       # Estrategia local de Passport (login)
    ├── constants/alertas.js     # Niveles de alerta y estados de cultivo válidos
    ├── middleware/
    │   ├── notFound.js          # 404
    │   ├── errorHandler.js      # 500
    │   └── requireAuth.js       # requireLogin, requireRole, attachUserView
    ├── models/                  # Schemas Mongoose + validate(): Productor, Lote, Observacion, Tecnico, TipoCultivo, Usuario
    ├── controllers/             # Lógica de cada recurso, vistas y login
    ├── routes/                  # Routers de la API, de las vistas y de autenticación
    ├── scripts/seed.js          # Carga inicial de la base (npm run seed)
    └── utils/
        ├── asyncHandler.js      # Envuelve controladores async y pasa errores a next()
        ├── dto.js               # Convierte _id de Mongo en id
        └── regex.js             # Escapa texto del usuario para búsquedas con $regex
```

- **Modelo**: `src/models/` — schemas de Mongoose y validaciones.
- **Vista**: `views/` (Pug) para el panel y las respuestas JSON para la API.
- **Controlador**: `src/controllers/` — lógica de negocio que conecta modelos y vistas.

## Persistencia con MongoDB y Mongoose

- La conexión se hace una sola vez en `src/server.js` con `mongoose.connect(mongoUri)`.
- Cada entidad tiene su schema y su modelo (`mongoose.model(...)`), que corresponde a una colección: `productors`, `lotes`, `tecnicos`, `tipocultivos`, `observacions` y `usuarios`.
- Las relaciones se guardan como `ObjectId` con `ref` (`Lote.productorId → Productor`, `Observacion.loteId → Lote`, `tecnicoId → Tecnico`, `tipoCultivoId → TipoCultivo`).
- Los filtros y ordenamientos se resuelven en la base (`find(query)`, `sort({ fecha: -1 })`, `exists`).
- `npm run seed` lee `data/*.json` y los inserta en MongoDB con ids deterministas (el mismo dato genera siempre el mismo ObjectId), por eso los ids de `request/agrotec.rest` funcionan después de cada seed.

## Middlewares, validaciones y manejo de errores

| Elemento | Archivo | Qué hace |
|---|---|---|
| `express.json` / `express.urlencoded` | `src/app.js` | Leen el body JSON (API) y de formularios (panel) |
| `express.static` | `src/app.js` | Sirve `public/` |
| `express-session` + Passport | `src/app.js`, `src/config/passport.js` | Sesión de login |
| `requireLogin` / `requireRole` | `src/middleware/requireAuth.js` | Protegen el panel; 403 si el rol no alcanza |
| `asyncHandler` | `src/utils/asyncHandler.js` | Captura errores de `async/await` y los envía a `errorHandler` |
| `notFound` | `src/middleware/notFound.js` | 404 en JSON (API) o vista de error (panel) |
| `errorHandler` | `src/middleware/errorHandler.js` | 500 en JSON (API) o vista de error (panel) |

**Validaciones simples** (función `validate()` de cada modelo, responden **400** con los mensajes):

- Productor: nombre, CUIT, email (con `@`) y localidad obligatorios.
- Lote: nombre obligatorio, hectáreas mayor a 0, `productorId` obligatorio y existente.
- Observación: lote, técnico y tipo de cultivo existentes; fecha válida; `estadoCultivo` ∈ {Bueno, Regular, Malo}; `nivelAlerta` ∈ {Normal, Atención, Crítico}; texto obligatorio.
- Técnico: nombre y especialidad obligatorios. Tipo de cultivo: nombre obligatorio.
- Reglas de negocio: CUIT y nombre de tipo de cultivo únicos (409); no borrar productores con lotes ni lotes con observaciones (409); no borrar observaciones (403).

## Pruebas documentadas

Las pruebas se realizaron con la extensión **REST Client** de VS Code sobre `request/agrotec.rest` (35 requests), después de ejecutar `npm run seed`. Cada request del archivo corresponde a una fila de esta tabla. Completar la columna **Obtenido** al ejecutar cada prueba (✅ si coincide con lo esperado).

| # | Prueba | Request | Esperado | Obtenido |
|---|---|---|---|---|
| 1 | Salud del servicio | `GET /api/health` | 200 `success: true` | |
| 2 | Listar productores | `GET /api/productores` | 200 con `total` y `data` | |
| 3 | Productor por id | `GET /api/productores/:id` | 200 | |
| 4 | Lotes de un productor | `GET /api/productores/:id/lotes` | 200 | |
| 5 | Crear productor | `POST /api/productores` | 201 (409 si se repite el CUIT) | |
| 6 | Actualizar productor | `PUT /api/productores/:id` | 200 | |
| 7 | Eliminar productor | `DELETE /api/productores/:id` | 200, o 409 si tiene lotes | |
| 8 | Listar lotes | `GET /api/lotes` | 200 con `nivelAlertaActual` | |
| 9 | Filtrar lotes por alerta | `GET /api/lotes?alerta=Crítico` | 200 solo lotes en Crítico | |
| 10 | Filtrar lotes por productor | `GET /api/lotes?productorId=...` | 200 | |
| 11 | Lote por id | `GET /api/lotes/:id` | 200 | |
| 12 | Historial del lote | `GET /api/lotes/:id/observaciones` | 200 ordenado por fecha desc. | |
| 13 | Crear lote | `POST /api/lotes` | 201 | |
| 14 | Actualizar lote | `PUT /api/lotes/:id` | 200 | |
| 15 | Eliminar lote | `DELETE /api/lotes/:id` | 200, o 409 si tiene observaciones | |
| 16 | Listar observaciones | `GET /api/observaciones` | 200 | |
| 17 | Filtrar por alerta | `GET /api/observaciones?alerta=...` | 200 | |
| 18 | Filtrar por lote | `GET /api/observaciones?loteId=...` | 200 | |
| 19 | Filtrar por técnico | `GET /api/observaciones?tecnicoId=...` | 200 | |
| 20 | Observación por id | `GET /api/observaciones/:id` | 200 | |
| 21 | Crear observación | `POST /api/observaciones` | 201 | |
| 22 | Crear observación sin fecha | `POST /api/observaciones` | **400** (validación) | |
| 23 | Actualizar observación | `PUT /api/observaciones/:id` | 200 | |
| 24 | Eliminar observación | `DELETE /api/observaciones/:id` | **403** (regla de negocio) | |
| 25 | Listar técnicos | `GET /api/tecnicos` | 200 | |
| 26 | Técnico por id | `GET /api/tecnicos/:id` | 200 | |
| 27 | Crear técnico | `POST /api/tecnicos` | 201 | |
| 28 | Listar tipos de cultivo | `GET /api/tipos-cultivo` | 200 | |
| 29 | Tipo de cultivo por id | `GET /api/tipos-cultivo/:id` | 200 | |
| 30 | Crear tipo de cultivo | `POST /api/tipos-cultivo` | 201 (409 si el nombre existe) | |
| 31–35 | Vistas del panel (`/`, `/lotes`, `/lotes/:id`, `/observaciones`, `/observaciones/nueva`) | `GET` | Sin sesión: redirige a `/login`. Con sesión: 200 (el formulario solo para admin, si no 403) | |

**Pruebas de casos de error adicionales**

| Prueba | Esperado | Obtenido |
|---|---|---|
| `GET /api/lotes/123` (id con formato inválido) | 404 | |
| `GET /api/lotes?productorId=abc` | 400 | |
| `GET /api/lotes?alerta=Alta` | 400 | |
| `POST /api/lotes` con `hectareas: 0` | 400 | |
| `POST /api/lotes` con un `productorId` inexistente | 400 | |
| `GET /api/ruta-inexistente` | 404 JSON | |
| Panel: login con contraseña incorrecta | Vuelve a `/login?error=1` | |
| Panel: usuario `lector` entra a `/observaciones/nueva` | 403 | |
| Iniciar el servidor con MongoDB apagado | El proceso termina con "No se pudo conectar a MongoDB" | |

## Bibliografía

**Documentación oficial**

- Node.js — Módulos ECMAScript: https://nodejs.org/api/esm.html
- Express — Guía (routing, middlewares, manejo de errores): https://expressjs.com/es/guide/routing.html · https://expressjs.com/es/guide/using-middleware.html · https://expressjs.com/es/guide/error-handling.html
- Mongoose — Documentación: https://mongoosejs.com/docs/guide.html
- MongoDB — Manual: https://www.mongodb.com/docs/manual/
- MongoDB — Imagen oficial de Docker: https://hub.docker.com/_/mongo
- Pug — Documentación: https://pugjs.org/api/getting-started.html
- express-session: https://github.com/expressjs/session
- MDN — async/await: https://developer.mozilla.org/es/docs/Learn/JavaScript/Asynchronous/Promises
- MDN — Códigos de estado HTTP: https://developer.mozilla.org/es/docs/Web/HTTP/Status
- REST Client (VS Code): https://marketplace.visualstudio.com/items?itemName=humao.rest-client
- Apuntes y clases de Desarrollo Web Backend — IFTS 29

## Utilización de herramientas de IA

- Verificacion de sintaxis en docker-compose
- Debug de errores en codigo js
- Ayuda para definir y mejorar visualmente el frontend con plantillas PUG
- Redacción de documentación del proyecto
- Recopilar tests para probar funcionalidad de la API rest
- Ayuda con la creacion de ObjectId en mongoose
- Ayuda para crear src/script/seed.js para parsear los datos de los jsons creados en la primera entrega y agregarlos a la nueva db
