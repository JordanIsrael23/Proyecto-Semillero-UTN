"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { UsuarioSession, HijoRel, EvaluacionCriterio, FichaMonitoreo, ActividadCasa } from "@/types/familia";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api";

export default function FamiliaDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<UsuarioSession | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Estados de negocio
  const [activeTab, setActiveTab] = useState<string>("progreso");
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

  // 2. Cargar hijos asociados
  useEffect(() => {
    if (!session) return;

    fetch(`${BACKEND_URL}/familia/hijos`, { headers: { "x-user-id": session.user.id } })
      .then((res) => res.json())
      .then((data) => {
        setHijos(data);
        if (data.length > 0) {
          setSelectedHijo(data[0]);
        }
      })
      .catch((e) => console.error("Error al cargar hijos:", e));
  }, [session]);

  // 3. Cargar progreso, ficha y tareas cuando cambia el hijo seleccionado o la pestaña activa
  useEffect(() => {
    if (!selectedHijo) return;
    const estId = selectedHijo.estudiante.id;

    // Cargar evaluaciones cognitivas
    fetch(`${BACKEND_URL}/estudiantes/${estId}/evaluaciones`)
      .then((res) => res.json())
      .then((data) => setHijoProgreso(data))
      .catch((e) => console.error("Error al cargar progreso del estudiante:", e));

    // Cargar ficha cualitativa
    fetch(`${BACKEND_URL}/estudiantes/${estId}/ficha-monitoreo`)
      .then((res) => res.text().then((text) => (text ? JSON.parse(text) : null)))
      .then((data) => setHijoFicha(data))
      .catch((e) => console.error("Error al cargar ficha del estudiante:", e));

    // Cargar tareas para el hogar
    fetch(`${BACKEND_URL}/estudiantes/${estId}/actividades-casa`)
      .then((res) => res.json())
      .then((data) => setActividadesCasa(data))
      .catch((e) => console.error("Error al cargar tareas en casa:", e));
  }, [selectedHijo]);

  // Cerrar Sesión
  const handleLogout = () => {
    localStorage.removeItem("user_session");
    router.replace("/");
  };

  // Marcar tarea realizada o actualizar comentario
  const handleToggleTaskCasa = async (actId: string, realizada: boolean, comentario: string) => {
    if (!selectedHijo) return;
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
      setActividadesCasa(tasksData);
    } catch (e) {
      alert("Error al actualizar la tarea de casa.");
    }
  };

  if (loadingSession) {
    return (
      <div className="flex-1 h-screen flex items-center justify-center bg-slate-900 text-slate-400 font-sans">
        <p className="text-lg font-semibold animate-pulse">Cargando sesión familiar...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      
      {/* 1. BARRA SUPERIOR */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-500/10 border border-pink-500/20 rounded-xl">
            <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">Semilleros UTN &bull; Apoyo Pedagógico</h1>
            <p className="text-xs text-slate-500 font-medium">Panel de Representantes de Familia</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-bold text-white">{session?.perfil.nombre} {session?.perfil.apellido}</p>
            <p className="text-xs text-pink-400 font-bold uppercase tracking-wider">Representante</p>
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
        
        {/* 2. BARRA LATERAL (CON LOS NUEVOS BOTONES MANTENIENDO TU ESTILO) */}
        <aside className="w-full md:w-64 bg-slate-950/50 md:border-r border-slate-800 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("progreso")}
            className={`w-full text-left py-3 px-4 rounded-xl text-sm font-bold flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === "progreso" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:bg-slate-850 hover:text-white"
            }`}
          >
            <span>📈 Avance Cognitivo</span>
          </button>

          <button
            onClick={() => setActiveTab("historial")}
            className={`w-full text-left py-3 px-4 rounded-xl text-sm font-bold flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === "historial" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:bg-slate-850 hover:text-white"
            }`}
          >
            <span>📊 Historial de Avance</span>
          </button>

          <button
            onClick={() => setActiveTab("tareas")}
            className={`w-full text-left py-3 px-4 rounded-xl text-sm font-bold flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === "tareas" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:bg-slate-850 hover:text-white"
            }`}
          >
            <span>🏠 Actividades en Casa</span>
          </button>

          <button
            onClick={() => setActiveTab("perfil")}
            className={`w-full text-left py-3 px-4 rounded-xl text-sm font-bold flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === "perfil" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:bg-slate-850 hover:text-white"
            }`}
          >
            <span>👦 Perfil del Estudiante</span>
          </button>
        </aside>

        {/* 3. CONTENIDO DINÁMICO */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          
          <div className="space-y-6">
            
            {/* Header de la sección de hijo */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {activeTab === "progreso" && "Avance Cognitivo de mi Hijo/a"}
                  {activeTab === "historial" && "Historial de Avance Temporal"}
                  {activeTab === "tareas" && "Tareas y Actividades en Casa"}
                  {activeTab === "perfil" && "Perfil del Estudiante"}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {activeTab === "progreso" && "Revisa el historial de evaluaciones del menor."}
                  {activeTab === "historial" && "Línea de tiempo del progreso evolutivo unidad por unidad."}
                  {activeTab === "tareas" && "Reporta el cumplimiento de las tareas escolares."}
                  {activeTab === "perfil" && "Información general y datos de registro de la matrícula."}
                </p>
              </div>
              
              {hijos.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold">Estudiante:</span>
                  <select
                    value={selectedHijo ? selectedHijo.estudiante.id : ""}
                    onChange={(e) => {
                      const hij = hijos.find((h) => h.estudiante.id === e.target.value);
                      if (hij) setSelectedHijo(hij);
                    }}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 w-[200px]"
                  >
                    {hijos.map((h) => (
                      <option key={h.estudiante.id} value={h.estudiante.id}>
                        {h.estudiante.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Botones de acciones del representante (visual, sin lógica) */}
            <div className="py-4">
              <h3 className="text-sm font-bold text-slate-300 mb-2">Acciones rápidas</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button className="py-3 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white hover:bg-indigo-600/20">📣 Reportar incidencia</button>
                <button className="py-3 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white hover:bg-indigo-600/20">🏠 Reportar tarea</button>
                <button className="py-3 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white hover:bg-indigo-600/20">📄 Ver informes</button>
                <button className="py-3 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white hover:bg-indigo-600/20">✉️ Contactar docente</button>
                <button className="py-3 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white hover:bg-indigo-600/20">📅 Solicitar reunión</button>
                <button className="py-3 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white hover:bg-indigo-600/20">🔔 Notificaciones</button>
                <button className="py-3 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white hover:bg-indigo-600/20">📚 Recursos</button>
                <button className="py-3 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white hover:bg-indigo-600/20">⚙️ Ajustes perfil</button>
              </div>
            </div>

            {selectedHijo ? (
              <div className="space-y-6">
                
                {/* 1. Tarjeta de Datos del Hijo (Ficha Rápida) */}
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-xl pointer-events-none" />
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded-md">
                      Estudiante
                    </span>
                    <h3 className="text-lg font-extrabold text-white mt-2">
                      {selectedHijo.estudiante.nombre} {selectedHijo.estudiante.apellido}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">C.I.: {selectedHijo.estudiante.cedula}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                      Aula / Semillero
                    </span>
                    <p className="text-sm font-bold text-white mt-2">{selectedHijo.grupo.nombre}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                      Docente Responsable
                    </span>
                    <p className="text-sm font-bold text-white mt-2">
                      {selectedHijo.docente.nombre} {selectedHijo.docente.apellido}
                    </p>
                  </div>
                </div>

                {/* CONTENIDO DE PESTAÑA: AVANCE COGNITIVO */}
                {activeTab === "progreso" && (
                  <div className="space-y-6">
                    
                    {/* Rejilla de Criterios Evaluados */}
                    <div className="space-y-4">
                      <h3 className="text-base font-extrabold text-white">Rúbrica Cognitiva</h3>
                      {hijoProgreso.length === 0 ? (
                        <div className="bg-slate-950 border border-slate-800 rounded-2xl py-12 text-center text-slate-500">
                          <span className="text-3xl block mb-2">📈</span>
                          <p className="text-xs font-semibold">El docente a cargo aún no ha registrado evaluaciones cognitivas para el menor.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {hijoProgreso.map((prog) => {
                            const code = prog.niveles_logro?.codigo;
                            let cardBorder = "border-slate-800 hover:border-slate-700";
                            let badgeClass = "bg-slate-850 text-slate-400 border-slate-800";
                            
                            if (code === "I") {
                              cardBorder = "border-red-500/30 hover:border-red-500/50";
                              badgeClass = "bg-red-500/10 text-red-400 border-red-500/20";
                            } else if (code === "EP") {
                              cardBorder = "border-amber-500/30 hover:border-amber-500/50";
                              badgeClass = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                            } else if (code === "L") {
                              cardBorder = "border-emerald-500/30 hover:border-emerald-500/50";
                              badgeClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                            }

                            return (
                              <div key={prog.id} className={`bg-slate-950 border p-6 rounded-2xl flex flex-col justify-between transition-all shadow-xl ${cardBorder}`}>
                                <div>
                                  <div className="flex justify-between items-start gap-4">
                                    <h4 className="font-extrabold text-white text-base">{prog.criterios_evaluacion?.nombre}</h4>
                                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border tracking-wider shrink-0 ${badgeClass}`}>
                                      {prog.niveles_logro?.nombre}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-2">
                                    Unidad: {prog.unidades_didacticas?.titulo}
                                  </p>
                                </div>
                                <div className="mt-4 bg-slate-900/60 p-4 rounded-xl border border-slate-850 text-xs leading-relaxed text-slate-300">
                                  <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px] mb-1">Observaciones del Educador:</span>
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
                      <div className="bg-slate-950 border border-slate-800 p-6 sm:p-8 rounded-2xl space-y-6 shadow-2xl">
                        <h3 className="text-base font-extrabold text-white border-b border-slate-900 pb-3">
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
                            <div key={i} className="space-y-1 bg-slate-900/40 p-4 rounded-xl border border-slate-850">
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{f.label}</h4>
                              <p className="text-slate-200 mt-1 leading-relaxed text-xs">{f.text}</p>
                            </div>
                          ))}
                        </div>

                        {hijoFicha.acciones_apoyo && (
                          <div className="border-t border-slate-900 pt-5 mt-4 space-y-1">
                            <h4 className="text-xs font-extrabold text-pink-400 uppercase tracking-wider">Acciones de Apoyo Recomendadas para el Hogar</h4>
                            <p className="text-slate-300 font-bold text-xs leading-relaxed">{hijoFicha.acciones_apoyo}</p>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                )}

                {/* CONTENIDO DE PESTAÑA NUEVA: HISTORIAL DE AVANCE (RF-F03) */}
                {activeTab === "historial" && (
                  <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
                    <h3 className="text-base font-extrabold text-white border-b border-slate-900 pb-3">Línea de Tiempo del Progreso</h3>
                    {hijoProgreso.length === 0 ? (
                      <div className="text-center py-6 text-slate-500">
                        <p className="text-xs font-semibold">No se encontraron registros de avance para graficar la evolución histórica.</p>
                      </div>
                    ) : (
                      <div className="relative border-l border-slate-800 ml-4 pl-6 space-y-6">
                        {hijoProgreso.map((prog) => (
                          <div key={prog.id} className="relative">
                            <div className="absolute -left-[29px] top-1 bg-indigo-600 rounded-full w-2.5 h-2.5" />
                            <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl space-y-1">
                              <span className="text-[10px] text-slate-500 font-mono block">Evaluación de la Unidad</span>
                              <h4 className="font-bold text-white text-sm">{prog.criterios_evaluacion?.nombre}</h4>
                              <p className="text-xs text-indigo-400">{prog.unidades_didacticas?.titulo}</p>
                              <div className="pt-2 flex items-center gap-4 text-xs">
                                <p><span className="text-slate-500">Logro:</span> <strong className="text-emerald-400">{prog.niveles_logro?.nombre}</strong></p>
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
                    <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl shadow-xl">
                      {actividadesCasa.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                          <span className="text-3xl block mb-2">🏠</span>
                          <p className="text-xs font-semibold">No se registran tareas asignadas para la unidad activa.</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-850 space-y-6">
                          {actividadesCasa.map((task) => (
                            <div key={task.id} className="flex gap-4 pt-6 first:pt-0 items-start">
                              <input
                                type="checkbox"
                                checked={task.realizada}
                                onChange={(e) => handleToggleTaskCasa(task.id, e.target.checked, task.comentario_familia || "")}
                                className="w-5 h-5 rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-slate-900 mt-1 cursor-pointer shrink-0"
                              />
                              <div className="flex-1 space-y-2">
                                <div>
                                  <span className="text-[9px] font-extrabold uppercase bg-slate-900 text-slate-500 border border-slate-800 px-2 py-0.5 rounded">
                                    {task.unidad_titulo}
                                  </span>
                                  <h4 className="font-extrabold text-white text-base mt-2">{task.titulo}</h4>
                                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{task.descripcion}</p>
                                </div>

                                {task.recursos_enlaces && task.recursos_enlaces.length > 0 && (
                                  <div className="flex gap-2 flex-wrap pt-1">
                                    {task.recursos_enlaces.map((rec, idx) => (
                                      <a
                                        key={idx}
                                        href={rec.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] font-extrabold text-indigo-400 transition-all flex items-center gap-1.5"
                                      >
                                        <span>📄</span>
                                        <span>{rec.titulo}</span>
                                      </a>
                                    ))}
                                  </div>
                                )}

                                <div className="space-y-1.5 pt-2">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Comentarios Familia / Reporte:</span>
                                  <input
                                    type="text"
                                    placeholder="Escribe brevemente cómo le fue a tu hijo/a realizando esta tarea..."
                                    defaultValue={task.comentario_familia || ""}
                                    onBlur={(e) => {
                                      if (e.target.value !== task.comentario_familia) {
                                        handleToggleTaskCasa(task.id, task.realizada, e.target.value);
                                      }
                                    }}
                                    className="w-full max-w-xl bg-slate-900 border border-slate-850 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                                  />
                                  {task.fecha_realizacion && (
                                    <p className="text-[10px] text-slate-500 font-semibold pt-1">
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

                {/* CONTENIDO DE PESTAÑA NUEVA: PERFIL DEL ESTUDIANTE (RF-F01) */}
                {activeTab === "perfil" && (
                  <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                    <h3 className="text-base font-extrabold text-white border-b border-slate-900 pb-3">Información del Estudiante</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 space-y-1">
                        <p><span className="text-slate-500">Nombres:</span> <strong className="text-white">{selectedHijo.estudiante.nombre}</strong></p>
                        <p><span className="text-slate-500">Apellidos:</span> <strong className="text-white">{selectedHijo.estudiante.apellido}</strong></p>
                        <p><span className="text-slate-500">Cédula:</span> <strong className="text-white font-mono">{selectedHijo.estudiante.cedula}</strong></p>
                      </div>
                      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 space-y-1">
                        <p><span className="text-slate-500">Semillero:</span> <strong className="text-white">{selectedHijo.grupo.nombre}</strong></p>
                        <p><span className="text-slate-500">Parentesco:</span> <strong className="text-white">{selectedHijo.parentesco}</strong></p>
                        <p><span className="text-slate-500">Fecha Nacimiento:</span> <strong className="text-white">{new Date(selectedHijo.estudiante.fecha_nacimiento).toLocaleDateString()}</strong></p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl text-center py-20 text-slate-500">
                <span className="text-4xl block mb-3">👦</span>
                <p className="text-sm font-bold">No se encontraron estudiantes asociados a tu cuenta de representante.</p>
              </div>
            )}

          </div>

        </main>
      </div>

    </div>
  );
}