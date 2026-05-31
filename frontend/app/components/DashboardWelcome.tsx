"use client";

interface KpiIndicator {
  icon: string;
  label: string;
  value: string | number;
  subtitle: string;
  color: "indigo" | "emerald" | "amber" | "pink" | "cyan" | "violet";
}

interface QuickAction {
  icon: string;
  label: string;
  description: string;
  tab: string;
  color: "indigo" | "emerald" | "amber" | "pink" | "cyan" | "violet";
}

interface DashboardWelcomeProps {
  userName: string;
  role: "docente" | "familia";
  indicators: KpiIndicator[];
  actions: QuickAction[];
  onNavigate: (tab: string) => void;
}

const colorMap = {
  indigo: {
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    text: "text-indigo-400",
    glow: "shadow-indigo-500/10",
    gradient: "from-indigo-500/20 to-indigo-600/5",
    hoverBorder: "hover:border-indigo-400/40",
    badge: "bg-indigo-500/15 text-indigo-300",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/10",
    gradient: "from-emerald-500/20 to-emerald-600/5",
    hoverBorder: "hover:border-emerald-400/40",
    badge: "bg-emerald-500/15 text-emerald-300",
  },
  amber: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-400",
    glow: "shadow-amber-500/10",
    gradient: "from-amber-500/20 to-amber-600/5",
    hoverBorder: "hover:border-amber-400/40",
    badge: "bg-amber-500/15 text-amber-300",
  },
  pink: {
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    text: "text-pink-400",
    glow: "shadow-pink-500/10",
    gradient: "from-pink-500/20 to-pink-600/5",
    hoverBorder: "hover:border-pink-400/40",
    badge: "bg-pink-500/15 text-pink-300",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    text: "text-cyan-400",
    glow: "shadow-cyan-500/10",
    gradient: "from-cyan-500/20 to-cyan-600/5",
    hoverBorder: "hover:border-cyan-400/40",
    badge: "bg-cyan-500/15 text-cyan-300",
  },
  violet: {
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    text: "text-violet-400",
    glow: "shadow-violet-500/10",
    gradient: "from-violet-500/20 to-violet-600/5",
    hoverBorder: "hover:border-violet-400/40",
    badge: "bg-violet-500/15 text-violet-300",
  },
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 18) return "Buenas tardes";
  return "Buenas noches";
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
  const greeting = getGreeting();
  const dateStr = getFormattedDate();
  const roleLabel = role === "docente" ? "Docente" : "Representante Familiar";
  const accentColor = role === "docente" ? "indigo" : "pink";

  return (
    <section className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      {/* ── Banner de Bienvenida ── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 shadow-2xl shadow-slate-950/60">
        {/* Decorative blurs */}
        <div className={`pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full blur-3xl opacity-30 ${role === "docente" ? "bg-indigo-600" : "bg-pink-600"}`} />
        <div className={`pointer-events-none absolute -bottom-16 -left-16 h-44 w-44 rounded-full blur-3xl opacity-20 ${role === "docente" ? "bg-cyan-500" : "bg-amber-500"}`} />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Avatar + Greeting */}
          <div className="flex items-start gap-5">
            <div className={`flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl border text-2xl sm:text-3xl font-black uppercase tracking-widest shadow-xl ${colorMap[accentColor].bg} ${colorMap[accentColor].border} ${colorMap[accentColor].text} ${colorMap[accentColor].glow}`}>
              {userName.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] ${colorMap[accentColor].badge}`}>
                  {role === "docente" ? "📚" : "🏠"} {roleLabel}
                </span>
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                {greeting}, <span className={colorMap[accentColor].text}>{userName}</span>
              </h1>
              <p className="mt-2 text-sm text-slate-400 max-w-lg leading-relaxed">
                {role === "docente"
                  ? "Bienvenido al Sistema de Apoyo Pedagógico. Gestiona tus grupos, planifica y evalúa el desarrollo cognitivo de tus estudiantes."
                  : "Bienvenido al Sistema de Apoyo Pedagógico. Consulta el progreso de tus hijos y las actividades asignadas para el hogar."}
              </p>
              <p className="mt-2 text-xs text-slate-500 font-medium capitalize">
                📅 {dateStr}
              </p>
            </div>
          </div>

          {/* Right: Quick Stat Pill */}
          <div className="shrink-0 flex flex-col items-center gap-2">
            <div className={`rounded-2xl border bg-gradient-to-b ${colorMap[accentColor].gradient} ${colorMap[accentColor].border} px-6 py-5 text-center shadow-xl ${colorMap[accentColor].glow} min-w-[180px]`}>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-slate-400">
                {role === "docente" ? "Progreso Semanal" : "Avance General"}
              </p>
              <p className={`mt-3 text-4xl font-black ${colorMap[accentColor].text}`}>
                {role === "docente" ? "85%" : "92%"}
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${role === "docente" ? "bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400" : "bg-gradient-to-r from-pink-500 via-rose-400 to-amber-400"}`}
                  style={{ width: role === "docente" ? "85%" : "92%" }}
                />
              </div>
              <p className="mt-2 text-[10px] text-slate-500 font-semibold">
                {role === "docente" ? "Evaluaciones completadas esta semana" : "Tareas y seguimiento al día"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Indicators Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {indicators.map((kpi, idx) => {
          const c = colorMap[kpi.color];
          return (
            <div
              key={idx}
              className={`group relative overflow-hidden rounded-2xl border bg-slate-950/80 p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${c.border} ${c.hoverBorder}`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Glow effect on hover */}
              <div className={`pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 ${c.bg}`} />

              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${c.bg} ${c.border} border`}>
                    {kpi.icon}
                  </span>
                  <span className={`text-3xl font-black ${c.text}`}>
                    {kpi.value}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-bold text-white">{kpi.label}</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">{kpi.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-base font-extrabold text-white">⚡ Acciones Rápidas</h2>
          <div className="flex-1 h-px bg-slate-800" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action, idx) => {
            const c = colorMap[action.color];
            return (
              <button
                key={idx}
                onClick={() => onNavigate(action.tab)}
                className={`group relative overflow-hidden rounded-2xl border bg-slate-950/60 p-5 text-left shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer ${c.border} ${c.hoverBorder}`}
              >
                {/* Animated gradient on hover */}
                <div className={`pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${c.gradient}`} />

                <div className="relative z-10">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${c.bg} border ${c.border} group-hover:scale-110 transition-transform duration-300`}>
                      {action.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-white group-hover:text-white truncate">
                        {action.label}
                      </h3>
                      <p className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors truncate">
                        {action.description}
                      </p>
                    </div>
                    {/* Arrow */}
                    <svg
                      className={`w-5 h-5 shrink-0 ${c.text} opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fade-in animation keyframe (injected inline) */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
