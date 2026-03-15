/** Lista reducida de países y regiones para el perfil. */
export const COUNTRIES: { value: string; label: string }[] = [
  { value: "ES", label: "España" },
  { value: "AR", label: "Argentina" },
  { value: "CL", label: "Chile" },
  { value: "CO", label: "Colombia" },
  { value: "MX", label: "México" },
  { value: "PE", label: "Perú" },
  { value: "US", label: "Estados Unidos" },
  { value: "UY", label: "Uruguay" },
  { value: "OT", label: "Otro" },
];

export const REGIONS: Record<string, { value: string; label: string }[]> = {
  ES: [
    { value: "madrid", label: "Comunidad de Madrid" },
    { value: "cataluna", label: "Cataluña" },
    { value: "andalucia", label: "Andalucía" },
    { value: "valencia", label: "Comunidad Valenciana" },
    { value: "otro", label: "Otra" },
  ],
  CL: [
    { value: "rm", label: "Región Metropolitana" },
    { value: "v", label: "Valparaíso" },
    { value: "biobio", label: "Biobío" },
    { value: "otro", label: "Otra" },
  ],
  MX: [
    { value: "cdmx", label: "Ciudad de México" },
    { value: "jalisco", label: "Jalisco" },
    { value: "nuevo-leon", label: "Nuevo León" },
    { value: "otro", label: "Otra" },
  ],
  AR: [
    { value: "caba", label: "CABA" },
    { value: "bsas", label: "Buenos Aires" },
    { value: "cordoba", label: "Córdoba" },
    { value: "otro", label: "Otra" },
  ],
  CO: [
    { value: "bogota", label: "Bogotá" },
    { value: "antioquia", label: "Antioquia" },
    { value: "valle", label: "Valle del Cauca" },
    { value: "otro", label: "Otra" },
  ],
  PE: [
    { value: "lima", label: "Lima" },
    { value: "arequipa", label: "Arequipa" },
    { value: "otro", label: "Otra" },
  ],
  US: [
    { value: "ca", label: "California" },
    { value: "ny", label: "Nueva York" },
    { value: "tx", label: "Texas" },
    { value: "otro", label: "Otro" },
  ],
  UY: [
    { value: "montevideo", label: "Montevideo" },
    { value: "otro", label: "Otra" },
  ],
  OT: [{ value: "otro", label: "—" }],
};

export function getRegionsForCountry(country: string) {
  return REGIONS[country] ?? REGIONS.OT;
}
