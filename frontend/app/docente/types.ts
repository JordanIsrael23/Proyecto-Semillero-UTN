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

export interface Grupo {
  id: string;
  nombre: string;
  docente_id: string;
  _count?: { estudiantes: number };
}

export interface Estudiante {
  id: string;
  cedula: string;
  nombre: string;
  apellido: string;
  grupo_id: string;
  fecha_nacimiento: string;
  activo: boolean;
  familia_estudiante?: {
    parentesco: string;
    familias: {
      id: string;
      nombre: string;
      apellido: string;
      telefono?: string;
      usuarios?: {
        email: string;
        cedula: string;
      };
    };
  }[];
}

export interface UnidadDidactica {
  id: string;
  titulo: string;
  resumen?: string;
  ambito: string;
  objetivos_generales?: string;
  objetivos_aprendizaje?: string;
  destrezas?: string;
  semanas_previstas: number;
  estado: "borrador" | "activo" | "archivado";
  actividades?: Actividad[];
}

export interface Actividad {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: "clase" | "casa";
  recursos_enlaces?: any;
}

export interface Criterio {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
}

export interface NivelLogro {
  id: string;
  codigo: string;
  nombre: string;
  orden: number;
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

export interface MetricaGrupal {
  criterio: string;
  iniciado: number;
  enProceso: number;
  logrado: number;
}

export interface FamiliaDemo {
  id: string;
  nombre: string;
  apellido: string;
  usuarios?: { email: string };
}
