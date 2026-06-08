export interface UsuarioSession {
  user: {
    id: string;
    cedula: string;
    email: string;
    rol: "docente" | "familia";
  };
  perfil: {
    id: string;
    nombre: string;
    apellido: string;
    telefono?: string;
  };
}

export interface HijoRel {
  parentesco: string;
  estudiante: {
    id: string;
    cedula: string;
    nombre: string;
    apellido: string;
    fecha_nacimiento: string;
  };
  grupo: {
    id: string;
    nombre: string;
  };
  docente: {
    id: string;
    nombre: string;
    apellido: string;
  };
}

export interface EvaluacionCriterio {
  id: string;
  criterio_id: string;
  nivel_logro_id: string;
  unidad_didactica_id: string;
  observaciones?: string;
  criterios_evaluacion?: { nombre: string };
  niveles_logro?: { nombre: string; codigo: string };
  unidades_didacticas?: { titulo: string };
}

export interface FichaMonitoreo {
  id?: string;
  clasificacion: string;
  seriacion: string;
  asimilacion_acomodacion: string;
  justificacion_logica: string;
  autorregulacion: string;
  observaciones?: string;
  acciones_apoyo?: string;
}

export interface ActividadCasa {
  id: string;
  titulo: string;
  descripcion: string;
  recursos_enlaces?: { titulo: string; url: string }[];
  unidad_titulo: string;
  realizada: boolean;
  fecha_realizacion?: string | null;
  comentario_familia?: string | null;
  nota?: string | null;
  fecha_limite?: string | null;
}
