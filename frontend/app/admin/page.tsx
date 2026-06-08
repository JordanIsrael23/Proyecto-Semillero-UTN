"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "../components/DashboardShell";
import MaterialIcon from "../components/MaterialIcon";
import AppModal from "../components/AppModal";

const ADMIN_NAV = [
  { id: "dashboard", label: "Inicio", icon: "dashboard" },
  { id: "docentes", label: "Gestión de Docentes", icon: "school" },
  { id: "familias", label: "Gestión de Familias", icon: "group" },
  { id: "database", label: "Base de Datos", icon: "database" },
] as const;

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api";

export default function AdminDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Estados de la app
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [users, setUsers] = useState<any[]>([]);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("configuraciones_sistema");
  const [tableRecords, setTableRecords] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingData, setLoadingData] = useState(false);

  // Estadísticas del dashboard
  const [stats, setStats] = useState({
    docentes: 0,
    familias: 0,
    grupos: 0,
    estudiantes: 0,
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  // Estados de Modales
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    variant: "success" | "error" | "warning" | "info" | "danger";
    onConfirm: () => void;
  } | null>(null);

  // Modal de Gestión de Usuarios
  const [userModal, setUserModal] = useState<{
    open: boolean;
    type: "create" | "edit";
    rol: "docente" | "familia";
    user?: any;
  } | null>(null);

  const [userForm, setUserForm] = useState({
    cedula: "",
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    password_raw: "",
    extraField: "", // especialidad para docente, dirección para familia
  });
  const [userFormError, setUserFormError] = useState<string | null>(null);

  // Modal Genérico de edición de BDD
  const [genericEditModal, setGenericEditModal] = useState<{
    open: boolean;
    tableName: string;
    record: any;
  } | null>(null);
  const [genericForm, setGenericForm] = useState<any>({});

  // Toast de feedback
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(timer);
  }, [feedback]);

  // Validar Sesión del Administrador
  useEffect(() => {
    const sessionJson = localStorage.getItem("user_session");
    if (!sessionJson) {
      router.replace("/login");
      return;
    }
    try {
      const parsedSession = JSON.parse(sessionJson);
      if (parsedSession.user?.rol !== "admin") {
        router.replace("/login");
        return;
      }
      setSession(parsedSession);
    } catch {
      router.replace("/login");
    } finally {
      setLoadingSession(false);
    }
  }, [router]);

  // Cargar datos según pestaña activa
  useEffect(() => {
    if (!session) return;

    if (activeTab === "dashboard") {
      fetchDashboardStats();
    } else if (activeTab === "docentes" || activeTab === "familias") {
      fetchUsers();
    } else if (activeTab === "database") {
      fetchTables();
    }
  }, [activeTab, session]);

  // Cargar registros al cambiar la tabla seleccionada
  useEffect(() => {
    if (!session || activeTab !== "database" || !selectedTable) return;
    fetchTableRecords(selectedTable);
  }, [selectedTable, activeTab, session]);

  const getAuthHeader = () => ({
    "Authorization": `Bearer ${session?.access_token}`,
    "Content-Type": "application/json",
  });

  // Funciones API
  const fetchDashboardStats = async () => {
    try {
      setLoadingData(true);
      // Obtener usuarios para contar docentes y familias
      const resUsers = await fetch(`${BACKEND_URL}/admin/usuarios`, { headers: getAuthHeader() });
      const usersData = await resUsers.json();
      const docs = usersData.filter((u: any) => u.rol === "docente").length;
      const fams = usersData.filter((u: any) => u.rol === "familia").length;

      // Obtener cantidad de grupos y estudiantes desde la API de tablas genéricas
      const resGrupos = await fetch(`${BACKEND_URL}/admin/tables/grupos`, { headers: getAuthHeader() });
      const gruposData = await resGrupos.json();
      const groupsCount = Array.isArray(gruposData) ? gruposData.length : 0;

      const resEstudiantes = await fetch(`${BACKEND_URL}/admin/tables/estudiantes`, { headers: getAuthHeader() });
      const estudiantesData = await resEstudiantes.json();
      const studentsCount = Array.isArray(estudiantesData) ? estudiantesData.length : 0;

      setStats({
        docentes: docs,
        familias: fams,
        grupos: groupsCount,
        estudiantes: studentsCount,
      });

      // Obtener logs recientes
      const resLogs = await fetch(`${BACKEND_URL}/admin/tables/auditoria_logs`, { headers: getAuthHeader() });
      const logsData = await resLogs.json();
      if (Array.isArray(logsData)) {
        // Ordenar por fecha_evento desc
        const sorted = logsData.sort((a: any, b: any) => new Date(b.fecha_evento).getTime() - new Date(a.fecha_evento).getTime());
        setRecentLogs(sorted.slice(0, 10));
      }
    } catch (e) {
      console.error("Error al cargar estadísticas:", e);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingData(true);
      const res = await fetch(`${BACKEND_URL}/admin/usuarios`, { headers: getAuthHeader() });
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      } else {
        setFeedback({ message: data.message || "Error al cargar usuarios", type: "error" });
      }
    } catch (e) {
      setFeedback({ message: "No se pudo conectar al servidor para cargar usuarios", type: "error" });
    } finally {
      setLoadingData(false);
    }
  };

  const fetchTables = async () => {
    try {
      setLoadingData(true);
      const res = await fetch(`${BACKEND_URL}/admin/tables`, { headers: getAuthHeader() });
      const data = await res.json();
      if (res.ok) {
        setTables(data);
      } else {
        setFeedback({ message: data.message || "Error al cargar tablas", type: "error" });
      }
    } catch (e) {
      setFeedback({ message: "No se pudo conectar al servidor para cargar tablas", type: "error" });
    } finally {
      setLoadingData(false);
    }
  };

  const fetchTableRecords = async (tableName: string) => {
    try {
      setLoadingData(true);
      const res = await fetch(`${BACKEND_URL}/admin/tables/${tableName}`, { headers: getAuthHeader() });
      const data = await res.json();
      if (res.ok) {
        setTableRecords(Array.isArray(data) ? data : []);
      } else {
        setFeedback({ message: data.message || "Error al cargar registros", type: "error" });
        setTableRecords([]);
      }
    } catch (e) {
      setFeedback({ message: "No se pudo conectar al servidor para cargar registros", type: "error" });
      setTableRecords([]);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    router.replace("/login");
  };

  // Validación de cédula ecuatoriana
  const validarCedulaEcuatoriana = (cedula: string): boolean => {
    if (!/^\d{10}$/.test(cedula)) return false;
    const provincia = parseInt(cedula.substring(0, 2), 10);
    if (provincia < 1 || (provincia > 24 && provincia !== 30)) return false;
    const tercerDigito = parseInt(cedula.substring(2, 3), 10);
    if (tercerDigito >= 6) return false;
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;
    for (let i = 0; i < 9; i++) {
      let valor = parseInt(cedula.charAt(i), 10) * coeficientes[i];
      if (valor >= 10) valor -= 9;
      suma += valor;
    }
    const digitoVerificadorInput = parseInt(cedula.charAt(9), 10);
    const residuo = suma % 10;
    const digitoVerificadorCalculado = residuo === 0 ? 0 : 10 - residuo;
    return digitoVerificadorCalculado === digitoVerificadorInput;
  };

  // Enviar formulario de usuario (Docente / Familia)
  const handleUserFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError(null);

    if (!validarCedulaEcuatoriana(userForm.cedula)) {
      setUserFormError("La cédula ingresada no es una cédula ecuatoriana válida.");
      return;
    }

    if (userModal?.type === "create" && !userForm.password_raw) {
      setUserFormError("La contraseña es requerida para un nuevo usuario.");
      return;
    }

    const payload = {
      cedula: userForm.cedula,
      nombre: userForm.nombre,
      apellido: userForm.apellido,
      email: userForm.email,
      telefono: userForm.telefono,
      rol: userModal?.rol,
      extraField: userForm.extraField,
      ...(userForm.password_raw ? { password_raw: userForm.password_raw } : {}),
    };

    try {
      const isEdit = userModal?.type === "edit";
      const url = isEdit
        ? `${BACKEND_URL}/admin/usuarios/${userModal?.user.id}`
        : `${BACKEND_URL}/admin/usuarios`;

      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: getAuthHeader(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback({
          message: isEdit ? "Usuario actualizado correctamente." : "Usuario creado correctamente.",
          type: "success",
        });
        setUserModal(null);
        fetchUsers();
      } else {
        setUserFormError(data.message || "Error al procesar la solicitud.");
      }
    } catch (e) {
      setUserFormError("No se pudo conectar al servidor.");
    }
  };

  const handleToggleUserStatus = async (user: any) => {
    const updatedStatus = !user.activo;
    try {
      const res = await fetch(`${BACKEND_URL}/admin/usuarios/${user.id}`, {
        method: "PUT",
        headers: getAuthHeader(),
        body: JSON.stringify({
          cedula: user.cedula,
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          telefono: user.telefono,
          rol: user.rol,
          activo: updatedStatus,
          extraField: user.rol === "docente" ? user.especialidad : user.direccion,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback({
          message: `Usuario ${updatedStatus ? "activado" : "desactivado"} con éxito.`,
          type: "success",
        });
        fetchUsers();
      } else {
        setFeedback({ message: data.message || "Error al actualizar estado", type: "error" });
      }
    } catch (e) {
      setFeedback({ message: "Error de red al actualizar estado", type: "error" });
    }
  };

  const openEditUserModal = (user: any) => {
    setUserForm({
      cedula: user.cedula,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      telefono: user.telefono || "",
      password_raw: "", // vacío para no cambiarla a menos que la ingresen
      extraField: user.rol === "docente" ? user.especialidad : user.direccion,
    });
    setUserFormError(null);
    setUserModal({
      open: true,
      type: "edit",
      rol: user.rol,
      user,
    });
  };

  const openCreateUserModal = (rol: "docente" | "familia") => {
    setUserForm({
      cedula: "",
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      password_raw: "",
      extraField: rol === "docente" ? "Desarrollo Cognitivo Infantil" : "",
    });
    setUserFormError(null);
    setUserModal({
      open: true,
      type: "create",
      rol,
    });
  };

  const handleDeleteUser = (user: any) => {
    setConfirmModal({
      open: true,
      title: "Eliminar Usuario",
      message: `¿Seguro que quieres eliminar permanentemente al usuario ${user.nombre} ${user.apellido}? Esta acción no se puede deshacer.`,
      confirmLabel: "Sí, eliminar",
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`${BACKEND_URL}/admin/usuarios/${user.id}`, {
            method: "DELETE",
            headers: getAuthHeader(),
          });
          const data = await res.json();
          if (res.ok) {
            setFeedback({ message: "Usuario eliminado con éxito.", type: "success" });
            fetchUsers();
          } else {
            setFeedback({ message: data.message || "Error al eliminar usuario", type: "error" });
          }
        } catch (e) {
          setFeedback({ message: "Error al conectar con el servidor", type: "error" });
        }
      },
    });
  };

  // Dinámico Base de Datos
  const getRowIdentifier = (tableName: string, record: any) => {
    if (tableName === "configuraciones_sistema") return record.clave;
    if (tableName === "perfil_docentes" || tableName === "perfil_familias") return record.usuario_id;
    if (tableName === "familia_estudiante") return `${record.familia_id}_${record.estudiante_id}`;
    return record.id;
  };

  const handleOpenEditRecordModal = (record: any) => {
    setGenericForm({ ...record });
    setGenericEditModal({
      open: true,
      tableName: selectedTable,
      record,
    });
  };

  const handleGenericFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genericEditModal) return;

    const rowId = getRowIdentifier(genericEditModal.tableName, genericEditModal.record);

    try {
      const res = await fetch(`${BACKEND_URL}/admin/tables/${genericEditModal.tableName}/${rowId}`, {
        method: "PUT",
        headers: getAuthHeader(),
        body: JSON.stringify(genericForm),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback({ message: "Registro actualizado en la base de datos.", type: "success" });
        setGenericEditModal(null);
        fetchTableRecords(genericEditModal.tableName);
      } else {
        setFeedback({ message: data.message || "Error al guardar el registro", type: "error" });
      }
    } catch (e) {
      setFeedback({ message: "No se pudo conectar con el servidor.", type: "error" });
    }
  };

  const handleDeleteRecord = (record: any) => {
    const rowId = getRowIdentifier(selectedTable, record);

    setConfirmModal({
      open: true,
      title: "Eliminar Registro",
      message: `¿Seguro que deseas eliminar este registro de la tabla "${selectedTable}"? Esto puede impactar la integridad de los datos si es referenciado.`,
      confirmLabel: "Eliminar",
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`${BACKEND_URL}/admin/tables/${selectedTable}/${rowId}`, {
            method: "DELETE",
            headers: getAuthHeader(),
          });
          const data = await res.json();
          if (res.ok) {
            setFeedback({ message: "Registro eliminado de la base de datos con éxito.", type: "success" });
            fetchTableRecords(selectedTable);
          } else {
            setFeedback({ message: data.message || "No se pudo eliminar el registro", type: "error" });
          }
        } catch (e) {
          setFeedback({ message: "Error al comunicar con el servidor", type: "error" });
        }
      },
    });
  };

  // Renderizadores de Pestañas
  const renderDashboard = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="ds-card p-6 flex items-center justify-between border-l-4 border-l-primary">
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant/75 uppercase tracking-wider block">Docentes Activos</span>
            <span className="text-3xl font-extrabold text-on-surface block mt-1">{stats.docentes}</span>
          </div>
          <div className="p-3 bg-primary/10 rounded-2xl text-primary text-2xl">
            <MaterialIcon name="school" />
          </div>
        </div>

        <div className="ds-card p-6 flex items-center justify-between border-l-4 border-l-highlight-orange">
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant/75 uppercase tracking-wider block">Familias Activas</span>
            <span className="text-3xl font-extrabold text-on-surface block mt-1">{stats.familias}</span>
          </div>
          <div className="p-3 bg-highlight-orange/10 rounded-2xl text-highlight-orange text-2xl">
            <MaterialIcon name="group" />
          </div>
        </div>

        <div className="ds-card p-6 flex items-center justify-between border-l-4 border-l-highlight-green">
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant/75 uppercase tracking-wider block">Grupos / Aulas</span>
            <span className="text-3xl font-extrabold text-on-surface block mt-1">{stats.grupos}</span>
          </div>
          <div className="p-3 bg-highlight-green/10 rounded-2xl text-highlight-green text-2xl">
            <MaterialIcon name="meeting_room" />
          </div>
        </div>

        <div className="ds-card p-6 flex items-center justify-between border-l-4 border-l-soft-blue">
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant/75 uppercase tracking-wider block">Estudiantes</span>
            <span className="text-3xl font-extrabold text-on-surface block mt-1">{stats.estudiantes}</span>
          </div>
          <div className="p-3 bg-soft-blue/10 rounded-2xl text-soft-blue text-2xl">
            <MaterialIcon name="child_care" />
          </div>
        </div>
      </div>

      {/* Bitácora de Auditoría */}
      <div className="ds-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
          <div>
            <h3 className="font-headline text-lg font-bold text-on-surface">Bitácora de Auditoría del Sistema</h3>
            <p className="text-xs text-on-surface-variant font-medium">Últimas 10 operaciones y cambios realizados en la base de datos</p>
          </div>
          <button
            onClick={fetchDashboardStats}
            className="flex items-center gap-1 text-xs text-primary font-bold hover:underline cursor-pointer"
          >
            <MaterialIcon name="refresh" className="text-sm" />
            <span>Refrescar</span>
          </button>
        </div>

        {loadingData ? (
          <div className="text-center py-12">
            <MaterialIcon name="progress_activity" className="animate-spin text-3xl text-primary" />
            <span className="block mt-2 text-xs font-semibold text-on-surface-variant">Cargando registros...</span>
          </div>
        ) : recentLogs.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant">
            <p className="text-sm font-semibold">No se encontraron logs de auditoría registrados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/20 text-on-surface-variant font-bold">
                  <th className="py-2.5 px-3">Fecha y Hora</th>
                  <th className="py-2.5 px-3">Acción</th>
                  <th className="py-2.5 px-3">Tabla Afectada</th>
                  <th className="py-2.5 px-3">ID Registro</th>
                  <th className="py-2.5 px-3">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {recentLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-surface-container-low transition-colors text-on-surface">
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {log.fecha_evento ? new Date(log.fecha_evento).toLocaleString() : "Sin fecha"}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded font-extrabold uppercase text-[9px] ${
                        log.accion === "INSERT" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                        log.accion === "UPDATE" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                        "bg-red-500/10 text-red-500 border border-red-500/20"
                      }`}>
                        {log.accion}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-semibold">{log.tabla_afectada}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-on-surface-variant/80">{log.registro_id || "N/A"}</td>
                    <td className="py-2.5 px-3 max-w-[200px] truncate text-on-surface-variant" title={JSON.stringify(log.detalles_valores)}>
                      {typeof log.detalles_valores === "object"
                        ? JSON.stringify(log.detalles_valores)
                        : log.detalles_valores || "Sin detalles"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderUsersManagement = (rol: "docente" | "familia") => {
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
            onClick={() => openCreateUserModal(rol)}
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
            onChange={(e) => setSearchQuery(e.target.value)}
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
                        onClick={() => handleToggleUserStatus(user)}
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
                        onClick={() => openEditUserModal(user)}
                        className="p-1.5 hover:bg-surface-container rounded-lg text-primary transition-all cursor-pointer inline-flex items-center justify-center"
                        title="Editar"
                      >
                        <MaterialIcon name="edit" className="text-base" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(user)}
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
  };

  const renderDatabaseExplorer = () => {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="border-b border-outline-variant/20 pb-4">
          <h3 className="font-headline text-lg font-bold text-on-surface">Explorador & Editor de Base de Datos</h3>
          <p className="text-xs text-on-surface-variant font-medium">
            Acceso administrativo directo para la modificación y eliminación de registros del sistema Kimma
          </p>
        </div>

        {/* Layout de BDD: Sidebar Izquierdo con tablas, Grid Derecho con contenido */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Listado de tablas */}
          <div className="lg:col-span-1 ds-card p-4 space-y-2.5 max-h-[70vh] overflow-y-auto">
            <span className="text-[10px] font-extrabold text-on-surface-variant/70 uppercase tracking-widest block px-2 mb-2">Tablas del Sistema</span>
            {tables.map((table) => {
              const isSelected = selectedTable === table;
              return (
                <button
                  key={table}
                  onClick={() => setSelectedTable(table)}
                  className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-all truncate flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-primary text-on-primary shadow-sm"
                      : "text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  <MaterialIcon name={table === "auditoria_logs" ? "history" : table === "configuraciones_sistema" ? "settings_applications" : "table_chart"} className="text-sm shrink-0" />
                  <span className="truncate">{table}</span>
                </button>
              );
            })}
          </div>

          {/* Registros de tabla seleccionada */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between bg-surface-container/30 border border-outline-variant/20 px-5 py-3 rounded-2xl">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">Tabla Seleccionada</span>
                <span className="text-sm font-extrabold text-on-surface font-mono">{selectedTable}</span>
              </div>
              <span className="text-xs font-bold text-on-surface-variant/80">
                Total registros: {tableRecords.length}
              </span>
            </div>

            {loadingData ? (
              <div className="text-center py-12 ds-card">
                <MaterialIcon name="progress_activity" className="animate-spin text-3xl text-primary" />
                <span className="block mt-2 text-xs font-semibold text-on-surface-variant">Cargando base de datos...</span>
              </div>
            ) : tableRecords.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant ds-card">
                <span className="text-3xl block mb-2">📦</span>
                <p className="text-xs font-semibold">Esta tabla no contiene ningún registro en la base de datos.</p>
              </div>
            ) : (
              <div className="ds-card p-4 overflow-x-auto max-h-[60vh] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/20 text-on-surface-variant font-bold bg-surface-container-low/50 sticky top-0">
                      {Object.keys(tableRecords[0]).map((key) => (
                        <th key={key} className="py-2.5 px-3 font-mono">{key}</th>
                      ))}
                      <th className="py-2.5 px-3 text-right sticky right-0 bg-surface-container-lowest shadow-[-8px_0_12px_rgba(0,0,0,0.03)]">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                    {tableRecords.map((record, index) => (
                      <tr key={index} className="hover:bg-surface-container-low transition-colors">
                        {Object.values(record).map((value: any, idx) => {
                          let displayValue = "";
                          if (value === null || value === undefined) {
                            displayValue = "null";
                          } else if (typeof value === "boolean") {
                            displayValue = value ? "true" : "false";
                          } else if (typeof value === "object") {
                            displayValue = JSON.stringify(value);
                          } else {
                            displayValue = value.toString();
                          }

                          return (
                            <td key={idx} className="py-2.5 px-3 max-w-[220px] truncate font-mono text-[11px] text-on-surface/90" title={displayValue}>
                              {displayValue}
                            </td>
                          );
                        })}
                        <td className="py-2 px-3 whitespace-nowrap text-right space-x-1 sticky right-0 bg-surface-container-lowest shadow-[-8px_0_12px_rgba(0,0,0,0.03)]">
                          <button
                            type="button"
                            onClick={() => handleOpenEditRecordModal(record)}
                            className="p-1 hover:bg-surface-container rounded-lg text-primary transition-all cursor-pointer inline-flex items-center justify-center"
                            title="Editar Fila"
                          >
                            <MaterialIcon name="edit" className="text-base" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRecord(record)}
                            className="p-1 hover:bg-error/15 rounded-lg text-error transition-all cursor-pointer inline-flex items-center justify-center"
                            title="Eliminar Fila"
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
        </div>
      </div>
    );
  };

  if (loadingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-on-surface">
        <div className="text-center">
          <MaterialIcon name="progress_activity" className="animate-spin text-4xl text-primary" />
          <p className="mt-4 font-semibold text-sm">Verificando sesión administrativa...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      navItems={ADMIN_NAV as any}
      userName={session?.user?.nombre ? `${session.user.nombre} ${session.user.apellido}` : "Administrador"}
      roleLabel="Administrador del Sistema"
      panelSubtitle="Kimma · Panel de Control Integral"
      onLogout={handleLogout}
      searchPlaceholder="Buscar registros de control..."
      footerText="Kimma © 2026 • Auditoría, Administración y Control Pedagógico de Semilleros UTN"
    >
      {/* Toast Feedback */}
      {feedback && (
        <div className={`fixed bottom-5 right-5 z-[10000] flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-bold shadow-lg transition-all animate-fade-in ${
          feedback.type === "success"
            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400"
            : "border-red-500/20 bg-red-500/10 text-red-500 dark:text-red-400"
        }`}>
          <MaterialIcon name={feedback.type === "success" ? "check_circle" : "error"} className="text-base shrink-0" />
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Renders Tab Content */}
      {activeTab === "dashboard" && renderDashboard()}
      {activeTab === "docentes" && renderUsersManagement("docente")}
      {activeTab === "familias" && renderUsersManagement("familia")}
      {activeTab === "database" && renderDatabaseExplorer()}

      {/* MODAL GESTIÓN DE USUARIOS */}
      {userModal && userModal.open && (
        <>
          <div className="fixed inset-0 z-[9998] bg-black/55 backdrop-blur-xs" onClick={() => setUserModal(null)} />
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="ds-modal relative w-full max-w-lg p-6 sm:p-8 animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3 mb-5">
                <h3 className="font-headline text-lg font-bold text-on-surface">
                  {userModal.type === "create" ? "Crear Nuevo Usuario" : "Editar Usuario"}{" "}
                  <span className="text-primary capitalize">({userModal.rol})</span>
                </h3>
                <button
                  onClick={() => setUserModal(null)}
                  className="rounded-full p-1.5 text-on-surface-variant hover:bg-surface-container transition-all cursor-pointer"
                >
                  <MaterialIcon name="close" />
                </button>
              </div>

              {userFormError && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-error/30 bg-error/10 p-3.5 text-xs font-semibold text-error">
                  <MaterialIcon name="error" className="shrink-0 text-base" />
                  <span>{userFormError}</span>
                </div>
              )}

              <form onSubmit={handleUserFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Cédula</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: 1004954321"
                      value={userForm.cedula}
                      onChange={(e) => setUserForm({ ...userForm, cedula: e.target.value })}
                      className="ds-input w-full px-3.5 py-2 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Correo Electrónico</label>
                    <input
                      type="email"
                      required
                      placeholder="correo@ejemplo.com"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      className="ds-input w-full px-3.5 py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Nombre</label>
                    <input
                      type="text"
                      required
                      placeholder="Ingrese nombre"
                      value={userForm.nombre}
                      onChange={(e) => setUserForm({ ...userForm, nombre: e.target.value })}
                      className="ds-input w-full px-3.5 py-2 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Apellido</label>
                    <input
                      type="text"
                      required
                      placeholder="Ingrese apellido"
                      value={userForm.apellido}
                      onChange={(e) => setUserForm({ ...userForm, apellido: e.target.value })}
                      className="ds-input w-full px-3.5 py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Teléfono</label>
                    <input
                      type="text"
                      placeholder="Ej: 0991234567"
                      value={userForm.telefono}
                      onChange={(e) => setUserForm({ ...userForm, telefono: e.target.value })}
                      className="ds-input w-full px-3.5 py-2 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                      {userModal.rol === "docente" ? "Especialidad" : "Dirección de Domicilio"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={userModal.rol === "docente" ? "Ej: Educación Inicial" : "Ej: Sector El Olivo"}
                      value={userForm.extraField}
                      onChange={(e) => setUserForm({ ...userForm, extraField: e.target.value })}
                      className="ds-input w-full px-3.5 py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Contraseña {userModal.type === "edit" && <span className="text-[9px] text-on-surface-variant/60 font-normal lowercase">(dejar vacío para conservar actual)</span>}
                  </label>
                  <input
                    type="password"
                    placeholder="Min 6 caracteres"
                    value={userForm.password_raw}
                    onChange={(e) => setUserForm({ ...userForm, password_raw: e.target.value })}
                    className="ds-input w-full px-3.5 py-2 text-xs"
                  />
                </div>

                <div className="flex gap-3 pt-4 justify-end">
                  <button
                    type="button"
                    onClick={() => setUserModal(null)}
                    className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="ds-btn-primary px-5 py-2.5 text-xs shadow-md cursor-pointer hover:scale-[1.01]"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* MODAL GENÉRICO DE BASE DE DATOS */}
      {genericEditModal && genericEditModal.open && (
        <>
          <div className="fixed inset-0 z-[9998] bg-black/55 backdrop-blur-xs" onClick={() => setGenericEditModal(null)} />
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="ds-modal relative w-full max-w-xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3 mb-5">
                <div>
                  <h3 className="font-headline text-base font-bold text-on-surface">
                    Editar Fila en la BDD
                  </h3>
                  <span className="text-[10px] font-mono text-primary">{genericEditModal.tableName}</span>
                </div>
                <button
                  onClick={() => setGenericEditModal(null)}
                  className="rounded-full p-1.5 text-on-surface-variant hover:bg-surface-container transition-all cursor-pointer"
                >
                  <MaterialIcon name="close" />
                </button>
              </div>

              <form onSubmit={handleGenericFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.keys(genericEditModal.record).map((key) => {
                    const isReadOnly =
                      key === "id" ||
                      key === "clave" ||
                      key === "usuario_id" ||
                      key.startsWith("fecha_") ||
                      key === "fecha_creacion" ||
                      key === "fecha_actualizacion" ||
                      key === "fecha_evento" ||
                      key === "fecha_modificacion";

                    const currentValue = genericForm[key];

                    // Renderizar controles según el tipo o nombre de columna
                    return (
                      <div key={key} className={`space-y-1 ${isReadOnly ? "opacity-60" : ""}`}>
                        <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-on-surface-variant">
                          {key} {isReadOnly && <span className="text-[9px] font-normal lowercase">(no editable)</span>}
                        </label>

                        {isReadOnly ? (
                          <div className="bg-surface-container-low px-3 py-2 rounded-xl text-xs font-mono break-all text-on-surface-variant select-all">
                            {currentValue !== null && currentValue !== undefined
                              ? currentValue.toString()
                              : "null"}
                          </div>
                        ) : typeof currentValue === "boolean" ? (
                          <div className="flex items-center gap-2 py-2">
                            <input
                              type="checkbox"
                              checked={!!currentValue}
                              onChange={(e) => setGenericForm({ ...genericForm, [key]: e.target.checked })}
                              className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
                            />
                            <span className="text-xs font-medium text-on-surface">Activo / Confirmado</span>
                          </div>
                        ) : key === "estado" ? (
                          <select
                            value={currentValue || ""}
                            onChange={(e) => setGenericForm({ ...genericForm, [key]: e.target.value })}
                            className="ds-input w-full px-3 py-2 text-xs"
                          >
                            <option value="borrador">Borrador</option>
                            <option value="activo">Activo</option>
                            <option value="archivado">Archivado</option>
                          </select>
                        ) : key === "tipo" ? (
                          <select
                            value={currentValue || ""}
                            onChange={(e) => setGenericForm({ ...genericForm, [key]: e.target.value })}
                            className="ds-input w-full px-3 py-2 text-xs"
                          >
                            <option value="clase">Clase</option>
                            <option value="casa">Casa</option>
                          </select>
                        ) : key === "app_criterio" ? (
                          <select
                            value={currentValue || ""}
                            onChange={(e) => setGenericForm({ ...genericForm, [key]: e.target.value })}
                            className="ds-input w-full px-3 py-2 text-xs"
                          >
                            <option value="Caracterizar">Caracterizar</option>
                            <option value="Clasificar">Clasificar</option>
                            <option value="Seriar">Seriar</option>
                            <option value="Rompecabezas">Rompecabezas</option>
                          </select>
                        ) : key === "respuesta" ? (
                          <select
                            value={currentValue || ""}
                            onChange={(e) => setGenericForm({ ...genericForm, [key]: e.target.value })}
                            className="ds-input w-full px-3 py-2 text-xs"
                          >
                            <option value="SI">SI</option>
                            <option value="NO">NO</option>
                            <option value="EP">EP</option>
                          </select>
                        ) : key === "fecha_nacimiento" || key === "fecha_limite" || key === "fecha_realizacion" || key === "fecha_sesion" || key === "fecha_evaluacion" ? (
                          <input
                            type="datetime-local"
                            value={
                              currentValue
                                ? new Date(currentValue).toISOString().slice(0, 16)
                                : ""
                            }
                            onChange={(e) => setGenericForm({ ...genericForm, [key]: e.target.value })}
                            className="ds-input w-full px-3 py-2 text-xs"
                          />
                        ) : typeof currentValue === "object" ? (
                          <textarea
                            value={JSON.stringify(currentValue)}
                            onChange={(e) => {
                              try {
                                const parsed = JSON.parse(e.target.value);
                                setGenericForm({ ...genericForm, [key]: parsed });
                              } catch {
                                // Dejar que escriban hasta que sea JSON válido
                              }
                            }}
                            className="ds-input w-full px-3 py-2 text-xs font-mono"
                            rows={3}
                          />
                        ) : (
                          <input
                            type="text"
                            value={currentValue !== null && currentValue !== undefined ? currentValue : ""}
                            onChange={(e) => setGenericForm({ ...genericForm, [key]: e.target.value })}
                            className="ds-input w-full px-3 py-2 text-xs font-mono"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3 pt-4 border-t border-outline-variant/20 justify-end">
                  <button
                    type="button"
                    onClick={() => setGenericEditModal(null)}
                    className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="ds-btn-primary px-5 py-2.5 text-xs shadow-md cursor-pointer hover:scale-[1.01]"
                  >
                    Guardar Registro
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* CONFIRMACIÓN MODAL (AppModal reutilizado) */}
      {confirmModal && (
        <AppModal
          open={confirmModal.open}
          type="confirm"
          variant={confirmModal.variant}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmLabel={confirmModal.confirmLabel}
          onClose={() => setConfirmModal(null)}
          onConfirm={() => {
            confirmModal.onConfirm();
            setConfirmModal(null);
          }}
        />
      )}
    </DashboardShell>
  );
}
