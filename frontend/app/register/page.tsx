"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { validarCedulaEcuatoriana } from "../utils/validation";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api";

export default function RegisterPage() {
  const router = useRouter();
  const [cedula, setCedula] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<"docente" | "familia">("familia");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    // Validación de cédula ecuatoriana (módulo 10)
    if (!validarCedulaEcuatoriana(cedula)) {
      setError("La cédula ingresada no es válida para la República del Ecuador.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cedula,
          email,
          password_raw: password,
          rol,
          nombre,
          apellido,
          telefono: telefono || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al realizar el registro.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 2500);
    } catch (err: any) {
      setError(err.message || "No se pudo conectar al servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-center items-center bg-radial from-[#1e1b4b] via-[#0f172a] to-[#020617] px-4 py-12 relative overflow-hidden font-sans">
      
      {/* Elementos decorativos en el fondo */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-pink-500/10 blur-[120px] pointer-events-none animate-pulse"></div>

      <div className="w-full max-w-lg z-10">
        
        {/* Cabecera / Marca */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
            Crea tu Cuenta
          </h1>
          <p className="text-sm text-slate-400 mt-2 font-medium">
            Forma parte del Sistema de Apoyo Pedagógico &bull; Semilleros UTN
          </p>
        </div>

        {/* Tarjeta de Registro (Glassmorphism) */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 sm:p-10">
          
          {success ? (
            <div className="text-center py-8 space-y-4">
              <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 mb-2">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">¡Registro Exitoso!</h3>
              <p className="text-sm text-slate-400 max-w-xs mx-auto">
                Tu cuenta ha sido creada con éxito. Redirigiéndote al inicio de sesión...
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs font-semibold flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Selector de Rol */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Tipo de Cuenta
                  </span>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setRol("familia")}
                      className={`py-3 px-4 rounded-2xl font-bold text-sm border transition-all cursor-pointer text-center ${
                        rol === "familia"
                          ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                          : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                      }`}
                    >
                      Representante Familia
                    </button>
                    <button
                      type="button"
                      onClick={() => setRol("docente")}
                      className={`py-3 px-4 rounded-2xl font-bold text-sm border transition-all cursor-pointer text-center ${
                        rol === "docente"
                          ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                          : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                      }`}
                    >
                      Docente / Educador
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Campo Nombres */}
                  <div className="space-y-2">
                    <label htmlFor="nombre" className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Nombres
                    </label>
                    <input
                      id="nombre"
                      type="text"
                      required
                      placeholder="Ej: Juan Carlos"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all font-medium text-sm"
                    />
                  </div>

                  {/* Campo Apellidos */}
                  <div className="space-y-2">
                    <label htmlFor="apellido" className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Apellidos
                    </label>
                    <input
                      id="apellido"
                      type="text"
                      required
                      placeholder="Ej: Pérez Gómez"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all font-medium text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Campo Cédula */}
                  <div className="space-y-2">
                    <label htmlFor="cedula" className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Cédula (10 dígitos)
                    </label>
                    <input
                      id="cedula"
                      type="text"
                      required
                      maxLength={10}
                      placeholder="Ej: 1003456789"
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value.replace(/\D/g, ""))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all font-medium text-sm"
                    />
                  </div>

                  {/* Campo Teléfono */}
                  <div className="space-y-2">
                    <label htmlFor="telefono" className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Teléfono
                    </label>
                    <input
                      id="telefono"
                      type="tel"
                      placeholder="Ej: 0998765432"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all font-medium text-sm"
                    />
                  </div>
                </div>

                {/* Campo Correo */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Correo Electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="ejemplo@utn.edu.ec"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all font-medium text-sm"
                  />
                </div>

                {/* Campo Contraseña */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all font-medium text-sm"
                  />
                </div>

                {/* Botón de envío */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Creando cuenta...</span>
                    </>
                  ) : (
                    <span>Registrarse</span>
                  )}
                </button>
              </form>

              {/* Login link */}
              <div className="mt-8 text-center border-t border-white/5 pt-6 text-sm text-slate-400">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/" className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline transition-all">
                  Inicia sesión aquí
                </Link>
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-slate-500 font-medium">
          &copy; {new Date().getFullYear()} Carrera de Software - UTN. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );
}
