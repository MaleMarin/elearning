import { ConceptoLeccionPage } from '@/components/learning/ConceptoLeccionPage'

const DATA = {
  id: 'les-publicar-datos',
  titulo: 'Formatos Abiertos para Datos Gubernamentales',
  subtitulo: 'CSV, JSON, XML y GeoJSON: los estándares que hacen los datos verdaderamente usables',
  familia: 'datos-abiertos' as const,
  duracion: '12 min',
  contenido: {
    introduccion:
      'Un mismo dato puede ser "transparencia" o "dato abierto" según el formato. Un PDF con tablas es difícil de analizar; un CSV permite procesamiento automático. La Norma Técnica de Datos Abiertos (NTDA) de México especifica qué formatos son aceptables y qué metadatos deben acompañar cada conjunto.',
    secciones: [
      {
        titulo: 'Por qué el formato importa tanto como el dato',
        texto: 'Un PDF con tablas de contratos es "transparencia". El mismo dato en CSV es "dato abierto". JSON permite consumo directo por APIs. GeoJSON es esencial para datos geoespaciales (infraestructura, zonas de riesgo). La Norma Técnica de Datos Abiertos de México (NTDA) especifica los formatos aceptados.',
        ejemplo:
          'Secretaría de Infraestructura publicó inventario de carreteras en PDF de 800 páginas. Nadie lo usó. Al republicarlo en GeoJSON, en 3 meses 12 empresas de logística integraron los datos en sus sistemas de rutas.',
      },
      {
        titulo: 'CSV, JSON y GeoJSON: cuándo usar cada uno',
        texto: 'CSV: datos tabulares simples (padrones, presupuestos, contratos). JSON: datos con estructura anidada (trámites con múltiples campos). GeoJSON: cualquier dato con coordenadas geográficas. XML: interoperabilidad con sistemas legacy del gobierno federal. Evitar: Excel (.xlsx), PDF, Word — no son formatos abiertos.',
        ejemplo: null,
      },
      {
        titulo: 'Metadatos: el pasaporte de los datos',
        texto: 'Un dato sin metadatos es inútil. Los metadatos mínimos según NTDA: título, descripción, organización que publica, fecha de actualización, frecuencia de actualización, licencia de uso, diccionario de datos. La mayoría de los conjuntos de datos en México fallan en el diccionario de datos.',
        ejemplo:
          'El INEGI es el estándar de oro en metadatos: cada variable de sus censos tiene nombre, descripción, tipo de dato, rango válido, fuente y metodología documentados. Por eso los datos del INEGI son los más reutilizados de México.',
      },
    ],
    cierre:
      'Elegir el formato correcto y documentar con metadatos no es burocracia: es lo que permite que otros (ciudadanos, empresas, periodistas) realmente usen los datos que publicas.',
  },
  bibliografia: [
    { titulo: 'Norma Técnica de Datos Abiertos (NTDA)', autor: 'Gobierno de México', año: '2015', tipo: 'ley' },
    { titulo: 'Guía de metadatos para datos abiertos', autor: 'INAI / CEPAL', año: '2017', tipo: 'guia' },
    { titulo: 'GeoJSON Format Specification', autor: 'IETF', año: '2016', url: 'https://geojson.org', tipo: 'articulo' },
  ],
  quiz: [
    {
      id: 'q1',
      texto: '¿Para qué tipo de datos se recomienda GeoJSON?',
      opciones: ['Solo presupuestos', 'Datos con coordenadas geográficas', 'Solo texto', 'Datos personales'],
      correcta: 1,
      explicacion: 'GeoJSON es un estándar para representar datos geoespaciales (puntos, líneas, polígonos) y es ideal para mapas, infraestructura y datos territoriales.',
    },
    {
      id: 'q2',
      texto: '¿Cuál de estos formatos NO se considera abierto según la NTDA?',
      opciones: ['CSV', 'Excel (.xlsx)', 'JSON', 'XML'],
      correcta: 1,
      explicacion: 'Los formatos propietarios como Excel (.xlsx) no son estándares abiertos. La NTDA recomienda CSV, JSON, XML para datos abiertos.',
    },
    {
      id: 'q3',
      texto: '¿Qué es un diccionario de datos en el contexto de datos abiertos?',
      opciones: [
        'Un listado de palabras clave',
        'Documentación que describe cada variable: nombre, tipo, descripción, valores válidos',
        'Un índice de archivos',
        'Un contrato de licencia',
      ],
      correcta: 1,
      explicacion: 'El diccionario de datos describe cada columna o campo: qué significa, qué tipo de dato es, y cómo interpretarlo. Es esencial para reutilización.',
    },
    {
      id: 'q4',
      texto: '¿Qué organismo mexicano es referente en calidad de metadatos?',
      opciones: ['SAT', 'INEGI', 'Banxico', 'SEP'],
      correcta: 1,
      explicacion: 'El INEGI documenta exhaustivamente sus conjuntos de datos (censos, encuestas), lo que facilita su reutilización por investigadores y desarrolladores.',
    },
    {
      id: 'q5',
      texto: '¿Cuál es la frecuencia mínima de actualización recomendada para datos dinámicos?',
      opciones: ['Cada 5 años', 'Según la naturaleza del dato: trimestral, mensual o en tiempo real', 'Solo una vez', 'Cada década'],
      correcta: 1,
      explicacion: 'La frecuencia debe ser coherente con la naturaleza del dato: presupuesto ejercido puede ser mensual, accidentes viales en tiempo real, etc.',
    },
  ],
  reto: {
    titulo: 'Convierte un dato existente a formato abierto',
    problema:
      'Toma el último informe trimestral de tu dependencia (en PDF o Word) e identifica las 3 tablas de datos más relevantes. Conviértelas a CSV con los metadatos mínimos requeridos por la NTDA.',
    entregable: 'Archivo CSV (o enlace) más un documento con: título del conjunto, descripción, organización, fecha de actualización, y diccionario de datos de las columnas.',
    contexto:
      'La mayoría de las dependencias publican informes en PDF o Word. Esas mismas tablas, en CSV y con metadatos, se convierten en datos abiertos reutilizables.',
    ejemplo_respuesta:
      'Tablas elegidas: (1) Presupuesto ejercido por partida, (2) Contratos adjudicados por proveedor, (3) Personal por área. CSV con columnas: para presupuesto (partida, monto_ejercido, periodo); para contratos (proveedor, monto, objeto, fecha); para personal (area, puesto, cantidad). Diccionario: cada columna con nombre, descripción, tipo (texto/número/fecha), ejemplo.',
  },
}

export default function Page() {
  return <ConceptoLeccionPage data={DATA} />
}
