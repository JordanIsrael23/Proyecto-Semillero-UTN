"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { validarCedulaEcuatoriana } from "../utils/validation";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api";

interface UsuarioSession {
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

interface Grupo {
  id: string;
  nombre: string;
  docente_id: string;
  _count?: { estudiantes: number };
}

interface Estudiante {
  id: string;
  cedula: string;
  nombre: string;
  apellido: string;
  grupo_id: string;
  fecha_nacimiento: string;
  activo: boolean;
  familia_estudiante?: { parentesco: string; familias: { nombre: string; apellido: string } }[];
}

interface UnidadDidactica {
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

interface Actividad {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: "clase" | "casa";
  recursos_enlaces?: any;
}

interface Criterio {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
}

interface NivelLogro {
  id: string;
  codigo: string;
  nombre: string;
  orden: number;
}

interface FichaMonitoreo {
  id?: string;
  clasificacion: string;
  seriacion: string;
  asimilacion_acomodacion: string;
  justificacion_logica: string;
  autorregulacion: string;
  observaciones?: string;
  acciones_apoyo?: string;
}

interface MetricaGrupal {
  criterio: string;
  iniciado: number;
  enProceso: number;
  logrado: number;
}

interface FamiliaDemo {
  id: string;
  nombre: string;
  apellido: string;
  usuarios?: { email: string };
}

export default function DocenteDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<UsuarioSession | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Estados comunes de datos
  const [criterios, setCriterios] = useState<Criterio[]>([]);
  const [niveles, setNiveles] = useState<NivelLogro[]>([]);
  const [familias, setFamilias] = useState<FamiliaDemo[]>([]);

  // Estados de negocio
  const [activeTab, setActiveTab] = useState<string>("alumnos");
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [unidades, setUnidades] = useState<UnidadDidactica[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<Estudiante | null>(null);

  // Formularios y modales
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showRepresentativeModal, setShowRepresentativeModal] = useState(false);

  const [studentForm, setStudentForm] = useState({
    cedula: "",
    nombre: "",
    apellido: "",
    fecha_nacimiento: "",
    representante_id: "",
    parentesco: "Padre"
  });

  const [representativeForm, setRepresentativeForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: ""
  });

  const [unitForm, setUnitForm] = useState({
    id: "",
    titulo: "",
    resumen: "",
    ambito: "",
    objetivos_generales: "",
    objetivos_aprendizaje: "",
    destrezas: "",
    semanas_previstas: 1,
    estado: "borrador" as any
  });

  const [activityForm, setActivityForm] = useState({
    titulo: "",
    descripcion: "",
    tipo: "casa" as "clase" | "casa",
    recursos: [] as { titulo: string; url: string }[]
  });

  // Rejilla de evaluaciones activa
  const [evaluacionesActive, setEvaluacionesActive] = useState<{ [criterioId: string]: { nivelId: string; obs: string } }>({});

  // Ficha de monitoreo activa
  const [fichaMonitoreo, setFichaMonitoreo] = useState<FichaMonitoreo>({
    clasificacion: "",
    seriacion: "",
    asimilacion_acomodacion: "",
    justificacion_logica: "",
    autorregulacion: "",
    observaciones: "",
    acciones_apoyo: ""
  });

  // Autoevaluación
  const [autoevaluacionAnswers, setAutoevaluacionAnswers] = useState<{ [qNum: number]: "SI" | "NO" | "EP" }>({
    1: "SI", 2: "SI", 3: "SI", 4: "SI", 5: "SI", 6: "SI"
  });
  const [autoevaluacionReflexion, setAutoevaluacionReflexion] = useState("");

  // Métricas colectivas
  const [metricasGrupales, setMetricasGrupales] = useState<MetricaGrupal[]>([]);

  // 1. Validar sesión
  useEffect(() => {
    const sessionJson = localStorage.getItem("user_session");
    if (!sessionJson) {
      router.replace("/");
      return;
    }

    try {
      const parsedSession = JSON.parse(sessionJson);
      if (parsedSession.user?.rol !== "docente") {
        router.replace("/");
        return;
      }
      setSession(parsedSession);
    } catch (e) {
      router.replace("/");
      return;
    } finally {
      setLoadingSession(false);
    }
  }, [router]);

  // 2. Cargar rúbrica y catálogos cuando el usuario está logueado
  useEffect(() => {
    if (!session) return;

    // Criterios
    fetch(`${BACKEND_URL}/rubrica/criterios`)
      .then((res) => res.json())
      .then((data) => setCriterios(data))
      .catch((e) => console.error("Error al cargar criterios:", e));

    // Niveles
    fetch(`${BACKEND_URL}/rubrica/niveles`)
      .then((res) => res.json())
      .then((data) => setNiveles(data))
      .catch((e) => console.error("Error al cargar niveles:", e));

    // Familias cargadas para vinculación de representantes
    fetch(`${BACKEND_URL}/usuarios-demo`)
      .then((res) => res.json())
      .then((data) => {
        const list = data
          .filter((u: any) => u.rol === "familia")
          .map((u: any) => ({
            id: u.familias?.id,
            nombre: u.familias?.nombre,
            apellido: u.familias?.apellido,
            usuarios: { email: u.email }
          }));
        setFamilias(list);
      })
      .catch((e) => console.error("Error al cargar representantes:", e));

    // Grupos del docente
    fetch(`${BACKEND_URL}/docente/grupos`, { headers: { "x-user-id": session.user.id } })
      .then((res) => res.json())
      .then((data) => {
        setGrupos(data);
        if (data.length > 0) {
          setSelectedGroup(data[0].id);
        }
      })
      .catch((e) => console.error("Error al cargar grupos:", e));

    // Unidades del docente
    fetch(`${BACKEND_URL}/docente/unidades`, { headers: { "x-user-id": session.user.id } })
      .then((res) => res.json())
      .then((data) => {
        setUnidades(data);
        if (data.length > 0) {
          setSelectedUnit(data[0].id);
        }
      })
      .catch((e) => console.error("Error al cargar unidades:", e));
  }, [session]);

  // 3. Cargar estudiantes cuando cambia el grupo seleccionado
  useEffect(() => {
    if (!selectedGroup) return;
    fetch(`${BACKEND_URL}/grupos/${selectedGroup}/estudiantes`)
      .then((res) => res.json())
      .then((data) => {
        setEstudiantes(data);
        if (data.length > 0) {
          setSelectedStudent(data[0]);
        } else {
          setSelectedStudent(null);
        }
      })
      .catch((e) => console.error("Error al cargar estudiantes:", e));

    // Cargar métricas colectivas
    fetch(`${BACKEND_URL}/grupos/${selectedGroup}/consolidado`)
      .then((res) => res.json())
      .then((data) => setMetricasGrupales(data))
      .catch((e) => console.error("Error al cargar consolidados:", e));
  }, [selectedGroup]);

  // 4. Cargar ficha de monitoreo del alumno seleccionado
  useEffect(() => {
    if (!selectedStudent || activeTab !== "monitoreo") return;
    fetch(`${BACKEND_URL}/estudiantes/${selectedStudent.id}/ficha-monitoreo`)
      .then((res) => res.text().then((text) => (text ? JSON.parse(text) : null)))
      .then((data) => {
        if (data) {
          setFichaMonitoreo(data);
        } else {
          setFichaMonitoreo({
            clasificacion: "",
            seriacion: "",
            asimilacion_acomodacion: "",
            justificacion_logica: "",
            autorregulacion: "",
            observaciones: "",
            acciones_apoyo: ""
          });
        }
      })
      .catch((e) => console.error("Error al cargar ficha de monitoreo:", e));
  }, [selectedStudent, activeTab]);

  // Cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem("user_session");
    router.replace("/");
  };

  // Crear estudiante
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGroup) {
      alert('Seleccione un grupo antes de crear el estudiante.');
      return;
    }

    if (!validarCedulaEcuatoriana(studentForm.cedula)) {
      alert("La cédula del estudiante no es una cédula ecuatoriana válida.");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/estudiantes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cedula: studentForm.cedula,
          nombre: studentForm.nombre,
          apellido: studentForm.apellido,
          fecha_nacimiento: studentForm.fecha_nacimiento,
          grupo_id: selectedGroup,
          representante_id: studentForm.representante_id || undefined,
          parentesco: studentForm.parentesco
        })
      });

      // Manejo robusto de errores: leer texto y parsear JSON si es posible
      const text = await res.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = { message: text };
      }

      if (!res.ok) {
        throw new Error(data?.message || "Error al registrar el estudiante.");
      }

      setShowStudentModal(false);
      setStudentForm({
        cedula: "",
        nombre: "",
        apellido: "",
        fecha_nacimiento: "",
        representante_id: "",
        parentesco: "Padre"
      });

      // Recargar estudiantes
      const listRes = await fetch(`${BACKEND_URL}/grupos/${selectedGroup}/estudiantes`);
      const listData = await listRes.json();
      setEstudiantes(listData);
      alert("Estudiante registrado exitosamente.");
    } catch (err: any) {
      alert(err.message || "No se pudo registrar el alumno.");
    }
  };

  // Crear Representante (desde modal interno)
  const handleCreateRepresentative = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/familias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(representativeForm)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al crear representante.");
      }

      alert("Representante creado con éxito.");
      setShowRepresentativeModal(false);
      setRepresentativeForm({ nombre: "", apellido: "", email: "", telefono: "" });

      // Recargar lista de familias vinculables
      const demoUsersRes = await fetch(`${BACKEND_URL}/usuarios-demo`);
      const demoUsers = await demoUsersRes.json();
      const list = demoUsers
        .filter((u: any) => u.rol === "familia")
        .map((u: any) => ({
          id: u.familias?.id,
          nombre: u.familias?.nombre,
          apellido: u.familias?.apellido,
          usuarios: { email: u.email }
        }));
      setFamilias(list);

      // Preseleccionar el nuevo representante
      setStudentForm((prev) => ({
        ...prev,
        representante_id: data.id
      }));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Guardar Planificación de Unidad Didáctica
  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!unitForm.id;
    const url = isEdit ? `${BACKEND_URL}/unidades/${unitForm.id}` : `${BACKEND_URL}/unidades`;
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-user-id": session?.user.id || ""
        },
        body: JSON.stringify(unitForm)
      });

      if (!res.ok) throw new Error("Error al guardar planificación.");

      setShowUnitModal(false);
      setUnitForm({
        id: "",
        titulo: "",
        resumen: "",
        ambito: "",
        objetivos_generales: "",
        objetivos_aprendizaje: "",
        destrezas: "",
        semanas_previstas: 1,
        estado: "borrador"
      });

      // Recargar unidades
      const unitsRes = await fetch(`${BACKEND_URL}/docente/unidades`, { headers: { "x-user-id": session?.user.id || "" } });
      const unitsData = await unitsRes.json();
      setUnidades(unitsData);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Clonar Unidad
  const handleCloneUnit = async (id: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/unidades/${id}/clonar`, {
        method: "POST",
        headers: { "x-user-id": session?.user.id || "" }
      });
      if (!res.ok) throw new Error("No se pudo clonar la unidad.");

      const unitsRes = await fetch(`${BACKEND_URL}/docente/unidades`, { headers: { "x-user-id": session?.user.id || "" } });
      const unitsData = await unitsRes.json();
      setUnidades(unitsData);
      alert("Unidad clonada como borrador.");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Agregar Actividad a Unidad
  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/unidades/${selectedUnit}/actividades`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: activityForm.titulo,
          descripcion: activityForm.descripcion,
          tipo: activityForm.tipo,
          recursos_enlaces: activityForm.recursos
        })
      });

      if (!res.ok) throw new Error("Error al crear actividad.");

      setShowActivityModal(false);
      setActivityForm({ titulo: "", descripcion: "", tipo: "casa", recursos: [] });

      // Recargar unidades
      const unitsRes = await fetch(`${BACKEND_URL}/docente/unidades`, { headers: { "x-user-id": session?.user.id || "" } });
      const unitsData = await unitsRes.json();
      setUnidades(unitsData);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Rejilla de evaluaciones
  const handleGradeCriterio = (criterioId: string, nivelId: string) => {
    setEvaluacionesActive((prev) => ({
      ...prev,
      [criterioId]: { ...prev[criterioId], nivelId }
    }));
  };

  const handleGradeObsChange = (criterioId: string, obs: string) => {
    setEvaluacionesActive((prev) => ({
      ...prev,
      [criterioId]: { ...prev[criterioId], obs }
    }));
  };

  const handleSaveEvaluaciones = async () => {
    if (!selectedStudent || !selectedUnit) return;

    const promises = Object.keys(evaluacionesActive).map((critId) => {
      const { nivelId, obs } = evaluacionesActive[critId];
      if (!nivelId) return Promise.resolve();

      return fetch(`${BACKEND_URL}/evaluaciones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": session?.user.id || ""
        },
        body: JSON.stringify({
          estudiante_id: selectedStudent.id,
          criterio_id: critId,
          nivel_logro_id: nivelId,
          unidad_didactica_id: selectedUnit,
          observaciones: obs
        })
      });
    });

    try {
      await Promise.all(promises);
      alert("Evaluaciones registradas exitosamente.");
      setEvaluacionesActive({});

      // Actualizar gráficos grupales
      const cRes = await fetch(`${BACKEND_URL}/grupos/${selectedGroup}/consolidado`);
      const cData = await cRes.json();
      setMetricasGrupales(cData);
    } catch (err) {
      alert("Ocurrió un error al guardar las evaluaciones.");
    }
  };

  // Ficha de Monitoreo
  const handleSaveFicha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      const res = await fetch(`${BACKEND_URL}/estudiantes/${selectedStudent.id}/ficha-monitoreo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": session?.user.id || ""
        },
        body: JSON.stringify(fichaMonitoreo)
      });
      const data = await res.json();
      if (!res.ok) throw new Error("No se pudo guardar la ficha.");

      alert("Ficha de monitoreo individual guardada exitosamente.");
      setFichaMonitoreo(data);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Autoevaluación Docente
  const handleSaveAutoevaluacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit) return;

    const respuestas = Object.keys(autoevaluacionAnswers).map((qNum) => ({
      numero_pregunta: Number(qNum),
      respuesta: autoevaluacionAnswers[Number(qNum)]
    }));

    try {
      const res = await fetch(`${BACKEND_URL}/autoevaluaciones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": session?.user.id || ""
        },
        body: JSON.stringify({
          unidad_didactica_id: selectedUnit,
          reflexion: autoevaluacionReflexion,
          respuestas
        })
      });

      if (!res.ok) throw new Error("Error al guardar autoevaluación.");

      alert("Autoevaluación guardada exitosamente.");
      setAutoevaluacionReflexion("");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Descarga del Informe completo
  const handleDownloadInforme = async (estId: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/estudiantes/${estId}/informe-completo`);
      const data = await res.json();

      const reportContent = `==================================================================
INFORME DE EVALUACIÓN COGNITIVA INDIVIDUAL
Universidad Técnica del Norte - Carrera de Software
Proyecto Semilleros UTN 2026
==================================================================

ESTUDIANTE: ${data.estudiante.nombre} ${data.estudiante.apellido}
CÉDULA: ${data.estudiante.cedula}
GRUPO: ${data.estudiante.grupos.nombre}
DOCENTE RESPONSABLE: ${data.estudiante.grupos.docentes.nombre} ${data.estudiante.grupos.docentes.apellido}
FECHA DE GENERACIÓN: ${new Date().toLocaleDateString()}

------------------------------------------------------------------
1. HISTORIAL DE EVALUACIONES COGNITIVAS POR CRITERIO
------------------------------------------------------------------
${
  data.evaluaciones.length === 0
    ? "No se registran evaluaciones cognitivas aún."
    : data.evaluaciones
        .map(
          (ev: any) =>
            `- [${ev.criterios_evaluacion.nombre}]: Logro = ${ev.niveles_logro.nombre} en Unidad: "${ev.unidades_didacticas.titulo}"\n  Observación: ${ev.observaciones || "Sin observación"}\n  Fecha: ${new Date(ev.fecha_evaluacion).toLocaleDateString()}`
        )
        .join("\n\n")
}

------------------------------------------------------------------
2. FICHA DE MONITOREO CUALITATIVA
------------------------------------------------------------------
${
  !data.fichaMonitoreo
    ? "No se ha completado la ficha de monitoreo individual."
    : `* Clasificación: ${data.fichaMonitoreo.clasificacion}
* Seriación: ${data.fichaMonitoreo.seriacion}
* Asimilación y Acomodación: ${data.fichaMonitoreo.asimilacion_acomodacion}
* Justificación Lógica: ${data.fichaMonitoreo.justificacion_logica}
* Autorregulación/Metacognición: ${data.fichaMonitoreo.autorregulacion}
* Observaciones del Docente: ${data.fichaMonitoreo.observaciones || "Ninguna"}
* Acciones de Apoyo Recomendadas: ${data.fichaMonitoreo.acciones_apoyo || "Ninguna"}`
}

------------------------------------------------------------------
3. SEGUIMIENTO DE ACTIVIDADES EN CASA
------------------------------------------------------------------
${
  data.tareasCasa.length === 0
    ? "No se registran tareas de extensión en casa."
    : data.tareasCasa
        .map(
          (tc: any) =>
            `- Actividad: "${tc.actividades.titulo}"\n  Realizada: ${tc.realizada ? "SÍ" : "NO"}\n  Comentario Familia: ${tc.comentario_familia || "Ninguno"}`
        )
        .join("\n\n")
}
==================================================================
`;

      const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `informe_cognitivo_${data.estudiante.nombre.toLowerCase()}_${data.estudiante.apellido.toLowerCase()}.txt`;
      link.click();
    } catch (e) {
      alert("No se pudo descargar el informe.");
    }
  };

  if (loadingSession) {
    return (
      <div className="flex-1 h-screen flex items-center justify-center bg-slate-900 text-slate-400 font-sans">
        <p className="text-lg font-semibold animate-pulse">Cargando sesión del docente...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      
      {/* 1. BARRA SUPERIOR */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">Semilleros UTN &bull; Apoyo Pedagógico</h1>
            <p className="text-xs text-slate-500 font-medium">Panel de Gestión Docente</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-bold text-white">{session?.perfil.nombre} {session?.perfil.apellido}</p>
            <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Docente</p>
          </div>
          <button
            onClick={handleLogout}
            className="py-2 px-4 border border-slate-700 bg-slate-900 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* 2. BARRA LATERAL (MENU DE SECCIONES) */}
        <aside className="w-full md:w-64 bg-slate-950/50 md:border-r border-slate-800 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("alumnos")}
            className={`w-full text-left py-3 px-4 rounded-xl text-sm font-bold flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === "alumnos" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:bg-slate-850 hover:text-white"
            }`}
          >
            <span>👥 Alumnos y Grupos</span>
          </button>
          <button
            onClick={() => setActiveTab("planificacion")}
            className={`w-full text-left py-3 px-4 rounded-xl text-sm font-bold flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === "planificacion" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:bg-slate-850 hover:text-white"
            }`}
          >
            <span>📅 Planificación Didáctica</span>
          </button>
          <button
            onClick={() => setActiveTab("evaluar")}
            className={`w-full text-left py-3 px-4 rounded-xl text-sm font-bold flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === "evaluar" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:bg-slate-850 hover:text-white"
            }`}
          >
            <span>📝 Rejilla de Evaluación</span>
          </button>
          <button
            onClick={() => setActiveTab("monitoreo")}
            className={`w-full text-left py-3 px-4 rounded-xl text-sm font-bold flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === "monitoreo" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:bg-slate-850 hover:text-white"
            }`}
          >
            <span>📊 Ficha de Monitoreo</span>
          </button>
          <button
            onClick={() => setActiveTab("autoevaluacion")}
            className={`w-full text-left py-3 px-4 rounded-xl text-sm font-bold flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === "autoevaluacion" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:bg-slate-850 hover:text-white"
            }`}
          >
            <span>🍎 Autoevaluación Docente</span>
          </button>
          <button
            onClick={() => setActiveTab("consolidado")}
            className={`w-full text-left py-3 px-4 rounded-xl text-sm font-bold flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === "consolidado" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:bg-slate-850 hover:text-white"
            }`}
          >
            <span>📈 Métricas Colectivas</span>
          </button>
        </aside>

        {/* 3. CONTENIDO DINÁMICO */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">

          {/* TAB 1: ALUMNOS Y GRUPOS */}
          {activeTab === "alumnos" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-white">Alumnos y Grupos</h2>
                  <p className="text-xs text-slate-400 mt-1">Registra estudiantes y vincula sus representantes.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 w-full sm:w-[220px]"
                  >
                    {grupos.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.nombre}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowStudentModal(true)}
                    className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
                  >
                    + Agregar Alumno
                  </button>
                </div>
              </div>

              {/* Listado de Estudiantes */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                {estudiantes.length === 0 ? (
                  <div className="text-center py-16 text-slate-500 space-y-2">
                    <span className="text-4xl block">👥</span>
                    <p className="font-bold text-sm">No hay alumnos registrados en este grupo.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase text-xs tracking-wider">
                        <tr>
                          <th className="px-6 py-4">Cédula</th>
                          <th className="px-6 py-4">Nombre y Apellido</th>
                          <th className="px-6 py-4">F. Nacimiento</th>
                          <th className="px-6 py-4">Representante</th>
                          <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {estudiantes.map((est) => {
                          const rep = est.familia_estudiante?.[0];
                          return (
                            <tr key={est.id} className="hover:bg-slate-900/50 transition-colors">
                              <td className="px-6 py-4 font-mono text-slate-300 font-bold">{est.cedula}</td>
                              <td className="px-6 py-4 font-bold text-white">{est.apellido}, {est.nombre}</td>
                              <td className="px-6 py-4 text-slate-400">{new Date(est.fecha_nacimiento).toLocaleDateString()}</td>
                              <td className="px-6 py-4">
                                {rep ? (
                                  <div>
                                    <p className="text-white font-semibold">{rep.familias.nombre} {rep.familias.apellido}</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{rep.parentesco}</p>
                                  </div>
                                ) : (
                                  <span className="text-slate-600 font-medium">Sin asignar</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right space-x-2">
                                <button
                                  onClick={() => handleDownloadInforme(est.id)}
                                  className="py-1.5 px-3 bg-slate-900 hover:bg-indigo-600/10 hover:text-indigo-400 border border-slate-800 rounded-lg text-xs font-bold transition-all cursor-pointer text-slate-300"
                                >
                                  Informe TXT
                                </button>
                                <button
                                  onClick={async () => {
                                    if (confirm("¿Seguro que deseas dar de baja lógica a este estudiante?")) {
                                      await fetch(`${BACKEND_URL}/estudiantes/${est.id}`, { method: "DELETE" });
                                      const res = await fetch(`${BACKEND_URL}/grupos/${selectedGroup}/estudiantes`);
                                      setEstudiantes(await res.json());
                                    }
                                  }}
                                  className="py-1.5 px-3 bg-slate-900 hover:bg-red-500/10 hover:text-red-400 border border-slate-800 rounded-lg text-xs font-bold transition-all cursor-pointer text-slate-500"
                                >
                                  Dar de Baja
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PLANIFICACIÓN PEDAGÓGICA */}
          {activeTab === "planificacion" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-white">Planificación de Actividades</h2>
                  <p className="text-xs text-slate-400 mt-1">Gestiona unidades didácticas y asigna tareas.</p>
                </div>
                <button
                  onClick={() => {
                    setUnitForm({ id: "", titulo: "", resumen: "", ambito: "Relaciones lógico-matemáticas", objetivos_generales: "", objetivos_aprendizaje: "", destrezas: "", semanas_previstas: 1, estado: "borrador" });
                    setShowUnitModal(true);
                  }}
                  className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  + Nueva Unidad Didáctica
                </button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {unidades.map((unit) => (
                  <div key={unit.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-extrabold uppercase bg-indigo-500/10 text-indigo-300 px-2 py-1 rounded-md border border-indigo-500/20 tracking-wider">
                          {unit.ambito}
                        </span>
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border tracking-wider ${
                          unit.estado === "activo"
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                            : unit.estado === "borrador"
                            ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}>
                          {unit.estado}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{unit.titulo}</h3>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">{unit.resumen || "Sin descripción disponible."}</p>
                      </div>
                      <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                        <span>🕒</span>
                        <span>Semanas previstas: {unit.semanas_previstas}</span>
                      </div>

                      {unit.actividades && unit.actividades.length > 0 && (
                        <div className="border-t border-slate-900 pt-4 mt-4">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Actividades vinculadas:</p>
                          <ul className="space-y-1.5 text-xs text-slate-300">
                            {unit.actividades.map((act) => (
                              <li key={act.id} className="flex items-center gap-2">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                  act.tipo === "casa" ? "bg-pink-500/10 text-pink-300" : "bg-indigo-500/10 text-indigo-300"
                                }`}>
                                  {act.tipo}
                                </span>
                                <span className="font-semibold">{act.titulo}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 border-t border-slate-900 pt-4 mt-6">
                      <button
                        onClick={() => {
                          setUnitForm({
                            id: unit.id,
                            titulo: unit.titulo,
                            resumen: unit.resumen || "",
                            ambito: unit.ambito,
                            objetivos_generales: unit.objetivos_generales || "",
                            objetivos_aprendizaje: unit.objetivos_aprendizaje || "",
                            destrezas: unit.destrezas || "",
                            semanas_previstas: unit.semanas_previstas,
                            estado: unit.estado
                          });
                          setShowUnitModal(true);
                        }}
                        className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleCloneUnit(unit.id)}
                        className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Clonar
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUnit(unit.id);
                          setActivityForm({ titulo: "", descripcion: "", tipo: "casa", recursos: [] });
                          setShowActivityModal(true);
                        }}
                        className="py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        + Actividad
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: REJILLA DE EVALUACIÓN */}
          {activeTab === "evaluar" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-white">Registro de Evaluaciones</h2>
                  <p className="text-xs text-slate-400 mt-1">Evalúa de forma ágil mediante la rúbrica cognitiva.</p>
                </div>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 w-full sm:w-[250px]"
                >
                  <option value="">-- Selecciona Unidad --</option>
                  {unidades.filter(u => u.estado === 'activo').map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.titulo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector horizontal de Estudiante */}
              <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-thin">
                {estudiantes.map((est) => (
                  <button
                    key={est.id}
                    onClick={() => setSelectedStudent(est)}
                    className={`py-2 px-4 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                      selectedStudent?.id === est.id
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                        : "bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-900 hover:text-white"
                    }`}
                  >
                    {est.apellido}, {est.nombre}
                  </button>
                ))}
              </div>

              {selectedStudent && selectedUnit ? (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-950 border border-slate-800 p-6 rounded-2xl gap-4">
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Estudiante Evaluado</p>
                      <h3 className="text-lg font-bold text-white mt-1">{selectedStudent.nombre} {selectedStudent.apellido}</h3>
                    </div>
                    <button
                      onClick={handleSaveEvaluaciones}
                      className="py-3 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer w-full sm:w-auto"
                    >
                      Guardar Todas las Evaluaciones
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {criterios.map((crit) => {
                      const selection = evaluacionesActive[crit.id] || { nivelId: "", obs: "" };
                      return (
                        <div key={crit.id} className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl">
                          <div>
                            <h4 className="text-base font-bold text-white">{crit.nombre}</h4>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{crit.descripcion}</p>
                          </div>
                          
                          <div className="mt-6 space-y-4">
                            <div className="grid grid-cols-3 gap-2">
                              {niveles.map((niv) => {
                                const isActive = selection.nivelId === niv.id;
                                let activeClass = "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-white";
                                if (isActive) {
                                  if (niv.codigo === "I") activeClass = "bg-red-500/20 border-red-500 text-red-300 shadow-md shadow-red-500/5";
                                  if (niv.codigo === "EP") activeClass = "bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/5";
                                  if (niv.codigo === "L") activeClass = "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/5";
                                }
                                return (
                                  <button
                                    key={niv.id}
                                    onClick={() => handleGradeCriterio(crit.id, niv.id)}
                                    className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${activeClass}`}
                                  >
                                    {niv.nombre}
                                  </button>
                                );
                              })}
                            </div>
                            <textarea
                              placeholder="Observaciones de logro..."
                              value={selection.obs}
                              onChange={(e) => handleGradeObsChange(crit.id, e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 h-[60px] resize-none"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl text-center py-20 text-slate-500">
                  <span className="text-4xl block mb-3">📝</span>
                  <p className="text-sm font-bold">Por favor, selecciona una Unidad Activa y un Estudiante para iniciar la evaluación.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: FICHA DE MONITOREO */}
          {activeTab === "monitoreo" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-white">Ficha de Monitoreo Individual</h2>
                  <p className="text-xs text-slate-400 mt-1">Registra análisis cualitativos de los procesos cognitivos.</p>
                </div>
                <select
                  value={selectedStudent?.id || ""}
                  onChange={(e) => {
                    const est = estudiantes.find((es) => es.id === e.target.value);
                    if (est) setSelectedStudent(est);
                  }}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 w-full sm:w-[250px]"
                >
                  <option value="">-- Selecciona Estudiante --</option>
                  {estudiantes.map((est) => (
                    <option key={est.id} value={est.id}>
                      {est.apellido}, {est.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {selectedStudent ? (
                <form onSubmit={handleSaveFicha} className="bg-slate-950 border border-slate-800 p-6 sm:p-8 rounded-2xl space-y-6 shadow-2xl">
                  <h3 className="text-lg font-bold text-white border-b border-slate-900 pb-3">
                    Estudiante: <span className="text-indigo-400">{selectedStudent.nombre} {selectedStudent.apellido}</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Clasificación</label>
                      <textarea
                        required
                        value={fichaMonitoreo.clasificacion}
                        onChange={(e) => setFichaMonitoreo({ ...fichaMonitoreo, clasificacion: e.target.value })}
                        placeholder="Descripción sobre cómo agrupa objetos según atributos (forma, color, etc.)"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 h-[100px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Seriación</label>
                      <textarea
                        required
                        value={fichaMonitoreo.seriacion}
                        onChange={(e) => setFichaMonitoreo({ ...fichaMonitoreo, seriacion: e.target.value })}
                        placeholder="Descripción sobre la habilidad de ordenar elementos de manera secuencial."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 h-[100px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Asimilación y Acomodación</label>
                      <textarea
                        required
                        value={fichaMonitoreo.asimilacion_acomodacion}
                        onChange={(e) => setFichaMonitoreo({ ...fichaMonitoreo, asimilacion_acomodacion: e.target.value })}
                        placeholder="Descripción de la apropiación y reestructuración de esquemas mentales."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 h-[100px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Justificación Lógica</label>
                      <textarea
                        required
                        value={fichaMonitoreo.justificacion_logica}
                        onChange={(e) => setFichaMonitoreo({ ...fichaMonitoreo, justificacion_logica: e.target.value })}
                        placeholder="Cómo expresa lógicamente la causa o razón de sus respuestas y acciones."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 h-[100px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Autorregulación</label>
                      <textarea
                        required
                        value={fichaMonitoreo.autorregulacion}
                        onChange={(e) => setFichaMonitoreo({ ...fichaMonitoreo, autorregulacion: e.target.value })}
                        placeholder="Capacidad del menor de guiar y coordinar sus propias conductas."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 h-[100px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Observaciones del Docente</label>
                      <textarea
                        value={fichaMonitoreo.observaciones || ""}
                        onChange={(e) => setFichaMonitoreo({ ...fichaMonitoreo, observaciones: e.target.value })}
                        placeholder="Notas adicionales e incidencias observadas."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 h-[100px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Acciones de Apoyo Recomendadas (Para Docente y Familia)</label>
                    <textarea
                      value={fichaMonitoreo.acciones_apoyo || ""}
                      onChange={(e) => setFichaMonitoreo({ ...fichaMonitoreo, acciones_apoyo: e.target.value })}
                      placeholder="Dinámicas sugeridas de apoyo escolar que deben implementarse en el aula y en casa."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 h-[80px]"
                    />
                  </div>

                  <div className="flex justify-end border-t border-slate-900 pt-5 mt-4">
                    <button
                      type="submit"
                      className="py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
                    >
                      Guardar Ficha de Monitoreo
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl text-center py-20 text-slate-500">
                  <span className="text-4xl block mb-3">📊</span>
                  <p className="text-sm font-bold">Por favor, selecciona un Estudiante para llenar la Ficha de Monitoreo.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: AUTOEVALUACIÓN DOCENTE */}
          {activeTab === "autoevaluacion" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-white">Autoevaluación Docente</h2>
                  <p className="text-xs text-slate-400 mt-1">Reflexiona y evalúa tu práctica en la unidad didáctica.</p>
                </div>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 w-full sm:w-[250px]"
                >
                  <option value="">-- Selecciona Unidad --</option>
                  {unidades.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.titulo}
                    </option>
                  ))}
                </select>
              </div>

              {selectedUnit ? (
                <form onSubmit={handleSaveAutoevaluacion} className="bg-slate-950 border border-slate-800 p-6 sm:p-8 rounded-2xl space-y-6 shadow-2xl">
                  <h3 className="text-lg font-bold text-white border-b border-slate-900 pb-3">
                    Formulario Pedagógico de Autoevaluación
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { num: 1, text: "1. ¿Las actividades permitieron el desarrollo cognitivo planteado?" },
                      { num: 2, text: "2. ¿Los recursos didácticos facilitaron la asimilación y acomodación?" },
                      { num: 3, text: "3. ¿Las rúbricas aplicadas permitieron medir el logro individual?" },
                      { num: 4, text: "4. ¿El tiempo estipulado para la unidad didáctica fue suficiente?" },
                      { num: 5, text: "5. ¿La comunicación y actividades en casa fueron apoyadas por la familia?" },
                      { num: 6, text: "6. ¿Se implementaron las adecuaciones curriculares necesarias?" }
                    ].map((q) => (
                      <div key={q.num} className="space-y-2">
                        <span className="text-xs font-bold text-slate-300 block">{q.text}</span>
                        <select
                          value={autoevaluacionAnswers[q.num]}
                          onChange={(e) => setAutoevaluacionAnswers({ ...autoevaluacionAnswers, [q.num]: e.target.value as any })}
                          className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 w-full"
                        >
                          <option value="SI">Sí</option>
                          <option value="NO">No</option>
                          <option value="EP">En Proceso</option>
                        </select>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-4">
                    <label className="text-xs font-bold text-slate-300 block">Reflexión Pedagógica y Propuestas de Mejora</label>
                    <textarea
                      required
                      value={autoevaluacionReflexion}
                      onChange={(e) => setAutoevaluacionReflexion(e.target.value)}
                      placeholder="Escriba sus comentarios reflexivos pedagógicos..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 h-[100px]"
                    />
                  </div>

                  <div className="flex justify-end border-t border-slate-900 pt-5 mt-4">
                    <button
                      type="submit"
                      className="py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
                    >
                      Registrar Autoevaluación
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl text-center py-20 text-slate-500">
                  <span className="text-4xl block mb-3">🍎</span>
                  <p className="text-sm font-bold">Por favor, selecciona una Unidad para completar tu autoevaluación.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: CONSOLIDADO GRUPAL */}
          {activeTab === "consolidado" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-white">Métricas Colectivas</h2>
                  <p className="text-xs text-slate-400 mt-1">Conteo consolidado de niveles de logro alcanzados por el grupo.</p>
                </div>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 w-full sm:w-[220px]"
                >
                  {grupos.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {metricasGrupales.length === 0 ? (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl text-center py-20 text-slate-500">
                  <span className="text-4xl block mb-3">📈</span>
                  <p className="text-sm font-bold">No se registran evaluaciones suficientes en este grupo para procesar métricas colectivas.</p>
                </div>
              ) : (
                <div className="space-y-6 bg-slate-950 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-2xl">
                  
                  {metricasGrupales.some(m => m.iniciado > m.logrado) && (
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-200 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
                      <span>⚠️</span>
                      <span><strong>Recomendación de Refuerzo:</strong> El grupo presenta áreas de oportunidad considerables. Se sugiere enfocar esfuerzos y materiales en los criterios con mayor porcentaje en nivel Iniciado.</span>
                    </div>
                  )}

                  <div className="space-y-6">
                    {metricasGrupales.map((met, idx) => {
                      const total = met.iniciado + met.enProceso + met.logrado;
                      const pctIniciado = total > 0 ? (met.iniciado / total) * 100 : 0;
                      const pctProceso = total > 0 ? (met.enProceso / total) * 100 : 0;
                      const pctLogrado = total > 0 ? (met.logrado / total) * 100 : 0;

                      return (
                        <div key={idx} className="space-y-2 border-b border-slate-900 pb-5 last:border-0 last:pb-0">
                          <h4 className="text-sm font-bold text-white">{met.criterio}</h4>
                          <div className="h-6 w-full bg-slate-900 rounded-full overflow-hidden flex text-[10px] font-extrabold text-white text-center">
                            {pctIniciado > 0 && (
                              <div className="bg-red-500 flex items-center justify-center transition-all" style={{ width: `${pctIniciado}%` }}>
                                {met.iniciado} Iniciado ({Math.round(pctIniciado)}%)
                              </div>
                            )}
                            {pctProceso > 0 && (
                              <div className="bg-amber-500 flex items-center justify-center transition-all" style={{ width: `${pctProceso}%` }}>
                                {met.enProceso} En Proceso ({Math.round(pctProceso)}%)
                              </div>
                            )}
                            {pctLogrado > 0 && (
                              <div className="bg-emerald-500 flex items-center justify-center transition-all" style={{ width: `${pctLogrado}%` }}>
                                {met.logrado} Logrado ({Math.round(pctLogrado)}%)
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-red-500 rounded-full" />Iniciado ({met.iniciado})</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />En Proceso ({met.enProceso})</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />Logrado ({met.logrado})</span>
                            <span className="ml-auto text-slate-400">Total: {total} alumnos</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* ==================================================================
          MODALES (DOCENTE)
          ================================================================== */}

      {/* Modal Agregar Alumno */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Registrar Alumno</h3>
              <button
                onClick={() => setShowStudentModal(false)}
                className="text-slate-500 hover:text-white cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 block">Cédula del Niño (10 dígitos)</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="Ej: 1005678901"
                  value={studentForm.cedula}
                  onChange={(e) => setStudentForm({ ...studentForm, cedula: e.target.value.replace(/\D/g, "") })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 block">Nombre</label>
                <input
                  type="text"
                  required
                  value={studentForm.nombre}
                  onChange={(e) => setStudentForm({ ...studentForm, nombre: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 block">Apellido</label>
                <input
                  type="text"
                  required
                  value={studentForm.apellido}
                  onChange={(e) => setStudentForm({ ...studentForm, apellido: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 block">Fecha de Nacimiento</label>
                <input
                  type="date"
                  required
                  value={studentForm.fecha_nacimiento}
                  onChange={(e) => setStudentForm({ ...studentForm, fecha_nacimiento: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 block">Vincular Representante (Familia)</label>
                <div className="flex gap-2">
                  <select
                    value={studentForm.representante_id}
                    onChange={(e) => setStudentForm({ ...studentForm, representante_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Ninguno --</option>
                    {familias.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nombre} {f.apellido}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowRepresentativeModal(true)}
                    className="px-3 border border-slate-800 bg-slate-950 hover:bg-slate-850 rounded-xl text-xs font-bold cursor-pointer text-indigo-400"
                  >
                    + Nuevo
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 block">Parentesco</label>
                <select
                  value={studentForm.parentesco}
                  onChange={(e) => setStudentForm({ ...studentForm, parentesco: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Padre">Padre</option>
                  <option value="Madre">Madre</option>
                  <option value="Tutor">Tutor / Representante Legal</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowStudentModal(false)}
                  className="py-2.5 px-4 bg-slate-950 hover:bg-slate-850 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Agregar Estudiante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Agregar Representante */}
      {showRepresentativeModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex justify-center items-center p-4 z-[60] animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Registrar Representante</h3>
              <button
                onClick={() => setShowRepresentativeModal(false)}
                className="text-slate-500 hover:text-white cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRepresentative} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 block">Nombre</label>
                <input
                  type="text"
                  required
                  value={representativeForm.nombre}
                  onChange={(e) => setRepresentativeForm({ ...representativeForm, nombre: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 block">Apellido</label>
                <input
                  type="text"
                  required
                  value={representativeForm.apellido}
                  onChange={(e) => setRepresentativeForm({ ...representativeForm, apellido: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 block">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={representativeForm.email}
                  onChange={(e) => setRepresentativeForm({ ...representativeForm, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 block">Teléfono (Opcional)</label>
                <input
                  type="tel"
                  value={representativeForm.telefono}
                  onChange={(e) => setRepresentativeForm({ ...representativeForm, telefono: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowRepresentativeModal(false)}
                  className="py-2.5 px-4 bg-slate-950 hover:bg-slate-850 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Crear Representante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Agregar / Editar Unidad Didáctica */}
      {showUnitModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">
                {unitForm.id ? "Editar Unidad Didáctica" : "Crear Unidad Didáctica"}
              </h3>
              <button
                onClick={() => setShowUnitModal(false)}
                className="text-slate-500 hover:text-white cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUnit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 block">Título de la Unidad</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Unidad 1: Colores primarios"
                  value={unitForm.titulo}
                  onChange={(e) => setUnitForm({ ...unitForm, titulo: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 block">Ámbito Cognitivo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Relaciones lógico-matemáticas"
                  value={unitForm.ambito}
                  onChange={(e) => setUnitForm({ ...unitForm, ambito: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 block">Resumen Pedagógico</label>
                <textarea
                  placeholder="Resumen del ámbito a evaluar..."
                  value={unitForm.resumen}
                  onChange={(e) => setUnitForm({ ...unitForm, resumen: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 h-[60px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 block">Objetivos Generales</label>
                <textarea
                  value={unitForm.objetivos_generales}
                  onChange={(e) => setUnitForm({ ...unitForm, objetivos_generales: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 h-[50px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 block">Objetivos de Aprendizaje</label>
                <textarea
                  value={unitForm.objetivos_aprendizaje}
                  onChange={(e) => setUnitForm({ ...unitForm, objetivos_aprendizaje: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 h-[50px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 block">Destrezas a Evaluar</label>
                <textarea
                  value={unitForm.destrezas}
                  onChange={(e) => setUnitForm({ ...unitForm, destrezas: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 h-[50px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 block">Semanas Previstas</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={unitForm.semanas_previstas}
                    onChange={(e) => setUnitForm({ ...unitForm, semanas_previstas: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 block">Estado</label>
                  <select
                    value={unitForm.estado}
                    onChange={(e) => setUnitForm({ ...unitForm, estado: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="borrador">Borrador</option>
                    <option value="activo">Activo</option>
                    <option value="archivado">Archivado</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowUnitModal(false)}
                  className="py-2.5 px-4 bg-slate-950 hover:bg-slate-850 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Guardar Planificación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Agregar Actividad */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Añadir Actividad</h3>
              <button
                onClick={() => setShowActivityModal(false)}
                className="text-slate-500 hover:text-white cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 block">Título de la Actividad</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Pintar lámina con crayones"
                  value={activityForm.titulo}
                  onChange={(e) => setActivityForm({ ...activityForm, titulo: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 block">Instrucciones</label>
                <textarea
                  required
                  placeholder="Procedimiento detallado..."
                  value={activityForm.descripcion}
                  onChange={(e) => setActivityForm({ ...activityForm, descripcion: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 h-[80px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 block">Tipo de Actividad</label>
                <select
                  value={activityForm.tipo}
                  onChange={(e) => setActivityForm({ ...activityForm, tipo: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="clase">En Clase</option>
                  <option value="casa">En Casa (Extensión)</option>
                </select>
              </div>

              {activityForm.tipo === "casa" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 block">Recursos Adicionales</label>
                  <button
                    type="button"
                    onClick={() => {
                      const title = prompt("Nombre del recurso (ej: Vídeo de seriación):");
                      const url = prompt("Enlace web (ej: https://...):");
                      if (title && url) {
                        setActivityForm((prev) => ({
                          ...prev,
                          recursos: [...prev.recursos, { titulo: title, url }]
                        }));
                      }
                    }}
                    className="w-full py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-bold cursor-pointer text-indigo-400"
                  >
                    + Vincular Archivo/Vídeo Enlace
                  </button>
                  <div className="max-h-28 overflow-y-auto space-y-1.5">
                    {activityForm.recursos.map((rec, i) => (
                      <div key={i} className="flex justify-between items-center bg-slate-950 border border-slate-800 p-2 rounded-lg text-xs">
                        <span className="truncate max-w-[200px] text-white">📄 <strong>{rec.titulo}</strong></span>
                        <button
                          type="button"
                          onClick={() => {
                            setActivityForm((prev) => ({
                              ...prev,
                              recursos: prev.recursos.filter((_, idx) => idx !== i)
                            }));
                          }}
                          className="text-red-400 hover:text-red-300 font-bold"
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowActivityModal(false)}
                  className="py-2.5 px-4 bg-slate-950 hover:bg-slate-850 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Agregar Actividad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
