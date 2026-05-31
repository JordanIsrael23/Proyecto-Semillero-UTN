"use client";

import type { ReactNode } from "react";
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
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-on-background">
      <aside className="fixed left-0 top-0 z-50 flex h-screen w-[280px] flex-col border-r border-outline-variant/30 bg-surface-container-lowest px-6 py-8">
        <div className="mb-12 px-2">
          <BrandLogo size={70} subtitle={panelSubtitle} />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-on-primary active-nav-glow active:scale-[0.98]"
                    : "text-on-surface-variant hover:bg-primary-container/10 hover:text-primary"
                }`}
              >
                <MaterialIcon name={item.icon} className="text-xl" />
                <span>{item.label}</span>
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
        </div>
      </aside>

      <main className="ml-[280px] flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-40 flex w-full items-center justify-between gap-6 border-b border-outline-variant/20 bg-surface/80 px-8 py-5 backdrop-blur-md lg:px-16">
          <div className="flex w-full max-w-md flex-1 items-center rounded-full border border-outline-variant/30 bg-surface-container-low px-5 py-2.5 transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
            <MaterialIcon name="search" className="mr-3 shrink-0 text-on-surface-variant" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="w-full border-none bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-0"
            />
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <ThemeToggle />
            <button
              type="button"
              className="relative rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
              aria-label="Notificaciones"
            >
              <MaterialIcon name="notifications" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full border-2 border-surface-container-lowest bg-highlight-orange" />
            </button>
            <div className="hidden items-center gap-3 rounded-full border border-outline-variant/10 bg-surface-container-high px-4 py-2 md:flex">
              <div className="text-right">
                <p className="text-sm font-semibold leading-none text-on-surface">{userName}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-primary">{roleLabel}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-soft-blue/30 bg-soft-blue/20">
                <MaterialIcon name="account_circle" className="text-3xl text-soft-blue" />
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="ds-btn-primary shrink-0 px-6 py-2.5 text-sm shadow-sm shadow-primary/20"
            >
              Cerrar Sesión
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-6 p-8 lg:px-16 lg:py-8">{children}</div>

        <footer className="px-8 py-10 text-center opacity-40 lg:px-16">
          <p className="text-xs uppercase tracking-widest text-on-surface-variant">{footerText}</p>
        </footer>
      </main>
    </div>
  );
}
