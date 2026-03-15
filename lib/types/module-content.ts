/**
 * Contenido teórico por módulo y control de visibilidad (biblioteca de contenido).
 */

export type VisibilityMode = "locked" | "preview" | "full";

export type BibliographyTipo = "libro" | "articulo" | "paper" | "reporte" | "web";

export interface BibliographyItem {
  id: string;
  tipo: BibliographyTipo;
  titulo: string;
  autor: string;
  año: number;
  descripcion: string;
  url?: string;
  obligatorio: boolean;
}

export interface PodcastItem {
  id: string;
  titulo: string;
  programa: string;
  descripcion: string;
  duracion: string;
  url: string;
  embedUrl?: string;
  imagen?: string;
}

export interface VideoItem {
  id: string;
  titulo: string;
  canal: string;
  descripcion: string;
  duracion: string;
  youtubeId: string;
  esObligatorio: boolean;
}

export interface LiveRecording {
  sessionDate: string;
  titulo: string;
  facilitador: string;
  duracion: string;
  youtubeId?: string;
  storageUrl?: string;
  transcripcion?: string;
}

export interface ModuleContentData {
  visibilityMode: VisibilityMode;
  bibliography: BibliographyItem[];
  podcasts: PodcastItem[];
  videos: VideoItem[];
  liveRecording: LiveRecording | null;
}
