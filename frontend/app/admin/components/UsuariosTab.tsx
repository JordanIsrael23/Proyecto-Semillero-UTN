"use client";

import React from "react";
import MaterialIcon from "../../components/MaterialIcon";

interface UsuariosTabProps {
  rol: "docente" | "familia";
  users: any[];
  loadingData: boolean;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onToggleUserStatus: (user: any) => void;
  onEditUser: (user: any) => void;
  onDeleteUser: (user: any) => void;
  onCreateUser: () => void;
}

export default function UsuariosTab({
  rol,
  users,
  loadingData,
  searchQuery,
  onSearchQueryChange,
  onToggleUserStatus,
  onEditUser,
  onDeleteUser,
  onCreateUser,
}: UsuariosTabProps) {
  const roleUsers = users.filter((u) => u.rol === rol);
  const filtered = roleUsers.filter(
    (u) =>
      u.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.apellido?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.cedula?.includes(searchQuery) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-outline-variant/20 pb-4">
        <div>
          <h3 className="font-headline text-lg font-bold text-on-surface">
            Gestión de {rol === "docente" ? "Docentes" : "Familias / Representantes"}
          </h3>
          <p className="text-xs text-on-surface-variant font-medium">
            Administración de cuentas de acceso y vinculación de perfiles
          </p>
        </div>
        <button
          onClick={onCreateUser}
          className="ds-btn-primary flex items-center gap-1.5 px-4 py-2.5 text-xs shadow-md cursor-pointer hover:scale-[1.02] transition-all"
        >
          <MaterialIcon name="person_add" className="text-base" />
          <span>Crear {rol === "docente" ? "Docente" : "Familia"}</span>
        </button>
      </div>

      {/* Buscador */}
      <div className="flex items-center rounded-2xl border border-outline-variant/30 bg-surface-container-low px-4 py-2.5 max-w-md">
        <MaterialIcon name="search" className="mr-2 text-on-surface-variant text-base" />
        <input
          type="search"
          placeholder="Buscar por cédula, nombre o correo..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          className="w-full border-none bg-transparent text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
        />
      </div>

      {loadingData ? (
        <div className="text-center py-12">
          <MaterialIcon name="progress_activity" className="animate-spin text-3xl text-primary" />
          <span className="block mt-2 text-xs font-semibold text-on-surface-variant">Cargando usuarios...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-on-surface-variant ds-card bg-surface-container-lowest">
          <span className="text-3xl block mb-2">🔍</span>
          <p className="text-xs font-semibold">No se encontraron usuarios {rol === "docente" ? "docentes" : "familiares"} registrados.</p>
        </div>
      ) : (
        <div className="ds-card p-6 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/20 text-on-surface-variant font-bold">
                <th className="py-2.5 px-3">Cédula</th>
                <th className="py-2.5 px-3">Nombre Completo</th>
                <th className="py-2.5 px-3">Correo</th>
                <th className="py-2.5 px-3">Teléfono</th>
                <th className="py-2.5 px-3">{rol === "docente" ? "Especialidad" : "Dirección"}</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-on-surface">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="py-3 px-3 whitespace-nowrap font-semibold">{user.cedula}</td>
                  <td className="py-3 px-3 whitespace-nowrap font-bold">{user.nombre} {user.apellido}</td>
                  <td className="py-3 px-3 whitespace-nowrap">{user.email}</td>
                  <td className="py-3 px-3 whitespace-nowrap">{user.telefono || "—"}</td>
                  <td className="py-3 px-3 max-w-[200px] truncate">
                    {rol === "docente" ? user.especialidad : user.direccion || "—"}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onToggleUserStatus(user)}
                      className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase transition-all tracking-wider cursor-pointer border hover:opacity-85 ${
                        user.activo
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-red-500/10 text-red-500 border-red-500/20"
                      }`}
                    >
                      {user.activo ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap text-right space-x-1.5">
                    <button
                      type="button"
                      onClick={() => onEditUser(user)}
                      className="p-1.5 hover:bg-surface-container rounded-lg text-primary transition-all cursor-pointer inline-flex items-center justify-center"
                      title="Editar"
                    >
                      <MaterialIcon name="edit" className="text-base" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteUser(user)}
                      className="p-1.5 hover:bg-error/15 rounded-lg text-error transition-all cursor-pointer inline-flex items-center justify-center"
                      title="Eliminar"
                    >
                      <MaterialIcon name="delete" className="text-base" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
