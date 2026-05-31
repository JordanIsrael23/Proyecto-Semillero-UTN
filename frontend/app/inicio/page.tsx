import InicioWelcomeDashboard from "../components/InicioWelcomeDashboard";
import ThemeToggle from "../components/ThemeToggle";

export default function InicioPage() {
  const perfil = {
    nombre: "Margarita",
    apellido: "Reascos",
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(130,173,226,0.18),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(255,184,103,0.12),_transparent_30%),var(--background)] text-[var(--foreground)] transition-colors duration-300">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-70 blur-3xl bg-[radial-gradient(circle_at_top_left,_rgba(130,173,226,0.35),_transparent_28%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-60 blur-3xl bg-[radial-gradient(circle_at_bottom_right,_rgba(255,184,103,0.24),_transparent_30%)]" />
        <header className="relative z-10 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Panel</p>
              <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
                Inicio / Bienvenida
              </h1>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="rounded-3xl bg-slate-900/90 px-4 py-3 border border-white/10 text-sm text-slate-300 shadow-lg shadow-slate-950/30">
                <p className="font-semibold text-white">Margarita Reascos</p>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Docente</p>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-10">
          <InicioWelcomeDashboard perfil={perfil} />
        </div>
      </div>
    </main>
  );
}
