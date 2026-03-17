import { ConceptoLeccionPage } from '@/components/learning/ConceptoLeccionPage'

const DATA = {
  id: 'les-lfpdppp',
  titulo: 'LFPDPPP: Ley de Protección de Datos Personales',
  subtitulo: 'El marco legal que protege a los ciudadanos mexicanos en el entorno digital',
  familia: 'ciberseguridad' as const,
  duracion: '18 min',
  contenido: {
    introduccion:
      'La Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su equivalente para el sector público establecen cómo las instituciones deben tratar la información personal. Todo servidor público que maneje datos ciudadanos debe conocer los principios y los derechos ARCO.',
    secciones: [
      {
        titulo: '¿Qué datos protege la LFPDPPP?',
        texto: 'La ley distingue datos personales (nombre, CURP, dirección) de datos sensibles (salud, biometría, religión, orientación sexual). Los datos sensibles tienen protección reforzada y requieren consentimiento expreso.',
        ejemplo:
          'El ISSSTE al digitalizar expedientes médicos tuvo que clasificar cada campo: nombre y número de empleado son datos personales; diagnósticos y medicamentos son datos sensibles. Los sistemas se rediseñaron con controles diferenciados.',
      },
      {
        titulo: 'Los 8 principios ARCO y más',
        texto: 'Los ciudadanos tienen derechos de Acceso, Rectificación, Cancelación y Oposición (ARCO). Además: portabilidad, limitación del tratamiento, y no ser sujeto de decisiones automatizadas. El servidor público debe conocer estos derechos para atender solicitudes correctamente.',
        ejemplo:
          'Un ciudadano puede pedir al IMSS su historial completo de consultas (Acceso), corregir una fecha de nacimiento errónea (Rectificación), eliminar datos de una relación laboral terminada (Cancelación), u oponerse al uso de sus datos para investigación (Oposición).',
      },
      {
        titulo: 'Obligaciones de los sujetos obligados',
        texto: 'Aviso de privacidad obligatorio, medidas de seguridad técnicas y administrativas, nombramiento de un responsable de datos, y registro ante el INAI. Las sanciones van de advertencia hasta 32 millones de pesos para las entidades más grandes.',
        ejemplo:
          'El gobierno de Querétaro fue sancionado en 2019 por publicar un padrón de beneficiarios con datos personales sin anonimizar. Sanción: capacitación obligatoria y mejoras en sistemas. Lección: anonimizar antes de publicar siempre.',
      },
    ],
    cierre:
      'Cumplir la LFPDPPP no es opcional. Conocer los principios, los derechos ARCO y las obligaciones de seguridad permite a las dependencias proteger a los ciudadanos y evitar sanciones y daño reputacional.',
  },
  bibliografia: [
    { titulo: 'Ley Federal de Protección de Datos Personales en Posesión de los Particulares', autor: 'DOF', año: '2010', tipo: 'ley' },
    { titulo: 'Guía para la Protección de Datos Personales', autor: 'INAI', año: '2018', url: 'https://www.inai.org.mx', tipo: 'guia' },
    { titulo: 'Derechos ARCO: guía de implementación', autor: 'INAI', año: '2019', tipo: 'guia' },
  ],
  quiz: [
    {
      id: 'q1',
      texto: '¿Qué son los derechos ARCO?',
      opciones: [
        'Un tipo de cifrado',
        'Acceso, Rectificación, Cancelación y Oposición a los datos personales',
        'Una norma de calidad',
        'Un protocolo de red',
      ],
      correcta: 1,
      explicacion: 'ARCO son los derechos que tiene todo ciudadano sobre sus datos personales: conocerlos (Acceso), corregirlos (Rectificación), eliminarlos (Cancelación) y oponerse a su uso (Oposición).',
    },
    {
      id: 'q2',
      texto: '¿Cuál de estos es un dato sensible según la ley?',
      opciones: ['Nombre completo', 'Datos de salud', 'Correo electrónico', 'Domicilio'],
      correcta: 1,
      explicacion: 'Los datos sensibles incluyen salud, origen étnico, creencias religiosas, datos biométricos y orientación sexual. Requieren consentimiento expreso y protección reforzada.',
    },
    {
      id: 'q3',
      texto: '¿Qué organismo es la autoridad en materia de protección de datos en México?',
      opciones: ['SAT', 'INAI', 'SEP', 'SHCP'],
      correcta: 1,
      explicacion: 'El INAI (Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales) es la autoridad que vigila el cumplimiento de la ley de protección de datos.',
    },
    {
      id: 'q4',
      texto: '¿Qué debe publicar una dependencia que recopila datos personales?',
      opciones: ['Solo el nombre del responsable', 'Aviso de privacidad', 'Lista de empleados', 'Presupuesto anual'],
      correcta: 1,
      explicacion: 'El aviso de privacidad es obligatorio: debe informar qué datos se recaban, para qué se usan, cómo ejercer ARCO y a quién contactar.',
    },
    {
      id: 'q5',
      texto: 'Antes de publicar un padrón de beneficiarios en datos abiertos, ¿qué se debe hacer?',
      opciones: ['Solo subirlo en PDF', 'Anonimizar los datos personales', 'Pedir permiso a cada persona', 'No publicarlo nunca'],
      correcta: 1,
      explicacion: 'La publicación de datos que contengan datos personales sin anonimizar puede constituir una violación a la LFPDPPP. Se deben eliminar o anonimizar los identificadores personales.',
    },
  ],
  reto: {
    titulo: 'Auditoría de cumplimiento LFPDPPP en tu sistema',
    contexto:
      'Tu dependencia tiene un sistema de atención ciudadana que recopila nombre, CURP, domicilio, teléfono y datos del trámite. No cuentan con aviso de privacidad visible ni proceso documentado para solicitudes ARCO.',
    problema: '¿Cuáles son las 3 acciones inmediatas de mayor impacto para llevar tu sistema a cumplimiento básico con la LFPDPPP en 30 días?',
    entregable: 'Listado de 3 acciones con descripción breve de cada una y responsable sugerido. Máximo 300 palabras.',
    ejemplo_respuesta:
      '(1) Redactar y publicar aviso de privacidad integral en la página de la dependencia y en el punto de captura del sistema (responsable: área jurídica + TI). (2) Designar por escrito al responsable de datos personales y publicar su contacto (responsable: titular de la dependencia). (3) Documentar el procedimiento para atender solicitudes ARCO (plazo 20 días) y capacitar al personal de ventanilla (responsable: área jurídica).',
  },
}

export default function Page() {
  return <ConceptoLeccionPage data={DATA} />
}
