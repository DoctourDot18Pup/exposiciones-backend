# SII Lince — Sistema de Coevaluación de Exposiciones

> TecNM · Campus Celaya · Ciclo Ene–Jun 2026

Plataforma web para la **gestión y coevaluación de exposiciones académicas** entre alumnos de un grupo. Los docentes programan exposiciones, habilitan ventanas de evaluación y consultan resultados; los alumnos califican a sus compañeros usando una rúbrica por criterios ponderados.

---

## Índice

- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Requisitos previos](#requisitos-previos)
- [Instalación y configuración](#instalación-y-configuración)
- [Variables de entorno](#variables-de-entorno)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Base de datos](#base-de-datos)
- [Autenticación y roles](#autenticación-y-roles)
- [Referencia de la API](#referencia-de-la-api)
- [Reglas de negocio](#reglas-de-negocio)
- [Formato de errores](#formato-de-errores)
- [Datos de prueba](#datos-de-prueba)
- [Escenarios de uso](#escenarios-de-uso)

---

## Stack tecnológico

| Tecnología | Versión | Rol |
|---|---|---|
| Node.js | 18+ LTS | Runtime |
| Express | 5.x | Framework HTTP |
| Supabase JS Client | 2.x | Acceso a base de datos (PostgreSQL) |
| jsonwebtoken | 9.x | Emisión y verificación de JWT |
| bcrypt | 6.x | Hash de contraseñas |
| Zod | 4.x | Validación de esquemas en controllers |
| dotenv | 17.x | Variables de entorno |
| nodemon | 3.x | Recarga automática en desarrollo |
| **Next.js** | **14.x** | **Frontend (Pages Router)** |
| **React** | **18.x** | **UI del frontend** |
| **Axios** | **1.x** | **Cliente HTTP en el frontend** |

---

## Arquitectura

```
exposiciones-backend/   → API REST · Express.js + Supabase  (puerto 3000)
exposiciones-frontend/  → Interfaz web · Next.js 14          (puerto 3001)
```

```
[Navegador :3001]
      │
      │  /api/v1/*  (proxy Next.js)
      ▼
[Express API :3000]
      │
      │  Supabase JS Client
      ▼
[Supabase · PostgreSQL · cloud]
```

**Flujo de autenticación:**
1. Frontend envía `POST /api/v1/auth/login` con `{ username, password }`.
2. Backend verifica contra Supabase y responde con un JWT firmado.
3. Frontend almacena el token en `localStorage` y lo adjunta en cada petición como `Authorization: Bearer <token>`.

Cada módulo del backend sigue la misma estructura interna:

```
routes.js      → rutas + middlewares de auth/rol
controller.js  → validación Zod, mapeo HTTP ↔ servicio
service.js     → lógica de negocio + consultas Supabase
```

---

## Requisitos previos

- Node.js ≥ 18
- npm ≥ 9
- Proyecto activo en [Supabase](https://supabase.com) con el esquema de tablas creado
- Variables de entorno configuradas (ver sección siguiente)

---

## Instalación y configuración

### Backend

```bash
git clone https://github.com/DoctourDot18Pup/exposiciones-backend.git
cd exposiciones-backend
npm install
cp .env.example .env   # completar con valores reales
npm run dev            # desarrollo (nodemon)
npm start              # producción
```

### Frontend

```bash
cd exposiciones-frontend
npm install
npm run dev            # http://localhost:3001
```

---

## Variables de entorno

Archivo `.env` en la raíz de `exposiciones-backend/`:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto del servidor | `3000` |
| `SUPABASE_URL` | URL del proyecto Supabase | `https://xxxx.supabase.co` |
| `SUPABASE_KEY` | Clave **service_role** de Supabase | `eyJhbGci...` |
| `JWT_SECRET` | Cadena secreta para firmar JWT | Cadena aleatoria larga |
| `JWT_EXPIRES_IN` | Duración del token en segundos | `7200` |
| `INSTITUTIONAL_DOMAIN` | Dominio para usernames de alumnos | `itcelaya.edu.mx` |

> Usa la clave `service_role` (nunca la `anon`) para que el backend opere con permisos completos. No la expongas en el frontend ni en repositorios públicos.

---

## Estructura del proyecto

```
exposiciones-backend/
├── src/
│   ├── config/
│   │   └── supabase.js                  # Inicialización del cliente Supabase
│   ├── middlewares/
│   │   ├── auth.middleware.js            # Verificación JWT y control de roles
│   │   └── errorHandler.middleware.js   # Formato estándar de errores
│   └── modules/
│       ├── auth/                         # M01 — Login
│       ├── materias/                     # M02 — CRUD materias
│       ├── grupos/                       # M03 — CRUD grupos
│       ├── alumnos/                      # M04 — Registro de alumnos
│       ├── equipos/                      # M05 — CRUD equipos
│       ├── rubricas/                     # M06 — CRUD rúbricas y criterios
│       ├── exposiciones/                 # M07 — Gestión de exposiciones
│       ├── permisos/                     # M08 — Permisos de evaluación
│       └── evaluaciones/                # M09 — Coevaluación
├── datos_prueba.sql                     # Script idempotente con datos de prueba
├── index.js                             # Entrada del servidor
├── .env.example
└── package.json
```

---

## Base de datos

### Diagrama de dependencias

```
USUARIOS
   │
   ├──► ALUMNOS ──► GRUPOS ──► MATERIAS ──► RUBRICAS ──► CRITERIOS
   │         │
   │         └──► EQUIPOS ──► EXPOSICIONES
   │                               │
   │                    PERMISOS_EVALUACION
   │                               │
   └────────────────────► EVALUACIONES ──► DETALLE_EVALUACION
```

### Tablas

| Tabla | Columnas clave | Descripción |
|-------|---------------|-------------|
| `usuarios` | `id_usuario`, `username`, `password_hash`, `rol` | Cuentas con rol `docente` o `alumno` |
| `materias` | `id_materia`, `clave_materia`, `nombre_materia` | Asignaturas |
| `grupos` | `id_grupo`, `id_materia`, `nombre_grupo` | Grupos escolares |
| `alumnos` | `id_alumno`, `id_usuario`, `id_grupo`, `id_equipo`, `nombre`, `apellido`, `matricula` | Perfil del alumno |
| `equipos` | `id_equipo`, `id_grupo`, `nombre_equipo` | Equipos de trabajo |
| `exposiciones` | `id_exposicion`, `id_equipo`, `tema`, `fecha`, `estado`, `minutos_ventana` | Exposiciones; estado: `pendiente / activa / cerrada` |
| `rubricas` | `id_rubrica`, `id_materia`, `nombre` | Rúbricas por materia |
| `criterios` | `id_criterio`, `id_rubrica`, `descripcion`, `ponderacion` | Criterios con ponderación (%) |
| `permisos_evaluacion` | `id_permiso`, `id_alumno`, `id_exposicion`, `habilitado`, `fecha_apertura`, `fecha_cierre`, `evaluado` | Permiso individual alumno ↔ exposición |
| `evaluaciones` | `id_evaluacion`, `id_exposicion`, `id_alumno`, `promedio`, `fecha_evaluacion` | Evaluación completa |
| `detalle_evaluacion` | `id_detalle`, `id_evaluacion`, `id_criterio`, `calificacion` | Calificación por criterio |

**Nota sobre `fecha_cierre`:** cuando el docente **reabre** un permiso para un alumno, se establece `fecha_cierre = '2099-12-31T23:59:59Z'` como centinela de "sin restricción de tiempo".

---

## Autenticación y roles

El único endpoint público es `POST /api/v1/auth/login`. Todos los demás requieren:

```
Authorization: Bearer <token>
```

### Obtener token

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "21031401@itcelaya.edu.mx",
  "password": "alumnos"
}
```

**Respuesta 200:**
```json
{
  "token": "eyJhbGci...",
  "usuario": { "id_usuario": 5, "nombre": "Ana", "rol": "alumno" }
}
```

### Roles

| Rol | Descripción |
|-----|-------------|
| `docente` | CRUD completo en catálogos, gestión de exposiciones, consulta de resultados |
| `alumno` | Consulta de exposiciones activas propias y registro de evaluaciones |

---

## Referencia de la API

**Base URL:** `http://localhost:3000/api/v1`

---

### Auth

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| POST | `/auth/login` | No | — | Iniciar sesión |

---

### Materias

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| GET | `/materias` | Sí | cualquiera | Listar (`?page=0&size=10`) |
| POST | `/materias` | Sí | docente | Crear |
| GET | `/materias/:id` | Sí | cualquiera | Obtener por ID |
| PUT | `/materias/:id` | Sí | docente | Actualizar |
| DELETE | `/materias/:id` | Sí | docente | Eliminar |

---

### Grupos

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| GET | `/grupos` | Sí | cualquiera | Listar |
| POST | `/grupos` | Sí | docente | Crear |
| GET | `/grupos/:id` | Sí | cualquiera | Obtener por ID |
| PUT | `/grupos/:id` | Sí | docente | Actualizar |
| DELETE | `/grupos/:id` | Sí | docente | Eliminar |

---

### Alumnos

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| GET | `/alumnos` | Sí | cualquiera | Listar |
| POST | `/alumnos` | Sí | docente | Registrar alumno |
| GET | `/alumnos/:id` | Sí | cualquiera | Obtener por ID |
| PUT | `/alumnos/:id` | Sí | docente | Actualizar |
| DELETE | `/alumnos/:id` | Sí | docente | Eliminar |

---

### Equipos

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| GET | `/equipos` | Sí | cualquiera | Listar |
| POST | `/equipos` | Sí | docente | Crear |
| GET | `/equipos/:id` | Sí | cualquiera | Obtener por ID |
| PUT | `/equipos/:id` | Sí | docente | Actualizar |
| DELETE | `/equipos/:id` | Sí | docente | Eliminar |

---

### Rúbricas y Criterios

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| GET | `/rubricas` | Sí | cualquiera | Listar |
| POST | `/rubricas` | Sí | docente | Crear |
| GET | `/rubricas/:id` | Sí | cualquiera | Obtener por ID |
| PUT | `/rubricas/:id` | Sí | docente | Actualizar |
| DELETE | `/rubricas/:id` | Sí | docente | Eliminar |
| GET | `/rubricas/:id/criterios` | Sí | cualquiera | Listar criterios de la rúbrica |
| POST | `/rubricas/:id/criterios` | Sí | docente | Agregar criterio |
| GET | `/criterios/:id` | Sí | cualquiera | Obtener criterio por ID |
| PUT | `/criterios/:id` | Sí | docente | Actualizar criterio |
| DELETE | `/criterios/:id` | Sí | docente | Eliminar criterio |

---

### Exposiciones

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| GET | `/exposiciones` | Sí | cualquiera | Listar. Docente: todas. Alumno: solo activas con permiso habilitado (incluye `_evaluado`) |
| POST | `/exposiciones` | Sí | docente | Crear en estado `pendiente` |
| GET | `/exposiciones/:id` | Sí | cualquiera | Obtener por ID |
| PUT | `/exposiciones/:id` | Sí | docente | Actualizar (solo estado `pendiente`) |
| DELETE | `/exposiciones/:id` | Sí | docente | Eliminar (solo estado `pendiente`) |
| PATCH | `/exposiciones/:id/habilitar` | Sí | docente | Habilitar: genera permisos y cambia estado a `activa` |
| PATCH | `/exposiciones/:id/cerrar` | Sí | docente | Cerrar con contraseña |

**Body `/habilitar`:**
```json
{ "minutos_ventana": 10 }
```
Valores válidos: `10` o `15`.

**Body `/cerrar`:**
```json
{ "metodo": "password", "password_confirmacion": "docente" }
```

**Campo `_evaluado` (solo alumnos):** `true` si el alumno ya registró su evaluación para esa exposición. Usado por el frontend para mostrar el badge *Evaluada* en lugar del botón *Evaluar →*.

---

### Permisos de evaluación

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| GET | `/permisos/exposicion/:id_exposicion` | Sí | docente | Listar permisos de todos los alumnos para una exposición |
| PATCH | `/permisos/:id/reabrir` | Sí | docente | Reabrir permiso de un alumno (sin restricción de tiempo, RN09.3) |

Reabrir falla con `409` si el alumno ya evaluó (RN01).

---

### Evaluaciones

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| POST | `/evaluaciones` | Sí | alumno | Registrar evaluación |
| GET | `/evaluaciones/:id` | Sí | cualquiera | Obtener por ID |
| GET | `/evaluaciones/exposicion/:id_exposicion` | Sí | docente | Resultados + criterios + detalles de una exposición |

**Body POST `/evaluaciones`:**
```json
{
  "id_exposicion": 3,
  "detalles": [
    { "id_criterio": 1, "calificacion": 9.0 },
    { "id_criterio": 2, "calificacion": 8.5 },
    { "id_criterio": 3, "calificacion": 8.0 },
    { "id_criterio": 4, "calificacion": 7.5 }
  ]
}
```

**Respuesta GET `/evaluaciones/exposicion/:id`:**
```json
{
  "id_exposicion": 3,
  "evaluaciones": [
    {
      "id_evaluacion": 1,
      "id_alumno": 3,
      "promedio": 8.38,
      "detalles": [
        { "id_criterio": 1, "calificacion": 9.0 }
      ]
    }
  ],
  "criterios": {
    "1": { "descripcion": "Dominio del tema", "ponderacion": 30 },
    "2": { "descripcion": "Claridad y estructura", "ponderacion": 25 }
  },
  "promedio_general": 8.38
}
```

---

## Reglas de negocio

| ID | Regla |
|----|-------|
| RN01 | Un permiso no puede reabrirse si el alumno ya evaluó |
| RN02 | Las calificaciones deben estar en el rango [0.0, 10.0] |
| RN03 | Toda evaluación debe incluir exactamente todos los criterios de la rúbrica |
| RN05 | Solo usuarios autenticados acceden a recursos protegidos |
| RN07 | Los recursos inexistentes retornan HTTP 404 |
| RN08 | Los integrantes del equipo expositor no reciben permiso de evaluación |
| RN09 | Una evaluación es válida si, en este orden estricto: (1) token válido, (2) alumno registrado, (3) permiso existente, (4) permiso habilitado, (5) ventana no expirada (omitido si docente reabrió), (6) no ha evaluado ya, (7) no pertenece al equipo expositor, (8) criterios y calificaciones válidos |
| RN09.3 | El docente puede reabrir la ventana de un alumno mientras no haya evaluado; sin restricción de tiempo |
| RN12 | Promedio ponderado: `Σ(calificacion × ponderacion) / Σ(ponderacion)` |
| RN13 | El cierre de una exposición requiere confirmación por contraseña del docente |

---

## Formato de errores

```json
{
  "timestamp": "2026-05-12T23:00:00.000Z",
  "status": 403,
  "error": "Forbidden",
  "message": "No tienes permiso para evaluar esta exposicion",
  "path": "/api/v1/evaluaciones"
}
```

| Código | Cuándo ocurre |
|--------|--------------|
| 400 | Datos inválidos, campo faltante, criterios incorrectos |
| 401 | Token ausente, inválido o expirado |
| 403 | Rol insuficiente o violación de regla de negocio |
| 404 | Recurso inexistente |
| 409 | Duplicado o evaluación repetida |
| 500 | Error inesperado del servidor |

---

## Datos de prueba

Ejecuta `datos_prueba.sql` en el **SQL Editor** de tu proyecto Supabase. El script comienza con un bloque `DELETE` que limpia datos anteriores — es completamente **idempotente**.

```
Docentes (usuario / contraseña):
  mgarcia@itcelaya.edu.mx   / docente
  cmendoza@itcelaya.edu.mx  / docente

Alumnos (matricula@itcelaya.edu.mx / alumnos):
  21031401–04  → 4°A BDA   (Equipo Alpha: 01-02 · Equipo Beta: 03-04)
  21031405–08  → 4°B BDA   (Equipo Delta: 05-06 · Equipo Gamma: 07-08)
  21031409–12  → 4°A POO   (Equipo Lambda: 09-10 · Equipo Sigma: 11-12)
  21031413–16  → 5°A Redes (Equipo Omega: 13-14 · Equipo Theta: 15-16)
```

| Recurso | Cantidad | Detalle |
|---------|----------|---------|
| Materias | 3 | BDA, POO, Redes |
| Grupos | 4 | 4°A BDA, 4°B BDA, 4°A POO, 5°A Redes |
| Docentes | 2 | mgarcia, cmendoza |
| Alumnos | 16 | 4 por grupo, matrícula 21031401–16 |
| Equipos | 8 | 2 por grupo |
| Exposiciones | 6 | Estado `pendiente` — habilitar desde la UI |
| Rúbricas | 3 | Una por materia |
| Criterios | 12 | 4 por rúbrica (ponderaciones suman 100%) |

---

## Escenarios de uso

Los escenarios siguientes describen flujos completos de extremo a extremo. Los actores son un **Docente** (`mgarcia`) y alumnos del grupo **4°A POO** (Equipo Lambda: 21031409, 21031410 · Equipo Sigma: 21031411, 21031412).

---

### Escenario 1 · Configuración inicial del ciclo

**Actor:** Docente  
**Objetivo:** Preparar el sistema antes del primer día de exposiciones

1. Iniciar sesión como `mgarcia@itcelaya.edu.mx` / `docente`.
2. Ir a **Materias** → verificar que `Programación Orientada a Objetos` existe.
3. Ir a **Grupos** → verificar que `4°A - POO` está vinculado a esa materia.
4. Ir a **Alumnos** → verificar que los 4 alumnos del grupo tienen equipo asignado.
5. Ir a **Rúbricas** → verificar que la rúbrica de POO tiene 4 criterios con ponderaciones que suman 100%:
   - Comprensión de conceptos OO: 35%
   - Calidad del código: 30%
   - Respuesta a preguntas: 20%
   - Recursos visuales: 15%

**Resultado esperado:** El sistema está listo para programar exposiciones del grupo.

---

### Escenario 2 · Programar una exposición

**Actor:** Docente  
**Objetivo:** Registrar la exposición del Equipo Sigma

1. Ir a **Exposiciones** → botón **Nueva exposición**.
2. Completar:
   - Tema: `Herencia y polimorfismo en Java`
   - Equipo: `Equipo Sigma`
   - Fecha: `22/05/2026`
3. Guardar.

**Resultado esperado:** La exposición aparece en la lista con estado **pendiente**. El docente puede editarla o eliminarla hasta que la habilite. Los alumnos aún no la ven en su panel.

---

### Escenario 3 · Habilitar la evaluación

**Actor:** Docente  
**Objetivo:** Abrir la ventana de coevaluación el día de la presentación

1. El 22/05/2026, el Equipo Sigma termina su presentación.
2. El docente va a **Exposiciones** → localiza la fila de `Herencia y polimorfismo`.
3. Clic en **Habilitar** → selecciona ventana de **15 minutos** → confirma.
4. El sistema en segundo plano:
   - Cambia el estado de la exposición a **activa**.
   - Crea permisos para los alumnos del grupo **4°A POO** **excepto** los del Equipo Sigma (Valeria y Ricardo, que expusieron).
   - Camila (21031409) y Fernando (21031410) reciben permiso con `fecha_apertura = ahora`, `fecha_cierre = ahora + 15 min`.

**Resultado esperado:**
- El docente ve la exposición como **activa** con el botón de permisos disponible.
- Camila y Fernando ven la exposición en su panel con el botón **Evaluar →** habilitado.
- Valeria y Ricardo (Equipo Sigma) **no ven** la exposición — nunca se les generó permiso (RN08).

---

### Escenario 4 · Alumno registra una evaluación

**Actor:** Camila Reyes (21031409, Equipo Lambda)  
**Objetivo:** Calificar al Equipo Sigma dentro de la ventana

1. Iniciar sesión como `21031409@itcelaya.edu.mx` / `alumnos`.
2. Ir a **Evaluaciones** → tab **Registrar**.
3. En el selector, aparece `Herencia y polimorfismo en Java`.
4. Se cargan los 4 criterios de la rúbrica POO.
5. Ajustar calificaciones: 10.0 / 8.5 / 8.5 / 8.5.
6. El sistema calcula el promedio ponderado en tiempo real:
   ```
   (10.0×35 + 8.5×30 + 8.5×20 + 8.5×15) / 100
   = (350 + 255 + 170 + 127.5) / 100
   = 9.025 ≈ 9.03
   ```
7. Clic en **Enviar evaluación** → `HTTP 201 · Created`.

**Resultado esperado:**
- La evaluación queda registrada con `promedio = 9.03`.
- En el panel de **Exposiciones** de Camila, la fila ahora muestra el badge **Evaluada** en lugar del botón **Evaluar →**.

---

### Escenario 5 · Alumno no evaluó a tiempo — el docente reabre el permiso

**Actor:** Docente + Fernando Díaz (21031410)  
**Objetivo:** Permitir que Fernando evalúe después de expirada la ventana

1. La ventana de 15 minutos expiró. Fernando no pudo evaluar a tiempo.
2. El docente va a **Exposiciones** → clic en el icono de personas de la fila.
3. El modal **Permisos — Herencia y polimorfismo** muestra:
   - Camila Reyes: Habilitado ✓ · Evaluado ✓ · Cierre: 15:30 (ya pasó)
   - Fernando Díaz: Habilitado ✓ · Evaluado ✗ · Cierre: 15:30 (ya pasó)
4. El docente hace clic en **Reabrir** en la fila de Fernando.
5. El sistema actualiza: `habilitado = true`, `fecha_cierre = 2099-12-31` (sin restricción). La columna Cierre muestra el badge **Sin límite**.
6. Fernando inicia sesión → ve la exposición activa → puede enviar su evaluación en cualquier momento.

**Resultado esperado:** Fernando evalúa exitosamente. El modal de permisos actualiza su estado a **Evaluado ✓** al refrescar.

---

### Escenario 6 · Consultar resultados y matriz de evaluación

**Actor:** Docente  
**Objetivo:** Ver el desempeño del Equipo Sigma según las coevaluaciones

1. Ir a **Evaluaciones** → tab **Listado** (o **Resultados**).
2. El sistema muestra la exposición `Herencia y polimorfismo en Java` con:
   - 2 evaluaciones
   - Promedio grupo: 9.03 (si ambos evaluadores dieron la misma calificación)
   - Badge: **Excelente**
3. Clic en **Ver matriz**.
4. Se abre la **Matriz de evaluación**:

```
EVALUADOR        C#9 (35%)   C#10 (30%)   C#11 (20%)   C#12 (15%)   PROMEDIO
Camila Reyes     10.0        8.5          8.5          8.5           9.03
Fernando Díaz     9.0        9.0          8.5          9.0           8.98
─────────────────────────────────────────────────────────────────────────────
Promedio grupo    9.5         8.8          8.5          8.8           9.00
```

**Interpretación del badge de desempeño:**

| Promedio | Badge |
|----------|-------|
| ≥ 9.0 | Excelente |
| ≥ 7.0 | Bueno |
| ≥ 5.0 | Regular |
| < 5.0 | Deficiente |

---

### Escenario 7 · Cerrar una exposición

**Actor:** Docente  
**Objetivo:** Archivar formalmente la exposición y bloquear nuevas evaluaciones

1. Ir a **Exposiciones** → clic en **Cerrar** en la fila de `Herencia y polimorfismo`.
2. El sistema solicita la contraseña del docente como confirmación.
3. Ingresar `docente` → confirmar.
4. El estado cambia a **cerrada**.

**Resultado esperado:** La exposición queda archivada. Ya no acepta evaluaciones. Los botones de Habilitar y Cerrar desaparecen de la interfaz.

---

### Escenario 8 (negativo) · Alumno intenta evaluar su propio equipo

**Actor:** Valeria González (21031411, Equipo Sigma)  
**Objetivo:** Verificar que el sistema bloquea la autoevaluación

1. Valeria inicia sesión el día de la exposición de su propio equipo.
2. En **Evaluaciones** → **Registrar**, la exposición `Herencia y polimorfismo` **no aparece** en el selector — nunca se creó su permiso (RN08).
3. Si intenta la petición directamente a la API:
   ```
   HTTP 403 · No puedes evaluar la exposicion de tu propio equipo
   ```

**Resultado esperado:** La autoevaluación queda bloqueada a nivel de interfaz y de API.

---

### Escenario 9 (negativo) · Alumno intenta evaluar dos veces

**Actor:** Camila Reyes (ya evaluó)  
**Objetivo:** Verificar que el sistema impide evaluaciones duplicadas

1. Camila ya evaluó exitosamente.
2. En su panel de **Exposiciones**, el botón **Evaluar →** ha sido reemplazado por el badge **Evaluada**.
3. Si intenta enviar la petición directamente a la API:
   ```
   HTTP 409 · Ya has evaluado esta exposicion
   ```
4. Si el docente intenta reabrir su permiso:
   ```
   HTTP 409 · El alumno ya ha evaluado esta exposicion y el permiso no puede reabrirse
   ```

**Resultado esperado:** La integridad de los datos queda garantizada en UI y en API.

---

### Escenario 10 (negativo) · Envío fuera de la ventana de tiempo

**Actor:** Fernando Díaz (permiso normal, no reabierto)  
**Objetivo:** Verificar que la ventana de tiempo se respeta

1. La ventana expiró a las 15:30. Fernando intenta evaluar a las 15:45.
2. El sistema responde:
   ```
   HTTP 403 · La ventana de evaluacion ha expirado
   ```
3. El docente debe **Reabrir** el permiso de Fernando para que pueda evaluar (ver Escenario 5).

**Resultado esperado:** El sistema rechaza la evaluación fuera de la ventana; el docente tiene el control para habilitarla de nuevo individualmente.
