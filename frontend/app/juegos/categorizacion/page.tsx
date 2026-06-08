"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { NivelClasificacion, MetricasJuegoAPI } from "./types";

/**
 * Dataset Inmutable de los Niveles del Juego.
 */
const NIVELES_HARDCODED: readonly NivelClasificacion[] = [
  {
    nivel: 1,
    instruccion: "Nivel 1: Clasifica en atributos simples",
    zonas: [
      { id: "z-segura", nombre: "Segura", criteriosRequeridos: ["seguro"] },
      { id: "z-peligrosa", nombre: "Peligrosa", criteriosRequeridos: ["peligroso"] }
    ],
    elementos: [
      { id: "e1", nombre: "Archivo A", imagenUrl: "/file.svg", atributos: ["seguro"] },
      { id: "e2", nombre: "Ventana B", imagenUrl: "/window.svg", atributos: ["peligroso"] }
    ]
  },
  {
    nivel: 2,
    instruccion: "Nivel 2: Clasifica evaluando múltiples atributos (AND)",
    zonas: [
      { id: "z-seguro-uniforme", nombre: "Seguro y Uniforme", criteriosRequeridos: ["seguro", "uniforme"] },
      { id: "z-peligroso-irregular", nombre: "Peligroso e Irregular", criteriosRequeridos: ["peligroso", "irregular"] }
    ],
    elementos: [
      { id: "e3", nombre: "Globo C", imagenUrl: "/globe.svg", atributos: ["seguro", "uniforme"] },
      { id: "e4", nombre: "Archivo D", imagenUrl: "/file.svg", atributos: ["peligroso", "irregular"] }
    ]
  },
  {
    nivel: 3,
    instruccion: "Nivel 3: Clasifica jerárquicamente en zonas planas y tangibles",
    zonas: [
      { id: "z-familia", nombre: "Familia", criteriosRequeridos: ["familia"] },
      { id: "z-comunidad", nombre: "Comunidad", criteriosRequeridos: ["comunidad"] }
    ],
    elementos: [
      { id: "e5", nombre: "Archivo Familia", imagenUrl: "/file.svg", atributos: ["familia"] },
      { id: "e6", nombre: "Globo Comunidad", imagenUrl: "/globe.svg", atributos: ["comunidad"] }
    ]
  }
];

/**
 * Componente Core que maneja la lógica de estado base y renderizado.
 */
function CategorizacionGameCore() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Validación Estricta de Sesión
  const sessionToken = searchParams.get("sessionToken");
  const metricaSesionId = searchParams.get("metricaSesionId");

  if (!sessionToken || !metricaSesionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-800 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Error de Autorización</h2>
          <p className="mb-4">
            No se pudo validar el contexto de la sesión activa. Por favor, ingresa desde el flujo principal de acceso.
          </p>
        </div>
      </div>
    );
  }

  /**
   * Capa de Red y Cierre (Fetch API)
   * Función asíncrona para sincronizar y despachar el resultado final.
   */
  const finalizarSesion = async (payload: MetricasJuegoAPI) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/juegos/sesion/${metricaSesionId}/detalles`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.status === 201) {
        // Redireccionar utilizando useRouter ante éxito estricto
        router.push("/familia");
      } else {
        console.error("Error en la sincronización:", response.status);
      }
    } catch (error) {
      console.error("Fallo la petición de red:", error);
    }
  };

  // En la implementación real, la UI del juego dependería de NIVELES_HARDCODED
  // Por el momento solo exponemos la carcasa estática
  const nivelActual = NIVELES_HARDCODED[0];

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-gray-800">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Juego de Categorización</h1>
          <p className="text-gray-600">Instrucción: {nivelActual.instruccion}</p>
        </header>

        {/* Zona de Renderizado de Contenedor de Juego (Cascarón) */}
        <section className="bg-white p-6 rounded-xl shadow border border-gray-100 mb-8 min-h-[400px] flex items-center justify-center">
          <p className="text-gray-400 italic">
            [Área reservada para el motor físico de Drag & Drop futuro]
          </p>
        </section>

        {/* Simulador de Finalización (Temporal para pruebas manuales) */}
        <footer className="text-right">
          <button
            onClick={() =>
              finalizarSesion({
                duracionSesion: "00:05:30",
                intentosPorElemento: 4,
                tasaAcierto: 100.0,
                secuenciaDecisiones: { e1: "z-segura", e2: "z-peligrosa" },
                usoAyudas: 0,
                nivelDificultad: nivelActual.nivel,
                abandono: false,
              })
            }
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Finalizar Sesión Manual
          </button>
        </footer>
      </div>
    </div>
  );
}

/**
 * Componente Envoltorio.
 * Obligatorio bajo Next.js App Router para componentes cliente usando useSearchParams.
 * Evita la desoptimización del SSR.
 */
export default function JuegoCategorizacionPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Cargando motor del juego...</div>}>
      <CategorizacionGameCore />
    </Suspense>
  );
}
