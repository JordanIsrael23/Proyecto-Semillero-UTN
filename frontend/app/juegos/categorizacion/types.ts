/**
 * types.ts
 *
 * Definición estricta de las estructuras de datos requeridas para el motor del juego de categorización.
 *
 * MEJORES PRÁCTICAS APLICADAS:
 * 1. Tipado Fuerte y Estricto: Interfaces definidas sin `any` para prevenir errores de runtime y facilitar el autocompletado en el IDE.
 * 2. Inmutabilidad por Defecto: Todos los campos y arrays están declarados como `readonly` para forzar su inmutabilidad a lo largo del ciclo de vida de la vista. Se recomienda crear copias en caso de mutación.
 * 3. Segregación y Semántica: Cada interfaz tiene un propósito único (DTO de red vs Modelo de Dominio de UI).
 */

/**
 * Representa un elemento interactivo que el usuario debe clasificar.
 * Los atributos se cruzan contra los criteriosRequeridos de las zonas.
 */
export interface ElementoClasificacion {
  readonly id: string;
  readonly nombre: string;
  readonly imagenUrl: string;
  readonly atributos: readonly string[];
}

/**
 * Representa el contenedor o zona donde el usuario soltará el elemento.
 * Puede exigir uno o varios criterios de forma combinada (AND / OR dependiendo del nivel de juego).
 */
export interface ZonaDestino {
  readonly id: string;
  readonly nombre: string;
  readonly criteriosRequeridos: readonly string[];
}

/**
 * Contenedor de la configuración completa de un nivel de juego en específico.
 * Asegura la entrega atómica de la dificultad actual y sus datos.
 */
export interface NivelClasificacion {
  readonly nivel: number;
  readonly instruccion: string;
  readonly zonas: readonly ZonaDestino[];
  readonly elementos: readonly ElementoClasificacion[];
}

/**
 * Contrato de Transferencia de Datos (DTO) para la sincronización con el Backend.
 * Refleja exactamente lo esperado por la API en `/api/juegos/sesion/{id}/detalles`.
 */
export interface MetricasJuegoAPI {
  readonly duracionSesion: string;           // Formato HH:MM:SS
  readonly intentosPorElemento: number;      // Cantidad total de intentos fallidos vs acertados global
  readonly tasaAcierto: number;              // Porcentaje de acierto (ej. 85.5)
  readonly secuenciaDecisiones: Readonly<Record<string, string>>; // Mapa ElementoID -> ZonaDestinoID
  readonly usoAyudas: number;                // Veces que se usó un botón de pistas
  readonly nivelDificultad: number;          // Nivel jugado
  readonly abandono: boolean;                // Flag si el juego se cerró antes de terminar
}
