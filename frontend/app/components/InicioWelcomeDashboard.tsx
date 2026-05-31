"use client";

interface SessionPerfil {
  nombre: string;
  apellido: string;
}

interface InicioWelcomeDashboardProps {
  perfil: SessionPerfil;
}

export default function InicioWelcomeDashboard({ perfil }: InicioWelcomeDashboardProps) {
  const nombreCompleto = `${perfil.nombre} ${perfil.apellido}`;

  const resumenCards = [
    {
      title: "Mis Estudiantes",
      description: "Gestiona tus alumnos matriculados y su vínculo con las familias.",
      label: "24 alumnos",
    },
    {
      title: "Planificación",
      description: "Organiza unidades didácticas y asigna actividades curriculares.",
      label: "8 unidades",
    },
    {
      title: "Evaluar",
      description: "Registra calificaciones y rúbricas de desempeño por estudiante.",
      label: "Rúbricas listas",
    },
  ];

  const sesiones = [
    {
      hora: "08:30 AM",
      materia: "Matemáticas - Grado 5",
      detalle: "Unidad 4: Fracciones Avanzadas",
    },
    {
      hora: "10:15 AM",
      materia: "Ciencias Naturales",
      detalle: "Laboratorio de Fotosíntesis",
    },
  ];

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/40">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-500/15 text-3xl font-black uppercase tracking-[0.18em] text-indigo-300 shadow-lg shadow-indigo-500/20">
              {perfil.nombre.charAt(0) || "M"}
            </div>
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400 font-semibold">Inicio / Bienvenida</p>
              <h1 className="mt-3 text-4xl font-extrabold text-white">
                ¡Hola, {nombreCompleto}!
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
                Bienvenido al Sistema de Apoyo Pedagógico. Hoy es un gran día para potenciar el crecimiento de tus alumnos y mantener el ritmo de tus actividades.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[2rem] bg-slate-900/90 border border-slate-800 p-5 shadow-xl shadow-slate-950/40">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold">Métricas de la Semana</p>
              <p className="mt-4 text-3xl font-extrabold text-white">85%</p>
              <p className="mt-2 text-sm text-slate-400">Has completado el 85% de tus evaluaciones semanales. ¡Excelente ritmo!</p>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-teal-400" style={{ width: "85%" }} />
              </div>
            </div>
            <div className="rounded-[2rem] bg-slate-900/90 border border-slate-800 p-5 shadow-xl shadow-slate-950/40">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold">Próximas Sesiones</p>
              <div className="mt-4 space-y-3">
                {sesiones.map((sesion) => (
                  <div key={sesion.hora} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold">{sesion.hora}</p>
                    <p className="mt-2 font-semibold text-white">{sesion.materia}</p>
                    <p className="mt-1 text-sm text-slate-400">{sesion.detalle}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {resumenCards.map((card) => (
            <div key={card.title} className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/40 transition hover:-translate-y-1">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold">{card.title}</p>
              <p className="mt-4 text-3xl font-extrabold text-white">{card.label}</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
