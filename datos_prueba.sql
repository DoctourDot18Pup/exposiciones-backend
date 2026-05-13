-- ============================================================
-- DATOS DE PRUEBA — SII Lince · TecNM Celaya
-- ============================================================
-- Contraseña docentes : docente
-- Contraseña alumnos  : alumnos
--
-- Ejecutar completo en el SQL Editor de Supabase.
-- Limpia y recrea todos los datos de prueba desde cero.
-- ============================================================


-- ─── 0. LIMPIEZA (elimina datos de prueba anteriores) ────────────────────────
DELETE FROM criterios   WHERE id_rubrica  IN (SELECT id_rubrica FROM rubricas WHERE nombre LIKE 'Rúbrica de Exposición Técnica%');
DELETE FROM rubricas    WHERE nombre      LIKE 'Rúbrica de Exposición Técnica%';
DELETE FROM exposiciones WHERE tema IN (
  'Diseño de esquemas ER y normalización',
  'Optimización de consultas SQL avanzadas',
  'Herencia y polimorfismo en Java',
  'Protocolo TCP/IP y modelo OSI',
  'Transacciones y control de concurrencia en SQL',
  'Patrones de diseño: Factory y Singleton'
);
DELETE FROM alumnos  WHERE matricula BETWEEN '21031401' AND '21031416';
DELETE FROM usuarios WHERE username  LIKE '2103140%@itcelaya.edu.mx';
DELETE FROM equipos  WHERE nombre_equipo IN ('Equipo Alpha','Equipo Beta','Equipo Delta','Equipo Gamma','Equipo Lambda','Equipo Sigma','Equipo Omega','Equipo Theta');
DELETE FROM grupos   WHERE nombre_grupo  IN ('4°A - Bases de Datos','4°B - Bases de Datos','4°A - POO','5°A - Redes');
DELETE FROM materias WHERE clave_materia IN ('ISC-BDA','ISC-POO','ISC-RDC');
DELETE FROM usuarios WHERE username      IN ('mgarcia@itcelaya.edu.mx','cmendoza@itcelaya.edu.mx');


-- ─── 1. MATERIAS ─────────────────────────────────────────────────────────────
INSERT INTO materias (clave_materia, nombre_materia) VALUES
  ('ISC-BDA', 'Bases de Datos'),
  ('ISC-POO', 'Programación Orientada a Objetos'),
  ('ISC-RDC', 'Redes de Computadoras');


-- ─── 2. GRUPOS ───────────────────────────────────────────────────────────────
INSERT INTO grupos (nombre_grupo, id_materia) VALUES
  ('4°A - Bases de Datos', (SELECT id_materia FROM materias WHERE clave_materia = 'ISC-BDA' LIMIT 1)),
  ('4°B - Bases de Datos', (SELECT id_materia FROM materias WHERE clave_materia = 'ISC-BDA' LIMIT 1)),
  ('4°A - POO',            (SELECT id_materia FROM materias WHERE clave_materia = 'ISC-POO' LIMIT 1)),
  ('5°A - Redes',          (SELECT id_materia FROM materias WHERE clave_materia = 'ISC-RDC' LIMIT 1));


-- ─── 3. DOCENTES ─────────────────────────────────────────────────────────────
INSERT INTO usuarios (username, password_hash, rol) VALUES
  ('mgarcia@itcelaya.edu.mx',  '$2b$10$0.IyOwFCqp.Ll1/xOqmWi..X2thJ3gxv6UNmQJUU1EUqJjCm/LLWO', 'docente'),
  ('cmendoza@itcelaya.edu.mx', '$2b$10$0.IyOwFCqp.Ll1/xOqmWi..X2thJ3gxv6UNmQJUU1EUqJjCm/LLWO', 'docente');


-- ─── 4. ALUMNOS ──────────────────────────────────────────────────────────────
DO $$
DECLARE
  g1  int := (SELECT id_grupo FROM grupos WHERE nombre_grupo = '4°A - Bases de Datos' LIMIT 1);
  g2  int := (SELECT id_grupo FROM grupos WHERE nombre_grupo = '4°B - Bases de Datos' LIMIT 1);
  g3  int := (SELECT id_grupo FROM grupos WHERE nombre_grupo = '4°A - POO'            LIMIT 1);
  g4  int := (SELECT id_grupo FROM grupos WHERE nombre_grupo = '5°A - Redes'          LIMIT 1);
  h   text := '$2b$10$oLKAN29oZh.QcmQTfSwGNuwPmcN.lbzxl8qA94no285/FwAF9DKOm';
  uid int;
BEGIN

  -- Grupo 1: 4°A Bases de Datos
  INSERT INTO usuarios (username, password_hash, rol) VALUES ('21031401@itcelaya.edu.mx', h, 'alumno') RETURNING id_usuario INTO uid;
  INSERT INTO alumnos  (nombre, apellido, matricula, id_grupo, id_usuario) VALUES ('Ana',       'Torres',   '21031401', g1, uid);

  INSERT INTO usuarios (username, password_hash, rol) VALUES ('21031402@itcelaya.edu.mx', h, 'alumno') RETURNING id_usuario INTO uid;
  INSERT INTO alumnos  (nombre, apellido, matricula, id_grupo, id_usuario) VALUES ('Luis',      'Ramírez',  '21031402', g1, uid);

  INSERT INTO usuarios (username, password_hash, rol) VALUES ('21031403@itcelaya.edu.mx', h, 'alumno') RETURNING id_usuario INTO uid;
  INSERT INTO alumnos  (nombre, apellido, matricula, id_grupo, id_usuario) VALUES ('Sofía',     'Herrera',  '21031403', g1, uid);

  INSERT INTO usuarios (username, password_hash, rol) VALUES ('21031404@itcelaya.edu.mx', h, 'alumno') RETURNING id_usuario INTO uid;
  INSERT INTO alumnos  (nombre, apellido, matricula, id_grupo, id_usuario) VALUES ('Diego',     'Castro',   '21031404', g1, uid);

  -- Grupo 2: 4°B Bases de Datos
  INSERT INTO usuarios (username, password_hash, rol) VALUES ('21031405@itcelaya.edu.mx', h, 'alumno') RETURNING id_usuario INTO uid;
  INSERT INTO alumnos  (nombre, apellido, matricula, id_grupo, id_usuario) VALUES ('Valentina', 'López',    '21031405', g2, uid);

  INSERT INTO usuarios (username, password_hash, rol) VALUES ('21031406@itcelaya.edu.mx', h, 'alumno') RETURNING id_usuario INTO uid;
  INSERT INTO alumnos  (nombre, apellido, matricula, id_grupo, id_usuario) VALUES ('Emilio',    'Sánchez',  '21031406', g2, uid);

  INSERT INTO usuarios (username, password_hash, rol) VALUES ('21031407@itcelaya.edu.mx', h, 'alumno') RETURNING id_usuario INTO uid;
  INSERT INTO alumnos  (nombre, apellido, matricula, id_grupo, id_usuario) VALUES ('Isabella',  'Morales',  '21031407', g2, uid);

  INSERT INTO usuarios (username, password_hash, rol) VALUES ('21031408@itcelaya.edu.mx', h, 'alumno') RETURNING id_usuario INTO uid;
  INSERT INTO alumnos  (nombre, apellido, matricula, id_grupo, id_usuario) VALUES ('Andrés',    'Jiménez',  '21031408', g2, uid);

  -- Grupo 3: 4°A POO
  INSERT INTO usuarios (username, password_hash, rol) VALUES ('21031409@itcelaya.edu.mx', h, 'alumno') RETURNING id_usuario INTO uid;
  INSERT INTO alumnos  (nombre, apellido, matricula, id_grupo, id_usuario) VALUES ('Camila',    'Reyes',    '21031409', g3, uid);

  INSERT INTO usuarios (username, password_hash, rol) VALUES ('21031410@itcelaya.edu.mx', h, 'alumno') RETURNING id_usuario INTO uid;
  INSERT INTO alumnos  (nombre, apellido, matricula, id_grupo, id_usuario) VALUES ('Fernando',  'Díaz',     '21031410', g3, uid);

  INSERT INTO usuarios (username, password_hash, rol) VALUES ('21031411@itcelaya.edu.mx', h, 'alumno') RETURNING id_usuario INTO uid;
  INSERT INTO alumnos  (nombre, apellido, matricula, id_grupo, id_usuario) VALUES ('Valeria',   'González', '21031411', g3, uid);

  INSERT INTO usuarios (username, password_hash, rol) VALUES ('21031412@itcelaya.edu.mx', h, 'alumno') RETURNING id_usuario INTO uid;
  INSERT INTO alumnos  (nombre, apellido, matricula, id_grupo, id_usuario) VALUES ('Ricardo',   'Vargas',   '21031412', g3, uid);

  -- Grupo 4: 5°A Redes
  INSERT INTO usuarios (username, password_hash, rol) VALUES ('21031413@itcelaya.edu.mx', h, 'alumno') RETURNING id_usuario INTO uid;
  INSERT INTO alumnos  (nombre, apellido, matricula, id_grupo, id_usuario) VALUES ('María',     'Flores',   '21031413', g4, uid);

  INSERT INTO usuarios (username, password_hash, rol) VALUES ('21031414@itcelaya.edu.mx', h, 'alumno') RETURNING id_usuario INTO uid;
  INSERT INTO alumnos  (nombre, apellido, matricula, id_grupo, id_usuario) VALUES ('Pablo',     'Ortega',   '21031414', g4, uid);

  INSERT INTO usuarios (username, password_hash, rol) VALUES ('21031415@itcelaya.edu.mx', h, 'alumno') RETURNING id_usuario INTO uid;
  INSERT INTO alumnos  (nombre, apellido, matricula, id_grupo, id_usuario) VALUES ('Laura',     'Medina',   '21031415', g4, uid);

  INSERT INTO usuarios (username, password_hash, rol) VALUES ('21031416@itcelaya.edu.mx', h, 'alumno') RETURNING id_usuario INTO uid;
  INSERT INTO alumnos  (nombre, apellido, matricula, id_grupo, id_usuario) VALUES ('Carlos',    'Rojas',    '21031416', g4, uid);

END $$;


-- ─── 5. EQUIPOS ──────────────────────────────────────────────────────────────
INSERT INTO equipos (nombre_equipo, id_grupo) VALUES
  ('Equipo Alpha',  (SELECT id_grupo FROM grupos WHERE nombre_grupo = '4°A - Bases de Datos' LIMIT 1)),
  ('Equipo Beta',   (SELECT id_grupo FROM grupos WHERE nombre_grupo = '4°A - Bases de Datos' LIMIT 1)),
  ('Equipo Delta',  (SELECT id_grupo FROM grupos WHERE nombre_grupo = '4°B - Bases de Datos' LIMIT 1)),
  ('Equipo Gamma',  (SELECT id_grupo FROM grupos WHERE nombre_grupo = '4°B - Bases de Datos' LIMIT 1)),
  ('Equipo Lambda', (SELECT id_grupo FROM grupos WHERE nombre_grupo = '4°A - POO'            LIMIT 1)),
  ('Equipo Sigma',  (SELECT id_grupo FROM grupos WHERE nombre_grupo = '4°A - POO'            LIMIT 1)),
  ('Equipo Omega',  (SELECT id_grupo FROM grupos WHERE nombre_grupo = '5°A - Redes'          LIMIT 1)),
  ('Equipo Theta',  (SELECT id_grupo FROM grupos WHERE nombre_grupo = '5°A - Redes'          LIMIT 1));


-- ─── 6. ASIGNAR ALUMNOS A EQUIPOS ────────────────────────────────────────────
UPDATE alumnos SET id_equipo = (SELECT id_equipo FROM equipos WHERE nombre_equipo = 'Equipo Alpha'  LIMIT 1) WHERE matricula IN ('21031401','21031402');
UPDATE alumnos SET id_equipo = (SELECT id_equipo FROM equipos WHERE nombre_equipo = 'Equipo Beta'   LIMIT 1) WHERE matricula IN ('21031403','21031404');
UPDATE alumnos SET id_equipo = (SELECT id_equipo FROM equipos WHERE nombre_equipo = 'Equipo Delta'  LIMIT 1) WHERE matricula IN ('21031405','21031406');
UPDATE alumnos SET id_equipo = (SELECT id_equipo FROM equipos WHERE nombre_equipo = 'Equipo Gamma'  LIMIT 1) WHERE matricula IN ('21031407','21031408');
UPDATE alumnos SET id_equipo = (SELECT id_equipo FROM equipos WHERE nombre_equipo = 'Equipo Lambda' LIMIT 1) WHERE matricula IN ('21031409','21031410');
UPDATE alumnos SET id_equipo = (SELECT id_equipo FROM equipos WHERE nombre_equipo = 'Equipo Sigma'  LIMIT 1) WHERE matricula IN ('21031411','21031412');
UPDATE alumnos SET id_equipo = (SELECT id_equipo FROM equipos WHERE nombre_equipo = 'Equipo Omega'  LIMIT 1) WHERE matricula IN ('21031413','21031414');
UPDATE alumnos SET id_equipo = (SELECT id_equipo FROM equipos WHERE nombre_equipo = 'Equipo Theta'  LIMIT 1) WHERE matricula IN ('21031415','21031416');


-- ─── 7. EXPOSICIONES (las habilitas desde la UI) ─────────────────────────────
INSERT INTO exposiciones (id_equipo, tema, fecha, estado) VALUES
  ((SELECT id_equipo FROM equipos WHERE nombre_equipo = 'Equipo Alpha'  LIMIT 1), 'Diseño de esquemas ER y normalización',          '2026-05-20', 'pendiente'),
  ((SELECT id_equipo FROM equipos WHERE nombre_equipo = 'Equipo Delta'  LIMIT 1), 'Optimización de consultas SQL avanzadas',         '2026-05-21', 'pendiente'),
  ((SELECT id_equipo FROM equipos WHERE nombre_equipo = 'Equipo Lambda' LIMIT 1), 'Herencia y polimorfismo en Java',                 '2026-05-22', 'pendiente'),
  ((SELECT id_equipo FROM equipos WHERE nombre_equipo = 'Equipo Omega'  LIMIT 1), 'Protocolo TCP/IP y modelo OSI',                   '2026-05-23', 'pendiente'),
  ((SELECT id_equipo FROM equipos WHERE nombre_equipo = 'Equipo Beta'   LIMIT 1), 'Transacciones y control de concurrencia en SQL',  '2026-05-27', 'pendiente'),
  ((SELECT id_equipo FROM equipos WHERE nombre_equipo = 'Equipo Sigma'  LIMIT 1), 'Patrones de diseño: Factory y Singleton',         '2026-05-28', 'pendiente');


-- ─── 8. RÚBRICAS ─────────────────────────────────────────────────────────────
INSERT INTO rubricas (id_materia, nombre) VALUES
  ((SELECT id_materia FROM materias WHERE clave_materia = 'ISC-BDA' LIMIT 1), 'Rúbrica de Exposición Técnica — BDA'),
  ((SELECT id_materia FROM materias WHERE clave_materia = 'ISC-POO' LIMIT 1), 'Rúbrica de Exposición Técnica — POO'),
  ((SELECT id_materia FROM materias WHERE clave_materia = 'ISC-RDC' LIMIT 1), 'Rúbrica de Exposición Técnica — Redes');


-- ─── 9. CRITERIOS ────────────────────────────────────────────────────────────
INSERT INTO criterios (id_rubrica, descripcion, ponderacion)
SELECT id_rubrica, col.descripcion, col.ponderacion::numeric
FROM (SELECT id_rubrica FROM rubricas WHERE nombre = 'Rúbrica de Exposición Técnica — BDA' LIMIT 1) r,
(VALUES
  ('Dominio del tema y fundamentos teóricos', 30),
  ('Claridad y estructura de la exposición',  25),
  ('Uso de ejemplos y casos prácticos',       25),
  ('Manejo del tiempo asignado',              20)
) AS col(descripcion, ponderacion);

INSERT INTO criterios (id_rubrica, descripcion, ponderacion)
SELECT id_rubrica, col.descripcion, col.ponderacion::numeric
FROM (SELECT id_rubrica FROM rubricas WHERE nombre = 'Rúbrica de Exposición Técnica — POO' LIMIT 1) r,
(VALUES
  ('Comprensión de conceptos orientados a objetos', 35),
  ('Calidad y legibilidad del código presentado',   30),
  ('Capacidad de respuesta a preguntas del grupo',  20),
  ('Recursos visuales y apoyo de diagramas',        15)
) AS col(descripcion, ponderacion);

INSERT INTO criterios (id_rubrica, descripcion, ponderacion)
SELECT id_rubrica, col.descripcion, col.ponderacion::numeric
FROM (SELECT id_rubrica FROM rubricas WHERE nombre = 'Rúbrica de Exposición Técnica — Redes' LIMIT 1) r,
(VALUES
  ('Conocimiento de fundamentos de redes', 30),
  ('Precisión en diagramas y topologías',  25),
  ('Relación con casos prácticos reales',  25),
  ('Presentación general y fluidez',       20)
) AS col(descripcion, ponderacion);


-- ─── RESUMEN ─────────────────────────────────────────────────────────────────
-- Docentes (usuario / contraseña):
--   mgarcia@itcelaya.edu.mx  / docente
--   cmendoza@itcelaya.edu.mx / docente
--
-- Alumnos (matricula@itcelaya.edu.mx / alumnos):
--   21031401-04  →  4°A BDA   (Alpha: 01-02 · Beta: 03-04)
--   21031405-08  →  4°B BDA   (Delta: 05-06 · Gamma: 07-08)
--   21031409-12  →  4°A POO   (Lambda: 09-10 · Sigma: 11-12)
--   21031413-16  →  5°A Redes (Omega: 13-14 · Theta: 15-16)
--
-- Exposiciones en estado "pendiente" — habilitarlas desde la UI.
-- ─────────────────────────────────────────────────────────────────────────────
