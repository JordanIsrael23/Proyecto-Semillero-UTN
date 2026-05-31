"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { validarCedulaEcuatoriana } from "../utils/validation";
import BrandLogo from "../components/BrandLogo";
import MaterialIcon from "../components/MaterialIcon";
import ThemeToggle from "../components/ThemeToggle";

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

    if (!validarCedulaEcuatoriana(cedula)) {
      setError("La cédula ingresada no es válida para la República del Ecuador.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      setTimeout(() => router.push("/"), 2500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "No se pudo conectar al servidor.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12 font-sans">
      <div className="pointer-events-none absolute -left-[10%] -top-[10%] h-[40%] w-[40%] animate-pulse rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] animate-pulse rounded-full bg-highlight-orange/10 blur-[120px]" />

      <div className="absolute right-5 top-5 z-50">
        <ThemeToggle />
      </div>

      <div className="z-10 w-full max-w-lg">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandLogo size={88} showText={false} className="mb-4 justify-center" />
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">Crea tu Cuenta</h1>
          <p className="mt-2 text-sm font-medium text-on-surface-variant">
            Sistema de Apoyo Pedagógico · Semilleros UTN
          </p>
        </div>

        <div className="ds-card rounded-3xl p-8 sm:p-10">
          {success ? (
            <div className="space-y-4 py-8 text-center">
              <div className="mb-2 inline-flex items-center justify-center rounded-full border border-highlight-green/30 bg-highlight-green/10 p-3 text-highlight-green">
                <MaterialIcon name="check_circle" className="text-5xl" filled />
              </div>
              <h3 className="font-headline text-2xl font-bold text-on-surface">¡Registro exitoso!</h3>
              <p className="mx-auto max-w-xs text-sm text-on-surface-variant">
                Tu cuenta ha sido creada. Redirigiéndote al inicio de sesión...
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 flex items-center gap-2 rounded-2xl border border-error/30 bg-error/10 p-4 text-xs font-semibold text-error">
                  <MaterialIcon name="error" className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <span className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Tipo de cuenta
                  </span>
                  <div className="grid grid-cols-2 gap-4">
                    {(
                      [
                        { id: "familia" as const, label: "Representante Familia" },
                        { id: "docente" as const, label: "Docente / Educador" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setRol(opt.id)}
                        className={`cursor-pointer rounded-2xl border px-4 py-3 text-center text-sm font-bold transition-all ${
                          rol === opt.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-outline-variant/30 bg-surface-container-low text-on-surface-variant hover:border-primary/30"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="nombre" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Nombres
                    </label>
                    <input id="nombre" type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} className="ds-input w-full px-4 py-3 text-sm" placeholder="Ej: Juan Carlos" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="apellido" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Apellidos
                    </label>
                    <input id="apellido" type="text" required value={apellido} onChange={(e) => setApellido(e.target.value)} className="ds-input w-full px-4 py-3 text-sm" placeholder="Ej: Pérez Gómez" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="cedula" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Cédula (10 dígitos)
                    </label>
                    <input id="cedula" type="text" required maxLength={10} value={cedula} onChange={(e) => setCedula(e.target.value.replace(/\D/g, ""))} className="ds-input w-full px-4 py-3 text-sm" placeholder="Ej: 1003456789" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="telefono" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Teléfono
                    </label>
                    <input id="telefono" type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="ds-input w-full px-4 py-3 text-sm" placeholder="Ej: 0998765432" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Correo electrónico
                  </label>
                  <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="ds-input w-full px-4 py-3 text-sm" placeholder="ejemplo@utn.edu.ec" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Contraseña
                  </label>
                  <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="ds-input w-full px-4 py-3 text-sm" placeholder="Mínimo 6 caracteres" />
                </div>

                <button type="submit" disabled={loading} className="ds-btn-primary mt-4 flex w-full cursor-pointer items-center justify-center gap-2 py-3.5 text-sm shadow-lg shadow-primary/20 disabled:opacity-50">
                  {loading ? (
                    <>
                      <MaterialIcon name="progress_activity" className="animate-spin text-xl" />
                      Creando cuenta...
                    </>
                  ) : (
                    "Registrarse"
                  )}
                </button>
              </form>

              <div className="mt-8 border-t border-outline-variant/20 pt-6 text-center text-sm text-on-surface-variant">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/" className="font-bold text-primary hover:underline">
                  Inicia sesión aquí
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="mt-8 text-center text-xs font-medium text-on-surface-variant/70">
          © {new Date().getFullYear()} Semilleros UTN · Sistema de Apoyo Pedagógico
        </p>
      </div>
    </div>
  );
}
