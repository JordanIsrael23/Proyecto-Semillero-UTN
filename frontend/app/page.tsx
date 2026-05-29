"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api";

export default function LoginPage() {
  const router = useRouter();
  const [cedulaOrEmail, setCedulaOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirigir si el usuario ya está logueado
  useEffect(() => {
    const userJson = localStorage.getItem("user_session");
    if (userJson) {
      try {
        const session = JSON.parse(userJson);
        if (session.user?.rol === "docente") {
          router.replace("/docente");
        } else if (session.user?.rol === "familia") {
          router.replace("/familia");
        }
      } catch (e) {
        localStorage.removeItem("user_session");
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cedulaOrEmail,
          password_raw: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al iniciar sesión.");
      }

      // Guardar la sesión en localStorage
      localStorage.setItem("user_session", JSON.stringify(data));

      // Redirigir según el rol
      if (data.user?.rol === "docente") {
        router.replace("/docente");
      } else if (data.user?.rol === "familia") {
        router.replace("/familia");
      } else {
        setError("Rol no reconocido en el sistema.");
        localStorage.removeItem("user_session");
      }
    } catch (err: any) {
      setError(err.message || "No se pudo conectar al servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-center items-center bg-radial from-[#1e1b4b] via-[#0f172a] to-[#020617] px-4 py-12 relative overflow-hidden font-sans">
      
      {/* Elementos decorativos animados en el fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-pink-500/10 blur-[120px] pointer-events-none animate-pulse"></div>

      <div className="w-full max-w-md z-10">
        
        {/* Cabecera / Marca */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl mb-4 transition-transform hover:scale-105 duration-300">
            <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl font-sans">
            Semilleros UTN
          </h1>
          <p className="text-sm text-slate-400 mt-2 font-medium">
            Universidad Técnica del Norte &bull; Carrera de Software
          </p>
        </div>

        {/* Tarjeta de Login (Glassmorphism) */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 sm:p-10 relative">
          
          <h2 className="text-xl font-bold text-white mb-6 text-center">
            Ingreso al Sistema Pedagógico
          </h2>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs font-semibold flex items-center gap-2 animate-shake">
              <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Campo Cédula o Correo */}
            <div className="space-y-2">
              <label htmlFor="cedulaOrEmail" className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Cédula o Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <input
                  id="cedulaOrEmail"
                  type="text"
                  required
                  placeholder="Ej: 1004567890 o docente@utn.edu.ec"
                  value={cedulaOrEmail}
                  onChange={(e) => setCedulaOrEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all font-medium text-sm"
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Contraseña
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all font-medium text-sm"
                />
              </div>
            </div>

            {/* Botón de Ingreso */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Validando credenciales...</span>
                </>
              ) : (
                <span>Ingresar al Sistema</span>
              )}
            </button>
          </form>

          {/* Registro link */}
          <div className="mt-8 text-center border-t border-white/5 pt-6 text-sm text-slate-400">
            ¿No tienes una cuenta aún?{" "}
            <Link href="/register" className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline transition-all">
              Regístrate aquí
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-slate-500 font-medium">
          &copy; {new Date().getFullYear()} Carrera de Software - UTN. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );
}
