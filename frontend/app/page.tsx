"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import BrandLogo from "./components/BrandLogo";
import MaterialIcon from "./components/MaterialIcon";
import ThemeToggle from "./components/ThemeToggle";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-background text-on-surface transition-colors duration-300">
      {/* Decorative background glows */}
      <div className="pointer-events-none absolute -left-[10%] top-0 h-[45%] w-[45%] rounded-full bg-primary/10 blur-[120px] dark:bg-primary/5" />
      <div className="pointer-events-none absolute -right-[10%] top-[20%] h-[45%] w-[45%] rounded-full bg-highlight-orange/10 blur-[120px] dark:bg-highlight-orange/5" />

      {/* Navigation */}
      <nav
        className={`fixed top-0 z-50 w-full border-b border-outline-variant/20 transition-all duration-300 ${scrolled
          ? "bg-surface/85 py-3 shadow-md backdrop-blur-md dark:bg-surface/80"
          : "bg-transparent py-5"
          }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-margin-mobile md:px-margin-desktop">
          {/* Logo */}
          <Link href="#" className="flex items-center gap-2 transition-transform active:scale-95">
            <BrandLogo size={42} showText={true} subtitle="Semilleros UTN 2026" />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#proyecto"
              className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors duration-200"
            >
              Proyecto
            </a>
            <a
              href="#pedagogia"
              className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors duration-200"
            >
              Pedagogía
            </a>
            <a
              href="#pilares"
              className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors duration-200"
            >
              Pilares
            </a>
            <a
              href="#utn"
              className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors duration-200"
            >
              UTN
            </a>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/login"
              className="ds-btn-primary px-5 py-2.5 text-sm shadow-md shadow-primary/10"
            >
              Acceder Web App
            </Link>
          </div>

          {/* Mobile Menu Actions */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-center rounded-xl p-2.5 text-on-surface-variant hover:bg-surface-container"
              aria-label="Toggle Menu"
            >
              <MaterialIcon name={mobileMenuOpen ? "close" : "menu"} className="text-2xl" />
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <div
          className={`absolute left-0 top-full w-full border-b border-outline-variant/20 bg-surface/95 shadow-xl backdrop-blur-lg transition-all duration-300 ease-in-out md:hidden ${mobileMenuOpen
            ? "visible opacity-100 translate-y-0"
            : "invisible opacity-0 -translate-y-4"
            }`}
        >
          <div className="flex flex-col gap-4 p-6">
            <a
              href="#proyecto"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-4 py-2.5 text-base font-semibold text-on-surface hover:bg-primary/10 hover:text-primary transition-colors"
            >
              Proyecto
            </a>
            <a
              href="#pedagogia"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-4 py-2.5 text-base font-semibold text-on-surface hover:bg-primary/10 hover:text-primary transition-colors"
            >
              Pedagogía
            </a>
            <a
              href="#pilares"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-4 py-2.5 text-base font-semibold text-on-surface hover:bg-primary/10 hover:text-primary transition-colors"
            >
              Pilares
            </a>
            <a
              href="#utn"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-4 py-2.5 text-base font-semibold text-on-surface hover:bg-primary/10 hover:text-primary transition-colors"
            >
              UTN
            </a>
            <hr className="border-outline-variant/20 my-1" />
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="ds-btn-primary w-full py-3 text-center text-sm shadow-md"
            >
              Acceder Web App
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20">
        {/* Hero Section */}
        <section id="proyecto" className="relative flex min-h-[85vh] items-center overflow-hidden py-16 md:py-24">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-margin-mobile md:grid-cols-2 md:gap-gutter md:px-margin-desktop">
            {/* Left Column: Text */}
            <div className="space-y-6 text-left animate-fade-in">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary dark:bg-primary/20">
                <MaterialIcon name="stars" className="text-sm shrink-0" />
                Innovación Educativa
              </span>
              <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface sm:text-5xl md:text-6xl leading-[1.15]">
                Cultivando el futuro con <span className="text-primary dark:text-soft-blue">Kimma</span>
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-on-surface-variant">
                Un ecosistema de conexión, cuidado y crecimiento cognitivo diseñado para potenciar el desarrollo integral en la primera infancia.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/login"
                  className="ds-btn-primary flex items-center justify-center gap-2 px-8 py-3.5 text-sm shadow-lg shadow-primary/20 hover:scale-[1.03]"
                >
                  Acceder Web App
                  <MaterialIcon name="login" className="text-lg" />
                </Link>
                <a
                  href="#pedagogia"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary/45 px-8 py-3.5 text-sm font-semibold text-primary hover:border-primary hover:bg-primary/5 transition-all duration-200"
                >
                  Saber más
                  <MaterialIcon name="arrow_downward" className="text-lg" />
                </a>
              </div>
            </div>

            {/* Right Column: Graphic */}
            <div className="relative flex items-center justify-center">
              {/* Blur elements behind image container */}
              <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-highlight-orange/30 blur-3xl opacity-60 dark:bg-highlight-orange/20" />
              <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-highlight-green/30 blur-3xl opacity-60 dark:bg-highlight-green/20" />

              {/* 1. Eliminado el 'p-12' para que la imagen toque los bordes */}
              <div className="relative z-10 w-full max-w-md aspect-square overflow-hidden rounded-full border-8 border-surface-container-lowest bg-surface-container-lowest shadow-xl dark:shadow-2xl flex items-center justify-center transition-transform duration-500 hover:scale-[1.02]">
                <Image
                  src="/kimma_logo.jpeg"
                  alt="Kimma Brand Identity"
                  width={380}
                  height={380}
                  /* 2. Cambiado a w-full h-full y object-cover */
                  className="h-full w-full object-cover shrink-0 dark:brightness-95"
                  priority
                  unoptimized
                />
              </div>
            </div>
          </div>
        </section>

        {/* Scientific Basis Section */}
        <section id="pedagogia" className="py-20 md:py-28 bg-surface-container-lowest transition-colors duration-300">
          <div className="mx-auto max-w-7xl px-margin-mobile md:px-margin-desktop">
            <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-gutter">
              {/* Left Column: Image */}
              <div className="relative overflow-hidden rounded-3xl border border-outline-variant/20 shadow-lg group">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGobnQFPJGWUVVXD-VZBhIgzNO0WmCA5S4mGvOGA1Esc7bzdpaoJuYKfOlkQ5pfmZ1Ayooi0j_14eP-GC-w7a6EZ741VVYIOCHYJc3g4vgGxvWINMmH5NYahVT_Uuh-e95mClmlLDR7VTIf1TcbVI8O2vVhZLHJHFHD5EL3z3VQ70ZT7gmkMGBzJXoEGq8T-aj7WnuDlCRisNTB_M0m7F9EL_Q8moH6_9DlLr0rYIc3cOBesBlRjdAG7JVworsyKEeS348SADwCng"
                  alt="FECYT Research Classroom"
                  width={600}
                  height={450}
                  className="h-[350px] sm:h-[450px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              </div>

              {/* Right Column: Text and Cards */}
              <div className="space-y-6">
                <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
                  Base Científica y Pedagógica
                </h2>
                <p className="text-lg leading-relaxed text-on-surface-variant">
                  Nacida de la investigación en la FECYT de la Universidad Técnica del Norte, nuestra metodología se fundamenta en la Educación Inicial de vanguardia, combinando neurociencia aplicada con entornos lúdicos y de cuidado.
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
                  <div className="flex items-start gap-4 p-5 rounded-2xl bg-highlight-green/10 border border-highlight-green/20 dark:bg-highlight-green/5 dark:border-highlight-green/10">
                    <MaterialIcon name="psychology" className="text-highlight-green text-3xl shrink-0" filled={true} />
                    <div className="space-y-1">
                      <h4 className="font-headline text-base font-bold text-on-surface">Estimulación Temprana</h4>
                      <p className="text-xs text-on-surface-variant font-medium">Programas personalizados para cada etapa del desarrollo infantil.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 rounded-2xl bg-primary/10 border border-primary/20 dark:bg-primary/5 dark:border-primary/10">
                    <MaterialIcon name="verified_user" className="text-primary text-3xl shrink-0" filled={true} />
                    <div className="space-y-1">
                      <h4 className="font-headline text-base font-bold text-on-surface">Rigor Académico</h4>
                      <p className="text-xs text-on-surface-variant font-medium">Validado por expertos e investigadores pedagógicos de la FECYT.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Pillars Section */}
        <section id="pilares" className="py-20 md:py-28 bg-surface-container-low transition-colors duration-300">
          <div className="mx-auto max-w-7xl px-margin-mobile md:px-margin-desktop">
            <div className="mx-auto max-w-3xl text-center space-y-4 mb-16">
              <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
                Nuestros Pilares Fundamentales
              </h2>
              <p className="text-lg text-on-surface-variant">
                Estructuras clave diseñadas para sostener el crecimiento saludable, seguro y equilibrado del niño.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Pillar 1 */}
              <div className="ds-card flex flex-col items-start p-8 transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-highlight-orange/20 text-highlight-orange dark:bg-highlight-orange/10">
                  <MaterialIcon name="spa" className="text-3xl" />
                </div>
                <h3 className="font-headline text-xl font-bold text-on-surface mb-3">Autocuidado</h3>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  Fomentamos la autonomía desde la consciencia personal, enseñando hábitos que promueven el bienestar físico, higiene y autorregulación emocional.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="ds-card flex flex-col items-start p-8 transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 text-primary dark:bg-primary/10">
                  <MaterialIcon name="groups" className="text-3xl" />
                </div>
                <h3 className="font-headline text-xl font-bold text-on-surface mb-3">Personas Seguras</h3>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  Construimos vínculos de confianza y entornos libres de riesgos que permiten la exploración activa y el desarrollo saludable de la autoestima.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="ds-card flex flex-col items-start p-8 transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-highlight-green/20 text-highlight-green dark:bg-highlight-green/10">
                  <MaterialIcon name="auto_graph" className="text-3xl" />
                </div>
                <h3 className="font-headline text-xl font-bold text-on-surface mb-3">Desarrollo Cognitivo</h3>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  Implementamos estrategias pedagógicas lúdicas y dinámicas que activan el potencial intelectual, el pensamiento lógico y la curiosidad innata.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Institutional Backing Section */}
        <section id="utn" className="py-20 md:py-24 bg-surface-container-lowest transition-colors duration-300">
          <div className="mx-auto max-w-4xl px-margin-mobile text-center space-y-8">
            <div className="mx-auto flex items-center justify-center w-full max-w-[200px] aspect-square overflow-hidden rounded-full transition-transform hover:scale-[1.02]">
              <Image
                src="/UTN_logo.png"
                alt="Universidad Técnica del Norte Logo"
                width={200}
                height={200}
                className="h-full w-full object-contain shrink-0"
                unoptimized
              />
            </div>
            <div className="space-y-4">
              <h2 className="font-headline text-2xl font-bold text-primary dark:text-soft-blue sm:text-3xl">
                Respaldo Académico Institucional
              </h2>
              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-on-surface-variant">
                Semilleros UTN 2026 es un proyecto de vinculación e investigación oficial de la Universidad Técnica del Norte, reafirmando nuestro compromiso con la excelencia educativa y la transformación social en el norte del país.
              </p>
            </div>
            <div className="flex justify-center gap-6 text-sm text-on-surface-variant/80 font-bold">
              <span>Ibarra, Ecuador</span>
              <span className="text-outline-variant">•</span>
              <span>Autónoma desde 1986</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-outline-variant/20 bg-surface-container py-12 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-margin-mobile md:px-margin-desktop">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            {/* Branding & Copyright */}
            <div className="text-center md:text-left space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="font-headline text-xl font-extrabold text-primary dark:text-soft-blue">
                  Semilleros UTN
                </span>
              </div>
              <p className="text-xs text-on-surface-variant max-w-md">
                © {new Date().getFullYear()} Semilleros UTN · FECYT Universidad Técnica del Norte. Todos los derechos reservados.
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
              <a
                href="https://www.utn.edu.ec"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
              >
                Investigación FECYT
              </a>
              <a
                href="#"
                className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
              >
                Guía de Autocuidado
              </a>
              <a
                href="#"
                className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
              >
                Políticas de Privacidad
              </a>
              <a
                href="#"
                className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
              >
                Contacto Institucional
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}