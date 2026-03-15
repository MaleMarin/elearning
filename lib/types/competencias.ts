/**
 * Competencias del Servicio Profesional de Carrera (SPC) — México.
 */

export type NivelCompetencia = "basico" | "intermedio" | "avanzado";

export type AreaCompetencia = "gestion" | "tecnica" | "directiva" | "transversal";

export interface Competencia {
  id: string;
  nombre: string;
  descripcion: string;
  nivel: NivelCompetencia;
  area: AreaCompetencia;
  fuenteOficial: string;
  indicadores: string[];
}

export interface LessonCompetencia {
  id: string;
  nivel: NivelCompetencia;
}
