"use client";

import { useState } from "react";
import MaterialIcon from "./MaterialIcon";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api";

interface AjustesTabProps {
  session: any;
}

export default function AjustesTab({ session }: AjustesTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<"perfil" | "apariencia" | "notificaciones" | "seguridad">("perfil");

  // Mock states for the form
  const [formData, setFormData] = useState({
    nombre: session?.user?.nombre || "",
    apellido: session?.user?.apellido || "",
    email: session?.user?.email || "",
    telefono: session?.user?.telefono || "",
    direccion: session?.user?.direccion || "",
    especialidad: session?.user?.especialidad || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await fetch(`${BACKEND_URL}/auth/perfil`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": session?.user?.id || ""
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al guardar los cambios");

      // Update local storage session
      const currentSessionRaw = localStorage.getItem("user_session");
      if (currentSessionRaw) {
        const currentSession = JSON.parse(currentSessionRaw);
        const updatedSession = {
          ...currentSession,
          user: { ...currentSession.user, ...data.user },
          perfil: data.perfil || currentSession.perfil
        };
        localStorage.setItem("user_session", JSON.stringify(updatedSession));
      }

      setFeedback({ message: "Perfil guardado exitosamente.", type: "success" });
      setTimeout(() => {
        setFeedback(null);
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setFeedback({ message: err.message || "Hubo un error de conexión", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFeedback({ message: "Las contraseñas no coinciden.", type: "error" });
      return;
    }
    if (!passwordForm.newPassword) return;

    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await fetch(`${BACKEND_URL}/auth/perfil`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": session?.user?.id || ""
        },
        body: JSON.stringify({ password_raw: passwordForm.newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al actualizar contraseña");

      setFeedback({ message: "Contraseña actualizada exitosamente.", type: "success" });
      setPasswordForm({ newPassword: "", confirmPassword: "" });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ message: err.message || "Hubo un error de conexión", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 lg:space-y-8 animate-fade-in">
      {feedback && (
        <div className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold shadow-sm transition-all ${feedback.type === "success"
            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400"
            : "border-red-500/20 bg-red-500/10 text-red-500 dark:text-red-400"
          }`}>
          <MaterialIcon name={feedback.type === "success" ? "check_circle" : "error"} className="text-xl shrink-0" />
          <span>{feedback.message}</span>
        </div>
      )}

      <div>
        <h1 className="font-headline text-2xl font-bold text-on-background sm:text-3xl">Ajustes de Cuenta</h1>
        <p className="mt-1 text-sm text-on-surface-variant/80">Gestiona tus preferencias, perfil y configuración del sistema.</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        {/* Menú lateral de ajustes */}
        <aside className="w-full shrink-0 overflow-x-auto lg:w-64 scrollbar-hide">
          <nav className="flex space-x-2 pb-2 lg:flex-col lg:space-x-0 lg:space-y-1 lg:pb-0">
            <button
              onClick={() => setActiveSubTab("perfil")}
              className={`flex items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${activeSubTab === "perfil"
                  ? "bg-primary-container/20 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                }`}
            >
              <MaterialIcon name="person" className="text-xl" />
              Perfil de Usuario
            </button>
            <button
              onClick={() => setActiveSubTab("apariencia")}
              className={`flex items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${activeSubTab === "apariencia"
                  ? "bg-primary-container/20 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                }`}
            >
              <MaterialIcon name="palette" className="text-xl" />
              Apariencia
            </button>
            <button
              onClick={() => setActiveSubTab("notificaciones")}
              className={`flex items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${activeSubTab === "notificaciones"
                  ? "bg-primary-container/20 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                }`}
            >
              <MaterialIcon name="notifications" className="text-xl" />
              Notificaciones
            </button>
            <button
              onClick={() => setActiveSubTab("seguridad")}
              className={`flex items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${activeSubTab === "seguridad"
                  ? "bg-primary-container/20 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                }`}
            >
              <MaterialIcon name="security" className="text-xl" />
              Seguridad
            </button>
          </nav>
        </aside>

        {/* Contenido principal de ajustes */}
        <div className="min-w-0 flex-1 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm sm:p-6 lg:p-8">
          {activeSubTab === "perfil" && (
            <form onSubmit={handleSave} className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-4 border-b border-outline-variant/20 pb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-soft-blue/20 text-soft-blue sm:h-20 sm:w-20">
                  <MaterialIcon name="account_circle" className="text-4xl sm:text-5xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface">Foto de Perfil</h3>
                  <div className="mt-2 flex gap-2">
                    <button type="button" className="rounded-lg bg-surface-container-high px-3 py-1.5 text-xs font-semibold text-on-surface hover:bg-surface-container-highest transition-colors">
                      Cambiar
                    </button>
                    <button type="button" className="rounded-lg px-3 py-1.5 text-xs font-semibold text-error hover:bg-error/10 transition-colors">
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-outline-variant/30 bg-background px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Apellido</label>
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-outline-variant/30 bg-background px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Correo Electrónico</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-outline-variant/30 bg-background px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Teléfono</label>
                  <input
                    type="text"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-outline-variant/30 bg-background px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Rol de Usuario</label>
                  <input
                    type="text"
                    disabled
                    value={session?.user?.rol || ""}
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface-container px-4 py-2.5 text-sm text-on-surface-variant uppercase opacity-70 cursor-not-allowed"
                  />
                </div>

                {session?.user?.rol === "docente" && (
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Especialidad</label>
                    <input
                      type="text"
                      name="especialidad"
                      value={formData.especialidad}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-outline-variant/30 bg-background px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                  </div>
                )}

                {session?.user?.rol === "familia" && (
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Dirección</label>
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-outline-variant/30 bg-background px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="ds-btn-primary px-6 py-2.5 text-sm font-semibold transition-transform active:scale-95"
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <MaterialIcon name="progress_activity" className="animate-spin text-lg" />
                      Guardando...
                    </div>
                  ) : (
                    "Guardar Cambios"
                  )}
                </button>
              </div>
            </form>
          )}

          {activeSubTab === "apariencia" && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-semibold text-lg text-on-surface">Preferencias de Interfaz</h3>
              <p className="text-sm text-on-surface-variant">Personaliza el aspecto de la plataforma según tus preferencias. El tema se guarda en este dispositivo.</p>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="cursor-pointer rounded-xl border-2 border-primary bg-background p-4 shadow-sm transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary">Tema Activo (Sistema)</span>
                    <MaterialIcon name="check_circle" className="text-primary" />
                  </div>
                  <div className="mt-4 flex h-24 w-full flex-col gap-2 rounded-lg border border-outline-variant/20 bg-background p-2">
                    <div className="h-4 w-1/3 rounded bg-surface-container-high"></div>
                    <div className="h-full w-full rounded bg-surface-container-low"></div>
                  </div>
                </div>

                <div className="cursor-pointer rounded-xl border-2 border-transparent bg-background p-4 shadow-sm transition-all hover:border-primary/50 opacity-70">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-on-surface">Forzar Otro Tema</span>
                  </div>
                  <div className="mt-4 flex items-center justify-center h-24 w-full rounded-lg border border-outline-variant/20 bg-surface-container-lowest p-2">
                    <span className="text-xs text-on-surface-variant text-center">Usa el botón del sol/luna en la barra superior para cambiar el tema al instante.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "notificaciones" && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-semibold text-lg text-on-surface">Preferencias de Notificación</h3>
              <p className="text-sm text-on-surface-variant">Elige qué tipo de alertas quieres recibir en tu correo o en la plataforma.</p>

              <div className="space-y-4 pt-2">
                <label className="flex cursor-pointer items-start gap-4 rounded-xl border border-outline-variant/20 p-4 transition-colors hover:bg-surface-container-lowest">
                  <div className="flex h-5 items-center">
                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-on-surface">Nuevas Actividades</p>
                    <p className="text-xs text-on-surface-variant">Recibir alerta cuando se asigne una nueva actividad al estudiante.</p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-start gap-4 rounded-xl border border-outline-variant/20 p-4 transition-colors hover:bg-surface-container-lowest">
                  <div className="flex h-5 items-center">
                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-on-surface">Recordatorios de Evaluaciones</p>
                    <p className="text-xs text-on-surface-variant">Recibir recordatorios antes de las fechas límite.</p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-start gap-4 rounded-xl border border-outline-variant/20 p-4 transition-colors hover:bg-surface-container-lowest">
                  <div className="flex h-5 items-center">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-on-surface">Reportes Semanales</p>
                    <p className="text-xs text-on-surface-variant">Recibir un resumen semanal del desempeño.</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {activeSubTab === "seguridad" && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-semibold text-lg text-on-surface">Seguridad y Acceso</h3>
              <p className="text-sm text-on-surface-variant">Actualiza tu contraseña y opciones de acceso a la cuenta.</p>

              <form onSubmit={handleSavePassword} className="space-y-5 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Nueva Contraseña</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-outline-variant/30 bg-background px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Confirmar Nueva Contraseña</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-outline-variant/30 bg-background px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div className="pt-2">
                  <button type="submit" disabled={isSaving} className="ds-btn-primary px-5 py-2 text-sm font-semibold transition-transform active:scale-95">
                    {isSaving ? "Actualizando..." : "Actualizar Contraseña"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
