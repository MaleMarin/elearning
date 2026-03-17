import { ConceptoLeccionPage } from '@/components/learning/ConceptoLeccionPage'

const DATA = {
  id: 'les-que-son-datos',
  titulo: '¿Qué son los Datos Abiertos?',
  subtitulo: 'Transparencia, acceso y valor público de la información gubernamental',
  familia: 'datos-abiertos' as const,
  duracion: '14 min',
  contenido: {
    introduccion:
      'Los datos abiertos son información pública publicada en formatos que cualquiera puede usar, reutilizar y redistribuir. No basta con "transparencia": los datos deben ser legibles por máquina, sin restricciones de uso y con licencia clara. En México, datos.gob.mx concentra miles de conjuntos de datos de instituciones federales y locales.',
    secciones: [
      {
        titulo: 'La definición: qué hace a un dato verdaderamente abierto',
        texto: 'Open Data Charter define 6 principios: abiertos por defecto, oportunos y completos, accesibles y usables, comparables e interoperables, para mejorar la gobernanza, y para el desarrollo inclusivo. No basta con publicar un PDF: los datos deben ser descargables, en formato legible por máquina, sin restricciones de uso.',
        ejemplo:
          'La Plataforma Nacional de Transparencia (infomex.org.mx) publica documentos pero NO son datos abiertos verdaderos: son PDFs no estructurados. En cambio, datos.gob.mx publica los mismos datos en CSV y JSON — esos sí son datos abiertos.',
      },
      {
        titulo: 'Ecosistema de datos abiertos en México',
        texto: 'datos.gob.mx tiene más de 14,000 conjuntos de datos de 250 instituciones. Los estados con mejores prácticas: CDMX (portal de datos de movilidad), Jalisco (datos de presupuesto abierto), Nuevo León (datos de seguridad en tiempo real). El gran pendiente: la mayoría de los estados tienen portales desactualizados o sin datos de calidad.',
        ejemplo: null,
      },
      {
        titulo: 'Valor público: para qué sirven los datos abiertos',
        texto: '(1) Periodistas de datos para investigación de corrupción. (2) Empresas para crear servicios (apps de transporte, salud). (3) Académicos para investigación de política pública. (4) Ciudadanos para exigir cuentas. El ROI de los datos abiertos en Reino Unido se estima en £6 por cada £1 invertida.',
        ejemplo:
          'La startup Gaia Analytics usó los datos abiertos de accidentes viales de la CDMX para crear un modelo predictivo de zonas de riesgo. Este modelo fue adoptado por la Secretaría de Seguridad para redistribuir patrullajes. Resultado: reducción del 18% en accidentes fatales en zonas de intervención.',
      },
    ],
    cierre:
      'Publicar datos abiertos de calidad no es solo un requisito de transparencia: es una palanca de valor económico y social. Elegir bien qué datos abrir y en qué formato es la primera decisión estratégica.',
  },
  bibliografia: [
    { titulo: 'Open Data Charter', autor: 'Open Data Charter', año: '2015', url: 'https://opendatacharter.net', tipo: 'articulo' },
    { titulo: 'Norma Técnica de Datos Abiertos (NTDA)', autor: 'Gobierno de México', año: '2015', tipo: 'ley' },
    { titulo: 'Portal datos.gob.mx', autor: 'Gobierno de México', año: '2015', url: 'https://datos.gob.mx', tipo: 'guia' },
  ],
  quiz: [
    {
      id: 'q1',
      texto: '¿Qué hace que un dato sea "abierto" en sentido técnico?',
      opciones: [
        'Que esté en internet',
        'Que sea descargable, en formato legible por máquina y sin restricciones de uso',
        'Que sea gratuito',
        'Que tenga más de 1000 registros',
      ],
      correcta: 1,
      explicacion: 'Un dato abierto debe ser accesible (descargable), en formatos que las máquinas puedan procesar (CSV, JSON, etc.) y con licencia que permita reutilización.',
    },
    {
      id: 'q2',
      texto: '¿Cuál de estos NO es un formato de dato abierto?',
      opciones: ['CSV', 'PDF con tablas', 'JSON', 'GeoJSON'],
      correcta: 1,
      explicacion: 'Un PDF con tablas no es legible por máquina de forma estándar. CSV, JSON y GeoJSON sí permiten procesamiento automático.',
    },
    {
      id: 'q3',
      texto: '¿Qué portal concentra los datos abiertos del gobierno federal mexicano?',
      opciones: ['infomex.org.mx', 'datos.gob.mx', 'gob.mx', 'transparenciapresupuestaria.gob.mx'],
      correcta: 1,
      explicacion: 'datos.gob.mx es el portal nacional de datos abiertos con más de 14,000 conjuntos de datos de instituciones públicas.',
    },
    {
      id: 'q4',
      texto: '¿Qué tipo de valor generan los datos abiertos?',
      opciones: [
        'Solo valor político',
        'Valor periodístico, económico, académico y de rendición de cuentas',
        'Solo valor para empresas',
        'Ninguno si no se usan',
      ],
      correcta: 1,
      explicacion: 'Los datos abiertos generan valor en múltiples dimensiones: investigación, apps y servicios, periodismo de datos y control ciudadano.',
    },
    {
      id: 'q5',
      texto: 'Según el Open Data Charter, ¿cuál es un principio de los datos abiertos?',
      opciones: ['Cerrados por defecto', 'Abiertos por defecto', 'Solo para gobierno', 'Solo en formato Excel'],
      correcta: 1,
      explicacion: 'El principio "abiertos por defecto" significa que la información pública debe publicarse como dato abierto salvo que exista una razón legal para no hacerlo.',
    },
  ],
  reto: {
    titulo: 'Publica tu primer conjunto de datos abiertos',
    contexto:
      'Tu dependencia tiene datos públicos que actualmente solo se entregan por solicitud de transparencia en PDF: contratos adjudicados, personal de base, presupuesto ejercido.',
    problema:
      'Elige UNO de esos conjuntos de datos y diseña el proceso para publicarlo como dato abierto verdadero en datos.gob.mx en 60 días.',
    entregable: 'Plan de 4 pasos: (1) conjunto elegido, (2) formato y metadatos, (3) responsables y plazos, (4) criterio de éxito.',
    ejemplo_respuesta:
      'Conjunto: contratos adjudicados del último año. Formato: CSV con columnas estándar (proveedor, monto, objeto, fecha). Metadatos: título, descripción, frecuencia de actualización, diccionario de datos. Responsable: área de compras + TI. Plazos: semana 1-2 limpieza, semana 3-4 carga en datos.gob.mx. Éxito: dataset publicado y al menos 1 descarga en 30 días.',
  },
}

export default function Page() {
  return <ConceptoLeccionPage data={DATA} />
}
