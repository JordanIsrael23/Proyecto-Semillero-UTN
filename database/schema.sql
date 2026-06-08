-- ============================================================================
-- PROYECTO SEMILLEROS UTN 2026 - BASE DE DATOS UNIFICADA (DEFINITIVA)
-- Universidad Técnica del Norte - Carrera de Software
-- ============================================================================

-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. TIPOS ENUMERADOS
-- ----------------------------------------------------------------------------
CREATE TYPE ESTADO_UNIDAD AS ENUM ('borrador', 'activo', 'archivado');
CREATE TYPE TIPO_ACTIVIDAD AS ENUM ('clase', 'casa');
CREATE TYPE RESPUESTA_AUTOEVALUACION AS ENUM ('SI', 'NO', 'EP');
CREATE TYPE CRITERIO_DIDACTICO AS ENUM ('Caracterizar', 'Clasificar', 'Seriar', 'Rompecabezas');

-- ----------------------------------------------------------------------------
-- 2. TABLAS DE SEGURIDAD Y PERFILES
-- ----------------------------------------------------------------------------
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rol_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    cedula VARCHAR(10) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Validación de formato de Cédula de Ecuador (10 dígitos, provincias 01-24 o 30, 3er dígito < 6)
    CONSTRAINT chk_cedula_ecuador_usuario 
        CHECK (cedula ~ '^(0[1-9]|1[0-9]|2[0-4]|30)[0-5][0-9]{7}$')
);

COMMENT ON CONSTRAINT chk_cedula_ecuador_usuario ON usuarios IS 'Lanza advertencia/error si la cédula no cumple con los 10 dígitos válidos de Ecuador';

CREATE TABLE perfil_docentes (
    usuario_id UUID PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    especialidad VARCHAR(100) DEFAULT 'Educación Inicial',
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE perfil_familias (
    usuario_id UUID PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    direccion VARCHAR(255),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE auditoria_logs (
    id BIGSERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    accion VARCHAR(100) NOT NULL, 
    tabla_afectada VARCHAR(100),
    registro_id VARCHAR(100),
    detalles_valores JSONB, 
    fecha_evento TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE configuraciones_sistema (
    clave VARCHAR(100) PRIMARY KEY,
    valor TEXT NOT NULL,
    descripcion TEXT,
    fecha_modificacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 3. GESTIÓN DE GRUPOS Y ESTUDIANTES
-- ----------------------------------------------------------------------------
CREATE TABLE grupos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL, 
    periodo_academico VARCHAR(50) NOT NULL, 
    docente_id UUID NOT NULL REFERENCES perfil_docentes(usuario_id) ON DELETE RESTRICT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE estudiantes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cedula VARCHAR(10) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    grupo_id UUID NOT NULL REFERENCES grupos(id) ON DELETE RESTRICT,
    fecha_nacimiento DATE NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Validación de formato de Cédula de Ecuador
    CONSTRAINT chk_cedula_ecuador_estudiante 
        CHECK (cedula ~ '^(0[1-9]|1[0-9]|2[0-4]|30)[0-5][0-9]{7}$'),
        
    -- Validación de Edad de Desarrollo Cognitivo (Entre 5 y 10 años cumplidos)
    CONSTRAINT chk_rango_edad_estudiante 
        CHECK (
            fecha_nacimiento <= (CURRENT_DATE - INTERVAL '5 years') AND 
            fecha_nacimiento >= (CURRENT_DATE - INTERVAL '10 years')
        )
);

COMMENT ON CONSTRAINT chk_cedula_ecuador_estudiante ON estudiantes IS 'Lanza una advertencia/error si la cédula del estudiante no es única o no tiene el formato ecuatoriano';
COMMENT ON CONSTRAINT chk_rango_edad_estudiante ON estudiantes IS 'Lanza una advertencia/error si el estudiante es menor a 5 años o mayor a 10 años';

CREATE TABLE familia_estudiante (
    familia_id UUID NOT NULL REFERENCES perfil_familias(usuario_id) ON DELETE CASCADE,
    estudiante_id UUID NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    parentesco VARCHAR(50) NOT NULL, 
    es_representante_principal BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (familia_id, estudiante_id)
);

-- ----------------------------------------------------------------------------
-- 4. PLANIFICACIÓN PEDAGÓGICA (UNIDADES Y ACTIVIDADES)
-- ----------------------------------------------------------------------------
CREATE TABLE unidades_didacticas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(255) NOT NULL,
    resumen TEXT,
    ambito VARCHAR(255) NOT NULL,
    objetivos_generales TEXT,
    objetivos_aprendizaje TEXT,
    destrezas TEXT,
    semanas_previstas INTEGER NOT NULL DEFAULT 1,
    grupo_id UUID NOT NULL REFERENCES grupos(id) ON DELETE RESTRICT,
    estado ESTADO_UNIDAD NOT NULL DEFAULT 'borrador',
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE actividades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unidad_id UUID NOT NULL REFERENCES unidades_didacticas(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    tipo TIPO_ACTIVIDAD NOT NULL DEFAULT 'clase',
    recursos_enlaces JSONB DEFAULT '[]'::jsonb, 
    fecha_limite TIMESTAMP WITH TIME ZONE, 
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE actividades_casa_seguimiento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actividad_id UUID NOT NULL REFERENCES actividades(id) ON DELETE CASCADE,
    estudiante_id UUID NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    familia_id UUID NOT NULL REFERENCES perfil_familias(usuario_id) ON DELETE RESTRICT,
    realizada BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_realizacion TIMESTAMP WITH TIME ZONE,
    desempeno_hijo_percepcion INTEGER, 
    comentario_familia TEXT,
    nota_docente DOUBLE PRECISION,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 5. RÚBRICA COGNITIVA Y EVALUACIONES
-- ----------------------------------------------------------------------------
CREATE TABLE criterios_evaluacion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(20) UNIQUE NOT NULL, 
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE niveles_logro (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(10) UNIQUE NOT NULL, 
    nombre VARCHAR(50) NOT NULL,
    orden INTEGER NOT NULL,
    peso_valor INTEGER NOT NULL, 
    descripcion TEXT
);

CREATE TABLE evaluaciones_criterio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estudiante_id UUID NOT NULL REFERENCES estudiantes(id) ON DELETE RESTRICT,
    criterio_id UUID NOT NULL REFERENCES criterios_evaluacion(id) ON DELETE RESTRICT,
    nivel_logro_id UUID NOT NULL REFERENCES niveles_logro(id) ON DELETE RESTRICT,
    unidad_didactica_id UUID NOT NULL REFERENCES unidades_didacticas(id) ON DELETE RESTRICT,
    docente_id UUID NOT NULL REFERENCES perfil_docentes(usuario_id) ON DELETE RESTRICT,
    observaciones TEXT,
    fecha_evaluacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    es_publicada_familia BOOLEAN NOT NULL DEFAULT TRUE, 
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 6. FICHA DE MONITOREO E COGNICIÓN E AUTOEVALUACIÓN
-- ----------------------------------------------------------------------------
CREATE TABLE fichas_monitoreo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estudiante_id UUID NOT NULL REFERENCES estudiantes(id) ON DELETE RESTRICT,
    docente_id UUID NOT NULL REFERENCES perfil_docentes(usuario_id) ON DELETE RESTRICT,
    clasificacion TEXT NOT NULL,
    seriacion TEXT NOT NULL,
    asimilacion_acomodacion TEXT NOT NULL,
    justificacion_logica TEXT NOT NULL,
    autorregulacion TEXT NOT NULL,
    observaciones TEXT,
    acciones_apoyo TEXT,
    fecha_monitoreo TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE autoevaluaciones_docente (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    docente_id UUID NOT NULL REFERENCES perfil_docentes(usuario_id) ON DELETE RESTRICT,
    unidad_didactica_id UUID REFERENCES unidades_didacticas(id) ON DELETE CASCADE,
    reflexion TEXT,
    fecha_autoevaluacion DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE respuestas_autoevaluacion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    autoevaluacion_id UUID NOT NULL REFERENCES autoevaluaciones_docente(id) ON DELETE CASCADE,
    numero_pregunta INTEGER NOT NULL CHECK (numero_pregunta BETWEEN 1 AND 6),
    respuesta RESPUESTA_AUTOEVALUACION NOT NULL,
    CONSTRAINT unica_pregunta_por_evaluacion UNIQUE (autoevaluacion_id, numero_pregunta)
);

-- ----------------------------------------------------------------------------
-- 7. MÉTRICAS DE JUEGOS GAMIFICADOS
-- ----------------------------------------------------------------------------
CREATE TABLE metricas_sesion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actividad_id UUID NOT NULL REFERENCES actividades(id) ON DELETE CASCADE,
    estudiante_id UUID NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    app_criterio CRITERIO_DIDACTICO NOT NULL, 
    fecha_sesion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE detalles_metricas_sesion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metrica_sesion_id UUID NOT NULL REFERENCES metricas_sesion(id) ON DELETE CASCADE,
    duracion_sesion INTERVAL NOT NULL,               
    intentos_por_elemento INTEGER NOT NULL,          
    tasa_acierto DOUBLE PRECISION NOT NULL,          
    secuencia_decisiones JSONB NOT NULL,             
    uso_ayudas INTEGER NOT NULL DEFAULT 0,           
    nivel_dificultad INTEGER NOT NULL,               
    abandono BOOLEAN NOT NULL DEFAULT FALSE          
);

-- ----------------------------------------------------------------------------
-- 8. ÍNDICES DE RENDIMIENTO
-- ----------------------------------------------------------------------------
CREATE INDEX idx_usuarios_rol ON usuarios(rol_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_estudiantes_grupo ON estudiantes(grupo_id);
CREATE INDEX idx_actividades_unidad ON actividades(unidad_id);
CREATE INDEX idx_metricas_estudiante_app ON metricas_sesion(estudiante_id, app_criterio);

-- ============================================================================
-- POBLACIÓN DE DATOS BASE Y DEMOSTRACIÓN (SEED DATA)
-- ============================================================================

-- Insertar Roles
INSERT INTO roles (id, nombre) VALUES
(1, 'admin'),
(2, 'docente'),
(3, 'familia');

-- Insertar Configuraciones Iniciales del Sistema
INSERT INTO configuraciones_sistema (clave, valor, descripcion) VALUES
('TIEMPO_MAX_SESION_MINUTOS', '7', 'Límite de tiempo recomendado para evitar fatiga cognitiva en el niño'),
('PERIODO_ACTIVO', '2026-1', 'Periodo lectivo en ejecución en la UTN');

-- Insertar Usuarios con Cédulas Ecuatorianas Válidas (10 dígitos con campos de Nombre y Apellido separados)
INSERT INTO usuarios (id, rol_id, cedula, email, password_hash, nombre, apellido, telefono) VALUES
('a0000000-0000-0000-0000-000000000001', 1, '1003612345', 'admin.utn@utn.edu.ec', '$2b$10$ABxZdC/RFqQ2Ucu33GlEnu9eA5.xhWnR9/Cm35ftC5N.3KXt53fLO', 'Carlos', 'Andrade Vaca', '0990000000'),
('a0000000-0000-0000-0000-000000000002', 2, '1004954321', 'mrea@utn.edu.ec', '$2b$10$ABxZdC/RFqQ2Ucu33GlEnu9eA5.xhWnR9/Cm35ftC5N.3KXt53fLO', 'Margarita', 'Reascos', '0991234567'),
('a0000000-0000-0000-0000-000000000003', 3, '1725619876', 'padre.demo@gmail.com', '$2b$10$ABxZdC/RFqQ2Ucu33GlEnu9eA5.xhWnR9/Cm35ftC5N.3KXt53fLO', 'Juan', 'Pérez Gómez', '0987654321'),
('a0000000-0000-0000-0000-000000000009', 1, '1725619884', 'kaiser@gmail.com', '$2b$10$AgAqVbsxIKFs.mBN3df6zOxZNsxiIBnGnyPjF2Co.gdyyRXP/XJea', 'Kaiser', 'Admin', '0999999999');

-- Crear Perfiles Vinculados
INSERT INTO perfil_docentes (usuario_id, especialidad) VALUES 
('a0000000-0000-0000-0000-000000000002', 'Desarrollo Cognitivo Infantil');

INSERT INTO perfil_familias (usuario_id, direccion) VALUES 
('a0000000-0000-0000-0000-000000000003', 'Ibarra, Sector El Olivo');

-- Crear Grupo Académico
INSERT INTO grupos (id, nombre, periodo_academico, docente_id) VALUES
('b4444444-4444-4444-4444-444444444444', 'Inicial II - Semillero UTN A', '2026-1', 'a0000000-0000-0000-0000-000000000002');

-- Registrar Estudiante dentro del rango de edad (Campos de Nombre y Apellido separados)
INSERT INTO estudiantes (id, cedula, nombre, apellido, grupo_id, fecha_nacimiento) VALUES
('e5555555-5555-5555-5555-555555555555', '1005234561', 'Mateo', 'Pérez Rivera', 'b4444444-4444-4444-4444-444444444444', '2021-03-12');

-- Vinculación familiar
INSERT INTO familia_estudiante (familia_id, estudiante_id, parentesco, es_representante_principal) VALUES
('a0000000-0000-0000-0000-000000000003', 'e5555555-5555-5555-5555-555555555555', 'Padre', true);

-- Insertar Planificación Curricular y Actividad con Fecha Límite
INSERT INTO unidades_didacticas (id, titulo, resumen, ambito, objetivos_generales, grupo_id, estado) VALUES
('c7777777-7777-7777-7777-777777777777', 'Unidad 1: Autocuidado y Personas Seguras', 'Comprensión y clasificación del entorno protector del menor.', 'Convivencia y Entorno', 'Desarrollar el criterio de clasificación en base a personas seguras y de riesgo.', 'b4444444-4444-4444-4444-444444444444', 'activo');

INSERT INTO actividades (id, unidad_id, titulo, descripcion, tipo, recursos_enlaces, fecha_limite) VALUES
('ac222222-2222-2222-2222-222222222222', 'c7777777-7777-7777-7777-777777777777', 'App 2 — ¿Dónde va? (Clasificar)', 'Identificar en la App móvil las personas que representan entornos seguros.', 'casa', '[{"titulo": "Vídeo Instructivo", "url": "https://www.youtube.com/watch?v=demo123"}]'::jsonb, '2026-06-25 18:00:00-05');

-- Registrar un Log de Auditoría Inicial
INSERT INTO auditoria_logs (usuario_id, accion, tabla_afectada, registro_id, detalles_valores) VALUES
('a0000000-0000-0000-0000-000000000002', 'INSERT', 'actividades', 'ac222222-2222-2222-2222-222222222222', '{"info": "Actividad configurada con fecha límite asignada correctamente por la docente"}');
