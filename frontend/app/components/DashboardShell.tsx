"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import BrandLogo from "./BrandLogo";
import MaterialIcon from "./MaterialIcon";
import ThemeToggle from "./ThemeToggle";

export interface DashboardNavItem {
  id: string;
  label: string;
  icon: string;
}

interface DashboardShellProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  navItems: DashboardNavItem[];
  userName: string;
  roleLabel: string;
  panelSubtitle: string;
  onLogout: () => void;
  searchPlaceholder?: string;
  footerText?: string;
}

export default function DashboardShell({
  children,
  activeTab,
  onTabChange,
  navItems,
  userName,
  roleLabel,
  panelSubtitle,
  onLogout,
  searchPlaceholder = "Buscar alumnos, planes...",
  footerText = "Kimma © 2026 • Conexión, Cuidado y Crecimiento Cognitivo",
}: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  const handleNavClick = (tab: string) => {
    onTabChange(tab);
    closeMobileMenu();
  };

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileMenu();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeMobileMenu]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      setIsDesktop(mq.matches);
      if (mq.matches) closeMobileMenu();
    };
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [closeMobileMenu]);

  const sidebarHidden = !isDesktop && !mobileMenuOpen;

  const sidebarContent = (
    <>
      <div className="mb-8 flex items-start justify-between gap-3 px-2 lg:mb-12">
        <BrandLogo size={56} subtitle={panelSubtitle} className="min-w-0 flex-1" />
        <button
          type="button"
          onClick={closeMobileMenu}
          className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container lg:hidden"
          aria-label="Cerrar menú"
        >
          <MaterialIcon name="close" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto overscroll-contain">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-primary text-on-primary active-nav-glow active:scale-[0.98]"
                  : "text-on-surface-variant hover:bg-primary-container/10 hover:text-primary"
              }`}
            >
              <MaterialIcon name={item.icon} className="shrink-0 text-xl" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-1 border-t border-outline-variant/30 pt-6">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-on-surface-variant transition-colors duration-200 hover:bg-primary-container/10 hover:text-primary"
        >
          <MaterialIcon name="settings" className="text-xl" />
          <span>Ajustes</span>
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-on-surface-variant transition-colors duration-200 hover:bg-primary-container/10 hover:text-primary"
        >
          <MaterialIcon name="help" className="text-xl" />
          <span>Ayuda</span>
        </button>
        <button
          type="button"
          onClick={() => {
            closeMobileMenu();
            onLogout();
          }}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-error transition-colors duration-200 hover:bg-error/10 lg:hidden"
        >
          <MaterialIcon name="logout" className="text-xl" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-on-background">
      {/* Overlay móvil */}
      <div
        className={`fixed inset-0 z-40 bg-on-surface/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeMobileMenu}
        aria-hidden={!mobileMenuOpen}
      />

      {/* Sidebar — drawer en móvil, fijo en desktop */}
      <aside
        id="dashboard-sidebar"
        className={`fixed left-0 top-0 z-50 flex h-screen w-[min(280px,85vw)] flex-col border-r border-outline-variant/30 bg-surface-container-lowest px-5 py-6 shadow-xl transition-transform duration-300 ease-in-out sm:px-6 sm:py-8 lg:w-[280px] lg:translate-x-0 lg:shadow-none ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        aria-hidden={sidebarHidden}
        aria-label="Menú principal"
        {...(!sidebarHidden && !isDesktop ? { role: "dialog" as const, "aria-modal": true as const } : {})}
      >
        {sidebarContent}
      </aside>

      <main className="flex min-h-screen min-w-0 flex-col bg-background lg:ml-[280px]">
        <header className="sticky top-0 z-30 border-b border-outline-variant/20 bg-surface/80 backdrop-blur-md">
          <div className="flex items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6 sm:py-4 lg:px-8 lg:py-5">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary lg:hidden"
              aria-label="Abrir menú"
              aria-expanded={mobileMenuOpen}
            >
              <MaterialIcon name="menu" className="text-2xl" />
            </button>

            <div className="min-w-0 flex-1 lg:hidden">
              <p className="truncate font-headline text-base font-bold text-primary">Kimma</p>
              <p className="truncate text-[10px] text-on-surface-variant/70">{panelSubtitle}</p>
            </div>

            <div className="hidden min-w-0 flex-1 items-center rounded-full border border-outline-variant/30 bg-surface-container-low px-5 py-2.5 transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 lg:flex lg:max-w-md">
              <MaterialIcon name="search" className="mr-3 shrink-0 text-on-surface-variant" />
              <input
                type="search"
                placeholder={searchPlaceholder}
                className="w-full min-w-0 border-none bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-0"
              />
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
              <ThemeToggle />
              <button
                type="button"
                className="relative rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                aria-label="Notificaciones"
              >
                <MaterialIcon name="notifications" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full border-2 border-surface-container-lowest bg-highlight-orange" />
              </button>
              <div className="hidden items-center gap-2 rounded-full border border-outline-variant/10 bg-surface-container-high px-3 py-1.5 sm:gap-3 sm:px-4 sm:py-2 md:flex">
                <div className="max-w-[120px] text-right sm:max-w-none">
                  <p className="truncate text-xs font-semibold leading-none text-on-surface sm:text-sm">
                    {userName}
                  </p>
                  <p className="mt-0.5 truncate text-[9px] font-bold uppercase tracking-wider text-primary sm:text-[10px]">
                    {roleLabel}
                  </p>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-soft-blue/30 bg-soft-blue/20 sm:h-10 sm:w-10">
                  <MaterialIcon name="account_circle" className="text-2xl text-soft-blue sm:text-3xl" />
                </div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="ds-btn-primary hidden shrink-0 px-4 py-2 text-xs sm:inline-flex sm:px-6 sm:py-2.5 sm:text-sm lg:inline-flex"
              >
                <span className="hidden sm:inline">Cerrar Sesión</span>
                <span className="sm:hidden">Salir</span>
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-error/10 hover:text-error sm:hidden"
                aria-label="Cerrar sesión"
              >
                <MaterialIcon name="logout" />
              </button>
            </div>
          </div>

          {/* Búsqueda full-width en tablet/móvil */}
          <div className="border-t border-outline-variant/10 px-4 pb-3 pt-2 lg:hidden">
            <div className="flex items-center rounded-full border border-outline-variant/30 bg-surface-container-low px-4 py-2.5 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
              <MaterialIcon name="search" className="mr-2 shrink-0 text-on-surface-variant" />
              <input
                type="search"
                placeholder={searchPlaceholder}
                className="w-full min-w-0 border-none bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-0"
              />
            </div>
          </div>
        </header>

        <div className="min-w-0 flex-1 space-y-4 p-4 sm:space-y-6 sm:p-6 lg:p-8 lg:px-16">{children}</div>

        <footer className="px-4 py-6 text-center opacity-40 sm:px-6 sm:py-8 lg:px-16 lg:py-10">
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant sm:text-xs">{footerText}</p>
        </footer>
      </main>
    </div>
  );
}
