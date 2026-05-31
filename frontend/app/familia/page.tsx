"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardWelcome from "../components/DashboardWelcome";

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

interface HijoRel {
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

interface EvaluacionCriterio {
  id: string;
  criterio_id: string;
  nivel_logro_id: string;
  unidad_didactica_id: string;
  observaciones?: string;
  criterios_evaluacion?: { nombre: string };
  niveles_logro?: { nombre: string; codigo: string };
  unidades_didacticas?: { titulo: string };
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

interface ActividadCasa {
  id: string;
  titulo: string;
  descripcion: string;
  recursos_enlaces?: { titulo: string; url: string }[];
  unidad_titulo: string;
  realizada: boolean;
  fecha_realizacion?: string | null;
  comentario_familia?: string | null;
}

export default function FamiliaDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<UsuarioSession | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Estado para el Modo Claro / Oscuro
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Estados de negocio
  const [activeTab, setActiveTab] = useState<string>("inicio");
  const [hijos, setHijos] = useState<HijoRel[]>([]);
  const [selectedHijo, setSelectedHijo] = useState<HijoRel | null>(null);
  const [hijoProgreso, setHijoProgreso] = useState<EvaluacionCriterio[]>([]);
  const [hijoFicha, setHijoFicha] = useState<FichaMonitoreo | null>(null);
  const [actividadesCasa, setActividadesCasa] = useState<ActividadCasa[]>([]);

  // 1. Validar sesión
  useEffect(() => {
    const sessionJson = localStorage.getItem("user_session");
    if (!sessionJson) {
      router.replace("/");
      return;
    }

    try {
      const parsedSession = JSON.parse(sessionJson);
      if (parsedSession.user?.rol !== "familia") {
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

  // Preferencia de tema (Local Storage)
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    localStorage.setItem("theme", !darkMode ? "dark" : "light");
  };

  // 2. Cargar hijos asociados
  useEffect(() => {
    if (!session) return;

    fetch(`${BACKEND_URL}/familia/hijos`, { headers: { "x-user-id": session.user.id } })
      .then((res) => res.json())
      .then((data) => {
        setHijos(data);
        if (data && data.length > 0) {
          setSelectedHijo(data[0]);
        }
      })
      .catch((e) => console.error("Error al cargar hijos:", e));
  }, [session]);

  // 3. Cargar progreso, ficha y tareas cuando cambia el hijo seleccionado
  useEffect(() => {
    if (!selectedHijo || !selectedHijo.estudiante?.id) return;
    const estId = selectedHijo.estudiante.id;

    // Cargar evaluaciones cognitivas
    fetch(`${BACKEND_URL}/estudiantes/${estId}/evaluaciones`)
      .then((res) => res.json())
      .then((data) => setHijoProgreso(Array.isArray(data) ? data : []))
      .catch((e) => console.error("Error al cargar progreso del estudiante:", e));

    // Cargar ficha cualitativa
    fetch(`${BACKEND_URL}/estudiantes/${estId}/ficha-monitoreo`)
      .then((res) => res.text().then((text) => (text ? JSON.parse(text) : null)))
      .then((data) => setHijoFicha(data))
      .catch((e) => console.error("Error al cargar ficha del estudiante:", e));

    // Cargar tareas para el hogar
    fetch(`${BACKEND_URL}/estudiantes/${estId}/actividades-casa`)
      .then((res) => res.json())
      .then((data) => setActividadesCasa(Array.isArray(data) ? data : []))
      .catch((e) => console.error("Error al cargar tareas en casa:", e));
  }, [selectedHijo]);

  // Cerrar Sesión
  const handleLogout = () => {
    localStorage.removeItem("user_session");
    router.replace("/");
  };

  // Marcar tarea realizada o actualizar comentario
  const handleToggleTaskCasa = async (actId: string, realizada: boolean, comentario: string) => {
    if (!selectedHijo || !selectedHijo.estudiante?.id) return;
    const estId = selectedHijo.estudiante.id;

    try {
      const res = await fetch(`${BACKEND_URL}/estudiantes/${estId}/actividades-casa/seguimiento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actividad_id: actId,
          realizada,
          comentario_familia: comentario
        })
      });

      if (!res.ok) throw new Error("No se pudo guardar el seguimiento.");

      // Recargar tareas
      const tasksRes = await fetch(`${BACKEND_URL}/estudiantes/${estId}/actividades-casa`);
      const tasksData = await tasksRes.json();
      setActividadesCasa(Array.isArray(tasksData) ? tasksData : []);
    } catch (e) {
      alert("Error al actualizar la tarea de casa.");
    }
  };

  if (loadingSession) {
    return (
      <div className={`flex-1 h-screen flex items-center justify-center font-sans ${darkMode ? "bg-slate-900 text-slate-400" : "bg-slate-50 text-slate-500"}`}>
        <p className="text-lg font-semibold animate-pulse">Cargando sesión familiar...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${darkMode ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-800"}`}>

      {/* 1. BARRA SUPERIOR */}
      <header className={`border-b px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 z-10 ${darkMode ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 border rounded-xl ${darkMode ? "bg-pink-500/10 border-pink-500/20" : "bg-pink-50 border-pink-200"}`}>
            <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
          </div>
          <div>
            <h1 className={`text-lg font-bold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>Semilleros UTN &bull; Apoyo Pedagógico</h1>
            <p className={`text-xs font-medium ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Panel de Representantes de Familia</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Botón de cambio de Tema (Claro/Oscuro) */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border text-sm transition-all cursor-pointer ${darkMode ? "bg-slate-900 border-slate-800 hover:bg-slate-850 text-amber-400" : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-600"}`}
            title={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {darkMode ? "☀️ Claro" : "🌙 Oscuro"}
          </button>

          <div className="text-right">
            <p className={`text-sm font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>{session?.perfil.nombre} {session?.perfil.apellido}</p>
            <p className="text-xs text-pink-500 font-bold uppercase tracking-wider">Representante</p>
          </div>
          <button
            onClick={handleLogout}
            className={`py-2 px-4 border rounded-xl text-xs font-bold transition-all cursor-pointer ${darkMode ? "border-slate-700 bg-slate-900 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 text-slate-300" : "border-slate-200 bg-white hover:bg-red-50 text-red-600 shadow-sm"}`}
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">

        {/* 2. BARRA LATERAL */}
        <aside className={`w-full md:w-64 p-4 space-y-2 md:border-r ${darkMode ? "bg-slate-950/50 border-slate-800" : "bg-white border-slate-200"}`}>
          <button
            onClick={() => setActiveTab("inicio")}
            className={`w-full text-left py-3 px-4 rounded-xl text-sm font-bold flex items-center gap-3 transition-all cursor-pointer ${activeTab === "inicio" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : darkMode ? "text-slate-400 hover:bg-slate-850 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
          >
            <span>🏠 Inicio</span>
          </button>
          <button
            onClick={() => setActiveTab("progreso")}
            className={`w-full text-left py-3 px-4 rounded-xl text-sm font-bold flex items-center gap-3 transition-all cursor-pointer ${activeTab === "progreso" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : darkMode ? "text-slate-400 hover:bg-slate-850 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
          >
            <span>📈 Avance Cognitivo</span>
          </button>

          <button
            onClick={() => setActiveTab("historial")}
            className={`w-full text-left py-3 px-4 rounded-xl text-sm font-bold flex items-center gap-3 transition-all cursor-pointer ${activeTab === "historial" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : darkMode ? "text-slate-400 hover:bg-slate-850 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
          >
            <span>📊 Historial de Avance</span>
          </button>

          <button
            onClick={() => setActiveTab("tareas")}
            className={`w-full text-left py-3 px-4 rounded-xl text-sm font-bold flex items-center gap-3 transition-all cursor-pointer ${activeTab === "tareas" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : darkMode ? "text-slate-400 hover:bg-slate-850 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
          >
            <span>🏠 Actividades en Casa</span>
          </button>

          <button
            onClick={() => setActiveTab("perfil")}
            className={`w-full text-left py-3 px-4 rounded-xl text-sm font-bold flex items-center gap-3 transition-all cursor-pointer ${activeTab === "perfil" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : darkMode ? "text-slate-400 hover:bg-slate-850 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
          >
            <span>👦 Perfil del Estudiante</span>
          </button>
        </aside>

        {/* 3. CONTENIDO DINÁMICO */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">

          {/* TAB 0: INICIO / DASHBOARD DE BIENVENIDA */}
          {activeTab === "inicio" && (
            <DashboardWelcome
              userName={`${session?.perfil.nombre} ${session?.perfil.apellido}`}
              role="familia"
              indicators={[
                {
                  icon: "👦",
                  label: "Hijos Vinculados",
                  value: hijos.length,
                  subtitle: "Estudiantes asociados a tu cuenta",
                  color: "pink",
                },
                {
                  icon: "🏠",
                  label: "Tareas Pendientes",
                  value: actividadesCasa.filter(t => !t.realizada).length,
                  subtitle: "Actividades de casa sin completar",
                  color: "amber",
                },
                {
                  icon: "📊",
                  label: "Evaluaciones Registradas",
                  value: hijoProgreso.length,
                  subtitle: "Evaluaciones cognitivas del docente",
                  color: "indigo",
                },
                {
                  icon: "✅",
                  label: "Tareas Completadas",
                  value: actividadesCasa.filter(t => t.realizada).length,
                  subtitle: "Actividades realizadas exitosamente",
                  color: "emerald",
                },
              ]}
              actions={[
                {
                  icon: "📈",
                  label: "Ver Avance Cognitivo",
                  description: "Consulta las evaluaciones y rúbrica de tu hijo/a",
                  tab: "progreso",
                  color: "indigo",
                },
                {
                  icon: "📊",
                  label: "Historial de Avance",
                  description: "Línea de tiempo del progreso evolutivo",
                  tab: "historial",
                  color: "emerald",
                },
                {
                  icon: "🏠",
                  label: "Actividades en Casa",
                  description: "Reporta el cumplimiento de tareas escolares",
                  tab: "tareas",
                  color: "amber",
                },
                {
                  icon: "👦",
                  label: "Perfil del Estudiante",
                  description: "Información general y datos de matrícula",
                  tab: "perfil",
                  color: "pink",
                },
              ]}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab !== "inicio" && (
            <div className="space-y-6">

              {/* Header de la sección */}
              <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5 ${darkMode ? "border-slate-800" : "border-slate-200"}`}>
                <div>
                  <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
                    {activeTab === "progreso" && "Avance Cognitivo de mi Hijo/a"}
                    {activeTab === "historial" && "Historial de Avance Temporal"}
                    {activeTab === "tareas" && "Tareas y Actividades en Casa"}
                    {activeTab === "perfil" && "Perfil del Estudiante"}
                  </h2>
                  <p className={`text-xs mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                    {activeTab === "progreso" && "Revisa el historial de evaluaciones del menor."}
                    {activeTab === "historial" && "Línea de tiempo del progreso evolutivo unidad por unidad."}
                    {activeTab === "tareas" && "Reporta el cumplimiento de las tareas escolares."}
                    {activeTab === "perfil" && "Información general y datos de registro de la matrícula."}
                  </p>
                </div>

                {hijos.length > 1 && (
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Estudiante:</span>
                    <select
                      value={selectedHijo ? selectedHijo.estudiante?.id : ""}
                      onChange={(e) => {
                        const hij = hijos.find((h) => h.estudiante?.id === e.target.value);
                        if (hij) setSelectedHijo(hij);
                      }}
                      className={`border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 w-[200px] ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800 shadow-sm"}`}
                    >
                      {hijos.map((h) => (
                        <option key={h.estudiante?.id} value={h.estudiante?.id}>
                          {h.estudiante?.nombre || "Estudiante sin nombre"}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {selectedHijo ? (
                <div className="space-y-6">

                  {/* 1. Tarjeta de Datos del Hijo (Ficha Rápida) */}
                  <div className={`border p-6 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-6 shadow-xl relative overflow-hidden ${darkMode ? "bg-slate-950 border-slate-800" : "bg-white border-slate-100"}`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-xl pointer-events-none" />
                    <div>
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${darkMode ? "text-pink-400 bg-pink-500/10 border border-pink-500/20" : "text-pink-600 bg-pink-50 border border-pink-100"}`}>
                        Estudiante
                      </span>
                      <h3 className={`text-lg font-extrabold mt-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
                        {selectedHijo.estudiante?.nombre} {selectedHijo.estudiante?.apellido}
                      </h3>
                      <p className={`text-[11px] font-mono mt-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>C.I.: {selectedHijo.estudiante?.cedula || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Aula / Semillero
                      </span>
                      <p className={`text-sm font-bold mt-2 ${darkMode ? "text-white" : "text-slate-800"}`}>{selectedHijo.grupo?.nombre || "No asignado"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Docente Responsable
                      </span>
                      <p className={`text-sm font-bold mt-2 ${darkMode ? "text-white" : "text-slate-800"}`}>
                        {selectedHijo.docente?.nombre} {selectedHijo.docente?.apellido}
                      </p>
                    </div>
                  </div>

                  {/* CONTENIDO DE PESTAÑA: AVANCE COGNITIVO */}
                  {activeTab === "progreso" && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className={`text-base font-extrabold ${darkMode ? "text-white" : "text-slate-900"}`}>Rúbrica Cognitiva</h3>
                        {hijoProgreso.length === 0 ? (
                          <div className={`border rounded-2xl py-12 text-center ${darkMode ? "bg-slate-950 border-slate-800 text-slate-500" : "bg-white border-slate-200 text-slate-400"}`}>
                            <span className="text-3xl block mb-2">📈</span>
                            <p className="text-xs font-semibold">El docente a cargo aún no ha registrado evaluaciones cognitivas para el menor.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {hijoProgreso.map((prog) => {
                              const code = prog.niveles_logro?.codigo;
                              let cardBorder = darkMode ? "border-slate-800 hover:border-slate-700" : "border-slate-200 hover:border-slate-300";
                              let badgeClass = darkMode ? "bg-slate-850 text-slate-400 border-slate-800" : "bg-slate-100 text-slate-600 border-slate-200";

                              if (code === "I") {
                                cardBorder = "border-red-500/30 hover:border-red-500/50";
                                badgeClass = "bg-red-500/10 text-red-500 border-red-500/20";
                              } else if (code === "EP") {
                                cardBorder = "border-amber-500/30 hover:border-amber-500/50";
                                badgeClass = "bg-amber-500/10 text-amber-600 border-amber-500/20";
                              } else if (code === "L") {
                                cardBorder = "border-emerald-500/30 hover:border-emerald-500/50";
                                badgeClass = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
                              }

                              return (
                                <div key={prog.id} className={`border p-6 rounded-2xl flex flex-col justify-between transition-all shadow-xl ${darkMode ? "bg-slate-950" : "bg-white"} ${cardBorder}`}>
                                  <div>
                                    <div className="flex justify-between items-start gap-4">
                                      <h4 className={`font-extrabold text-base ${darkMode ? "text-white" : "text-slate-900"}`}>{prog.criterios_evaluacion?.nombre}</h4>
                                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border tracking-wider shrink-0 ${badgeClass}`}>
                                        {prog.niveles_logro?.nombre}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">
                                      Unidad: {prog.unidades_didacticas?.titulo || "N/A"}
                                    </p>
                                  </div>
                                  <div className={`mt-4 p-4 rounded-xl border text-xs leading-relaxed ${darkMode ? "bg-slate-900/60 border-slate-850 text-slate-300" : "bg-slate-50 border-slate-150 text-slate-600"}`}>
                                    <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px] mb-1">Observaciones del Educador:</span>
                                    {prog.observaciones || "El menor muestra buena actitud y disponibilidad durante la evaluación."}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Ficha Cualitativa de Monitoreo */}
                      {hijoFicha && (
                        <div className={`border p-6 sm:p-8 rounded-2xl space-y-6 shadow-2xl ${darkMode ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"}`}>
                          <h3 className={`text-base font-extrabold border-b pb-3 ${darkMode ? "text-white border-slate-900" : "text-slate-900 border-slate-100"}`}>
                            Ficha Cualitativa de Monitoreo Individual
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            {[
                              { label: "Clasificación", text: hijoFicha.clasificacion },
                              { label: "Seriación", text: hijoFicha.seriacion },
                              { label: "Asimilación y Acomodación", text: hijoFicha.asimilacion_acomodacion },
                              { label: "Justificación Lógica", text: hijoFicha.justificacion_logica },
                              { label: "Autorregulación", text: hijoFicha.autorregulacion },
                              { label: "Observaciones Generales", text: hijoFicha.observaciones || "Sin observaciones." }
                            ].map((f, i) => (
                              <div key={i} className={`space-y-1 p-4 rounded-xl border ${darkMode ? "bg-slate-900/40 border-slate-850" : "bg-slate-50 border-slate-150"}`}>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{f.label}</h4>
                                <p className={`mt-1 leading-relaxed text-xs ${darkMode ? "text-slate-200" : "text-slate-700"}`}>{f.text}</p>
                              </div>
                            ))}
                          </div>

                          {hijoFicha.acciones_apoyo && (
                            <div className={`border-t pt-5 mt-4 space-y-1 ${darkMode ? "border-slate-900" : "border-slate-100"}`}>
                              <h4 className="text-xs font-extrabold text-pink-500 uppercase tracking-wider">Acciones de Apoyo Recomendadas para el Hogar</h4>
                              <p className={`font-bold text-xs leading-relaxed ${darkMode ? "text-slate-300" : "text-slate-700"}`}>{hijoFicha.acciones_apoyo}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* CONTENIDO DE PESTAÑA: HISTORIAL DE AVANCE */}
                  {activeTab === "historial" && (
                    <div className={`border p-6 rounded-2xl shadow-xl space-y-6 ${darkMode ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"}`}>
                      <h3 className={`text-base font-extrabold border-b pb-3 ${darkMode ? "text-white border-slate-900" : "text-slate-900 border-slate-100"}`}>Línea de Tiempo del Progreso</h3>
                      {hijoProgreso.length === 0 ? (
                        <div className="text-center py-6 text-slate-400">
                          <p className="text-xs font-semibold">No se encontraron registros de avance para graficar la evolución histórica.</p>
                        </div>
                      ) : (
                        <div className={`relative border-l ml-4 pl-6 space-y-6 ${darkMode ? "border-slate-800" : "border-slate-200"}`}>
                          {hijoProgreso.map((prog) => (
                            <div key={prog.id} className="relative">
                              <div className="absolute -left-[29px] top-1 bg-indigo-600 rounded-full w-2.5 h-2.5" />
                              <div className={`border p-4 rounded-xl space-y-1 ${darkMode ? "bg-slate-900/60 border-slate-850" : "bg-slate-50 border-slate-150"}`}>
                                <span className="text-[10px] text-slate-400 font-mono block">Evaluación de la Unidad</span>
                                <h4 className={`font-bold text-sm ${darkMode ? "text-white" : "text-slate-900"}`}>{prog.criterios_evaluacion?.nombre}</h4>
                                <p className="text-xs text-indigo-500 font-semibold">{prog.unidades_didacticas?.titulo || "Unidad de Aprendizaje"}</p>
                                <div className="pt-2 flex items-center gap-4 text-xs">
                                  <p><span className="text-slate-400">Logro:</span> <strong className="text-emerald-500">{prog.niveles_logro?.nombre || "N/A"}</strong></p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* CONTENIDO DE PESTAÑA: TAREAS EN CASA */}
                  {activeTab === "tareas" && (
                    <div className="space-y-6">
                      <div className={`border p-6 rounded-2xl shadow-xl ${darkMode ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"}`}>
                        {actividadesCasa.length === 0 ? (
                          <div className="text-center py-12 text-slate-400">
                            <span className="text-3xl block mb-2">🏠</span>
                            <p className="text-xs font-semibold">No se registran tareas asignadas para la unidad activa.</p>
                          </div>
                        ) : (
                          <div className={`divide-y space-y-6 ${darkMode ? "divide-slate-850" : "divide-slate-100"}`}>
                            {actividadesCasa.map((task) => (
                              <div key={task.id} className="flex gap-4 pt-6 first:pt-0 items-start">
                                <input
                                  type="checkbox"
                                  checked={task.realizada}
                                  onChange={(e) => handleToggleTaskCasa(task.id, e.target.checked, task.comentario_familia || "")}
                                  className={`w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 mt-1 cursor-pointer shrink-0 ${darkMode ? "border-slate-800 bg-slate-900" : "border-slate-300 bg-white"}`}
                                />
                                <div className="flex-1 space-y-2">
                                  <div>
                                    <span className={`text-[9px] font-extrabold uppercase border px-2 py-0.5 rounded ${darkMode ? "bg-slate-900 text-slate-400 border-slate-800" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                                      {task.unidad_titulo}
                                    </span>
                                    <h4 className={`font-extrabold text-base mt-2 ${darkMode ? "text-white" : "text-slate-900"}`}>{task.titulo}</h4>
                                    <p className={`text-xs mt-1 leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-600"}`}>{task.descripcion}</p>
                                  </div>

                                  {task.recursos_enlaces && task.recursos_enlaces.length > 0 && (
                                    <div className="flex gap-2 flex-wrap pt-1">
                                      {task.recursos_enlaces.map((rec, idx) => (
                                        <a
                                          key={idx}
                                          href={rec.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className={`py-1.5 px-3 border rounded-lg text-[10px] font-extrabold text-indigo-500 transition-all flex items-center gap-1.5 ${darkMode ? "bg-slate-900 hover:bg-slate-800 border-slate-800" : "bg-slate-50 hover:bg-slate-100 border-slate-200"}`}
                                        >
                                          <span>📄</span>
                                          <span>{rec.titulo}</span>
                                        </a>
                                      ))}
                                    </div>
                                  )}

                                  <div className="space-y-1.5 pt-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Comentarios Familia / Reporte:</span>
                                    <input
                                      type="text"
                                      placeholder="Escribe brevemente cómo le fue a tu hijo/a realizando esta tarea..."
                                      defaultValue={task.comentario_familia || ""}
                                      onBlur={(e) => {
                                        if (e.target.value !== task.comentario_familia) {
                                          handleToggleTaskCasa(task.id, task.realizada, e.target.value);
                                        }
                                      }}
                                      className={`w-full max-w-xl border rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-indigo-500 ${darkMode ? "bg-slate-900 border-slate-850 text-white" : "bg-white border-slate-200 text-slate-800"}`}
                                    />
                                    {task.fecha_realizacion && (
                                      <p className="text-[10px] text-slate-400 font-semibold pt-1">
                                        Marcada realizada el: <strong>{new Date(task.fecha_realizacion).toLocaleString()}</strong>
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CONTENIDO DE PESTAÑA: PERFIL DEL ESTUDIANTE */}
                  {activeTab === "perfil" && (
                    <div className={`border p-6 rounded-2xl shadow-xl space-y-4 ${darkMode ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"}`}>
                      <h3 className={`text-base font-extrabold border-b pb-3 ${darkMode ? "text-white border-slate-900" : "text-slate-900 border-slate-100"}`}>Información del Estudiante</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className={`p-4 rounded-xl border space-y-2 ${darkMode ? "bg-slate-900/60 border-slate-850" : "bg-slate-50 border-slate-150"}`}>
                          <p><span className="text-slate-400 font-medium">Nombres:</span> <strong className={darkMode ? "text-white" : "text-slate-900"}>{selectedHijo.estudiante?.nombre || "N/A"}</strong></p>
                          <p><span className="text-slate-400 font-medium">Apellidos:</span> <strong className={darkMode ? "text-white" : "text-slate-900"}>{selectedHijo.estudiante?.apellido || "N/A"}</strong></p>
                          <p><span className="text-slate-400 font-medium">Cédula de Identidad:</span> <strong className={`font-mono ${darkMode ? "text-white" : "text-slate-900"}`}>{selectedHijo.estudiante?.cedula || "N/A"}</strong></p>
                        </div>
                        <div className={`p-4 rounded-xl border space-y-2 ${darkMode ? "bg-slate-900/60 border-slate-850" : "bg-slate-50 border-slate-150"}`}>
                          <p><span className="text-slate-400 font-medium">Semillero Asignado:</span> <strong className={darkMode ? "text-white" : "text-slate-900"}>{selectedHijo.grupo?.nombre || "No asignado"}</strong></p>
                          <p><span className="text-slate-400 font-medium">Parentesco registrado:</span> <strong className={darkMode ? "text-white" : "text-slate-900"}>{selectedHijo.parentesco || "Representado"}</strong></p>
                          <p>
                            <span className="text-slate-400 font-medium">Fecha de Nacimiento:</span>{" "}
                            <strong className={darkMode ? "text-white" : "text-slate-900"}>
                              {selectedHijo.estudiante?.fecha_nacimiento ? new Date(selectedHijo.estudiante.fecha_nacimiento).toLocaleDateString() : "No registrada"}
                            </strong>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className={`border rounded-2xl text-center py-20 ${darkMode ? "bg-slate-950 border-slate-800 text-slate-500" : "bg-white border-slate-200 text-slate-400"}`}>
                  <span className="text-4xl block mb-3">👦</span>
                  <p className="text-sm font-bold">No se encontraron estudiantes asociados a tu cuenta de representante.</p>
                </div>
              )}

            </div>
          )}
        </main>
      </div>

    </div>
  );
}