# AgroTec — Monitoreo de Lotes Agrícolas (API + Panel Web)

## Descripción del Caso 4 — AgroTec

AgroTec es un sistema de monitoreo agrícola pensado para que técnicos de campo registren observaciones sobre el estado de los cultivos en distintos lotes, y para que productores y coordinadores puedan seguir esa información de forma centralizada.

El sistema permite:

- Gestionar **productores** y los **lotes** que les pertenecen.
- Registrar **técnicos** habilitados para hacer observaciones de campo.
- Definir **tipos de cultivo** por lote.
- Cargar **observaciones** periódicas por lote (estado del cultivo, nivel de alerta, notas del técnico), que quedan como historial permanente — por regla de negocio, una observación **no se elimina** una vez creada (se conserva como registro histórico).
- Calcular automáticamente el **nivel de alerta actual** de cada lote a partir de su observación más reciente.

El proyecto se construyó siguiendo una arquitectura **MVC**, expone una **API REST** para integraciones externas, y además incluye un **panel web con vistas renderizadas en el servidor (SSR)** usando el motor de plantillas Pug, pensado para uso directo desde el navegador sin necesidad de un frontend separado.

La persistencia de datos se resuelve con **archivos JSON locales** (sin base de datos externa), lo cual simplifica el despliegue y la corrección para esta primera entrega del caso de estudio.

## Requisitos previos

- **Node.js 18 o superior**
- npm (incluido con Node.js)

## Instalación y ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/Elibar19/G9-Backend-IFTS29.git
cd G9-Backend-IFTS29

# 2. Instalar dependencias
npm install

# 3. Ejecutar en modo producción
npm start

# 3'. o bien, en modo desarrollo (reinicio automático con nodemon)
npm run dev
```

Por defecto el servidor levanta en `http://localhost:3000` (configurable con la variable de entorno `PORT`).

| Comando | Descripción |
|---|---|
| `npm install` | Instala las dependencias del proyecto (`express`, `pug`, `nodemon`) |
| `npm start` | Levanta el servidor con Node directamente |
| `npm run dev` | Levanta el servidor con `nodemon`, reiniciando ante cada cambio de archivo |

Una vez levantado, se puede verificar que el servidor está activo entrando a:

```
GET http://localhost:3000/api/health
```

## Panel web (SSR)

| Ruta | Descripción |
|---|---|
| `GET /` | Dashboard principal: métricas generales, todos los lotes con su alerta actual y últimas observaciones |
| `GET /lotes` | Listado de lotes con semáforo de alerta |
| `GET /lotes/:id` | Detalle de un lote + historial cronológico de observaciones |
| `GET /observaciones` | Listado global de observaciones ordenado por fecha, con nombre de lote, técnico y cultivo |
| `GET /observaciones/nueva` | Formulario para cargar una nueva observación |
| `POST /observaciones` | Procesa el alta de una observación desde el formulario |

## Endpoints de la API REST

Todas las respuestas siguen el formato `{ success, data }` —los listados agregan el total: `{ success, total, data }`— o `{ success, message }` ante error. Los recursos de lista aceptan filtros por **query string** donde se indica.

### Productores — `/api/productores`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/productores` | Lista todos los productores |
| GET | `/api/productores/:id` | Obtiene un productor por id (404 si no existe) |
| GET | `/api/productores/:id/lotes` | Lista los lotes vinculados a ese productor |
| POST | `/api/productores` | Crea un productor (valida campos obligatorios) |
| PUT | `/api/productores/:id` | Actualiza un productor |
| DELETE | `/api/productores/:id` | Elimina un productor |

### Lotes — `/api/lotes`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/lotes` | Lista lotes. Filtros: `?alerta=` (Normal/Atención/Crítico) y `?productorId=` |
| GET | `/api/lotes/:id` | Obtiene un lote por id |
| GET | `/api/lotes/:id/observaciones` | Historial de observaciones del lote + nivel de alerta actual |
| POST | `/api/lotes` | Crea un lote |
| PUT | `/api/lotes/:id` | Actualiza un lote |
| DELETE | `/api/lotes/:id` | Elimina un lote |

### Observaciones — `/api/observaciones`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/observaciones` | Lista observaciones. Filtros: `?alerta=`, `?tecnicoId=`, `?loteId=` |
| GET | `/api/observaciones/:id` | Obtiene una observación por id |
| POST | `/api/observaciones` | Crea una observación (fecha y nivel de alerta obligatorios) |
| PUT | `/api/observaciones/:id` | Actualiza una observación |
| DELETE | `/api/observaciones/:id` | **403 Forbidden** — regla de negocio: las observaciones son históricas y no se eliminan físicamente |

### Técnicos — `/api/tecnicos`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/tecnicos` | Lista técnicos |
| GET | `/api/tecnicos/:id` | Obtiene un técnico por id |
| POST | `/api/tecnicos` | Crea un técnico |

### Tipos de cultivo — `/api/tipos-cultivo`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/tipos-cultivo` | Lista tipos de cultivo |
| GET | `/api/tipos-cultivo/:id` | Obtiene un tipo de cultivo por id |
| POST | `/api/tipos-cultivo` | Crea un tipo de cultivo |

### Salud del servicio

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Verifica que la API está en funcionamiento |

## Estructura de carpetas (arquitectura MVC)

```
G9-Backend-IFTS29/
├── data/                     # "Base de datos" en archivos JSON (una tabla por entidad)
│   ├── productores.json
│   ├── lotes.json
│   ├── observaciones.json
│   ├── tecnicos.json
│   └── tiposCultivo.json
├── public/
│   └── css/estilos.css       # Estilos del panel web
├── views/                    # Vistas Pug (SSR)
│   ├── layout.pug
│   ├── index.pug
│   ├── error.pug
│   ├── lotes/
│   └── observaciones/
├── src/
│   ├── app.js                 # Configuración de Express (middlewares, view engine, montaje de rutas)
│   ├── server.js               # Punto de entrada: levanta el servidor HTTP
│   ├── config.js                # Configuración (puerto, etc.)
│   ├── constants/
│   │   └── alertas.js           # Niveles de alerta y estados de cultivo válidos
│   ├── middleware/
│   │   ├── notFound.js           # Middleware 404
│   │   └── errorHandler.js       # Middleware de manejo de errores
│   ├── models/                  # Definición de entidades (Productor, Lote, Observacion, Tecnico, TipoCultivo)
│   ├── controllers/             # Lógica de negocio (Modelo ⇄ Vista/API)
│   ├── routes/                  # Definición de endpoints REST y SSR
│   ├── utils/
│   │   └── id.js                # Generador de ids (prefijo + timestamp)
│   └── storage/
│       ├── JsonStorage.js        # Clase de acceso a datos sobre archivos JSON
│       └── index.js               # Instancias de storage por entidad
└── package.json
```

La app sigue el patrón **MVC**:
- **Modelo**: `src/models/` define la forma de cada entidad y sus validaciones; `src/storage/` es la capa de persistencia que los controllers usan para leer/escribir.
- **Controlador**: `src/controllers/` contiene toda la lógica de negocio y validaciones, tanto para las respuestas JSON de la API como para las vistas SSR.
- **Vista**: `views/` (Pug) para el panel web, y las respuestas JSON que arman los controllers para el consumo como API REST.

## Capa de persistencia (JSON)

En lugar de una base de datos externa, el proyecto usa **archivos JSON como tablas**, mediante la clase `JsonStorage` (`src/storage/JsonStorage.js`):

- Cada archivo en `data/` (por ejemplo `lotes.json`) actúa como una tabla independiente, con un array de objetos.
- `JsonStorage` se instancia una vez por entidad en `src/storage/index.js` (`productores`, `lotes`, `tecnicos`, `observaciones`, `tiposCultivo`), y expone:
  - `ensureFile()`: crea el archivo vacío (`[]`) si todavía no existe.
  - `read()` / `write(items)`: lectura y escritura completa del archivo.
  - `findAll()`: devuelve todos los registros.
  - `findById(id)`: busca un registro por id.
  - `insert(item)`: agrega un nuevo registro.
  - `update(id, item)`: reemplaza un registro existente.
  - `delete(id)`: elimina un registro.
- Los identificadores se generan con `generateId(prefijo)` (`src/utils/id.js`), combinando un prefijo por entidad con un timestamp (por ejemplo `prod-1699999999999`).

Esta capa es intencionalmente simple: no maneja concurrencia ni transacciones, pero resulta suficiente para el alcance de esta primera entrega y facilita inspeccionar y modificar los datos a mano durante el desarrollo.
