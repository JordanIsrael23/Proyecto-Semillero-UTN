"use client";

interface RoleWelcomeDashboardProps {
  userName: string;
  role: "docente" | "familia";
}

export default function RoleWelcomeDashboard({ userName, role }: RoleWelcomeDashboardProps) {
  const title = role === "docente" ? `¡Hola, ${userName}!` : `¡Bienvenido/a, ${userName}!`;
  const subtitle =
    role === "docente"
      ? "Revisa tus grupos, planes y evaluaciones pendientes."
      : "Consulta el progreso de tus hijos y las actividades en casa.";

  const cards =
    role === "docente"
      ? [
          {
            label: "Mis estudiantes",
            title: "50 matriculados",
            description: "Gestiona alumnos por grupo y vincula representantes.",
          },
          {
            label: "Planificación",
            title: "8 unidades activas",
            description: "Crea o edita unidades didácticas alineadas al currículo.",
          },
          {
            label: "Evaluar",
            title: "Rúbricas listas",
            description: "Avanza en las evaluaciones semanales con el sistema integrado.",
          },
        ]
      : [
          {
            label: "Mi hijo/a",
            title: "1 estudiante",
            description: "Ve el progreso cognitivo y la planificación del docente.",
          },
          {
            label: "Actividades en casa",
            title: "3 tareas pendientes",
            description: "Registra cumplimientos y comentarios familiares.",
          },
          {
            label: "Comunicación",
            title: "Docente disponible",
            description: "Mantente informado de las evaluaciones y el seguimiento.",
          },
        ];

  return (
    <section className="mb-8">
      <div className="rounded-[2rem] bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 border border-white/10 p-6 shadow-2xl shadow-indigo-950/30">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.32em] text-indigo-300 font-semibold">
              {role === "docente" ? "Docente" : "Representante familiar"}
            </p>
            <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white leading-tight">{title}</h1>
            <p className="mt-3 text-sm text-slate-300">{subtitle}</p>
          </div>
          <div className="rounded-3xl bg-white/5 border border-white/10 px-5 py-4 min-w-[220px] shadow-lg shadow-slate-950/20">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300 font-bold">Puntaje</p>
            <p className="mt-4 text-3xl font-extrabold text-white">{role === "docente" ? "85 %" : "92 %"}</p>
            <p className="mt-2 text-xs text-slate-400">{role === "docente" ? "Ejecuta tus evaluaciones de la semana" : "Monitorea el avance de tu familia"}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {cards.map((card) => (
            <div key={card.title} className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:border-indigo-400/30">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400 font-bold">{card.label}</p>
              <h2 className="mt-3 text-xl font-semibold text-white">{card.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
