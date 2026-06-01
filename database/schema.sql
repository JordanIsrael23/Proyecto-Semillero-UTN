-- Habilitar extensión para UUIDs (si no está activa)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. TIPOS ENUMERADOS
-- ----------------------------------------------------------------------------

CREATE TYPE ROL_USUARIO AS ENUM ('admin', 'docente', 'familia');
CREATE TYPE ESTADO_UNIDAD AS ENUM ('borrador', 'activo', 'archivado');
CREATE TYPE TIPO_ACTIVIDAD AS ENUM ('clase', 'casa');
CREATE TYPE RESPUESTA_AUTOEVALUACION AS ENUM ('SI', 'NO', 'EP'); -- EP = En Proceso

-- ----------------------------------------------------------------------------
-- 2. TABLAS DE SEGURIDAD Y PERFILES
-- ----------------------------------------------------------------------------

-- Tabla de Usuarios (Credenciales base)
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cedula VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol ROL_USUARIO NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE usuarios IS 'Credenciales base de acceso al sistema con asignación de roles y cédula de identidad';

-- Tabla de Docentes (Perfil de profesor)
CREATE TABLE docentes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE docentes IS 'Información de perfil de los docentes vinculados a un usuario';

-- Tabla de Familias (Representantes legales / Padres)
CREATE TABLE familias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE familias IS 'Información de los representantes familiares vinculados a un usuario';

-- ----------------------------------------------------------------------------
-- 3. GESTIÓN DE GRUPOS Y ESTUDIANTES
-- ----------------------------------------------------------------------------

-- Tabla de Grupos (Aulas / Semilleros)
CREATE TABLE grupos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL, -- Ej: "Inicial II - Grupo A"
    docente_id UUID NOT NULL REFERENCES docentes(id) ON DELETE RESTRICT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE grupos IS 'Aulas o grupos de educación inicial gestionados por docentes';

-- Tabla de Estudiantes (Niños/as)
CREATE TABLE estudiantes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cedula VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    grupo_id UUID NOT NULL REFERENCES grupos(id) ON DELETE RESTRICT,
    fecha_nacimiento DATE NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE estudiantes IS 'Datos de los menores asignados a cada grupo de estudio con su respectiva cédula';

-- Relación Familias - Estudiantes (N a N para soportar multi-hijo y multi-representante)
CREATE TABLE familia_estudiante (
    familia_id UUID NOT NULL REFERENCES familias(id) ON DELETE CASCADE,
    estudiante_id UUID NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    parentesco VARCHAR(50) NOT NULL, -- Ej: 'Padre', 'Madre', 'Tío/a', 'Representante Legal'
    PRIMARY KEY (familia_id, estudiante_id)
);

COMMENT ON TABLE familia_estudiante IS 'Relación que asocia representantes familiares con uno o más estudiantes';

-- ----------------------------------------------------------------------------
-- 4. PLANIFICACIÓN PEDAGÓGICA (UNIDADES Y ACTIVIDADES)
-- ----------------------------------------------------------------------------

-- Unidades Didácticas (RF-D02)
CREATE TABLE unidades_didacticas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(255) NOT NULL,
    resumen TEXT,
    ambito VARCHAR(255) NOT NULL,
    objetivos_generales TEXT,
    objetivos_aprendizaje TEXT,
    destrezas TEXT,
    semanas_previstas INTEGER NOT NULL DEFAULT 1,
    docente_id UUID NOT NULL REFERENCES docentes(id) ON DELETE RESTRICT,
    estado ESTADO_UNIDAD NOT NULL DEFAULT 'borrador',
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE unidades_didacticas IS 'Planificación curricular realizada por el docente para el aula';

-- Actividades vinculadas a Unidades Didácticas
CREATE TABLE actividades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unidad_id UUID NOT NULL REFERENCES unidades_didacticas(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    tipo TIPO_ACTIVIDAD NOT NULL DEFAULT 'clase', -- clase o casa
    recursos_enlaces JSONB DEFAULT '[]'::jsonb, -- Enlaces a videos, PDFs, láminas, fichas
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE actividades IS 'Actividades y tareas de la unidad pedagógica (incluye recursos en casa)';

-- Seguimiento de Actividades de Casa por Alumno (RF-F04)
CREATE TABLE actividades_casa_seguimiento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actividad_id UUID NOT NULL REFERENCES actividades(id) ON DELETE CASCADE,
    estudiante_id UUID NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    realizada BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_realizacion TIMESTAMP WITH TIME ZONE,
    comentario_familia TEXT,
    nota VARCHAR(20),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE actividades_casa_seguimiento IS 'Registro del avance y comentarios de la familia sobre actividades escolares en casa';

-- ----------------------------------------------------------------------------
-- 5. RÚBRICA COGNITIVA Y EVALUACIONES (RF-D03, RF-D04, RF-D05)
-- ----------------------------------------------------------------------------

-- Criterios de Evaluación Cognitiva (Clasificación, Seriación, etc.)
CREATE TABLE criterios_evaluacion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(20) UNIQUE NOT NULL, -- Ej: 'CLAS', 'SERI', 'CONSC'
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE criterios_evaluacion IS 'Criterios de la rúbrica de desarrollo cognitivo';

-- Niveles de Logro (Iniciado, En Proceso, Logrado)
CREATE TABLE niveles_logro (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(10) UNIQUE NOT NULL, -- Ej: 'I', 'EP', 'L'
    nombre VARCHAR(50) NOT NULL,
    orden INTEGER NOT NULL, -- Para ordenación en gráficas/tablas
    descripcion TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE niveles_logro IS 'Niveles de la rúbrica (Iniciado, En Proceso, Logrado) con orden de escala';

-- Tabla de Evaluaciones de Criterio (Historial y Trazabilidad sin eliminaciones)
-- Se implementa versionamiento: si se edita, se crea una nueva fila con mayor version y se inactiva la anterior.
CREATE TABLE evaluaciones_criterio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estudiante_id UUID NOT NULL REFERENCES estudiantes(id) ON DELETE RESTRICT,
    criterio_id UUID NOT NULL REFERENCES criterios_evaluacion(id) ON DELETE RESTRICT,
    nivel_logro_id UUID NOT NULL REFERENCES niveles_logro(id) ON DELETE RESTRICT,
    unidad_didactica_id UUID NOT NULL REFERENCES unidades_didacticas(id) ON DELETE RESTRICT,
    docente_id UUID NOT NULL REFERENCES docentes(id) ON DELETE RESTRICT,
    observaciones TEXT,
    fecha_evaluacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE evaluaciones_criterio IS 'Evaluaciones cognitivas individuales por criterio con control de versiones (RNF-06)';

-- ----------------------------------------------------------------------------
-- 6. FICHA DE MONITOREO INDIVIDUAL (RF-D06)
-- ----------------------------------------------------------------------------

-- Ficha de Monitoreo consolidada por estudiante
CREATE TABLE fichas_monitoreo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estudiante_id UUID NOT NULL REFERENCES estudiantes(id) ON DELETE RESTRICT,
    docente_id UUID NOT NULL REFERENCES docentes(id) ON DELETE RESTRICT,
    clasificacion TEXT NOT NULL,          -- Descripción cualitativa
    seriacion TEXT NOT NULL,              -- Descripción cualitativa
    asimilacion_acomodacion TEXT NOT NULL, -- Descripción cualitativa
    justificacion_logica TEXT NOT NULL,    -- Descripción cualitativa
    autorregulacion TEXT NOT NULL,         -- Descripción cualitativa
    observaciones TEXT,
    acciones_apoyo TEXT,                  -- Acciones sugeridas para el docente y la familia
    fecha_monitoreo TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE fichas_monitoreo IS 'Fichas de monitoreo individuales completadas por el docente';

-- ----------------------------------------------------------------------------
-- 7. AUTOEVALUACIÓN DOCENTE (RF-D07)
-- ----------------------------------------------------------------------------

-- Autoevaluación del Docente
CREATE TABLE autoevaluaciones_docente (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    docente_id UUID NOT NULL REFERENCES docentes(id) ON DELETE RESTRICT,
    unidad_didactica_id UUID REFERENCES unidades_didacticas(id) ON DELETE CASCADE,
    reflexion TEXT,
    fecha_autoevaluacion DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE autoevaluaciones_docente IS 'Formulario de autoevaluación del docente asociado a una unidad o sesión';

-- Respuestas detalladas para cada una de las 6 preguntas pedagógicas de autoevaluación
CREATE TABLE respuestas_autoevaluacion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    autoevaluacion_id UUID NOT NULL REFERENCES autoevaluaciones_docente(id) ON DELETE CASCADE,
    numero_pregunta INTEGER NOT NULL CHECK (numero_pregunta BETWEEN 1 AND 6),
    respuesta RESPUESTA_AUTOEVALUACION NOT NULL,
    CONSTRAINT unica_pregunta_por_evaluacion UNIQUE (autoevaluacion_id, numero_pregunta)
);

COMMENT ON TABLE respuestas_autoevaluacion IS 'Detalle de respuestas (SI/NO/EP) para las 6 preguntas de autoevaluación';

-- ----------------------------------------------------------------------------
-- 8. ÍNDICES DE RENDIMIENTO (RNF-04)
-- ----------------------------------------------------------------------------

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_cedula ON usuarios(cedula);
CREATE INDEX idx_estudiantes_grupo ON estudiantes(grupo_id);
CREATE INDEX idx_estudiantes_cedula ON estudiantes(cedula);
CREATE INDEX idx_familia_estudiante_estudiante ON familia_estudiante(estudiante_id);
CREATE INDEX idx_actividades_unidad ON actividades(unidad_id);
CREATE INDEX idx_actividades_casa_estudiante ON actividades_casa_seguimiento(estudiante_id);
CREATE INDEX idx_evaluaciones_estudiante_activa ON evaluaciones_criterio(estudiante_id) WHERE activa = TRUE;
CREATE INDEX idx_evaluaciones_criterio_unidad ON evaluaciones_criterio(unidad_didactica_id);
CREATE INDEX idx_fichas_monitoreo_estudiante ON fichas_monitoreo(estudiante_id);
CREATE INDEX idx_respuestas_autoevaluacion_master ON respuestas_autoevaluacion(autoevaluacion_id);


-- ============================================================================
-- DATOS SEMILLA (SEED DATA DEMO)
-- Para realizar pruebas funcionales de los módulos Docente y Familias
-- ============================================================================

-- 1. Insertar Criterios Cognitivos
INSERT INTO criterios_evaluacion (codigo, nombre, descripcion) VALUES
('CLAS', 'Clasificación', 'Capacidad del niño de agrupar objetos según criterios como color, forma o tamaño.'),
('SERI', 'Seriación', 'Capacidad de ordenar elementos siguiendo una secuencia lógica (e.g. de menor a mayor).'),
('CONS', 'Construcción de Conocimiento', 'Capacidad de asimilar y acomodar esquemas a partir del entorno físico y social.'),
('LOGI', 'Pensamiento Lógico', 'Capacidad de justificar lógicamente agrupamientos y relaciones sencillas.'),
('META', 'Metacognición / Autorregulación', 'Capacidad de guiar y evaluar sus propias acciones en actividades guiadas.');

-- 2. Insertar Niveles de Logro
INSERT INTO niveles_logro (codigo, nombre, orden, descripcion) VALUES
('I', 'Iniciado', 1, 'El estudiante requiere asistencia constante para realizar la actividad.'),
('EP', 'En Proceso', 2, 'El estudiante realiza la actividad con apoyo parcial o intermitente.'),
('L', 'Logrado', 3, 'El estudiante realiza la actividad de forma autónoma e independiente.');

-- 3. Insertar Usuarios de Prueba (Contraseña en texto plano para la demo: 'password123', pero implementaremos hashing en registro real)
-- En el sistema real con bcrypt, la contraseña 'password123' se encriptaría. Pero para no romper seeds iniciales, guardamos su hash bcrypt si es posible.
-- El hash bcrypt de 'password123' con un salt de 10 es: $2b$10$sbwmYbQcTq4ygko89s0CX.RnEEUyHWj75Dd6.79NS2mbDuC.Z6nri
INSERT INTO usuarios (id, email, password_hash, rol, cedula) VALUES
('a0000000-0000-0000-0000-000000000001', 'docente.utn@utn.edu.ec', '$2b$10$sbwmYbQcTq4ygko89s0CX.RnEEUyHWj75Dd6.79NS2mbDuC.Z6nri', 'docente', '1000000001'),
('a0000000-0000-0000-0000-000000000002', 'padre.demo@gmail.com', '$2b$10$sbwmYbQcTq4ygko89s0CX.RnEEUyHWj75Dd6.79NS2mbDuC.Z6nri', 'familia', '1000000002'),
('a0000000-0000-0000-0000-000000000003', 'madre.demo@gmail.com', '$2b$10$sbwmYbQcTq4ygko89s0CX.RnEEUyHWj75Dd6.79NS2mbDuC.Z6nri', 'familia', '1000000003');

-- 4. Insertar Perfiles (Docente y Familia)
INSERT INTO docentes (id, usuario_id, nombre, apellido, telefono) VALUES
('d1111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000001', 'Margarita', 'Reascos', '0991234567');

INSERT INTO familias (id, usuario_id, nombre, apellido, telefono) VALUES
('f2222222-2222-2222-2222-222222222222', 'a0000000-0000-0000-0000-000000000002', 'Juan', 'Pérez', '0987654321'),
('f3333333-3333-3333-3333-333333333333', 'a0000000-0000-0000-0000-000000000003', 'Carmen', 'Gómez', '0981112222');

-- 5. Insertar Grupo Demo (Asociado al Docente)
INSERT INTO grupos (id, nombre, docente_id) VALUES
('b4444444-4444-4444-4444-444444444444', 'Inicial II - Semillero "A"', 'd1111111-1111-1111-1111-111111111111');

-- 6. Insertar Estudiantes (Niños/as con su respectiva cédula)
INSERT INTO estudiantes (id, nombre, apellido, grupo_id, fecha_nacimiento, cedula) VALUES
('e5555555-5555-5555-5555-555555555555', 'Mateo', 'Pérez Gómez', 'b4444444-4444-4444-4444-444444444444', '2021-08-15', '1000000004'),
('e6666666-6666-6666-6666-666666666666', 'Sofía', 'Pérez Gómez', 'b4444444-4444-4444-4444-444444444444', '2022-02-10', '1000000005');

-- 7. Asociar Estudiantes con Familias
INSERT INTO familia_estudiante (familia_id, estudiante_id, parentesco) VALUES
('f2222222-2222-2222-2222-222222222222', 'e5555555-5555-5555-5555-555555555555', 'Padre'),
('f2222222-2222-2222-2222-222222222222', 'e6666666-6666-6666-6666-666666666666', 'Padre'),
('f3333333-3333-3333-3333-333333333333', 'e5555555-5555-5555-5555-555555555555', 'Madre'),
('f3333333-3333-3333-3333-333333333333', 'e6666666-6666-6666-6666-666666666666', 'Madre');

-- 8. Insertar Unidad Didáctica de Prueba (Activa)
INSERT INTO unidades_didacticas (id, titulo, resumen, ambito, objetivos_generales, objetivos_aprendizaje, destrezas, semanas_previstas, docente_id, estado) VALUES
('c7777777-7777-7777-7777-777777777777', 
 'Unidad 1: Descubriendo Colores y Seriaciones Simples', 
 'Desarrollo del pensamiento lógico a través de la clasificación y ordenamiento de objetos del entorno cotidiano.', 
 'Relaciones lógico-matemáticas', 
 'Fomentar la asimilación cognitiva mediante agrupamientos guiados.', 
 'Identificar y agrupar objetos por colores y ordenar series de hasta 3 elementos.', 
 'Clasificar objetos cotidianos y ordenar secuencias de tamaño.', 
 2, 
 'd1111111-1111-1111-1111-111111111111', 
 'activo');

-- 9. Insertar Actividades
INSERT INTO actividades (id, unidad_id, titulo, descripcion, tipo, recursos_enlaces) VALUES
('ac111111-1111-1111-1111-111111111111', 
 'c7777777-7777-7777-7777-777777777777', 
 'Clasificación de bloques lógicos', 
 'Actividad grupal donde los niños clasifican bloques de madera por su color y forma en canastas separadas.', 
 'clase', 
 '[]'::jsonb),

('ac222222-2222-2222-2222-222222222222', 
 'c7777777-7777-7777-7777-777777777777', 
 'Jugando a ordenar cucharas en casa', 
 'Pídale a su hijo/a ordenar 3 cucharas de la más pequeña a la más grande en la mesa. Tome una foto o comente el resultado.', 
 'casa', 
 '[{"titulo": "Vídeo Instructivo - Seriación Inicial", "url": "https://www.youtube.com/watch?v=demo123"}, {"titulo": "Ficha Pedagógica PDF", "url": "https://utn.edu.ec/recursos/ficha_seriacion.pdf"}]'::jsonb);

-- 10. Insertar Seguimiento de Actividad en Casa
INSERT INTO actividades_casa_seguimiento (actividad_id, estudiante_id, realizada, fecha_realizacion, comentario_familia) VALUES
('ac222222-2222-2222-2222-222222222222', 'e5555555-5555-5555-5555-555555555555', TRUE, CURRENT_TIMESTAMP - INTERVAL '1 day', 'Mateo logró ordenar las cucharas correctamente. Se divirtió mucho haciéndolo.');

-- 11. Insertar Evaluaciones Iniciales
INSERT INTO evaluaciones_criterio (estudiante_id, criterio_id, nivel_logro_id, unidad_didactica_id, docente_id, observaciones, version, activa) VALUES
('e5555555-5555-5555-5555-555555555555', 
 (SELECT id FROM criterios_evaluacion WHERE codigo='CLAS'), 
 (SELECT id FROM niveles_logro WHERE codigo='EP'), 
 'c7777777-7777-7777-7777-777777777777', 
 'd1111111-1111-1111-1111-111111111111', 
 'Mateo agrupa por color pero a veces mezcla formas.', 
 1, 
 TRUE),

('e5555555-5555-5555-5555-555555555555', 
 (SELECT id FROM criterios_evaluacion WHERE codigo='SERI'), 
 (SELECT id FROM niveles_logro WHERE codigo='I'), 
 'c7777777-7777-7777-7777-777777777777', 
 'd1111111-1111-1111-1111-111111111111', 
 'Le cuesta ordenar de menor a mayor de forma autónoma. Requiere guía verbal.', 
 1, 
 TRUE);

-- 12. Insertar Ficha de Monitoreo
INSERT INTO fichas_monitoreo (estudiante_id, docente_id, clasificacion, seriacion, asimilacion_acomodacion, justificacion_logica, autorregulacion, observaciones, acciones_apoyo) VALUES
('e5555555-5555-5555-5555-555555555555', 
 'd1111111-1111-1111-1111-111111111111', 
 'Clasifica hasta 2 atributos simultáneos (color y tamaño) con ayuda.', 
 'Ordena series de 3 elementos con guía visual.', 
 'Asimila esquemas rápidamente e intenta acomodarlos mediante ensayo y error.', 
 'Explica de forma simple por qué puso un elemento en un grupo diciendo "porque se parece".', 
 'Sigue instrucciones simples, aunque se distrae después de 5 minutos.', 
 'Muestra muy buena disposición y agrado por actividades lúdicas.', 
 'Se recomienda a la familia seguir jugando con la clasificación de juguetes por color en casa.');

-- 13. Insertar Autoevaluación Docente
INSERT INTO autoevaluaciones_docente (id, docente_id, unidad_didactica_id, reflexion) VALUES
('ad999999-9999-9999-9999-999999999999', 
 'd1111111-1111-1111-1111-111111111111', 
 'c7777777-7777-7777-7777-777777777777', 
 'La unidad funcionó muy bien en la clasificación por colores, pero para la seriación de tamaños noté que necesito utilizar material concreto de mayor tamaño para facilitar la manipulación visual.');

-- Respuestas a las 6 preguntas de la autoevaluación del docente (Sí=SI, No=NO, En Proceso=EP)
INSERT INTO respuestas_autoevaluacion (autoevaluacion_id, numero_pregunta, respuesta) VALUES
('ad999999-9999-9999-9999-999999999999', 1, 'SI'),
('ad999999-9999-9999-9999-999999999999', 2, 'SI'),
('ad999999-9999-9999-9999-999999999999', 3, 'EP'),
('ad999999-9999-9999-9999-999999999999', 4, 'SI'),
('ad999999-9999-9999-9999-999999999999', 5, 'NO'),
('ad999999-9999-9999-9999-999999999999', 6, 'SI');
