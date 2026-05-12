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
- [Ejemplos de uso](#ejemplos-de-uso)
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
├── docs/
│   └── EXAMPLES.md                      # Ejemplos completos de uso por módulo
├── src/
│   ├── config/
│   │   └── supabase.js                  # Inicialización del cliente Supabase
│   ├── middlewares/
│   │   ├── auth.middleware.js            # Verificación JWT y control de roles
│   │   └── errorHandler.middleware.js   # Formato estándar de errores
│   └── modules/
│       ├── auth/                         # M01 — Login
│       │   ├── auth.routes.js
│       │   ├── auth.controller.js
│       │   └── auth.service.js
│       ├── materias/                     # M02 — CRUD materias
│       │   ├── materias.routes.js
│       │   ├── materias.controller.js
│       │   └── materias.service.js
│       ├── rubricas/                     # M03 — CRUD rúbricas y criterios
│       │   ├── rubricas.routes.js
│       │   ├── rubricas.controller.js
│       │   └── rubricas.service.js
│       ├── grupos/                       # M04 — CRUD grupos
│       │   ├── grupos.routes.js
│       │   ├── grupos.controller.js
│       │   └── grupos.service.js
│       ├── alumnos/                      # M05 — Registro de alumnos (RN11)
│       │   ├── alumnos.routes.js
│       │   ├── alumnos.controller.js
│       │   └── alumnos.service.js
│       ├── equipos/                      # M06 — CRUD equipos
│       │   ├── equipos.routes.js
│       │   ├── equipos.controller.js
│       │   └── equipos.service.js
│       ├── exposiciones/                 # M07 — Gestión de exposiciones
│       │   ├── exposiciones.routes.js
│       │   ├── exposiciones.controller.js
│       │   └── exposiciones.service.js
│       ├── permisos/                     # M08 — Permisos de evaluación
│       │   ├── permisos.routes.js
│       │   ├── permisos.controller.js
│       │   └── permisos.service.js
│       └── evaluaciones/                # M09 — Registro y consulta de evaluaciones
│           ├── evaluaciones.routes.js
│           ├── evaluaciones.controller.js
│           └── evaluaciones.service.js
├── app.js                               # Configuración de Express y registro de rutas
├── index.js                             # Entrada del servidor
├── .env                                 # Variables de entorno (no versionado)
├── .env.example                         # Plantilla de variables
├── vercel.json                          # Configuración de despliegue
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
   │         └──► EQUIPOS         └──► RUBRICAS ──► CRITERIOS
   │                  │
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
| `ponderacion` | decimal | Peso del criterio |

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
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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
| `docente` | Profesor titular | CRUD completo en recursos de configuración, gestión de exposiciones y consulta de resultados |
| `alumno` | Estudiante | Consulta de exposiciones activas de su grupo y registro de evaluaciones |

---

## Reglas de negocio

| ID | Regla |
|---|---|
| **RN01** | Un alumno no puede evaluar la misma exposición dos veces. |
| **RN02** | Las calificaciones deben estar en el rango 0.0 a 10.0. |
| **RN03** | Toda evaluación debe incluir todos los criterios de la rúbrica, sin excepción. |
| **RN04** | No pueden existir dos materias con la misma `clave_materia`. |
| **RN05** | Solo usuarios autenticados acceden a recursos protegidos. El único endpoint público es `POST /auth/login`. |
| **RN06** | Los criterios de evaluación son predefinidos por el docente antes de habilitar una exposición. |
| **RN07** | Los recursos inexistentes siempre retornan HTTP 404. |
| **RN08** | Un alumno no puede evaluar la exposición de su propio equipo. El alumno solo ve exposiciones de otros equipos de su grupo. |
| **RN09** | Una exposición es evaluable únicamente dentro de la ventana de tiempo activa y el mismo día calendario en que fue habilitada. Las validaciones se ejecutan en este orden estricto: (1) token válido, (2) registro de alumno, (3) permiso existente, (4) permiso habilitado, (5) mismo día calendario, (6) dentro de la ventana de tiempo, (7) no ha evaluado ya, (8) no pertenece al equipo expositor, (9) criterios válidos y calificaciones en rango. |
| **RN09.3** | El docente puede rehabilitar la ventana de evaluación para un alumno específico, siempre que ese alumno no haya evaluado aún. |
| **RN10** | El docente ve el desglose completo con evaluaciones individuales y sus detalles. |
| **RN11** | Las credenciales de los alumnos se generan automáticamente al registrarlos: `username = {4 primeras letras del apellido}{4 últimos dígitos de matrícula}@{INSTITUTIONAL_DOMAIN}` y `password_temporal = {4 primeras letras del apellido}{4 últimos dígitos de matrícula}`. Las credenciales se exponen únicamente en la respuesta de creación (HTTP 201). |
| **RN12** | El promedio ponderado se calcula en el backend al registrar la evaluación. Fórmula: `SUM(calificacion × ponderacion) / SUM(ponderacion)`. |
| **RN13** | El cierre manual de una exposición requiere confirmación del docente: mediante contraseña (validada con bcrypt en el backend) o captcha (validado en el frontend; el backend acepta la solicitud sin verificación adicional). |

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
| PUT | `/materias/:id` | Sí | Docente | Actualizar materia |
| DELETE | `/materias/:id` | Sí | Docente | Eliminar materia |

### Rúbricas y Criterios

| Método | Ruta | Auth | Rol | Descripción |
|---|---|---|---|---|
| GET | `/rubricas` | Sí | Cualquiera | Listar rúbricas (paginado) |
| POST | `/rubricas` | Sí | Docente | Crear rúbrica vinculada a una materia |
| GET | `/rubricas/:id` | Sí | Cualquiera | Obtener rúbrica por ID |
| PUT | `/rubricas/:id` | Sí | Docente | Actualizar rúbrica |
| DELETE | `/rubricas/:id` | Sí | Docente | Eliminar rúbrica |
| GET | `/criterios/rubrica/:id` | Sí | Cualquiera | Listar criterios de una rúbrica |
| POST | `/criterios/rubrica/:id` | Sí | Docente | Agregar criterio a una rúbrica |
| GET | `/criterios/:id` | Sí | Cualquiera | Obtener criterio por ID |
| PUT | `/criterios/:id` | Sí | Docente | Actualizar criterio |
| DELETE | `/criterios/:id` | Sí | Docente | Eliminar criterio |

### Grupos

| Método | Ruta | Auth | Rol | Descripción |
|---|---|---|---|---|
| GET | `/grupos` | Sí | Cualquiera | Listar grupos (paginado) |
| POST | `/grupos` | Sí | Docente | Crear grupo vinculado a una materia |
| GET | `/grupos/:id` | Sí | Cualquiera | Obtener grupo por ID |
| PUT | `/grupos/:id` | Sí | Docente | Actualizar grupo |
| DELETE | `/grupos/:id` | Sí | Docente | Eliminar grupo |

### Alumnos

| Método | Ruta | Auth | Rol | Descripción |
|---|---|---|---|---|
| GET | `/alumnos` | Sí | Cualquiera | Listar alumnos (paginado) |
| POST | `/alumnos` | Sí | Docente | Registrar alumno (genera credenciales — RN11) |
| GET | `/alumnos/:id` | Sí | Cualquiera | Obtener alumno por ID |
| PUT | `/alumnos/:id` | Sí | Docente | Actualizar datos del alumno |
| DELETE | `/alumnos/:id` | Sí | Docente | Eliminar alumno y su usuario asociado |

### Equipos

| Método | Ruta | Auth | Rol | Descripción |
|---|---|---|---|---|
| GET | `/equipos` | Sí | Docente | Listar equipos (paginado) |
| POST | `/equipos` | Sí | Docente | Crear equipo vinculado a un grupo |
| GET | `/equipos/:id` | Sí | Docente | Obtener equipo por ID |
| PUT | `/equipos/:id` | Sí | Docente | Actualizar equipo |
| DELETE | `/equipos/:id` | Sí | Docente | Eliminar equipo |

### Exposiciones

| Método | Ruta | Auth | Rol | Descripción |
|---|---|---|---|---|
| GET | `/exposiciones` | Sí | Cualquiera | Listar exposiciones — docente ve todas; alumno ve solo activas de otros equipos de su grupo (RN08) |
| POST | `/exposiciones` | Sí | Docente | Crear exposición en estado `pendiente` |
| GET | `/exposiciones/:id` | Sí | Cualquiera | Obtener exposición por ID |
| PUT | `/exposiciones/:id` | Sí | Docente | Actualizar exposición (solo estado `pendiente`) |
| DELETE | `/exposiciones/:id` | Sí | Docente | Eliminar exposición (solo estado `pendiente`) |
| POST | `/exposiciones/:id/habilitar` | Sí | Docente | Habilitar exposición: cambia estado a `activa` y genera permisos para el grupo (RN08) |
| POST | `/exposiciones/:id/cerrar` | Sí | Docente | Cerrar exposición con confirmación por password o captcha (RN13) |

### Permisos de Evaluación

| Método | Ruta | Auth | Rol | Descripción |
|---|---|---|---|---|
| GET | `/permisos/exposicion/:id` | Sí | Docente | Listar permisos de una exposición con su estado actual |
| PATCH | `/permisos/:id/reabrir` | Sí | Docente | Reabrir ventana de evaluación para un alumno que no ha evaluado (RN09.3) |

### Evaluaciones

| Método | Ruta | Auth | Rol | Descripción |
|---|---|---|---|---|
| POST | `/evaluaciones` | Sí | Alumno | Registrar evaluación con validaciones RN09 en orden estricto |
| GET | `/evaluaciones/exposicion/:id` | Sí | Docente | Consultar resultados de una exposición con detalles y promedio general |
| GET | `/evaluaciones/:id` | Sí | Cualquiera | Obtener evaluación por ID |

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
| `400` | Bad Request | Datos inválidos, campo faltante, ID de recurso relacionado inexistente, criterios incorrectos |
| `401` | Unauthorized | Token ausente, inválido o expirado |
| `403` | Forbidden | Rol insuficiente, operación no permitida por el estado actual del recurso, o violación de regla de negocio de acceso |
| `404` | Not Found | Recurso inexistente (RN07) |
| `409` | Conflict | Duplicado (matrícula, clave de materia) o evaluación repetida (RN01) |
| `500` | Internal Server Error | Error inesperado del servidor o de Supabase |

---

## Ejemplos de uso

Ver el archivo [docs/EXAMPLES.md](docs/EXAMPLES.md) para ejemplos detallados de petición y respuesta de todos los módulos, incluyendo:

- Flujo completo de extremo a extremo (16 pasos)
- Casos de error por módulo con respuestas exactas
- Tabla de generación de credenciales (RN11)
- Cálculo del promedio ponderado (RN12)

---

## Flujo de trabajo Git

```
main          ← rama de producción
  └── develop ← rama de integración
        ├── feature/m01-auth
        ├── feature/m02-materias
        ├── feature/m03-rubricas
        ├── feature/m04-grupos
        ├── feature/m05-alumnos
        ├── feature/m06-equipos
        ├── feature/m07-exposiciones
        ├── feature/m08-permisos
        └── feature/m09-evaluaciones
```

**Regla:** cada módulo se desarrolla en su propia rama `feature/mXX-nombre`, partiendo de la rama del módulo anterior (por dependencia de código). Los PRs apuntan a `develop`. Una vez validados todos los módulos, `develop` se fusiona en `main`.

---

## Convención de commits

```
<tipo>(<módulo>): <descripción imperativa en español>
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
```

---

## Estado del desarrollo

### Módulos completados — Roberto Gómez

| # | Módulo | Branch | PR | Estado |
|---|---|---|---|---|
| M01 | Configuración base + Auth | `feature/m01-auth` | #1 | Mergeado en `main` |
| M02 | Materias | `feature/m02-materias` | #2 | Mergeado en `main` |
| M03 | Rúbricas y Criterios | `feature/m03-rubricas` | #4 | Mergeado en `main` |
| M04 | Grupos | `feature/m04-grupos` | #6 | Mergeado en `main` |
| M05 | Alumnos | `feature/m05-alumnos` | #8 | Mergeado en `main` |

### Módulos completados — Jose Armando

| # | Módulo | Branch | PR | Estado |
|---|---|---|---|---|
| M06 | Equipos | `feature/m06-equipos` | #9 | Mergeado en `main` |
| M07 | Exposiciones | `feature/m07-exposiciones` | #10 | Mergeado en `main` |
| M08 | Permisos de Evaluación | `feature/m08-permisos` | #11 | Mergeado en `main` |

### Módulos completados — Roberto Gómez (correcciones y cierre)

| # | Módulo | Descripción | Estado |
|---|---|---|---|
| M07 | Exposiciones (fix) | Corrección de códigos 409→403 en operaciones de estado y validación de cierre con password | En `main` |
| M08 | Permisos (fix) | Corrección crítica: bloquear reapertura si el alumno ya evaluó (RN01) | En `main` |
| M09 | Evaluaciones | Implementación completa con cadena de validaciones RN09 y cálculo RN12 | En `main` |
