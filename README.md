# Sistema de Exposiciones — Backend API

API REST para la gestión de exposiciones académicas con coevaluación entre alumnos. Desarrollada con Node.js, Express y Supabase (PostgreSQL).

---

## Tabla de contenidos

- [Stack tecnológico](#stack-tecnológico)
- [Requisitos previos](#requisitos-previos)
- [Instalación y configuración](#instalación-y-configuración)
- [Variables de entorno](#variables-de-entorno)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Diseño de base de datos](#diseño-de-base-de-datos)
- [Arquitectura de módulos](#arquitectura-de-módulos)
- [Autenticación](#autenticación)
- [Reglas de negocio](#reglas-de-negocio)
- [Endpoints implementados](#endpoints-implementados)
- [Formato de errores](#formato-de-errores)
- [Ejemplos de peticiones y respuestas](#ejemplos-de-peticiones-y-respuestas)
- [Flujo de trabajo Git](#flujo-de-trabajo-git)
- [Convención de commits](#convención-de-commits)
- [Estado del desarrollo](#estado-del-desarrollo)

---

## Stack tecnológico

| Tecnología | Versión | Rol |
|---|---|---|
| Node.js | 20 LTS | Runtime |
| Express | 5.x | Framework HTTP |
| Supabase JS Client | 2.x | Acceso a base de datos (PostgreSQL) |
| jsonwebtoken | 9.x | Emisión y verificación de JWT |
| bcrypt | 5.x | Hash de contraseñas |
| Zod | 4.x | Validación de esquemas |
| dotenv | 16.x | Variables de entorno |
| nodemon | 3.x | Recarga en desarrollo |

---

## Requisitos previos

- Node.js 20 LTS
- Proyecto activo en [Supabase](https://supabase.com) con las tablas creadas
- (Opcional) Cuenta en [Vercel](https://vercel.com) para despliegue

---

## Instalación y configuración

```bash
# 1. Clonar el repositorio
git clone https://github.com/DoctourDot18Pup/exposiciones-backend.git
cd exposiciones-backend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con los valores reales

# 4. Iniciar en modo desarrollo
npm run dev

# 5. Iniciar en producción
npm start
```

---

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto del servidor | `3000` |
| `SUPABASE_URL` | URL del proyecto en Supabase | `https://xxxx.supabase.co` |
| `SUPABASE_KEY` | Clave anon/service de Supabase | `eyJhbGci...` |
| `JWT_SECRET` | Secreto para firmar los tokens JWT | Cadena aleatoria larga |
| `JWT_EXPIRES_IN` | Duración del token en segundos | `7200` (2 horas) |
| `INSTITUTIONAL_DOMAIN` | Dominio para generar usernames de alumnos | `itcelaya.edu.mx` |

---

## Estructura del proyecto

```
exposiciones-backend/
├── src/
│   ├── config/
│   │   └── supabase.js              # Inicialización del cliente Supabase
│   ├── middlewares/
│   │   ├── auth.middleware.js        # Verificación JWT y control de roles
│   │   └── errorHandler.middleware.js# Formato estándar de errores
│   └── modules/
│       ├── auth/                     # M01 — Login
│       │   ├── auth.routes.js
│       │   ├── auth.controller.js
│       │   └── auth.service.js
│       ├── materias/                 # M02 — CRUD materias
│       │   ├── materias.routes.js
│       │   ├── materias.controller.js
│       │   └── materias.service.js
│       ├── rubricas/                 # M03 — CRUD rubricas y criterios
│       │   ├── rubricas.routes.js
│       │   ├── rubricas.controller.js
│       │   └── rubricas.service.js
│       ├── grupos/                   # M04 — CRUD grupos
│       │   ├── grupos.routes.js
│       │   ├── grupos.controller.js
│       │   └── grupos.service.js
│       ├── alumnos/                  # M05 — Registro de alumnos (RN11)
│       │   ├── alumnos.routes.js
│       │   ├── alumnos.controller.js
│       │   └── alumnos.service.js
│       ├── equipos/                  # M06 — (pendiente)
│       ├── exposiciones/             # M07 — (pendiente)
│       ├── permisos/                 # M08 — (pendiente)
│       └── evaluaciones/             # M09 — (pendiente)
├── index.js                          # Entrada del servidor
├── .env                              # Variables de entorno (no versionado)
├── .env.example                      # Plantilla de variables
├── vercel.json                       # Configuración de despliegue
└── package.json
```

Cada módulo sigue la misma estructura interna:

```
routes.js      → Define las rutas y aplica middlewares de autenticación/rol
controller.js  → Valida el input con Zod y delega al servicio
service.js     → Contiene la lógica de negocio y acceso a Supabase
```

---

## Diseño de base de datos

### Diagrama de dependencias

```
USUARIOS
   │
   ├──► ALUMNOS ──► GRUPOS ──► MATERIAS
   │         │                    │
   │         └──► EQUIPOS         ├──► RUBRICAS ──► CRITERIOS
   │                  │           │
   │                  └──► EXPOSICIONES
   │                             │
   │                    PERMISOS_EVALUACION
   │                             │
   └──────────────────► EVALUACIONES ──► DETALLE_EVALUACION
```

### Tablas

#### `usuarios`
| Columna | Tipo | Descripción |
|---|---|---|
| `id_usuario` | integer PK | Identificador único |
| `username` | varchar | Correo institucional (único) |
| `password_hash` | varchar | Hash bcrypt de la contraseña |
| `rol` | varchar | `'docente'` o `'alumno'` |

#### `materias`
| Columna | Tipo | Descripción |
|---|---|---|
| `id_materia` | integer PK | Identificador único |
| `clave_materia` | varchar | Clave única (ej. `TADW-01`) |
| `nombre_materia` | varchar | Nombre descriptivo |

#### `rubricas`
| Columna | Tipo | Descripción |
|---|---|---|
| `id_rubrica` | integer PK | Identificador único |
| `id_materia` | integer FK | Materia a la que pertenece |
| `nombre` | varchar | Nombre de la rúbrica |

#### `criterios`
| Columna | Tipo | Descripción |
|---|---|---|
| `id_criterio` | integer PK | Identificador único |
| `id_rubrica` | integer FK | Rúbrica a la que pertenece |
| `descripcion` | varchar | Descripción del criterio |
| `ponderacion` | decimal | Peso del criterio (la suma de todos debe ser 100) |

#### `grupos`
| Columna | Tipo | Descripción |
|---|---|---|
| `id_grupo` | integer PK | Identificador único |
| `id_materia` | integer FK | Materia a la que pertenece |
| `nombre_grupo` | varchar | Nombre del grupo (ej. `Grupo 7A`) |

#### `equipos`
| Columna | Tipo | Descripción |
|---|---|---|
| `id_equipo` | integer PK | Identificador único |
| `id_grupo` | integer FK | Grupo al que pertenece |
| `nombre_equipo` | varchar | Nombre del equipo |

#### `alumnos`
| Columna | Tipo | Descripción |
|---|---|---|
| `id_alumno` | integer PK | Identificador único |
| `id_usuario` | integer FK | Usuario asociado en `usuarios` |
| `id_grupo` | integer FK | Grupo al que pertenece |
| `id_equipo` | integer FK nullable | Equipo asignado (puede ser null) |
| `nombre` | varchar | Nombre del alumno |
| `apellido` | varchar | Apellido(s) del alumno |
| `matricula` | varchar | Número de matrícula (único) |

#### `exposiciones`
| Columna | Tipo | Descripción |
|---|---|---|
| `id_exposicion` | integer PK | Identificador único |
| `id_equipo` | integer FK | Equipo expositor |
| `tema` | varchar | Tema de la exposición |
| `fecha` | date | Fecha programada |
| `estado` | varchar | `'pendiente'`, `'activa'` o `'cerrada'` |
| `minutos_ventana` | integer | Duración de la ventana: `10` o `15` minutos |

#### `permisos_evaluacion`
| Columna | Tipo | Descripción |
|---|---|---|
| `id_permiso` | integer PK | Identificador único |
| `id_alumno` | integer FK | Alumno habilitado para evaluar |
| `id_exposicion` | integer FK | Exposición a evaluar |
| `habilitado` | boolean | Si el permiso está activo |
| `fecha_apertura` | timestamp | Momento en que se habilitó |
| `fecha_cierre` | timestamp | Momento en que expira la ventana |
| `evaluado` | boolean | Si el alumno ya evaluó |

#### `evaluaciones`
| Columna | Tipo | Descripción |
|---|---|---|
| `id_evaluacion` | integer PK | Identificador único |
| `id_exposicion` | integer FK | Exposición evaluada |
| `id_alumno` | integer FK | Alumno que evaluó |
| `fecha_evaluacion` | timestamp | Momento del registro |
| `promedio` | decimal | Promedio ponderado calculado por el backend |

#### `detalle_evaluacion`
| Columna | Tipo | Descripción |
|---|---|---|
| `id_detalle` | integer PK | Identificador único |
| `id_evaluacion` | integer FK | Evaluación a la que pertenece |
| `id_criterio` | integer FK | Criterio evaluado |
| `descripcion_criterio` | varchar | Copia de la descripción al momento de evaluar |
| `ponderacion` | decimal | Copia de la ponderación al momento de evaluar |
| `calificacion` | decimal | Calificación asignada (0.0 – 10.0) |

---

## Arquitectura de módulos

### Flujo de una petición

```
Cliente HTTP
    │
    ▼
Express Router (routes.js)
    │  └─ apply: authenticate, requireRole
    ▼
Controller (controller.js)
    │  └─ validate: Zod schema
    ▼
Service (service.js)
    │  └─ business logic + Supabase queries
    ▼
Supabase (PostgreSQL)
```

### Middlewares globales

**`authenticate`** — verifica el Bearer token en cada ruta protegida:
1. Extrae el token del header `Authorization: Bearer <token>`
2. Verifica la firma con `JWT_SECRET`
3. Adjunta el payload a `req.user` (`{ id_usuario, username, rol }`)
4. Responde `401` si el token es inválido o ha expirado

**`requireRole(rol)`** — restringe acceso por rol:
- Responde `403` si `req.user.rol` no coincide con el rol requerido

**`errorHandler`** — captura todos los errores no controlados y los formatea con la estructura estándar.

---

## Autenticación

El sistema usa **JWT (JSON Web Tokens)**. El único endpoint público es `POST /api/v1/auth/login`.

### Obtener token

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "docente@itcelaya.edu.mx",
  "password": "mipassword"
}
```

**Respuesta exitosa (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 7200,
  "tokenType": "Bearer"
}
```

### Usar el token

Incluir en todas las peticiones protegidas:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Payload del JWT

```json
{
  "id_usuario": 1,
  "username": "docente@itcelaya.edu.mx",
  "rol": "docente",
  "iat": 1746835200,
  "exp": 1746842400
}
```

### Roles disponibles

| Rol | Descripción | Acceso |
|---|---|---|
| `docente` | Profesor titular | CRUD completo en todos los recursos de configuración |
| `alumno` | Estudiante | Lectura, registro de evaluaciones y consulta de resultados propios |

---

## Reglas de negocio

| ID | Regla |
|---|---|
| **RN01** | Un alumno no puede evaluar la misma exposición dos veces. |
| **RN02** | Las calificaciones deben estar en el rango 0.0 a 10.0 en múltiplos de 0.5. |
| **RN03** | Toda evaluación debe incluir todos los criterios de la rúbrica, sin excepción. |
| **RN04** | No pueden existir dos materias con la misma `clave_materia`. |
| **RN05** | Solo usuarios autenticados acceden a recursos protegidos. El único endpoint público es `POST /auth/login`. |
| **RN06** | Los criterios de evaluación son predefinidos por el docente antes de habilitar una exposición. |
| **RN07** | Los recursos inexistentes siempre retornan HTTP 404. |
| **RN08** | Un alumno no puede evaluar la exposición de su propio equipo. |
| **RN09** | Una exposición es evaluable únicamente dentro de la ventana de tiempo activa y el mismo día calendario en que fue habilitada. Las validaciones se realizan en tiempo real (sin jobs ni schedulers) en el siguiente orden: (1) token válido, (2) existe permiso, (3) permiso habilitado, (4) mismo día, (5) dentro de la ventana, (6) no ha evaluado ya, (7) no pertenece al equipo expositor, (8) calificaciones válidas, (9) todos los criterios incluidos. |
| **RN09.3** | El docente puede rehabilitar la ventana de evaluación para un alumno específico sin afectar al resto. |
| **RN10** | El alumno ve únicamente el promedio consolidado de la exposición. El docente ve el desglose completo con evaluaciones individuales por evaluador. |
| **RN11** | Las credenciales de los alumnos se generan automáticamente al registrarlos: `username = {matricula}@{INSTITUTIONAL_DOMAIN}` y `password_temporal = primeras 4 letras del apellido (minúsculas) + últimos 4 dígitos de la matrícula`. Las credenciales se exponen únicamente en la respuesta de creación (HTTP 201). |
| **RN12** | El promedio ponderado se calcula en el backend y se almacena. Fórmula: `SUM(calificacion × ponderacion) / SUM(ponderacion)`. |
| **RN13** | El cierre manual de una exposición requiere confirmación por parte del docente, ya sea mediante contraseña (validada contra el hash en backend) o captcha (validado en frontend, el backend no verifica). |

---

## Endpoints implementados

Base URL: `http://localhost:3000/api/v1`

### Auth

| Método | Ruta | Auth | Rol | Descripción |
|---|---|---|---|---|
| POST | `/auth/login` | No | — | Autenticar usuario y obtener JWT |

### Materias

| Método | Ruta | Auth | Rol | Descripción |
|---|---|---|---|---|
| GET | `/materias` | Sí | Cualquiera | Listar materias (paginado) |
| POST | `/materias` | Sí | Docente | Crear materia |
| GET | `/materias/:id` | Sí | Cualquiera | Obtener materia por ID |
| PUT | `/materias/:id` | Sí | Docente | Actualizar materia completa |
| DELETE | `/materias/:id` | Sí | Docente | Eliminar materia |

### Rúbricas y Criterios

| Método | Ruta | Auth | Rol | Descripción |
|---|---|---|---|---|
| GET | `/rubricas` | Sí | Cualquiera | Listar rúbricas (paginado) |
| POST | `/rubricas` | Sí | Docente | Crear rúbrica vinculada a una materia |
| GET | `/rubricas/:id` | Sí | Cualquiera | Obtener rúbrica por ID |
| PUT | `/rubricas/:id` | Sí | Docente | Actualizar rúbrica completa |
| DELETE | `/rubricas/:id` | Sí | Docente | Eliminar rúbrica |
| GET | `/rubricas/:id/criterios` | Sí | Cualquiera | Listar criterios de una rúbrica |
| POST | `/rubricas/:id/criterios` | Sí | Docente | Agregar criterio a una rúbrica |
| PUT | `/criterios/:id` | Sí | Docente | Actualizar criterio |
| DELETE | `/criterios/:id` | Sí | Docente | Eliminar criterio |

### Grupos

| Método | Ruta | Auth | Rol | Descripción |
|---|---|---|---|---|
| GET | `/grupos` | Sí | Cualquiera | Listar grupos (paginado) |
| POST | `/grupos` | Sí | Docente | Crear grupo vinculado a una materia |
| GET | `/grupos/:id` | Sí | Cualquiera | Obtener grupo por ID |
| PUT | `/grupos/:id` | Sí | Docente | Actualizar grupo completo |
| DELETE | `/grupos/:id` | Sí | Docente | Eliminar grupo |

### Alumnos

| Método | Ruta | Auth | Rol | Descripción |
|---|---|---|---|---|
| GET | `/alumnos` | Sí | Cualquiera | Listar alumnos (paginado) |
| POST | `/alumnos` | Sí | Docente | Registrar alumno (genera credenciales automáticamente — RN11) |
| GET | `/alumnos/:id` | Sí | Cualquiera | Obtener alumno por ID |
| PUT | `/alumnos/:id` | Sí | Docente | Actualizar datos del alumno |
| DELETE | `/alumnos/:id` | Sí | Docente | Eliminar alumno y su usuario asociado |

### Pendientes (M06–M09)

| Módulo | Ruta base | Responsable |
|---|---|---|
| M06 — Equipos | `/equipos` | Jose Armando |
| M07 — Exposiciones | `/exposiciones` | Jose Armando |
| M08 — Permisos | `/permisos` | Jose Armando |
| M09 — Evaluaciones | `/evaluaciones` | Jose Armando |

---

## Formato de errores

Todos los errores del sistema responden con la siguiente estructura:

```json
{
  "timestamp": "2026-05-10T10:00:00.000Z",
  "status": 404,
  "error": "Not Found",
  "message": "El recurso solicitado no existe",
  "path": "/api/v1/materias/99"
}
```

| Campo | Descripción |
|---|---|
| `timestamp` | Fecha y hora del error en formato ISO 8601 |
| `status` | Código HTTP del error |
| `error` | Nombre estándar del código HTTP |
| `message` | Mensaje descriptivo del error |
| `path` | Ruta que generó el error |

### Códigos de error utilizados

| Código | Significado | Cuándo ocurre |
|---|---|---|
| `400` | Bad Request | Datos inválidos, campo faltante, ID de recurso relacionado inexistente |
| `401` | Unauthorized | Token ausente, inválido o expirado |
| `403` | Forbidden | Usuario autenticado sin el rol requerido, o violación de regla de negocio de acceso |
| `404` | Not Found | Recurso inexistente (RN07) |
| `409` | Conflict | Duplicado (matrícula, clave de materia, username) o evaluación repetida (RN01) |
| `500` | Internal Server Error | Error inesperado del servidor o de Supabase |

---

## Ejemplos de peticiones y respuestas

### Login exitoso

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "docente@itcelaya.edu.mx",
  "password": "pere0123"
}
```
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 7200,
  "tokenType": "Bearer"
}
```

---

### Listar materias (paginado)

```http
GET /api/v1/materias?page=0&size=10
Authorization: Bearer <token>
```
```json
{
  "content": [
    {
      "id_materia": 1,
      "clave_materia": "TADW-01",
      "nombre_materia": "Topicos Avanzados de Desarrollo Web"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "page": 0,
  "size": 10
}
```

---

### Listar criterios de una rúbrica

```http
GET /api/v1/rubricas/1/criterios
Authorization: Bearer <token>
```
```json
[
  { "id_criterio": 1, "id_rubrica": 1, "descripcion": "Dominio del tema",      "ponderacion": 40.0 },
  { "id_criterio": 2, "id_rubrica": 1, "descripcion": "Presentacion",          "ponderacion": 30.0 },
  { "id_criterio": 3, "id_rubrica": 1, "descripcion": "Manejo de preguntas",   "ponderacion": 20.0 },
  { "id_criterio": 4, "id_rubrica": 1, "descripcion": "Material visual",       "ponderacion": 10.0 }
]
```

---

### Registrar alumno (RN11 — credenciales automáticas)

```http
POST /api/v1/alumnos
Authorization: Bearer <token_docente>
Content-Type: application/json

{
  "nombre": "Juan",
  "apellido": "Perez Lopez",
  "matricula": "21400123",
  "id_grupo": 1
}
```
```json
{
  "id_alumno": 1,
  "id_usuario": 2,
  "id_grupo": 1,
  "id_equipo": null,
  "nombre": "Juan",
  "apellido": "Perez Lopez",
  "matricula": "21400123",
  "credenciales": {
    "username": "21400123@itcelaya.edu.mx",
    "password_temporal": "pere0123"
  }
}
```

> Las credenciales aparecen **únicamente** en esta respuesta. No se vuelven a exponer.

---

### Error — Matrícula duplicada

```http
POST /api/v1/alumnos
Authorization: Bearer <token_docente>
Content-Type: application/json

{ "nombre": "Otro", "apellido": "Alumno", "matricula": "21400123", "id_grupo": 1 }
```
```json
{
  "timestamp": "2026-05-10T10:32:00.000Z",
  "status": 409,
  "error": "Conflict",
  "message": "Ya existe un alumno con la matricula 21400123",
  "path": "/api/v1/alumnos"
}
```

---

### Error — Sin token

```http
GET /api/v1/materias
```
```json
{
  "timestamp": "2026-05-10T10:32:00.000Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Token invalido o expirado",
  "path": "/api/v1/materias"
}
```

---

### Error — Rol insuficiente

```http
POST /api/v1/materias
Authorization: Bearer <token_alumno>
Content-Type: application/json

{ "clave_materia": "TEST-01", "nombre_materia": "Test" }
```
```json
{
  "timestamp": "2026-05-10T10:32:00.000Z",
  "status": 403,
  "error": "Forbidden",
  "message": "No tiene permisos para realizar esta operacion",
  "path": "/api/v1/materias"
}
```

---

## Flujo de trabajo Git

```
main          ← rama de producción
  └── develop ← rama de integración
        ├── feature/m01-auth
        ├── feature/m02-materias
        ├── feature/m03-rubricas
        ├── feature/m04-grupos
        └── feature/m05-alumnos
```

**Regla:** cada módulo se desarrolla en su propia rama `feature/mXX-nombre`, partiendo de la rama del módulo anterior (por dependencia de código). Los PRs apuntan a `develop`. Una vez validados todos los módulos de una entrega, `develop` se fusiona en `main`.

---

## Convención de commits

```
<tipo>(<módulo>): <descripción imperativa en español>

- Detalle 1
- Detalle 2
```

| Tipo | Cuándo usarlo |
|---|---|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de un error |
| `chore` | Tareas de mantenimiento, configuración |
| `docs` | Cambios en documentación |
| `refactor` | Cambios de código sin cambiar comportamiento |

**Ejemplo:**
```
feat(alumnos): implementar registro con generacion automatica de credenciales (RN11)

- Genera username como {matricula}@{INSTITUTIONAL_DOMAIN}
- Genera password_temporal con primeras 4 letras del apellido + ultimos 4 digitos de matricula
- Hashea la contraseña con bcrypt antes de insertar en usuarios
- Expone credenciales solo en la respuesta 201
```

---

## Estado del desarrollo

### Módulos completados — Jesus Roberto Gómez

| # | Módulo | Branch | PR | Estado |
|---|---|---|---|---|
| M01 | Configuración base + Auth | `feature/m01-auth` | #1 | Mergeado en `main` |
| M02 | Materias | `feature/m02-materias` | #2 | Mergeado en `main` |
| M03 | Rúbricas y Criterios | `feature/m03-rubricas` | #4 | Mergeado en `main` |
| M04 | Grupos | `feature/m04-grupos` | #6 | Mergeado en `main` |
| M05 | Alumnos | `feature/m05-alumnos` | #8 | Mergeado en `main` |

### Módulos pendientes — Jose Armando

| # | Módulo | Branch | Estado |
|---|---|---|---|
| M06 | Equipos | `feature/m06-equipos` | Pendiente |
| M07 | Exposiciones | `feature/m07-exposiciones` | Pendiente |
| M08 | Permisos | `feature/m08-permisos` | Pendiente |
| M09 | Evaluaciones | `feature/m09-evaluaciones` | Pendiente |
