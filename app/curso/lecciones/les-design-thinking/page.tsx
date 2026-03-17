import { ConceptoLeccionPage } from '@/components/learning/ConceptoLeccionPage'

const DATA = {
  id: 'les-design-thinking',
  titulo: 'Design Thinking para Gobierno',
  subtitulo: 'Las 5 etapas del diseño centrado en el ciudadano aplicadas a servicios públicos',
  familia: 'innovacion' as const,
  duracion: '20 min',
  contenido: {
    introduccion:
      'Innovación pública no es solo tecnología: es rediseñar procesos con el ciudadano en el centro. Design Thinking es una metodología de 5 etapas (empatizar, definir, idear, prototipar, testear) que evita el error clásico de gobierno: diseñar soluciones sin entender el problema real. Este módulo combina el marco de innovación pública con las herramientas de Design Thinking.',
    secciones: [
      {
        titulo: '¿Qué es y qué NO es innovación pública?',
        texto: 'Innovación pública no es solo tecnología. Es rediseñar procesos, eliminar burocracia innecesaria, y crear valor público real. El gobierno de Estonia redujo 98% de trámites presenciales sin IA — solo con rediseño de procesos y firma digital. México tiene el potencial: 130 millones de personas, millones de interacciones gubernamentales diarias.',
        ejemplo:
          'El programa "Trámites y Servicios" de la CDMX eliminó 340 trámites innecesarios entre 2019-2021. No requirió tecnología nueva — solo un equipo que preguntó "¿por qué hacemos esto?" a cada proceso.',
      },
      {
        titulo: 'Las 5 etapas y cómo adaptarlas al gobierno',
        texto: 'Empatizar (entrevistas con ciudadanos, no suposiciones), Definir (problema real, no síntoma), Idear (sin autocensura presupuestal en la primera ronda), Prototipar (versión de papel en 1 día), Testear (con 5 ciudadanos reales). El error más común en gobierno: saltar de "definir" a "solución tecnológica" sin idear ni prototipar.',
        ejemplo:
          'IMJUVE rediseñó su portal de becas usando Design Thinking: 3 semanas de entrevistas con 40 jóvenes revelaron que el problema no era el formulario (que era lo que querían mejorar) sino que los jóvenes no sabían que existía la beca. Solución: campaña en redes antes de rediseñar el portal. Registros: +340%.',
      },
      {
        titulo: 'Herramientas clave: mapa de empatía y journey map',
        texto: 'Mapa de empatía: qué piensa, siente, dice y hace el ciudadano al usar un servicio. Journey map: cada paso que da el ciudadano desde que decide hacer el trámite hasta que termina, con los dolores en cada etapa. Estas herramientas hacen visible lo invisible y crean consenso en el equipo.',
        ejemplo: null,
      },
      {
        titulo: 'Prototipado rápido en contexto gubernamental',
        texto: 'En gobierno, prototipar tiene resistencia cultural ("si no está terminado no lo mostramos"). El cambio de mentalidad clave: un prototipo de papel que falla en 5 minutos de prueba es mejor que un sistema de millones que falla cuando ya está instalado. Presupuestar tiempo de prototipado es presupuestar inteligentemente.',
        ejemplo:
          'La CDMX prototipó el nuevo formato de licencias de conducir en papel con recortes y post-its antes de contratar el desarrollo. En 2 horas de pruebas con 8 ciudadanos encontraron 6 problemas de usabilidad críticos. Ahorraron 3 meses de rediseño.',
      },
    ],
    cierre:
      'Design Thinking no es un lujo para equipos con presupuesto: es la forma de evitar gastar millones en soluciones que los ciudadanos no usan. Empezar por empatizar y prototipar barato ahorra tiempo y dinero.',
  },
  bibliografia: [
    { titulo: 'Design Thinking for Public Good', autor: 'GovLab', año: '2018', tipo: 'articulo' },
    { titulo: 'This is Service Design Doing', autor: 'Stickdorn et al.', año: '2018', tipo: 'libro' },
    { titulo: 'Laboratorio para la Ciudad (CDMX)', autor: 'LabCDMX', año: '2015', tipo: 'guia' },
  ],
  quiz: [
    {
      id: 'q1',
      texto: '¿Cuál es la primera etapa de Design Thinking?',
      opciones: ['Implementar', 'Empatizar', 'Contratar tecnología', 'Evaluar'],
      correcta: 1,
      explicacion: 'Empatizar es la primera etapa: entender al usuario (ciudadano) mediante entrevistas y observación, sin asumir qué necesita.',
    },
    {
      id: 'q2',
      texto: '¿Qué error común cometen las dependencias al "innovar"?',
      opciones: [
        'Contratar demasiados consultores',
        'Saltar de definir el problema a la solución tecnológica sin idear ni prototipar',
        'No tener presupuesto',
        'Preguntar al ciudadano',
      ],
      correcta: 1,
      explicacion: 'Muchos proyectos pasan de "tenemos un problema" a "vamos a comprar un sistema" sin explorar ideas ni probar prototipos baratos con usuarios reales.',
    },
    {
      id: 'q3',
      texto: '¿Para qué sirve un journey map?',
      opciones: [
        'Para planear viajes oficiales',
        'Para visualizar cada paso del ciudadano al usar un servicio e identificar dolores',
        'Para medir distancias',
        'Para diseñar mapas geográficos',
      ],
      correcta: 1,
      explicacion: 'El journey map recorre paso a paso la experiencia del usuario (desde que decide hacer el trámite hasta que termina) y marca los puntos de fricción o dolor.',
    },
    {
      id: 'q4',
      texto: '¿Por qué prototipar en papel antes de desarrollar?',
      opciones: [
        'Porque es más barato imprimir',
        'Porque permite probar con usuarios reales y encontrar errores antes de invertir en desarrollo',
        'Porque el papel es obligatorio',
        'Porque no hay presupuesto para software',
      ],
      correcta: 1,
      explicacion: 'Un prototipo de papel (o de bajo costo) permite testear la idea con ciudadanos en poco tiempo y corregir antes de gastar en desarrollo.',
    },
    {
      id: 'q5',
      texto: 'En el caso IMJUVE, ¿cuál fue el hallazgo clave de las entrevistas?',
      opciones: [
        'Que el formulario era muy largo',
        'Que los jóvenes no sabían que existía la beca; el problema era visibilidad, no el portal',
        'Que faltaban becas',
        'Que el sistema era lento',
      ],
      correcta: 1,
      explicacion: 'Las entrevistas revelaron que el cuello de botella no era el formulario sino la falta de conocimiento de la beca. La solución fue comunicación antes de rediseñar el portal.',
    },
  ],
  reto: {
    titulo: 'Mapa de empatía de un ciudadano usando tu servicio',
    contexto:
      'Los equipos suelen diseñar desde el escritorio sin hablar con quien usa el servicio. Un mapa de empatía obliga a ponerse en el lugar del ciudadano.',
    problema:
      'Elige a UN ciudadano típico que usa tu servicio más frecuente. Crea su mapa de empatía: ¿qué piensa? ¿qué siente? ¿qué dice? ¿qué hace? ¿qué necesita realmente que el servicio nunca le da?',
    entregable: 'Mapa de empatía (puede ser en formato texto o tabla) con las 5 dimensiones: piensa, siente, dice, hace, necesidades no cubiertas.',
    ejemplo_respuesta:
      'Persona: María, 45 años, va a renovar su licencia de conducir. Piensa: "¿Por qué piden tanto papel?" Siente: frustración y miedo a que le rechacen el trámite. Dice: "Ya vine dos veces y me faltaba un documento." Hace: busca en internet, pregunta a conocidos, llega con carpeta llena. Necesidad no cubierta: saber exactamente qué llevar la primera vez y poder agendar cita en línea.',
  },
}

export default function Page() {
  return <ConceptoLeccionPage data={DATA} />
}
