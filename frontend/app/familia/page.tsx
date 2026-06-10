"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardWelcome from "../components/DashboardWelcome";
import DashboardShell from "../components/DashboardShell";
import HijoCard from "./components/HijoCard";
import ProgresoTab from "./components/ProgresoTab";
import HistorialTab from "./components/HistorialTab";
import TareasTab from "./components/TareasTab";
import PerfilTab from "./components/PerfilTab";
import AjustesTab from "../components/AjustesTab";
import { UsuarioSession, HijoRel, EvaluacionCriterio, FichaMonitoreo, ActividadCasa } from "./types";

const FAMILIA_NAV = [
  { id: "inicio", label: "Inicio", icon: "home" },
  { id: "progreso", label: "Avance Cognitivo", icon: "trending_up" },
  { id: "historial", label: "Historial de Avance", icon: "timeline" },
  { id: "tareas", label: "Actividades en Casa", icon: "home_work" },
  { id: "perfil", label: "Perfil del Estudiante", icon: "face" },
] as const;

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api";

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
        <div className="fixed inset-x-0 top-6 z-[9999] flex justify-center px-4">
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

        {activeTab !== "inicio" && activeTab !== "ajustes" && (
          <div className="space-y-6">

            {/* Header de la sección */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5 border-outline-variant/30">
              <div>
                <h2 className="font-headline text-xl font-bold text-on-surface">
                  {activeTab === "progreso" && "Avance Cognitivo de mi Hijo/a"}
                  {activeTab === "historial" && "Historial de Avance Temporal"}
                  {activeTab === "tareas" && "Tareas y Actividades en Casa"}
                  {activeTab === "perfil" && "Perfil del Estudiante"}
                </h2>
                <p className="text-xs mt-1 text-on-surface-variant">
                  {activeTab === "progreso" && "Revisa el historial de evaluaciones del menor."}
                  {activeTab === "historial" && "Línea de tiempo del progreso evolutivo unidad por unidad."}
                  {activeTab === "tareas" && "Reporta el cumplimiento de las tareas escolares."}
                  {activeTab === "perfil" && "Información general y datos de registro de la matrícula."}
                </p>
              </div>

              {hijos.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-on-surface-variant">Estudiante:</span>
                  <select
                    value={selectedHijo ? selectedHijo.estudiante?.id : ""}
                    onChange={(e) => {
                      const hij = hijos.find((h) => h.estudiante?.id === e.target.value);
                      if (hij) setSelectedHijo(hij);
                    }}
                    className="border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 w-[200px] ds-input shadow-sm"
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
                <HijoCard selectedHijo={selectedHijo} />

                {/* CONTENIDO DE PESTAÑA: AVANCE COGNITIVO */}
                {activeTab === "progreso" && (
                  <ProgresoTab
                    hijoProgreso={hijoProgreso}
                    hijoFicha={hijoFicha}
                  />
                )}

                {/* CONTENIDO DE PESTAÑA: HISTORIAL DE AVANCE */}
                {activeTab === "historial" && (
                  <HistorialTab hijoProgreso={hijoProgreso} />
                )}

                {/* CONTENIDO DE PESTAÑA: TAREAS EN CASA */}
                {activeTab === "tareas" && (
                  <TareasTab
                    actividadesCasa={actividadesCasa}
                    onToggleTask={handleToggleTaskCasa}
                  />
                )}

                {/* CONTENIDO DE PESTAÑA: PERFIL DEL ESTUDIANTE */}
                {activeTab === "perfil" && (
                  <PerfilTab selectedHijo={selectedHijo} />
                )}

              </div>
            ) : (
              <div className="border rounded-2xl text-center py-20 ds-card text-on-surface-variant">
                <span className="text-4xl block mb-3">👦</span>
                <p className="text-sm font-bold">No se encontraron estudiantes asociados a tu cuenta de representante.</p>
              </div>
            )}

          </div>
        )}

        {/* TAB AJUSTES */}
        {activeTab === "ajustes" && <AjustesTab session={session} />}
      </div>
    </DashboardShell>
  );
}