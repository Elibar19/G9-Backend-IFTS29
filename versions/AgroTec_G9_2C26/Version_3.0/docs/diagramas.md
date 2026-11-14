# Diagramas del sistema — AgroTec (3ª entrega)

Diagramas en [Mermaid](https://mermaid.js.org/): GitHub los renderiza directamente al abrir este archivo.
Para insertarlos en el PDF, abrir `docs/diagramas.html` en el navegador (o pegar cada bloque en <https://mermaid.live>) y exportar como imagen.

---

## 1. Diagrama de casos de uso

Actores: **Visitante** (sin sesión), **Lector** (rol `usuario`), **Administrador** (rol `admin`) y **Render** (sistema externo que hace el health-check). El administrador hereda todo lo que puede hacer el lector.

```mermaid
flowchart LR
    V([Visitante])
    L([Lector<br/>rol usuario])
    A([Administrador<br/>rol admin])

    subgraph AgroTec
        direction TB
        UC1((Iniciar sesión))
        UC2((Cerrar sesión))
        UC3((Consultar lotes y<br/>nivel de alerta actual))
        UC4((Filtrar lotes por<br/>alerta / productor))
        UC5((Ver historial de<br/>observaciones))
        UC6((Consultar productores,<br/>técnicos y cultivos))
        UC7((Registrar<br/>observación))
        UC8((ABM de productores<br/>y lotes))
        UC10((Alta de técnicos y<br/>tipos de cultivo))
        UCV((Validar datos y<br/>reglas de negocio))
        UC11((Verificar estado<br/>del servicio))
    end

    R([Render<br/>health-check])

    V --> UC1
    L --> UC2
    L --> UC3
    L --> UC5
    L --> UC6
    A --> UC7
    A --> UC8
    A --> UC10
    A -. hereda .-> L
    UC4 -. extiende .-> UC3
    UC7 -. incluye .-> UCV
    UC8 -. incluye .-> UCV
    UC10 -. incluye .-> UCV
    UC11 --- R
```

## 2. Diagrama de clases

Modelos Mongoose (`src/models/`) y sus relaciones por referencia (`ObjectId`). `nivelAlertaActual` no se guarda: se calcula a partir de la observación más reciente del lote.

```mermaid
classDiagram
    class Productor {
        +ObjectId _id
        +String nombre
        +String cuit
        +String email
        +String telefono
        +String localidad
        +validate(data) String[]
    }
    class Lote {
        +ObjectId _id
        +String nombre
        +Number hectareas
        +ObjectId productorId
        +String ubicacion
        +nivelAlertaActual() String «calculado»
        +validate(data) String[]
    }
    class Observacion {
        +ObjectId _id
        +ObjectId loteId
        +ObjectId tecnicoId
        +ObjectId tipoCultivoId
        +String fecha
        +String estadoCultivo «Bueno|Regular|Malo»
        +String nivelAlerta «Normal|Atención|Crítico»
        +String observaciones
        +validate(data) String[]
    }
    class Tecnico {
        +ObjectId _id
        +String nombre
        +String especialidad
        +String email
        +String telefono
        +validate(data) String[]
    }
    class TipoCultivo {
        +ObjectId _id
        +String nombre
        +validate(data) String[]
    }
    class Usuario {
        +ObjectId _id
        +String usuario «unique»
        +String password «hash bcrypt»
        +String role «admin|usuario»
        +String nombre
    }
    class Session {
        +String _id «sid de la cookie»
        +Object session «passport.user»
        +Date expires
    }

    Productor "1" --> "0..*" Lote : posee
    Lote "1" --> "0..*" Observacion : historial
    Tecnico "1" --> "0..*" Observacion : registra
    TipoCultivo "1" --> "0..*" Observacion : clasifica
    Usuario "1" --> "0..*" Session : autentica
```

## 3. Modelo de datos (ER)

```mermaid
erDiagram
    PRODUCTORES ||--o{ LOTES : "posee"
    LOTES ||--o{ OBSERVACIONES : "tiene historial"
    TECNICOS ||--o{ OBSERVACIONES : "registra"
    TIPOSCULTIVO ||--o{ OBSERVACIONES : "clasifica"
    USUARIOS ||--o{ SESSIONS : "inicia"

    PRODUCTORES {
        ObjectId _id PK
        string nombre
        string cuit "único (409 si se repite)"
        string email
        string telefono
        string localidad
    }
    LOTES {
        ObjectId _id PK
        string nombre
        number hectareas "mayor a 0"
        ObjectId productorId FK
        string ubicacion
    }
    OBSERVACIONES {
        ObjectId _id PK
        ObjectId loteId FK
        ObjectId tecnicoId FK
        ObjectId tipoCultivoId FK
        string fecha "fecha válida obligatoria"
        string estadoCultivo
        string nivelAlerta
        string observaciones
    }
    TECNICOS {
        ObjectId _id PK
        string nombre
        string especialidad
        string email
        string telefono
    }
    TIPOSCULTIVO {
        ObjectId _id PK
        string nombre "único"
    }
    USUARIOS {
        ObjectId _id PK
        string usuario "único"
        string password "hash bcrypt $2b$10$"
        string role "admin | usuario"
        string nombre
    }
    SESSIONS {
        string _id PK "sid de agrotec.sid"
        object session
        date expires "TTL 24 h"
    }
```

Reglas de integridad que la aplicación hace cumplir (MongoDB no tiene FK): no se puede borrar un productor con lotes (409), ni un lote con observaciones (409); las observaciones no se borran nunca (403, RF09).

## 4. Diagrama de secuencia — inicio de sesión

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant E as Express + express-session
    participant P as Passport (LocalStrategy)
    participant DB as MongoDB (usuarios)
    participant S as MongoDB (sessions)

    U->>E: POST /login {usuario, password}
    E->>P: passport.authenticate('local')
    P->>DB: Usuario.findOne({ usuario })
    DB-->>P: documento con hash bcrypt
    P->>P: bcrypt.compare(password, hash)
    alt credenciales válidas
        P->>E: req.login(user sin password)
        E->>S: guardar sesión { passport.user: _id }
        E-->>U: 302 → / + Set-Cookie agrotec.sid (HttpOnly, SameSite=Lax, Secure en prod)
    else credenciales inválidas
        P-->>E: done(null, false)
        E-->>U: 302 → /login?error=1 (sin sesión)
    end
```

## 5. Diagrama de secuencia — escritura protegida en la API

```mermaid
sequenceDiagram
    autonumber
    actor C as Cliente (cookie agrotec.sid)
    participant E as Express
    participant S as connect-mongo (sessions)
    participant M as requireApiAuth
    participant Ctl as loteController.create
    participant DB as MongoDB

    C->>E: POST /api/lotes {nombre, hectareas, productorId}
    E->>S: cargar sesión por sid
    S-->>E: passport.user → req.user (deserializeUser)
    E->>M: requireApiAuth()
    alt sin sesión
        M-->>C: 401 {success:false, message:"No autenticado..."}
    else con sesión
        E->>M: requireApiAuth('admin')
        alt rol ≠ admin
            M-->>C: 403 {success:false, message:"Tu rol no tiene permisos..."}
        else rol admin
            M->>Ctl: next()
            Ctl->>Ctl: validate(datos)
            alt datos inválidos
                Ctl-->>C: 400 {success:false, message}
            else válidos
                Ctl->>DB: Productor.findById(productorId)
                alt productor inexistente
                    Ctl-->>C: 400 "No existe el productor indicado"
                else existe
                    Ctl->>DB: Lote.create(datos)
                    Ctl-->>C: 201 {success:true, data}
                end
            end
        end
    end
    Note over Ctl,DB: Cualquier excepción async → asyncHandler → errorHandler → 500 JSON
```

## 6. Arquitectura de despliegue

```mermaid
flowchart LR
    B[Navegador / REST Client] -- HTTPS --> RP[Proxy de Render<br/>termina TLS]
    RP -- HTTP + X-Forwarded-Proto --> APP[Web Service Node.js<br/>Express · NODE_ENV=production<br/>trust proxy · cookie Secure]
    APP -- mongodb+srv:// TLS --> ATLAS[(MongoDB Atlas M0<br/>colecciones del dominio<br/>+ sessions)]
    RP -. health-check GET /api/health .-> APP
    GH[GitHub · rama main] -- auto-deploy en cada push --> APP
```

## 7. Planificación del equipo

### 7.1 Backlog de historias de usuario (priorizado)

Prioridad MoSCoW (Must / Should / Could). Estimación en puntos de historia (1 = muy simple, 8 = compleja). Backlog reconstruido a partir del historial de commits y PRs del repositorio.

| ID | Historia de usuario | Prioridad | Est. | Entrega | Responsable |
|---|---|---|---|---|---|
| HU01 | Como coordinador quiero gestionar productores para saber a quién pertenece cada lote | Must | 3 | 1ª | Ortiz |
| HU02 | Como coordinador quiero gestionar lotes asociados a un productor | Must | 3 | 1ª | Ortiz |
| HU03 | Como técnico quiero registrar observaciones con fecha, estado y nivel de alerta | Must | 5 | 1ª | Ortiz / Bargaz |
| HU04 | Como coordinador quiero ver el nivel de alerta actual de cada lote | Must | 3 | 1ª–2ª | Ortiz |
| HU05 | Como usuario quiero un panel web para consultar lotes y observaciones | Should | 5 | 1ª | Grigolatto |
| HU06 | Como equipo queremos persistir los datos en MongoDB en lugar de archivos JSON | Must | 8 | 2ª | Bargaz |
| HU07 | Como equipo queremos migrar el código a módulos ESM | Should | 3 | 2ª | Ortiz |
| HU08 | Como admin quiero iniciar sesión y que solo yo pueda cargar observaciones | Must | 5 | 2ª | Grigolatto |
| HU09 | Como responsable de seguridad quiero contraseñas hasheadas con bcrypt | Must | 2 | 3ª | Grigolatto |
| HU10 | Como responsable de seguridad quiero que la API exija sesión y rol | Must | 5 | 3ª | Grigolatto |
| HU11 | Como usuario quiero que mi sesión no se pierda cuando el servidor se reinicia | Should | 3 | 3ª | Grigolatto |
| HU12 | Como cliente quiero acceder al sistema desde internet (Render + Atlas) | Must | 5 | 3ª | Equipo |
| HU13 | Como equipo queremos pruebas automatizadas de las reglas críticas | Could | 2 | 3ª | Equipo |
| HU14 | Como coordinador quiero alertas en tiempo real (Socket.IO) | Could | 8 | futura | — |

### 7.2 Tablero (estado al cierre de la 3ª entrega)

```mermaid
flowchart LR
    subgraph Hecho
        direction TB
        h1[HU01–HU05 · 1ª entrega]
        h2[HU06–HU08 · 2ª entrega]
        h3[HU09–HU11 · seguridad]
        h4[HU13 · tests node:test]
    end
    subgraph En_curso[En curso]
        direction TB
        c1[HU12 · deploy Render + Atlas]
    end
    subgraph Backlog
        direction TB
        b1[HU14 · alertas en tiempo real]
        b2[CSRF + rate-limit en login]
        b3[ABM de usuarios del panel]
    end
    Backlog --> En_curso --> Hecho
```

### 7.3 Cronograma de las tres entregas

```mermaid
gantt
    title AgroTec — cronograma por entrega
    dateFormat YYYY-MM-DD
    axisFormat %d/%m
    section 1ª entrega
    Modelos, middlewares, app/server     :done, e1a, 2026-09-08, 1d
    Persistencia JSON, controllers, rutas :done, e1b, 2026-09-09, 1d
    Vistas Pug, README, requests REST     :done, e1c, 2026-09-09, 1d
    section 2ª entrega
    Migración ESM                         :done, e2a, 2026-10-14, 3d
    MongoDB + Mongoose + Docker           :done, e2b, 2026-10-14, 3d
    Login con sesión y roles (panel)      :done, e2c, 2026-10-15, 3d
    section 3ª entrega
    bcrypt + API protegida                :done, e3a, 2026-11-08, 3d
    connect-mongo + config producción     :done, e3b, 2026-11-10, 1d
    Tests automatizados + diagramas       :done, e3c, 2026-11-14, 1d
    Deploy Render + Atlas                 :active, e3d, 2026-11-14, 3d
    Video y documentación final           :e3e, after e3d, 3d
```
