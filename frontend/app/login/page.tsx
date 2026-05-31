"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BrandLogo from "../components/BrandLogo";
import MaterialIcon from "../components/MaterialIcon";
import ThemeToggle from "../components/ThemeToggle";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api";

export default function LoginPage() {
  const router = useRouter();
  const [cedulaOrEmail, setCedulaOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      } catch {
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cedulaOrEmail, password_raw: password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Error al iniciar sesión.");
      }

      localStorage.setItem("user_session", JSON.stringify(data));

      if (data.user?.rol === "docente") {
        router.replace("/docente");
      } else if (data.user?.rol === "familia") {
        router.replace("/familia");
      } else {
        setError("Rol no reconocido en el sistema.");
        localStorage.removeItem("user_session");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "No se pudo conectar al servidor.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12 font-sans text-on-background">
      <div className="pointer-events-none absolute -left-[10%] -top-[10%] h-[40%] w-[40%] animate-pulse rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] animate-pulse rounded-full bg-highlight-orange/10 blur-[120px]" />

      <div className="absolute right-5 top-5 z-50">
        <ThemeToggle />
      </div>

      <div className="z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandLogo size={96} showText={false} className="mb-4 justify-center" />
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Kimma</h1>
          <p className="mt-2 text-sm font-medium text-on-surface-variant">
            Semilleros UTN · Universidad Técnica del Norte
          </p>
        </div>

        <div className="ds-card relative rounded-3xl p-8 backdrop-blur-xl sm:p-10">
          <h2 className="mb-6 text-center font-headline text-xl font-bold text-on-surface">
            Ingreso al Sistema Pedagógico
          </h2>

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-2xl border border-error/30 bg-error/10 p-4 text-xs font-semibold text-error">
              <MaterialIcon name="error" className="shrink-0 text-base" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="cedulaOrEmail" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Cédula o Correo Electrónico
              </label>
              <div className="relative">
                <MaterialIcon
                  name="person"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant"
                />
                <input
                  id="cedulaOrEmail"
                  type="text"
                  required
                  placeholder="Ingrese su usuario"
                  value={cedulaOrEmail}
                  onChange={(e) => setCedulaOrEmail(e.target.value)}
                  className="ds-input w-full py-3 pl-11 pr-4 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Contraseña
              </label>
              <div className="relative">
                <MaterialIcon
                  name="lock"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant"
                />
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="ds-input w-full py-3 pl-11 pr-4 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="ds-btn-primary flex w-full cursor-pointer items-center justify-center gap-2 py-3.5 text-sm shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <MaterialIcon name="progress_activity" className="animate-spin text-xl" />
                  Validando credenciales...
                </>
              ) : (
                "Ingresar al Sistema"
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-outline-variant/20 pt-6 text-center text-sm text-on-surface-variant">
            ¿No tienes una cuenta aún?{" "}
            <Link href="/register" className="font-bold text-primary transition-colors hover:underline">
              Regístrate aquí
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-xs font-medium text-on-surface-variant/70">
          © {new Date().getFullYear()} Semilleros UTN · Sistema de Apoyo Pedagógico
        </p>
      </div>
    </div>
  );
}
