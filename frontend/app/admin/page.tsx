"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "../components/DashboardShell";
import MaterialIcon from "../components/MaterialIcon";
import AppModal from "../components/AppModal";

// Importar Componentes Modulares
import DashboardTab from "./components/DashboardTab";
import UsuariosTab from "./components/UsuariosTab";
import DatabaseTab from "./components/DatabaseTab";
import UserModal from "./components/UserModal";
import GenericEditModal from "./components/GenericEditModal";
import AjustesTab from "../components/AjustesTab";

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
      const resUsers = await fetch(`${BACKEND_URL}/admin/usuarios`, { headers: getAuthHeader() });
      const usersData = await resUsers.json();
      const docs = usersData.filter((u: any) => u.rol === "docente").length;
      const fams = usersData.filter((u: any) => u.rol === "familia").length;

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

      const resLogs = await fetch(`${BACKEND_URL}/admin/tables/auditoria_logs`, { headers: getAuthHeader() });
      const logsData = await resLogs.json();
      if (Array.isArray(logsData)) {
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
      password_raw: "",
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

      {/* Renders Tab Content from Modular Components */}
      {activeTab === "dashboard" && (
        <DashboardTab
          stats={stats}
          recentLogs={recentLogs}
          loadingData={loadingData}
          onRefresh={fetchDashboardStats}
        />
      )}
      {activeTab === "docentes" && (
        <UsuariosTab
          rol="docente"
          users={users}
          loadingData={loadingData}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onToggleUserStatus={handleToggleUserStatus}
          onEditUser={openEditUserModal}
          onDeleteUser={handleDeleteUser}
          onCreateUser={() => openCreateUserModal("docente")}
        />
      )}
      {activeTab === "familias" && (
        <UsuariosTab
          rol="familia"
          users={users}
          loadingData={loadingData}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onToggleUserStatus={handleToggleUserStatus}
          onEditUser={openEditUserModal}
          onDeleteUser={handleDeleteUser}
          onCreateUser={() => openCreateUserModal("familia")}
        />
      )}
      {activeTab === "database" && (
        <DatabaseTab
          tables={tables}
          selectedTable={selectedTable}
          onSelectTable={setSelectedTable}
          tableRecords={tableRecords}
          loadingData={loadingData}
          onEditRecord={handleOpenEditRecordModal}
          onDeleteRecord={handleDeleteRecord}
        />
      )}
      {activeTab === "ajustes" && <AjustesTab session={session} />}

      {/* MODAL GESTIÓN DE USUARIOS */}
      <UserModal
        open={!!userModal && userModal.open}
        type={userModal?.type || "create"}
        rol={userModal?.rol || "docente"}
        userForm={userForm}
        onFormChange={setUserForm}
        error={userFormError}
        onClose={() => setUserModal(null)}
        onSubmit={handleUserFormSubmit}
      />

      {/* MODAL GENÉRICO DE BASE DE DATOS */}
      {genericEditModal && (
        <GenericEditModal
          open={genericEditModal.open}
          tableName={genericEditModal.tableName}
          record={genericEditModal.record}
          genericForm={genericForm}
          onFormChange={setGenericForm}
          onClose={() => setGenericEditModal(null)}
          onSubmit={handleGenericFormSubmit}
        />
      )}

      {/* CONFIRMACIÓN MODAL */}
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
