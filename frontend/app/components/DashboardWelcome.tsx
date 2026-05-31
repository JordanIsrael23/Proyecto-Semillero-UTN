"use client";

import Image from "next/image";
import MaterialIcon from "./MaterialIcon";

interface KpiIndicator {
  icon: string;
  label: string;
  value: string | number;
  subtitle: string;
  color: "soft-blue" | "orange" | "primary" | "green" | "secondary" | "tertiary";
}

interface QuickAction {
  icon: string;
  label: string;
  description: string;
  tab: string;
  color: "soft-blue" | "orange" | "primary" | "green" | "secondary" | "tertiary";
}

interface DashboardWelcomeProps {
  userName: string;
  role: "docente" | "familia";
  indicators: KpiIndicator[];
  actions: QuickAction[];
  onNavigate: (tab: string) => void;
}

const colorMap = {
  "soft-blue": {
    bg: "bg-soft-blue/10",
    text: "text-soft-blue",
    hover: "group-hover:bg-soft-blue group-hover:text-white",
  },
  orange: {
    bg: "bg-highlight-orange/10",
    text: "text-highlight-orange",
    hover: "group-hover:bg-highlight-orange group-hover:text-on-surface",
  },
  primary: {
    bg: "bg-primary/10",
    text: "text-primary",
    hover: "group-hover:bg-primary group-hover:text-on-primary",
  },
  green: {
    bg: "bg-highlight-green/10",
    text: "text-highlight-green",
    hover: "group-hover:bg-highlight-green group-hover:text-white",
  },
  secondary: {
    bg: "bg-secondary-fixed-dim/20",
    text: "text-secondary",
    hover: "group-hover:bg-secondary group-hover:text-white",
  },
  tertiary: {
    bg: "bg-tertiary-container/20",
    text: "text-tertiary",
    hover: "group-hover:bg-tertiary group-hover:text-white",
  },
};

const EDUCATION_BG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBpaj4Pmr8NEE6L9VgElItMAX4H1g3cOFLLTGNooiWn6d6ThO7nbu2C3CL3ny-ou5aJURMrgY9OkeU0hJ0urMwxWdaZFMsOfS0LExb5XDCwiVQrCRHB_3Mk9kNMQUXkPviMvZc8bcBDIoN2b3mvYPMvw7yY-MtsDMndjfhXCTiQuW3QsaHrd1--mI7KTxHzDWn3ZXBGmGB4_QooQBOPGZoJ41gteYw2kQnxyfQmbK3N-0TAV03C7ekWuIzgPYnSm0VUrOLDWLlynQM";

function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString("es-EC", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function DashboardWelcome({
  userName,
  role,
  indicators,
  actions,
  onNavigate,
}: DashboardWelcomeProps) {
  const firstName = getFirstName(userName);
  const dateStr = getFormattedDate();
  const roleLabel = role === "docente" ? "Docente" : "Representante Familiar";
  const progress = role === "docente" ? 85 : 92;

  const sesiones =
    role === "docente"
      ? [
          {
            hora: "08:30",
            meridiano: "AM",
            titulo: "Matemáticas - Grado 5",
            detalle: "Unidad 4: Fracciones Avanzadas",
            activa: true,
          },
          {
            hora: "10:15",
            meridiano: "AM",
            titulo: "Ciencias Naturales",
            detalle: "Laboratorio de Fotosíntesis",
            activa: false,
          },
        ]
      : [
          {
            hora: "Hoy",
            meridiano: "",
            titulo: "Revisar tareas en casa",
            detalle: "Actividades pendientes del semillero",
            activa: true,
          },
          {
            hora: "Esta",
            meridiano: "sem.",
            titulo: "Consultar avance cognitivo",
            detalle: "Últimas evaluaciones del docente",
            activa: false,
          },
        ];

  return (
    <section className="animate-fade-in space-y-6">
      {/* Welcome + Progress */}
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
        <div className="relative flex items-center gap-8 overflow-hidden rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-sm lg:col-span-2 sm:p-10">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <span className="font-headline text-5xl font-bold text-primary">{firstName.charAt(0).toUpperCase()}</span>
          </div>
          <div className="relative z-10 min-w-0 space-y-2">
            <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              {roleLabel}
            </span>
            <h1 className="font-headline text-3xl font-semibold leading-tight text-on-surface sm:text-[2.5rem] sm:leading-[3rem]">
              ¡Hola, <span className="text-primary">{firstName}!</span> 👋
            </h1>
            <p className="max-w-xl text-base text-on-surface-variant">
              {role === "docente"
                ? "Bienvenido al Sistema de Apoyo Pedagógico. Gestiona tus grupos, planifica y evalúa el desarrollo cognitivo de tus estudiantes."
                : "Bienvenido al Sistema de Apoyo Pedagógico. Consulta el progreso de tus hijos y las actividades asignadas para el hogar."}
            </p>
            <p className="flex items-center gap-1.5 pt-2 text-sm text-on-surface-variant/60">
              <MaterialIcon name="calendar_today" className="text-base" />
              <span className="capitalize">{dateStr}</span>
            </p>
          </div>
          <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="flex flex-col justify-center rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-8 text-center shadow-sm">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70">
            {role === "docente" ? "Progreso Semanal" : "Avance General"}
          </p>
          <span className="font-headline mb-6 text-[3.5rem] font-bold leading-none text-primary">{progress}%</span>
          <div className="mb-3 h-2 w-full rounded-full bg-surface-container-highest">
            <div
              className="h-full rounded-full bg-highlight-green transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-on-surface-variant">
            {role === "docente"
              ? "Evaluaciones completadas esta semana"
              : "Tareas y seguimiento al día"}
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {indicators.map((kpi, idx) => {
          const c = colorMap[kpi.color] ?? colorMap.primary;
          return (
            <div
              key={idx}
              className="flex items-start justify-between rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm"
            >
              <div className="space-y-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.bg} ${c.text}`}>
                  <MaterialIcon name={kpi.icon} filled className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-on-surface">{kpi.label}</h3>
                  <p className="mt-1 text-xs text-on-surface-variant">{kpi.subtitle}</p>
                </div>
              </div>
              <span className="font-headline text-4xl text-secondary">{kpi.value}</span>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-on-surface">
          <MaterialIcon name="bolt" className="text-highlight-orange" />
          <h2 className="font-headline text-2xl font-medium">Acciones Rápidas</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {actions.map((action, idx) => {
            const c = colorMap[action.color] ?? colorMap.primary;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onNavigate(action.tab)}
                className="group flex cursor-pointer items-center gap-5 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 text-left transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${c.bg} ${c.text} ${c.hover}`}
                >
                  <MaterialIcon name={action.icon} className="text-2xl" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-on-surface transition-colors group-hover:text-primary">
                    {action.label}
                  </p>
                  <p className="mt-0.5 text-xs text-on-surface-variant">{action.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Próximas sesiones + Asistencia */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h4 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">
              {role === "docente" ? "Próximas Sesiones" : "Recordatorios"}
            </h4>
            <MaterialIcon name="calendar_today" className="text-on-surface-variant" />
          </div>
          <div className="space-y-4">
            {sesiones.map((sesion, i) => (
              <div
                key={i}
                className={`flex items-center gap-5 rounded-2xl p-4 transition-colors ${
                  sesion.activa
                    ? "border border-primary/5 bg-primary/5 hover:bg-primary/10"
                    : "bg-surface-container/50 opacity-70 hover:bg-surface-container"
                }`}
              >
                <div
                  className={`w-14 shrink-0 rounded-xl p-2.5 text-center text-xs font-bold shadow-sm ${
                    sesion.activa
                      ? "bg-primary text-on-primary"
                      : "border border-soft-blue/10 bg-soft-blue/20 text-soft-blue"
                  }`}
                >
                  {sesion.hora}
                  {sesion.meridiano && (
                    <>
                      <br />
                      {sesion.meridiano}
                    </>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold text-on-surface">{sesion.titulo}</p>
                  <p className="mt-0.5 text-xs text-on-surface-variant">{sesion.detalle}</p>
                </div>
                {sesion.activa && role === "docente" && (
                  <button
                    type="button"
                    className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-lowest"
                    aria-label="Más opciones"
                  >
                    <MaterialIcon name="more_vert" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[240px] overflow-hidden rounded-3xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm">
          <Image
            src={EDUCATION_BG}
            alt="Ambiente educativo"
            fill
            className="object-cover opacity-15"
            unoptimized
          />
          <div className="relative z-10 flex h-full min-h-[240px] flex-col justify-end bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/80 to-transparent p-10">
            <h4 className="font-headline text-2xl font-medium text-on-surface">
              {role === "docente" ? "Asistencia" : "Seguimiento"}
            </h4>
            <p className="mt-2 text-base text-on-surface-variant">
              {role === "docente"
                ? "Hoy registraste el 100% de asistencia en tu grupo activo."
                : "Mantén al día el reporte de actividades en casa de tu hijo/a."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
