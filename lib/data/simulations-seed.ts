/**
 * Escenarios del Simulador de Política Pública (Brecha 2).
 * Se pueden cargar en Firestore /simulations/{id} vía admin o seed.
 */
import type { Simulation } from "@/lib/types/simulador";

export const SIMULATIONS_SEED: Omit<Simulation, "id">[] = [
  {
    titulo: "Digitalización del trámite de licencias en tu municipio",
    contexto:
      "El municipio recibe 800 trámites de licencias comerciales al mes. 70% se hacen en papel. Los ciudadanos esperan en promedio 3 horas. El director de sistemas tiene 58 años y cree que 'el sistema actual funciona bien'.",
    presupuesto: "MXN $800,000",
    tiempo: "6 meses",
    equipo: "8 personas, acceso limitado a internet en ventanillas",
    modulo: "Transformación digital",
    criterios: [
      "viabilidad técnica",
      "gestión del cambio",
      "impacto ciudadano",
      "sostenibilidad",
      "cumplimiento normativo",
    ],
    dificultad: "intermedio",
    duracionMinutos: 15,
  },
  {
    titulo: "Implementar trabajo remoto en una dependencia federal",
    contexto:
      "Tu dependencia tiene 400 empleados. El secretario quiere 40% en home office permanente. Los sindicatos están en contra. TI dice que la infraestructura no aguanta. Tienes 3 meses antes de que el secretario presente resultados al presidente.",
    presupuesto: "MXN $3.2M",
    tiempo: "3 meses",
    equipo: "15 personas de diferentes áreas, ninguna con experiencia en transformación digital",
    modulo: "Gestión del cambio",
    criterios: [
      "viabilidad técnica",
      "gestión del cambio",
      "impacto en el servicio",
      "sostenibilidad",
      "relación sindical",
    ],
    dificultad: "avanzado",
    duracionMinutos: 15,
  },
  {
    titulo: "Crisis de datos: tu sistema fue hackeado",
    contexto:
      "A las 11pm del viernes recibes un aviso: el sistema de nómina de tu dependencia fue comprometido. Datos de 2,400 empleados expuestos. Tienes que tomar 5 decisiones en las próximas 2 horas.",
    presupuesto: "Sin límite — emergencia",
    tiempo: "2 horas",
    equipo: "Solo tú y el equipo de TI de guardia (3 personas)",
    modulo: "Ciberseguridad y respuesta",
    criterios: [
      "comunicación de crisis",
      "contención técnica",
      "cumplimiento normativo",
      "protección de datos",
      "coordinación institucional",
    ],
    dificultad: "avanzado",
    duracionMinutos: 15,
  },
];

export function getSimulationsWithIds(): Simulation[] {
  return SIMULATIONS_SEED.map((s, i) => ({
    ...s,
    id: `sim-${i + 1}`,
  }));
}
