# Secciones para completar `DSWB_2A_G9-AgroTec_2C26`

Texto listo para pegar en el documento de la 3ª entrega. Cada bloque indica **dónde va**.
Lo marcado con `[COMPLETAR]` depende de algo que solo puede hacer el equipo (crear el deploy, grabar el video, opinión personal).

---

## → Sección 1. Links (reemplazar)

- Repositorio GitHub: https://github.com/Elibar19/G9-Backend-IFTS29
- Carpeta Drive (1ª / 2ª / 3ª entrega + versiones del código): `[COMPLETAR link Drive]`
- Video coloquio: `[COMPLETAR link — compartir como "Cualquier persona con el enlace puede ver"]`
- Aplicación en línea (Render): `[COMPLETAR https://agrotec-backend.onrender.com]`
  - Health-check público: `[URL]/api/health`
  - Usuarios de prueba: `admin` (rol admin) y `lector` (rol usuario); contraseñas en `data/usuarios.json`.

---

## → Nueva sección (después de 2.3): Asignación de roles y responsabilidades

> Reconstruido desde el historial de commits y PRs del repositorio. **Revisar y ajustar** si alguien hizo trabajo que no quedó en commits (documentación, pruebas, reuniones).

| Integrante | Rol en el equipo | Tareas realizadas |
|---|---|---|
| **Bargaz, Elian** | Líder técnico / integración e infraestructura | Commit inicial (modelos, primeros middlewares, `app.js` y `server.js`); migración a **MongoDB + Mongoose** con **Docker Compose** y script `seed.js` (2ª entrega); revisión y merge de los Pull Requests #1, #2 y #3; despliegue en Render + Atlas, tests automatizados y diagramas (3ª entrega). |
| **Ortiz, María Fernanda** | Desarrolladora backend — dominio y API | Capa de persistencia JSON y datos semilla; **controllers** con reglas de negocio y validaciones de los cinco recursos; **rutas REST** con parámetros dinámicos y filtros por query (1ª entrega); **migración a módulos ESM** (2ª entrega). |
| **Grigolatto, Emanuel** | Desarrollador backend — seguridad, vistas y QA | **Vistas Pug** y estilos, README y archivo de pruebas REST Client (1ª entrega); login con sesión y roles, estilos de login, `.env.example` (2ª entrega); **bcrypt**, `requireApiAuth`, **connect-mongo**, configuración segura de producción y batería de 49 requests (3ª entrega). |

**Forma de trabajo:** una rama por integrante/sección (`seccion-a-Fernanda`, `elian-develop`, `develop`), integración por Pull Request hacia `main` con revisión previa, y mensajes de commit con convención `feat / fix / docs / chore`.

---

## → Sección 5.6. Despliegue en Render + MongoDB Atlas (reemplazar "pendiente")

- **Necesidad:** la consigna exige que el sistema esté disponible en internet con MongoDB Atlas. Hasta la 2ª entrega solo corría en local con Mongo en Docker.
- **Decisión:** **Render** (Web Service Node, plan gratuito, deploy automático desde GitHub) + **MongoDB Atlas M0**. El código ya estaba preparado: la conexión se toma de `MONGODB_URI`, y `NODE_ENV=production` activa `trust proxy` y cookie `Secure` (5.4). Se eligió describir el servicio como código con un **Blueprint** (`render.yaml`) para que la configuración quede versionada en el repo y no solo en el panel de Render.
- **Implementación:**
  - `render.yaml`: `buildCommand: npm ci`, `startCommand: npm start`, `healthCheckPath: /api/health`, `NODE_ENV=production`, `SESSION_SECRET` generado por Render (`generateValue`) y `MONGODB_URI` cargada a mano (`sync: false`, nunca en el repo).
  - `package.json`: `"engines": { "node": ">=18" }` para fijar el runtime y versión `3.0.0`.
  - Atlas: cluster M0, usuario de base con contraseña propia, acceso de red `0.0.0.0/0` (ver riesgo abajo) y carga inicial con `npm run seed` apuntando a la URI de Atlas.
- **Evidencia:** `[COMPLETAR con capturas]` — panel de Render en estado *Live*, `GET /api/health` → 200 desde la URL pública, colección `sessions` en Atlas con documentos tras el login.

---

## → Sección 6. Diagramas del sistema (reemplazar "pendiente")

Insertar las imágenes de `docs/img/` (fuente editable en `docs/diagramas.md`, Mermaid):

| # | Diagrama | Archivo | Qué muestra |
|---|---|---|---|
| 6.1 | Casos de uso | `01-casos-de-uso.png` | Actores (visitante, lector, admin, Render) y qué puede hacer cada rol; el admin hereda lo del lector. |
| 6.2 | Clases | `02-clases.png` | Los 6 modelos Mongoose + `Session`, sus atributos, `validate()` y relaciones 1‑N. |
| 6.3 | Modelo de datos (ER) | `03-er.png` | Colecciones, PK/FK por `ObjectId` y restricciones (CUIT único, hectáreas > 0, TTL de sesión). |
| 6.4 | Secuencia — login | `04-secuencia-login.png` | Passport + `bcrypt.compare` + creación de la sesión en Mongo y cookie. |
| 6.5 | Secuencia — escritura en la API | `05-secuencia-api.png` | Cadena 401 → 403 → 400 → 201 de `POST /api/lotes` y derivación de errores al `errorHandler`. |
| 6.6 | Arquitectura de despliegue | `06-despliegue.png` | Navegador → proxy TLS de Render → Node → Atlas; deploy automático desde GitHub. |
| 6.7 | Planificación | `07-tablero.png`, `08-gantt.png` + tabla de historias de usuario de `docs/diagramas.md` §7.1 | Backlog priorizado (MoSCoW) con estimación en puntos, tablero y cronograma de las tres entregas. |

---

## → Sección 7. Matriz (correcciones)

- Fila **Persistencia**, columna 1ª entrega: cambiar `Archivos JS…` por **Archivos JSON**.
- Fila **Pruebas**, columna 3ª entrega: agregar **+ 25 tests unitarios automatizados (`node:test`)**.
- Fila **Despliegue**, columna 3ª entrega: **Render (Blueprint `render.yaml`) + Atlas**.

---

## → Sección 8. Despliegue (reemplazar "PENDIENTE" — pasar a pasado una vez hecho)

1. **MongoDB Atlas:** se creó un cluster **M0** gratuito, un usuario de base de datos con contraseña propia y una regla de acceso de red. Se obtuvo la URI `mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/agrotec`.
2. **Carga inicial en Atlas:** desde la máquina local, `MONGODB_URI="<uri de Atlas>" npm run seed` → 6 colecciones del dominio cargadas y usuarios con hash bcrypt.
3. **Render:** *New → Blueprint* sobre el repositorio; Render lee `render.yaml`, crea el Web Service `agrotec-backend` sobre la rama `main`, genera `SESSION_SECRET` y pide el valor de `MONGODB_URI`. Cada push a `main` dispara un nuevo deploy.
4. **Verificación en producción:** ver 9.3.
5. **Riesgo conocido — IPs de Render vs. lista de acceso de Atlas:** el plan gratuito de Render no tiene IP de salida fija, por lo que la lista de acceso de Atlas se abrió a `0.0.0.0/0`. La mitigación es que el acceso sigue exigiendo usuario y contraseña de base (no expuestos: viven solo en las variables de entorno de Render) y TLS obligatorio de Atlas. En un plan pago se restringiría a las IPs de salida publicadas por Render.
6. **Limitación del plan gratuito:** el servicio se suspende tras ~15 min sin tráfico; el primer request posterior tarda ~30–50 s (*cold start*). No afecta la funcionalidad, y gracias a **connect-mongo** las sesiones sobreviven a esa suspensión.

---

## → Sección 9. Agregar al inicio

**Técnicas de prueba utilizadas:** (1) **pruebas funcionales de caja negra** de la API y del panel con REST Client (`request/agrotec.rest`, 49 requests), incluyendo particiones de equivalencia (datos válidos/ inválidos) y valores límite (hectáreas = 0, fecha inválida, ids con formato incorrecto); (2) **pruebas unitarias automatizadas** con el runner nativo `node:test` (sin dependencias nuevas) sobre las validaciones y los middlewares de seguridad; (3) **pruebas de humo en producción** sobre la URL de Render.

## → Nueva sección 9.3. Resultados — pruebas unitarias automatizadas

- **Objetivo:** que las reglas más críticas (validaciones RF07/RF08, autorización RF11/RF12, formato de error RNF03/RNF04) se puedan verificar en segundos y sin base de datos, para detectar regresiones antes de cada deploy.
- **Procedimiento:** `npm test` (ejecuta `test/validaciones.test.js` y `test/middlewares.test.js`). Los middlewares se prueban con objetos `req`/`res` simulados.
- **Resultado obtenido:** **25 tests, 25 pass, 0 fail** (≈0,4 s).

| Suite | Casos | Qué verifica |
|---|---|---|
| Observación (RF07/RF08) | 6 | Observación completa válida; sin fecha, fecha inválida, alerta fuera de enum, estado de cultivo inválido → error; objeto vacío acumula los 7 errores. |
| Lote (RF03) | 3 | Lote válido; hectáreas 0 y negativas (valores límite); sin productor. |
| Productor / Técnico / Tipo de cultivo | 4 | Alta válida; email sin `@`; técnico sin especialidad; tipo sin nombre. |
| `requireApiAuth` | 4 | Sin sesión → 401 JSON sin redirigir; lector lee; lector escribe → 403; admin escribe. |
| `requireLogin` / `requireRole` | 2 | Panel sin sesión → `/login`; lector en pantalla de admin → vista 403. |
| `notFound` / `errorHandler` | 3 | 404 JSON en `/api`, 404 vista en panel, 500 JSON **sin filtrar el mensaje interno**. |
| Utilidades | 3 | `asyncHandler` deriva promesas rechazadas a `next()`; `escapeRegex` neutraliza caracteres especiales; `mapId`. |

## → Sección 9.4 (antes 9.3). Resultados — producción (reemplazar "pendiente")

Ejecutar sobre la URL de Render y completar la columna Obtenido:

| # | Caso | Esperado | Obtenido |
|---|---|---|---|
| 1 | `GET /api/health` anónimo | 200 `{success:true}` | `[ ]` |
| 2 | `GET /api/lotes` anónimo | 401 JSON | `[ ]` |
| 3 | Login `admin` en `/login` | 302 → `/`; cookie `agrotec.sid; Secure; HttpOnly; SameSite=Lax` | `[ ]` |
| 4 | Admin: `GET /api/lotes` | 200 con `nivelAlertaActual` | `[ ]` |
| 5 | Admin: `POST /api/productores` | 201 | `[ ]` |
| 6 | Login `lector` + `POST /api/lotes` | 403 JSON por rol | `[ ]` |
| 7 | Lector en `/observaciones/nueva` | 403 | `[ ]` |
| 8 | *Manual Deploy → Restart service* en Render y repetir `GET /api/lotes` con la misma cookie | 200 sin volver a loguearse (sesión en Atlas) | `[ ]` |
| 9 | Colección `sessions` en Atlas | documentos con `_id` = sid | `[ ]` |
| 10 | Respuesta sin cabecera `X-Powered-By` | ausente | `[ ]` |

---

## → Nueva sección: Mantenimiento y evolución

Resumen de las correcciones y adaptaciones hechas a lo largo de las tres entregas, ordenadas por el objetivo que perseguían:

**Seguridad**
- Contraseñas en texto plano → hash **bcrypt** (coste 10).
- API abierta → **sesión obligatoria + rol admin para escritura**, con 401/403 en JSON.
- Secreto de sesión con valor por defecto en producción → el servidor **no arranca** sin `SESSION_SECRET` (fail-fast).
- Cookie sin endurecer → `HttpOnly`, `SameSite=Lax`, `Secure` en producción; `X-Powered-By` desactivado.
- Búsquedas por texto armadas con input del usuario → `escapeRegex` antes de usar `$regex`.
- Errores 500 que podían exponer detalles internos → `errorHandler` responde un mensaje genérico (cubierto por test).

**Escalabilidad y disponibilidad**
- Archivos JSON (escritura concurrente insegura, sin consultas) → **MongoDB**, con conexión configurable para local o Atlas.
- Sesiones en memoria del proceso → **connect-mongo**: el servicio puede reiniciarse, re-desplegarse o correr en varias instancias sin perder sesiones.
- Despliegue en Render con health-check, para que la plataforma detecte y reinicie un servicio caído.

**Rendimiento**
- Acceso a datos síncrono → **async/await**, que no bloquea el event loop mientras se espera a la base.
- Consultas filtradas en la base (`find({ productorId })`) en lugar de traer todo y filtrar en memoria.
- El nivel de alerta actual se obtiene con `sort({ fecha: -1 }).limit(1)`, trayendo un solo documento por lote.

**Mantenibilidad**
- CommonJS → **ESM**; `asyncHandler` evita `try/catch` repetidos; `mapId` unifica el formato de salida.
- Pruebas automatizadas (`npm test`) para detectar regresiones; configuración de deploy versionada (`render.yaml`).

**Deuda técnica identificada (próximos pasos):** el cálculo de alerta hace una consulta por lote (patrón N+1) — se resolvería con un `aggregate` con `$lookup`/`$group`; agregar índices sobre `loteId` y `fecha` en `observaciones`; protección CSRF y rate-limit en el login; ABM de usuarios del panel; alertas en tiempo real.

---

## → Sección 10. Uso de inteligencia artificial (reemplazar)

| Herramienta | Uso | Cómo se revisó / adaptó |
|---|---|---|
| OpenCode (agente LLM) | Revisión del estado del proyecto, borradores de middlewares y scripts, corrida de baterías de prueba y generación de evidencia, asistencia en redacción. | Cada cambio se leyó y probó con REST Client antes del commit; los textos se reescribieron con el vocabulario de la materia. |
| Claude Code (agente LLM) | Contraste de la entrega contra la consigna, `render.yaml`, tests con `node:test`, diagramas en Mermaid y borradores de estas secciones. | Los tests se ejecutaron (25/25); los diagramas se verificaron contra los modelos y rutas reales; los roles se reconstruyeron desde el historial de git y se corrigieron por el equipo. |
| Asistentes de chat (2ª entrega) | Sintaxis de `docker-compose`, depuración de errores JS, plantillas Pug, `ObjectId` en Mongoose y `seed.js`. | Adaptado al modelo de datos del caso. |

**Prompts representativos:**
- *"Según el PDF de consignas, ¿qué nos falta para tener completa la entrega tanto en código como en el PDF de tercera entrega?"*
- *"Proteger la API con la misma sesión del panel respondiendo 401/403 en JSON en lugar de redirigir."*
- *"Generar tests unitarios sin base de datos para las validaciones y los middlewares de autorización."*

**Contenido adaptado o mejorado:** `[COMPLETAR — p. ej. "se simplificó el diagrama de casos de uso", "se reescribió la conclusión con experiencias propias", "se descartó la sugerencia X porque…"]`.

---

## → Sección 12. Conclusión final

> **Borrador**: es una reflexión personal del grupo. Usarlo como punto de partida y reescribirlo con experiencias propias (en el video les van a preguntar sobre esto).

**¿Qué aprendimos este cuatrimestre?**
Construimos un backend real de punta a punta y, sobre todo, a hacerlo evolucionar: la misma aplicación pasó de archivos JSON a MongoDB, de CommonJS a ESM, de no tener usuarios a tener sesiones persistentes con roles, y de correr en una notebook a estar publicada en internet. Entendimos el modelo de middlewares de Express como una cadena donde cada pieza decide si deja pasar el request, cómo separar responsabilidades con MVC, y por qué la asincronía (async/await) es central en Node.

**¿Qué dificultades tuvimos y cómo las resolvimos?**
- *Migrar de JSON a MongoDB* cambió los ids numéricos por `ObjectId` y rompió las referencias: lo resolvimos con un `seed.js` que genera ObjectIds deterministas a partir de los ids viejos.
- *connect-mongo v6* ya no aceptaba la opción `mongooseConnection` que mostraban los tutoriales: leímos la documentación de la librería, pasamos el `client` del driver y reordenamos el arranque para conectar a Mongo antes de importar `app.js`.
- *Proteger la API* con el middleware del panel devolvía un redirect HTML a clientes que esperaban JSON: creamos `requireApiAuth`.
- *Coordinarnos entre tres* sin pisarnos: ramas por integrante y Pull Requests revisados antes de integrar.
- `[COMPLETAR con dificultades propias: Docker, el deploy, tiempos, etc.]`

**¿Qué parte del desarrollo backend nos interesó más?**
`[COMPLETAR — cada integrante puede responder en una línea. Ej.: la seguridad (sesiones, hashing, roles); el modelado de datos y las reglas de negocio; el despliegue en la nube.]`

**¿Qué deberíamos reforzar?**
Testing automatizado (empezamos con unitarias; faltan pruebas de integración contra una base de prueba), optimización de consultas en MongoDB (agregaciones e índices), seguridad web más allá de la autenticación (CSRF, rate limiting, cabeceras) y prácticas de despliegue continuo (CI que corra `npm test` antes de cada deploy).

---

## → Guion sugerido para el video (no va en el PDF)

Cada integrante en cámara, hablando de su parte (~3–4 min c/u):

1. **Intro (cualquiera, 1 min):** problema de negocio, demo rápida en la URL de Render.
2. **Ortiz:** modelos y reglas de negocio (409 productor con lotes, 403 RF09, nivel de alerta actual), rutas con parámetros y filtros, migración a ESM.
3. **Bargaz:** MongoDB + Mongoose + Docker, `seed.js`, deploy en Render + Atlas (`render.yaml`, variables de entorno, riesgo de IPs), tests con `npm test`.
4. **Grigolatto:** login con Passport + bcrypt, `requireApiAuth` (401/403), connect-mongo, configuración de producción.
5. **Demo de pruebas (requerido por la consigna):** correr `npm test`; en REST Client mostrar anónimo → 401, lector → 403, admin → 201, casos límite (hectáreas 0, observación sin fecha → 400, id inválido → 404, borrar observación → 403), y reinicio del servicio sin perder la sesión.
