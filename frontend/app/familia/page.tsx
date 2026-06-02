"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardWelcome from "../components/DashboardWelcome";
import DashboardShell from "../components/DashboardShell";
import AppModal from "../components/AppModal";

const FAMILIA_NAV = [
  { id: "inicio", label: "Inicio", icon: "home" },
  { id: "progreso", label: "Avance Cognitivo", icon: "trending_up" },
  { id: "historial", label: "Historial de Avance", icon: "timeline" },
  { id: "tareas", label: "Actividades en Casa", icon: "home_work" },
  { id: "perfil", label: "Perfil del Estudiante", icon: "face" },
] as const;

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
  nota?: string | null;
}

const getEquivalenciaNota = (notaStr: string | null | undefined) => {
  if (!notaStr) return null;
  
  // Try parsing as float first
  const nota = parseFloat(notaStr);
  if (!isNaN(nota)) {
    if (nota >= 8.0) {
      return { label: "Logrado", colorClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
    }
    if (nota >= 5.0) {
      return { label: "En Proceso", colorClass: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
    }
    return { label: "Iniciado", colorClass: "bg-red-500/10 text-red-500 border-red-500/20" };
  }
  
  // Fallback to old code formats
  const clean = notaStr.toUpperCase().trim();
  if (clean === "L" || clean === "LOGRADO") {
    return { label: "Logrado", colorClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
  }
  if (clean === "EP" || clean === "EN PROCESO") {
    return { label: "En Proceso", colorClass: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
  }
  return { label: "Iniciado", colorClass: "bg-red-500/10 text-red-500 border-red-500/20" };
};

export default function FamiliaDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<UsuarioSession | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Estados de negocio
  const [activeTab, setActiveTab] = useState<string>("inicio");
  const [hijos, setHijos] = useState<HijoRel[]>([]);
  const [selectedHijo, setSelectedHijo] = useState<HijoRel | null>(null);
  const [hijoProgreso, setHijoProgreso] = useState<EvaluacionCriterio[]>([]);
  const [hijoFicha, setHijoFicha] = useState<FichaMonitoreo | null>(null);
  const [actividadesCasa, setActividadesCasa] = useState<ActividadCasa[]>([]);

  // Feedback toast (reemplaza window.alert)
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 3500);
    return () => window.clearTimeout(timer);
  }, [feedback]);

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
      setFeedback({ message: "Error al actualizar la tarea de casa.", type: "error" });
    }
  };

  if (loadingSession) {
    return (
      <div className="flex h-screen flex-1 items-center justify-center bg-background font-sans text-on-surface-variant">
        <p className="animate-pulse text-lg font-semibold">Cargando sesión familiar...</p>
      </div>
    );
  }

  const userFullName = `${session?.perfil.nombre ?? ""} ${session?.perfil.apellido ?? ""}`.trim();

  return (
    <DashboardShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      navItems={[...FAMILIA_NAV]}
      userName={userFullName}
      roleLabel="Representante"
      panelSubtitle="Panel Familia"
      onLogout={handleLogout}
      searchPlaceholder="Buscar hijos, tareas..."
    >
      {/* Toast de feedback – reemplaza window.alert() */}
      {feedback && (
        <div className="fixed inset-x-0 top-6 z-50 flex justify-center px-4">
          <div
            className="flex items-start gap-3 rounded-3xl border px-4 py-4 bg-surface-container-lowest text-on-surface shadow-xl shadow-black/10 max-w-sm w-full"
            style={{
              borderColor: feedback.type === "success" ? "var(--primary)" : "var(--error)"
            }}
          >
            <span
              className="text-lg"
              style={{ color: feedback.type === "success" ? "var(--primary)" : "var(--error)" }}
            >
              {feedback.type === "success" ? "✅" : "⚠️"}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-on-surface">
                {feedback.type === "success" ? "¡Listo!" : "Error"}
              </p>
              <p className="mt-1 text-xs leading-5 text-on-surface-variant">{feedback.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-xs font-bold text-on-surface-variant opacity-80 transition hover:opacity-100"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      <div className="overflow-y-auto">

          {/* TAB 0: INICIO / DASHBOARD DE BIENVENIDA */}
          {activeTab === "inicio" && (
            <DashboardWelcome
              userName={`${session?.perfil.nombre} ${session?.perfil.apellido}`}
              role="familia"
              indicators={[
                {
                  icon: "face",
                  label: "Hijos Vinculados",
                  value: hijos.length,
                  subtitle: "Estudiantes asociados a tu cuenta",
                  color: "tertiary",
                },
                {
                  icon: "home_work",
                  label: "Tareas Pendientes",
                  value: actividadesCasa.filter((t) => !t.realizada).length,
                  subtitle: "Actividades de casa sin completar",
                  color: "orange",
                },
                {
                  icon: "analytics",
                  label: "Evaluaciones Registradas",
                  value: hijoProgreso.length,
                  subtitle: "Evaluaciones cognitivas del docente",
                  color: "primary",
                },
                {
                  icon: "task_alt",
                  label: "Tareas Completadas",
                  value: actividadesCasa.filter((t) => t.realizada).length,
                  subtitle: "Actividades realizadas exitosamente",
                  color: "green",
                },
              ]}
              actions={[
                {
                  icon: "trending_up",
                  label: "Ver Avance Cognitivo",
                  description: "Consulta las evaluaciones y rúbrica de tu hijo/a",
                  tab: "progreso",
                  color: "primary",
                },
                {
                  icon: "timeline",
                  label: "Historial de Avance",
                  description: "Línea de tiempo del progreso evolutivo",
                  tab: "historial",
                  color: "green",
                },
                {
                  icon: "home_work",
                  label: "Actividades en Casa",
                  description: "Reporta el cumplimiento de tareas escolares",
                  tab: "tareas",
                  color: "orange",
                },
                {
                  icon: "face",
                  label: "Perfil del Estudiante",
                  description: "Información general y datos de matrícula",
                  tab: "perfil",
                  color: "tertiary",
                },
              ]}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab !== "inicio" && (
            <div className="space-y-6">

              {/* Header de la sección */}
              <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5 border-outline-variant/30`}>
                <div>
                  <h2 className="font-headline text-xl font-bold text-on-surface">
                    {activeTab === "progreso" && "Avance Cognitivo de mi Hijo/a"}
                    {activeTab === "historial" && "Historial de Avance Temporal"}
                    {activeTab === "tareas" && "Tareas y Actividades en Casa"}
                    {activeTab === "perfil" && "Perfil del Estudiante"}
                  </h2>
                  <p className={`text-xs mt-1 text-on-surface-variant`}>
                    {activeTab === "progreso" && "Revisa el historial de evaluaciones del menor."}
                    {activeTab === "historial" && "Línea de tiempo del progreso evolutivo unidad por unidad."}
                    {activeTab === "tareas" && "Reporta el cumplimiento de las tareas escolares."}
                    {activeTab === "perfil" && "Información general y datos de registro de la matrícula."}
                  </p>
                </div>

                {hijos.length > 1 && (
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold text-on-surface-variant`}>Estudiante:</span>
                    <select
                      value={selectedHijo ? selectedHijo.estudiante?.id : ""}
                      onChange={(e) => {
                        const hij = hijos.find((h) => h.estudiante?.id === e.target.value);
                        if (hij) setSelectedHijo(hij);
                      }}
                      className={`border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 w-[200px] ds-input w-[200px] shadow-sm`}
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
                  <div className={`border p-6 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-6 shadow-xl relative overflow-hidden ds-card`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-xl pointer-events-none" />
                    <div>
                      <span className="rounded-md border border-tertiary-container/40 bg-tertiary-container/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-tertiary">
                        Estudiante
                      </span>
                      <h3 className={`text-lg font-extrabold mt-2 text-on-surface`}>
                        {selectedHijo.estudiante?.nombre} {selectedHijo.estudiante?.apellido}
                      </h3>
                      <p className="mt-0.5 font-mono text-[11px] text-on-surface-variant">C.I.: {selectedHijo.estudiante?.cedula || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-on-surface-variant">
                        Aula / Semillero
                      </span>
                      <p className={`text-sm font-bold mt-2 text-on-surface`}>{selectedHijo.grupo?.nombre || "No asignado"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-on-surface-variant">
                        Docente Responsable
                      </span>
                      <p className={`text-sm font-bold mt-2 text-on-surface`}>
                        {selectedHijo.docente?.nombre} {selectedHijo.docente?.apellido}
                      </p>
                    </div>
                  </div>

                  {/* CONTENIDO DE PESTAÑA: AVANCE COGNITIVO */}
                  {activeTab === "progreso" && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className={`text-base font-extrabold text-on-surface`}>Rúbrica Cognitiva</h3>
                        {hijoProgreso.length === 0 ? (
                          <div className={`border rounded-2xl py-12 text-center ds-card text-on-surface-variant`}>
                            <span className="text-3xl block mb-2">📈</span>
                            <p className="text-xs font-semibold">El docente a cargo aún no ha registrado evaluaciones cognitivas para el menor.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {hijoProgreso.map((prog) => {
                              const code = prog.niveles_logro?.codigo;
                              let cardBorder = "border-outline-variant/30 hover:border-primary/30";
                              let badgeClass = "bg-surface-container text-on-surface-variant border-outline-variant/30";

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
                                <div key={prog.id} className={`flex flex-col justify-between rounded-2xl border bg-surface-container-lowest p-6 shadow-xl transition-all ${cardBorder}`}>
                                  <div>
                                    <div className="flex justify-between items-start gap-4">
                                      <h4 className={`font-extrabold text-base text-on-surface`}>{prog.criterios_evaluacion?.nombre}</h4>
                                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border tracking-wider shrink-0 ${badgeClass}`}>
                                        {prog.niveles_logro?.nombre}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-on-surface-variant font-bold uppercase mt-2">
                                      Unidad: {prog.unidades_didacticas?.titulo || "N/A"}
                                    </p>
                                  </div>
                                  <div className="mt-4 rounded-xl border border-outline-variant/20 bg-surface-container-low p-4 text-xs leading-relaxed text-on-surface-variant">
                                    <span className="font-bold text-on-surface-variant uppercase tracking-wider block text-[10px] mb-1">Observaciones del Educador:</span>
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
                        <div className={`border p-6 sm:p-8 rounded-2xl space-y-6 ds-card shadow-sm`}>
                          <h3 className="border-b border-outline-variant/20 pb-3 text-base font-extrabold text-on-surface">
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
                              <div key={i} className="space-y-1 rounded-xl border border-outline-variant/20 bg-surface-container-low p-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{f.label}</h4>
                                <p className="mt-1 text-xs leading-relaxed text-on-surface">{f.text}</p>
                              </div>
                            ))}
                          </div>

                          {hijoFicha.acciones_apoyo && (
                            <div className="mt-4 space-y-1 border-t border-outline-variant/20 pt-5">
                              <h4 className="text-xs font-extrabold uppercase tracking-wider text-tertiary">Acciones de Apoyo Recomendadas para el Hogar</h4>
                              <p className="text-xs font-bold leading-relaxed text-on-surface">{hijoFicha.acciones_apoyo}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* CONTENIDO DE PESTAÑA: HISTORIAL DE AVANCE */}
                  {activeTab === "historial" && (
                    <div className={`border p-6 rounded-2xl shadow-xl space-y-6 ds-card`}>
                      <h3 className="border-b border-outline-variant/20 pb-3 text-base font-extrabold text-on-surface">Línea de Tiempo del Progreso</h3>
                      {hijoProgreso.length === 0 ? (
                        <div className="text-center py-6 text-on-surface-variant">
                          <p className="text-xs font-semibold">No se encontraron registros de avance para graficar la evolución histórica.</p>
                        </div>
                      ) : (
                        <div className={`relative border-l ml-4 pl-6 space-y-6 border-outline-variant/30`}>
                          {hijoProgreso.map((prog) => (
                            <div key={prog.id} className="relative">
                              <div className="absolute -left-[29px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                              <div className="space-y-1 rounded-xl border border-outline-variant/20 bg-surface-container-low p-4">
                                <span className="text-[10px] text-on-surface-variant font-mono block">Evaluación de la Unidad</span>
                                <h4 className={`font-bold text-sm text-on-surface`}>{prog.criterios_evaluacion?.nombre}</h4>
                                <p className="text-xs font-semibold text-primary">{prog.unidades_didacticas?.titulo || "Unidad de Aprendizaje"}</p>
                                <div className="pt-2 flex items-center gap-4 text-xs">
                                  <p><span className="text-on-surface-variant">Logro:</span> <strong className="text-highlight-green">{prog.niveles_logro?.nombre || "N/A"}</strong></p>
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
                      <div className={`border p-6 rounded-2xl shadow-xl ds-card`}>
                        {actividadesCasa.length === 0 ? (
                          <div className="text-center py-12 text-on-surface-variant">
                            <span className="text-3xl block mb-2">🏠</span>
                            <p className="text-xs font-semibold">No se registran tareas asignadas para la unidad activa.</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-outline-variant/20 space-y-6">
                            {actividadesCasa.map((task) => (
                              <div key={task.id} className="flex gap-4 pt-6 first:pt-0 items-start">
                                <input
                                  type="checkbox"
                                  checked={task.realizada}
                                  onChange={(e) => handleToggleTaskCasa(task.id, e.target.checked, task.comentario_familia || "")}
                                  className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border-outline-variant/40 bg-surface-container-lowest text-primary focus:ring-primary"
                                />
                                <div className="flex-1 space-y-2">
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-start gap-4">
                                      <div>
                                        <span className="rounded border border-outline-variant/30 bg-surface-container px-2 py-0.5 text-[9px] font-extrabold uppercase text-on-surface-variant">
                                          {task.unidad_titulo}
                                        </span>
                                        <h4 className={`font-extrabold text-base mt-2 text-on-surface`}>{task.titulo}</h4>
                                      </div>
                                      {task.nota && getEquivalenciaNota(task.nota) && (
                                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border tracking-wider shrink-0 ${getEquivalenciaNota(task.nota)?.colorClass}`}>
                                          Nota: {getEquivalenciaNota(task.nota)?.label}
                                        </span>
                                      )}
                                    </div>
                                    <p className="mt-1 text-xs leading-relaxed text-on-surface">{task.descripcion}</p>
                                  </div>

                                  {task.recursos_enlaces && task.recursos_enlaces.length > 0 && (
                                    <div className="flex gap-2 flex-wrap pt-1">
                                      {task.recursos_enlaces.map((rec, idx) => (
                                        <a
                                          key={idx}
                                          href={rec.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="flex items-center gap-1.5 rounded-lg border border-outline-variant/30 bg-surface-container-low py-1.5 px-3 text-[10px] font-extrabold text-primary transition-all hover:bg-surface-container"
                                        >
                                          <span>📄</span>
                                          <span>{rec.titulo}</span>
                                        </a>
                                      ))}
                                    </div>
                                  )}

                                  <div className="space-y-1.5 pt-2">
                                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Comentarios Familia / Reporte:</span>
                                    <input
                                      type="text"
                                      placeholder="Escribe brevemente cómo le fue a tu hijo/a realizando esta tarea..."
                                      defaultValue={task.comentario_familia || ""}
                                      onBlur={(e) => {
                                        if (e.target.value !== task.comentario_familia) {
                                          handleToggleTaskCasa(task.id, task.realizada, e.target.value);
                                        }
                                      }}
                                      className="ds-input w-full max-w-xl px-4 py-2 text-xs"
                                    />
                                    {task.fecha_realizacion && (
                                      <p className="text-[10px] text-on-surface-variant font-semibold pt-1">
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
                    <div className={`border p-6 rounded-2xl shadow-xl space-y-4 ds-card`}>
                      <h3 className="border-b border-outline-variant/20 pb-3 text-base font-extrabold text-on-surface">Información del Estudiante</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-2 rounded-xl border border-outline-variant/20 bg-surface-container-low p-4">
                          <p><span className="font-medium text-on-surface-variant">Nombres:</span> <strong className="text-on-surface">{selectedHijo.estudiante?.nombre || "N/A"}</strong></p>
                          <p><span className="font-medium text-on-surface-variant">Apellidos:</span> <strong className="text-on-surface">{selectedHijo.estudiante?.apellido || "N/A"}</strong></p>
                          <p><span className="font-medium text-on-surface-variant">Cédula de Identidad:</span> <strong className="font-mono text-on-surface">{selectedHijo.estudiante?.cedula || "N/A"}</strong></p>
                        </div>
                        <div className="space-y-2 rounded-xl border border-outline-variant/20 bg-surface-container-low p-4">
                          <p><span className="font-medium text-on-surface-variant">Semillero Asignado:</span> <strong className="text-on-surface">{selectedHijo.grupo?.nombre || "No asignado"}</strong></p>
                          <p><span className="font-medium text-on-surface-variant">Parentesco registrado:</span> <strong className="text-on-surface">{selectedHijo.parentesco || "Representado"}</strong></p>
                          <p>
                            <span className="font-medium text-on-surface-variant">Fecha de Nacimiento:</span>{" "}
                            <strong className="text-on-surface">
                              {selectedHijo.estudiante?.fecha_nacimiento ? new Date(selectedHijo.estudiante.fecha_nacimiento).toLocaleDateString() : "No registrada"}
                            </strong>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className={`border rounded-2xl text-center py-20 ds-card text-on-surface-variant`}>
                  <span className="text-4xl block mb-3">👦</span>
                  <p className="text-sm font-bold">No se encontraron estudiantes asociados a tu cuenta de representante.</p>
                </div>
              )}

            </div>
          )}
      </div>
    </DashboardShell>
  );
}