# Ejemplos de uso — API Sistema de Exposiciones

Colección de peticiones y respuestas para todos los módulos del sistema, cubriendo el flujo completo y los casos de error más relevantes.

**Base URL:** `http://localhost:3000/api/v1`

---

## Índice

1. [Autenticación](#1-autenticación)
2. [Materias](#2-materias)
3. [Rúbricas](#3-rúbricas)
4. [Criterios](#4-criterios)
5. [Grupos](#5-grupos)
6. [Alumnos](#6-alumnos)
7. [Equipos](#7-equipos)
8. [Exposiciones](#8-exposiciones)
9. [Permisos de Evaluación](#9-permisos-de-evaluación)
10. [Evaluaciones](#10-evaluaciones)
11. [Flujo completo de extremo a extremo](#11-flujo-completo-de-extremo-a-extremo)

---

## 1. Autenticación

### POST /auth/login — Credenciales correctas

**Request**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "docente01",
  "password": "secreta123"
}
```

**Response 200**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### POST /auth/login — Contraseña incorrecta

**Request**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "docente01",
  "password": "incorrecta"
}
```

**Response 401**
```json
{
  "timestamp": "2026-05-11T10:00:00.000Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Credenciales invalidas",
  "path": "/api/v1/auth/login"
}
```

---

### POST /auth/login — Usuario no existe

**Response 401**
```json
{
  "timestamp": "2026-05-11T10:00:00.000Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Credenciales invalidas",
  "path": "/api/v1/auth/login"
}
```

---

### POST /auth/login — Body incompleto

**Request**
```http
POST /api/v1/auth/login
Content-Type: application/json

{ "username": "docente01" }
```

**Response 400**
```json
{
  "timestamp": "2026-05-11T10:00:00.000Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Required",
  "path": "/api/v1/auth/login"
}
```

---

### Acceso sin token

Cualquier endpoint protegido sin el header `Authorization`.

**Response 401**
```json
{
  "timestamp": "2026-05-11T10:00:00.000Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Token invalido o expirado",
  "path": "/api/v1/exposiciones"
}
```

---

## 2. Materias

> Todos los endpoints requieren rol **docente**.

### GET /materias — Listar (paginado)

**Request**
```http
GET /api/v1/materias?page=0&size=10
Authorization: Bearer <TOKEN_DOCENTE>
```

**Response 200**
```json
{
  "content": [
    { "id_materia": 1, "nombre": "Ingeniería de Software" },
    { "id_materia": 2, "nombre": "Base de Datos" }
  ],
  "totalElements": 2,
  "totalPages": 1,
  "page": 0,
  "size": 10
}
```

---

### GET /materias/:id — Obtener una

**Request**
```http
GET /api/v1/materias/1
Authorization: Bearer <TOKEN_DOCENTE>
```

**Response 200**
```json
{ "id_materia": 1, "nombre": "Ingeniería de Software" }
```

---

### GET /materias/9999 — No existe

**Response 404**
```json
{
  "timestamp": "2026-05-11T10:00:00.000Z",
  "status": 404,
  "error": "Not Found",
  "message": "El recurso solicitado no existe",
  "path": "/api/v1/materias/9999"
}
```

---

### POST /materias — Crear

**Request**
```http
POST /api/v1/materias
Authorization: Bearer <TOKEN_DOCENTE>
Content-Type: application/json

{ "nombre": "Arquitecturas de Software" }
```

**Response 201**
```json
{ "id_materia": 3, "nombre": "Arquitecturas de Software" }
```

---

### POST /materias — Nombre demasiado corto

**Request body:** `{ "nombre": "AB" }`

**Response 400**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "String must contain at least 3 character(s)",
  "path": "/api/v1/materias"
}
```

---

### PUT /materias/:id — Actualizar

**Request**
```http
PUT /api/v1/materias/3
Authorization: Bearer <TOKEN_DOCENTE>
Content-Type: application/json

{ "nombre": "Arquitecturas de Software Avanzadas" }
```

**Response 200**
```json
{ "id_materia": 3, "nombre": "Arquitecturas de Software Avanzadas" }
```

---

### DELETE /materias/:id — Eliminar

**Request**
```http
DELETE /api/v1/materias/3
Authorization: Bearer <TOKEN_DOCENTE>
```

**Response 204** *(sin cuerpo)*

---

## 3. Rúbricas

> Requieren rol **docente**.

### GET /rubricas — Listar

**Response 200**
```json
{
  "content": [
    { "id_rubrica": 1, "id_materia": 1, "nombre": "Rúbrica IS 2025" }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "page": 0,
  "size": 10
}
```

---

### POST /rubricas — Crear

**Request**
```http
POST /api/v1/rubricas
Authorization: Bearer <TOKEN_DOCENTE>
Content-Type: application/json

{ "id_materia": 1, "nombre": "Rúbrica IS 2025" }
```

**Response 201**
```json
{ "id_rubrica": 1, "id_materia": 1, "nombre": "Rúbrica IS 2025" }
```

---

### POST /rubricas — Materia inexistente

**Request body:** `{ "id_materia": 9999, "nombre": "Rúbrica X" }`

**Response 400**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "La materia con id 9999 no existe",
  "path": "/api/v1/rubricas"
}
```

---

### PUT /rubricas/:id — Actualizar

**Request**
```http
PUT /api/v1/rubricas/1
Authorization: Bearer <TOKEN_DOCENTE>
Content-Type: application/json

{ "id_materia": 1, "nombre": "Rúbrica IS 2026" }
```

**Response 200**
```json
{ "id_rubrica": 1, "id_materia": 1, "nombre": "Rúbrica IS 2026" }
```

---

### DELETE /rubricas/:id — Eliminar

**Response 204** *(sin cuerpo)*

---

## 4. Criterios

> Los criterios pertenecen a una rúbrica. Base path: `/api/v1/criterios`.

### GET /criterios/rubrica/:id_rubrica — Listar criterios de una rúbrica

**Request**
```http
GET /api/v1/criterios/rubrica/1
Authorization: Bearer <TOKEN_DOCENTE>
```

**Response 200**
```json
[
  { "id_criterio": 1, "id_rubrica": 1, "descripcion": "Claridad expositiva", "ponderacion": 0.4 },
  { "id_criterio": 2, "id_rubrica": 1, "descripcion": "Dominio del tema",    "ponderacion": 0.4 },
  { "id_criterio": 3, "id_rubrica": 1, "descripcion": "Material de apoyo",   "ponderacion": 0.2 }
]
```

---

### GET /criterios/rubrica/9999 — Rúbrica inexistente

**Response 404**

---

### POST /criterios/rubrica/:id_rubrica — Agregar criterio

**Request**
```http
POST /api/v1/criterios/rubrica/1
Authorization: Bearer <TOKEN_DOCENTE>
Content-Type: application/json

{ "descripcion": "Claridad expositiva", "ponderacion": 0.4 }
```

**Response 201**
```json
{ "id_criterio": 1, "id_rubrica": 1, "descripcion": "Claridad expositiva", "ponderacion": 0.4 }
```

---

### POST /criterios/rubrica/:id — Ponderacion fuera de rango

**Request body:** `{ "descripcion": "Criterio X", "ponderacion": 1.5 }`

**Response 400**

---

### GET /criterios/:id — Obtener criterio por ID

**Request**
```http
GET /api/v1/criterios/1
Authorization: Bearer <TOKEN_DOCENTE>
```

**Response 200**
```json
{ "id_criterio": 1, "id_rubrica": 1, "descripcion": "Claridad expositiva", "ponderacion": 0.4 }
```

---

### PUT /criterios/:id — Actualizar criterio

**Request**
```http
PUT /api/v1/criterios/1
Authorization: Bearer <TOKEN_DOCENTE>
Content-Type: application/json

{ "descripcion": "Claridad y fluidez expositiva", "ponderacion": 0.35 }
```

**Response 200**
```json
{ "id_criterio": 1, "id_rubrica": 1, "descripcion": "Claridad y fluidez expositiva", "ponderacion": 0.35 }
```

---

### DELETE /criterios/:id — Eliminar criterio

**Response 204** *(sin cuerpo)*

---

## 5. Grupos

> Requieren rol **docente**.

### GET /grupos — Listar

**Response 200**
```json
{
  "content": [
    { "id_grupo": 1, "id_materia": 1, "nombre_grupo": "IS-A 2025" }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "page": 0,
  "size": 10
}
```

---

### POST /grupos — Crear

**Request**
```http
POST /api/v1/grupos
Authorization: Bearer <TOKEN_DOCENTE>
Content-Type: application/json

{ "id_materia": 1, "nombre_grupo": "IS-A 2025" }
```

**Response 201**
```json
{ "id_grupo": 1, "id_materia": 1, "nombre_grupo": "IS-A 2025" }
```

---

### POST /grupos — Materia inexistente

**Response 400**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "La materia con id 9999 no existe",
  "path": "/api/v1/grupos"
}
```

---

### PUT /grupos/:id — Actualizar

**Request body:** `{ "id_materia": 1, "nombre_grupo": "IS-B 2025" }`

**Response 200**

---

### DELETE /grupos/:id — Eliminar

**Response 204**

---

## 6. Alumnos

> Requieren rol **docente**. La creación genera credenciales automáticas (RN11).

### GET /alumnos — Listar

**Response 200**
```json
{
  "content": [
    {
      "id_alumno": 1,
      "id_usuario": 5,
      "id_grupo": 1,
      "id_equipo": 2,
      "nombre": "Ana",
      "apellido": "García",
      "matricula": "21031001"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "page": 0,
  "size": 10
}
```

---

### POST /alumnos — Crear alumno (genera credenciales automáticas)

**Request**
```http
POST /api/v1/alumnos
Authorization: Bearer <TOKEN_DOCENTE>
Content-Type: application/json

{
  "nombre": "Ana",
  "apellido": "García",
  "matricula": "21031001",
  "id_grupo": 1,
  "id_equipo": 2
}
```

**Response 201**

> La contraseña temporal solo se devuelve en la creación. No hay forma de recuperarla después.

```json
{
  "id_alumno": 1,
  "id_usuario": 5,
  "id_grupo": 1,
  "id_equipo": 2,
  "nombre": "Ana",
  "apellido": "García",
  "matricula": "21031001",
  "credenciales": {
    "username": "garc1001@dominio.edu.mx",
    "password_temporal": "garc1001"
  }
}
```

**Regla RN11 — generación de credenciales:**
- `username` = primeras 4 letras del apellido (minúsculas) + últimos 4 dígitos de la matrícula + `@dominio`
- `password_temporal` = primeras 4 letras del apellido (minúsculas) + últimos 4 dígitos de la matrícula

| apellido | matricula | username generado | password temporal |
|---|---|---|---|
| García | 21031001 | garc1001@... | garc1001 |
| Hernández | 21030042 | hern0042@... | hern0042 |
| Li | 21030099 | li990099@... | li990099 |

---

### POST /alumnos — Grupo inexistente

**Response 400**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "El grupo con id 9999 no existe",
  "path": "/api/v1/alumnos"
}
```

---

### POST /alumnos — Equipo inexistente

**Response 400**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "El equipo con id 9999 no existe",
  "path": "/api/v1/alumnos"
}
```

---

### PUT /alumnos/:id — Actualizar alumno

Si cambia la matrícula, el `username` en `usuarios` se actualiza automáticamente.

**Request**
```http
PUT /api/v1/alumnos/1
Authorization: Bearer <TOKEN_DOCENTE>
Content-Type: application/json

{
  "nombre": "Ana Lucía",
  "apellido": "García",
  "matricula": "21031001",
  "id_grupo": 1,
  "id_equipo": 2
}
```

**Response 200** *(sin campo `credenciales`)*
```json
{
  "id_alumno": 1,
  "id_usuario": 5,
  "id_grupo": 1,
  "id_equipo": 2,
  "nombre": "Ana Lucía",
  "apellido": "García",
  "matricula": "21031001"
}
```

---

### DELETE /alumnos/:id — Eliminar alumno

Elimina también el usuario asociado.

**Response 204**

---

## 7. Equipos

> Requieren rol **docente**.

### GET /equipos — Listar

**Response 200**
```json
{
  "content": [
    { "id_equipo": 1, "id_grupo": 1, "nombre_equipo": "Equipo Alpha" },
    { "id_equipo": 2, "id_grupo": 1, "nombre_equipo": "Equipo Beta" }
  ],
  "totalElements": 2,
  "totalPages": 1,
  "page": 0,
  "size": 10
}
```

---

### POST /equipos — Crear

**Request**
```http
POST /api/v1/equipos
Authorization: Bearer <TOKEN_DOCENTE>
Content-Type: application/json

{ "id_grupo": 1, "nombre_equipo": "Equipo Alpha" }
```

**Response 201**
```json
{ "id_equipo": 1, "id_grupo": 1, "nombre_equipo": "Equipo Alpha" }
```

---

### POST /equipos — Grupo inexistente

**Response 400**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "El grupo con id 9999 no existe",
  "path": "/api/v1/equipos"
}
```

---

### PUT /equipos/:id — Actualizar

**Request body:** `{ "id_grupo": 1, "nombre_equipo": "Equipo Alpha v2" }`

**Response 200**

---

### DELETE /equipos/:id — Eliminar

**Response 204**

---

## 8. Exposiciones

### GET /exposiciones — Listar (docente: todas)

El docente ve todas las exposiciones sin importar su estado.

**Request**
```http
GET /api/v1/exposiciones?page=0&size=10
Authorization: Bearer <TOKEN_DOCENTE>
```

**Response 200**
```json
{
  "content": [
    {
      "id_exposicion": 1,
      "id_equipo": 1,
      "tema": "Microservicios con Node.js",
      "fecha": "2026-06-10",
      "estado": "activa",
      "minutos_ventana": 10
    },
    {
      "id_exposicion": 2,
      "id_equipo": 2,
      "tema": "Patrones de Diseño",
      "fecha": "2026-06-17",
      "estado": "pendiente",
      "minutos_ventana": null
    }
  ],
  "totalElements": 2,
  "totalPages": 1,
  "page": 0,
  "size": 10
}
```

---

### GET /exposiciones — Listar (alumno: solo activas de otros equipos)

El alumno solo ve exposiciones con `estado: "activa"` de equipos de su mismo grupo, **excluyendo su propio equipo** (RN08). El objeto retornado no incluye datos anidados del equipo.

**Request**
```http
GET /api/v1/exposiciones
Authorization: Bearer <TOKEN_ALUMNO>
```

**Response 200**
```json
{
  "content": [
    {
      "id_exposicion": 1,
      "id_equipo": 1,
      "tema": "Microservicios con Node.js",
      "fecha": "2026-06-10",
      "estado": "activa",
      "minutos_ventana": 10
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "page": 0,
  "size": 10
}
```

> Si el alumno es el único equipo del grupo, o todos los demás equipos no tienen exposiciones activas, `content` será `[]`.

---

### POST /exposiciones — Crear

**Request**
```http
POST /api/v1/exposiciones
Authorization: Bearer <TOKEN_DOCENTE>
Content-Type: application/json

{
  "id_equipo": 2,
  "tema": "Patrones de Diseño",
  "fecha": "2026-06-17"
}
```

**Response 201**
```json
{
  "id_exposicion": 2,
  "id_equipo": 2,
  "tema": "Patrones de Diseño",
  "fecha": "2026-06-17",
  "estado": "pendiente",
  "minutos_ventana": null
}
```

---

### POST /exposiciones — Equipo inexistente

**Response 400**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "El equipo con id 9999 no existe",
  "path": "/api/v1/exposiciones"
}
```

---

### POST /exposiciones — Fecha con formato inválido

**Request body:** `{ "id_equipo": 1, "tema": "Test", "fecha": "17/06/2026" }`

**Response 400** — la fecha debe tener formato `YYYY-MM-DD`

---

### PUT /exposiciones/:id — Actualizar (solo estado pendiente)

**Request**
```http
PUT /api/v1/exposiciones/2
Authorization: Bearer <TOKEN_DOCENTE>
Content-Type: application/json

{
  "id_equipo": 2,
  "tema": "Patrones de Diseño GoF",
  "fecha": "2026-06-17"
}
```

**Response 200**

---

### PUT /exposiciones/:id — Intentar modificar una exposición activa o cerrada

**Response 403**
```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Solo se pueden modificar exposiciones en estado pendiente",
  "path": "/api/v1/exposiciones/1"
}
```

---

### DELETE /exposiciones/:id — Eliminar (solo estado pendiente)

**Response 204**

---

### DELETE /exposiciones/:id — Intentar eliminar una no pendiente

**Response 403**
```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Solo se pueden eliminar exposiciones en estado pendiente",
  "path": "/api/v1/exposiciones/1"
}
```

---

### POST /exposiciones/:id/habilitar — Habilitar exposición

Cambia el estado a `activa` y genera permisos de evaluación para todos los alumnos del grupo, **excepto los del equipo expositor** (RN08).

`minutos_ventana` acepta únicamente `10` o `15`.

**Request**
```http
POST /api/v1/exposiciones/2/habilitar
Authorization: Bearer <TOKEN_DOCENTE>
Content-Type: application/json

{ "minutos_ventana": 10 }
```

**Response 200**
```json
{
  "id_exposicion": 2,
  "id_equipo": 2,
  "tema": "Patrones de Diseño GoF",
  "fecha": "2026-06-17",
  "estado": "activa",
  "minutos_ventana": 10
}
```

---

### POST /exposiciones/:id/habilitar — Valor de ventana inválido

**Request body:** `{ "minutos_ventana": 20 }`

**Response 400**

---

### POST /exposiciones/:id/habilitar — Exposición ya activa o cerrada

**Response 403**
```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Solo se pueden habilitar exposiciones en estado pendiente",
  "path": "/api/v1/exposiciones/2/habilitar"
}
```

---

### POST /exposiciones/:id/cerrar — Cerrar con captcha

No requiere validación adicional en el backend.

**Request**
```http
POST /api/v1/exposiciones/2/cerrar
Authorization: Bearer <TOKEN_DOCENTE>
Content-Type: application/json

{ "metodo": "captcha" }
```

**Response 200**
```json
{
  "id_exposicion": 2,
  "estado": "cerrada",
  ...
}
```

---

### POST /exposiciones/:id/cerrar — Cerrar con password correcto

**Request**
```http
POST /api/v1/exposiciones/2/cerrar
Authorization: Bearer <TOKEN_DOCENTE>
Content-Type: application/json

{
  "metodo": "password",
  "password_confirmacion": "secreta123"
}
```

**Response 200**

---

### POST /exposiciones/:id/cerrar — Password incorrecto

**Response 403**
```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Password de confirmacion incorrecto",
  "path": "/api/v1/exposiciones/2/cerrar"
}
```

---

### POST /exposiciones/:id/cerrar — Método password sin `password_confirmacion`

**Request body:** `{ "metodo": "password" }`

**Response 400**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "password_confirmacion es requerido cuando metodo es password",
  "path": "/api/v1/exposiciones/2/cerrar"
}
```

---

## 9. Permisos de Evaluación

> Solo accesibles por el rol **docente**.

### GET /permisos/exposicion/:id_exposicion — Listar permisos

Devuelve todos los permisos generados para una exposición, con el estado actual de cada alumno.

**Request**
```http
GET /api/v1/permisos/exposicion/2
Authorization: Bearer <TOKEN_DOCENTE>
```

**Response 200**
```json
[
  {
    "id_permiso": 1,
    "id_alumno": 1,
    "id_exposicion": 2,
    "habilitado": true,
    "evaluado": false,
    "fecha_apertura": "2026-06-17T09:00:00.000Z",
    "fecha_cierre": "2026-06-17T09:10:00.000Z"
  },
  {
    "id_permiso": 2,
    "id_alumno": 3,
    "id_exposicion": 2,
    "habilitado": true,
    "evaluado": true,
    "fecha_apertura": "2026-06-17T09:00:00.000Z",
    "fecha_cierre": "2026-06-17T09:10:00.000Z"
  }
]
```

---

### GET /permisos/exposicion/:id — Exposición inexistente

**Response 404**

---

### PATCH /permisos/:id/reabrir — Reabrir ventana de evaluación

Permite extender la ventana para un alumno que aún no ha evaluado. Genera nuevas `fecha_apertura` y `fecha_cierre`.

**Request**
```http
PATCH /api/v1/permisos/1/reabrir
Authorization: Bearer <TOKEN_DOCENTE>
Content-Type: application/json

{ "minutos_ventana": 15 }
```

**Response 200**
```json
{
  "id_permiso": 1,
  "id_alumno": 1,
  "id_exposicion": 2,
  "habilitado": true,
  "evaluado": false,
  "fecha_apertura": "2026-06-17T09:15:00.000Z",
  "fecha_cierre": "2026-06-17T09:30:00.000Z"
}
```

---

### PATCH /permisos/:id/reabrir — Alumno ya evaluó

No se puede reabrir un permiso de un alumno que ya completó su evaluación.

**Response 409**
```json
{
  "status": 409,
  "error": "Conflict",
  "message": "El alumno ya ha evaluado esta exposicion y el permiso no puede reabrirse",
  "path": "/api/v1/permisos/2/reabrir"
}
```

---

### PATCH /permisos/:id/reabrir — Permiso inexistente

**Response 404**

---

## 10. Evaluaciones

### POST /evaluaciones — Registrar evaluación

Solo disponible para el rol **alumno**. Se validan las nueve reglas de negocio (RN09) en orden estricto.

**Request**
```http
POST /api/v1/evaluaciones
Authorization: Bearer <TOKEN_ALUMNO>
Content-Type: application/json

{
  "id_exposicion": 2,
  "detalles": [
    { "id_criterio": 1, "calificacion": 9.0 },
    { "id_criterio": 2, "calificacion": 8.5 },
    { "id_criterio": 3, "calificacion": 7.0 }
  ]
}
```

**Response 201**
```json
{
  "id_evaluacion": 1,
  "id_alumno": 1,
  "id_exposicion": 2,
  "promedio": 8.5
}
```

> **Cálculo del promedio (RN12):**  
> Con ponderaciones `0.4`, `0.4`, `0.2`:  
> `(9.0×0.4 + 8.5×0.4 + 7.0×0.2) / (0.4+0.4+0.2) = (3.6+3.4+1.4)/1.0 = 8.4`

---

### POST /evaluaciones — Docente intenta evaluar

Los docentes no pueden registrar evaluaciones.

**Response 403**
```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "No tiene permisos para realizar esta operacion",
  "path": "/api/v1/evaluaciones"
}
```

---

### POST /evaluaciones — Alumno sin permiso para la exposición (RN09-3)

**Response 403**
```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "No tienes permiso para evaluar esta exposicion",
  "path": "/api/v1/evaluaciones"
}
```

---

### POST /evaluaciones — Permiso deshabilitado (RN09-4)

**Response 403**
```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "El permiso de evaluacion no esta habilitado",
  "path": "/api/v1/evaluaciones"
}
```

---

### POST /evaluaciones — Evaluación fuera del día de apertura (RN09-5)

**Response 403**
```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "La evaluacion solo puede realizarse el dia de apertura",
  "path": "/api/v1/evaluaciones"
}
```

---

### POST /evaluaciones — Ventana de tiempo expirada (RN09-6)

**Response 403**
```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "La ventana de evaluacion ha expirado",
  "path": "/api/v1/evaluaciones"
}
```

---

### POST /evaluaciones — Alumno ya evaluó (RN09-7)

Enviar la misma solicitud por segunda vez.

**Response 409**
```json
{
  "status": 409,
  "error": "Conflict",
  "message": "Ya has evaluado esta exposicion",
  "path": "/api/v1/evaluaciones"
}
```

---

### POST /evaluaciones — Alumno pertenece al equipo expositor (RN09-8)

**Response 403**
```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "No puedes evaluar la exposicion de tu propio equipo",
  "path": "/api/v1/evaluaciones"
}
```

---

### POST /evaluaciones — Criterios no coinciden con la rúbrica (RN09-9)

Los `id_criterio` enviados deben coincidir exactamente (ni más ni menos) con los de la rúbrica asociada a la exposición.

**Request body con criterio incorrecto:**
```json
{
  "id_exposicion": 2,
  "detalles": [
    { "id_criterio": 999, "calificacion": 8 }
  ]
}
```

**Response 400**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Los criterios enviados no coinciden con los de la rubrica",
  "path": "/api/v1/evaluaciones"
}
```

---

### POST /evaluaciones — Calificación fuera de rango

**Request body con calificación inválida:**
```json
{
  "id_exposicion": 2,
  "detalles": [
    { "id_criterio": 1, "calificacion": 11 },
    { "id_criterio": 2, "calificacion": 8 },
    { "id_criterio": 3, "calificacion": 7 }
  ]
}
```

**Response 400**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "La calificacion debe estar entre 0 y 10",
  "path": "/api/v1/evaluaciones"
}
```

---

### POST /evaluaciones — Body inválido (sin detalles)

**Request body:** `{ "id_exposicion": 2 }`

**Response 400**

---

### GET /evaluaciones/:id — Obtener evaluación

**Request**
```http
GET /api/v1/evaluaciones/1
Authorization: Bearer <TOKEN_DOCENTE>
```

**Response 200**
```json
{
  "id_evaluacion": 1,
  "id_alumno": 1,
  "id_exposicion": 2,
  "promedio": 8.4
}
```

---

### GET /evaluaciones/:id — No existe

**Response 404**

---

### GET /evaluaciones/exposicion/:id_exposicion — Consultar resultados

Solo disponible para **docentes**. Incluye todas las evaluaciones con sus detalles y el promedio general del grupo.

**Request**
```http
GET /api/v1/evaluaciones/exposicion/2
Authorization: Bearer <TOKEN_DOCENTE>
```

**Response 200**
```json
{
  "id_exposicion": 2,
  "evaluaciones": [
    {
      "id_evaluacion": 1,
      "id_alumno": 1,
      "id_exposicion": 2,
      "promedio": 8.4,
      "detalles": [
        { "id_detalle": 1, "id_evaluacion": 1, "id_criterio": 1, "calificacion": 9.0 },
        { "id_detalle": 2, "id_evaluacion": 1, "id_criterio": 2, "calificacion": 8.5 },
        { "id_detalle": 3, "id_evaluacion": 1, "id_criterio": 3, "calificacion": 7.0 }
      ]
    },
    {
      "id_evaluacion": 2,
      "id_alumno": 3,
      "id_exposicion": 2,
      "promedio": 9.0,
      "detalles": [
        { "id_detalle": 4, "id_evaluacion": 2, "id_criterio": 1, "calificacion": 9.5 },
        { "id_detalle": 5, "id_evaluacion": 2, "id_criterio": 2, "calificacion": 9.0 },
        { "id_detalle": 6, "id_evaluacion": 2, "id_criterio": 3, "calificacion": 8.0 }
      ]
    }
  ],
  "promedio_general": 8.7
}
```

---

### GET /evaluaciones/exposicion/:id — Sin evaluaciones aún

**Response 200**
```json
{
  "id_exposicion": 2,
  "evaluaciones": [],
  "promedio_general": 0
}
```

---

### GET /evaluaciones/exposicion/:id — Exposición inexistente

**Response 404**

---

### GET /evaluaciones/exposicion/:id — Alumno intenta acceder

**Response 403**

---

## 11. Flujo completo de extremo a extremo

El siguiente flujo cubre el ciclo de vida completo de una exposición, desde la configuración inicial hasta la consulta de resultados.

```
1.  POST /auth/login                          → obtener TOKEN_DOCENTE
2.  POST /materias                            → crear materia (id_materia=1)
3.  POST /rubricas                            → crear rúbrica para la materia (id_rubrica=1)
4.  POST /criterios/rubrica/1  (×3)           → agregar 3 criterios con ponderaciones
5.  POST /grupos                              → crear grupo para la materia (id_grupo=1)
6.  POST /equipos  (×2)                       → crear Equipo Alpha (id=1) y Equipo Beta (id=2)
7.  POST /alumnos  (×4)                       → crear alumnos: 2 en Alpha, 2 en Beta
                                                 ↳ guardar credenciales devueltas
8.  POST /auth/login (alumno de Beta)         → obtener TOKEN_ALUMNO
9.  POST /exposiciones                        → crear exposición de Alpha (estado=pendiente)
10. POST /exposiciones/:id/habilitar          → habilitar con minutos_ventana=10
                                                 ↳ se generan permisos para los alumnos de Beta
11. GET  /permisos/exposicion/:id             → docente verifica permisos generados
12. POST /evaluaciones  (alumno 1 de Beta)    → registrar evaluación con calificaciones
13. POST /evaluaciones  (alumno 2 de Beta)    → registrar segunda evaluación
14. GET  /permisos/exposicion/:id             → docente ve 2 alumnos con evaluado=true
15. POST /exposiciones/:id/cerrar             → cerrar con captcha o password
16. GET  /evaluaciones/exposicion/:id         → consultar resultados finales con promedio_general
```

### Casos especiales dentro del flujo

| Paso | Situación | Resultado |
|---|---|---|
| 10 | Habilitar una exposición ya activa | 403 |
| 12 | El alumno del equipo Alpha intenta evaluar la exposición de Alpha | 403 — no puede evaluar su propio equipo |
| 12 | El alumno evalúa fuera del horario de apertura | 403 — ventana expirada |
| 12 | El alumno envía criterios que no pertenecen a la rúbrica | 400 |
| 12 | El alumno envía menos criterios de los requeridos | 400 |
| 13 | El mismo alumno intenta evaluar por segunda vez | 409 |
| 11→ | El docente intenta reabrir el permiso de un alumno que ya evaluó | 409 |
| 11→ | El docente reabre el permiso de un alumno que NO ha evaluado | 200 — nueva ventana activa |
| 9→  | El docente intenta editar la exposición después de habilitarla | 403 |
| 9→  | El docente intenta eliminar la exposición después de habilitarla | 403 |
