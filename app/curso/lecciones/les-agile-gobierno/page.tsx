import { ConceptoLeccionPage } from '@/components/learning/ConceptoLeccionPage'

const DATA = {
  id: 'les-agile-gobierno',
  titulo: 'Metodologías Ágiles en el Gobierno',
  subtitulo: 'Scrum y Kanban aplicados a proyectos de transformación digital pública',
  familia: 'innovacion' as const,
  duracion: '18 min',
  contenido: {
    introduccion:
      'El modelo en cascada (definir todo, desarrollar, entregar) falla con frecuencia en proyectos gubernamentales: los requisitos cambian, los ciudadanos cambian, el contexto político cambia. Las metodologías ágiles (Scrum, Kanban) proponen entregas pequeñas y frecuentes, con retroalimentación continua. Adaptadas al gobierno, reducen el riesgo de proyectos que no sirven a nadie.',
    secciones: [
      {
        titulo: 'Por qué el modelo en cascada falla en gobierno digital',
        texto: 'El modelo tradicional (definir todo → desarrollar → entregar) falla porque los requisitos cambian, los ciudadanos cambian, y el contexto político cambia. Proyectos gubernamentales TIC en cascada tienen 67% de probabilidad de fracasar o entregarse fuera de tiempo/costo (Standish Group). Ágil reduce ese riesgo con entregas pequeñas y frecuentes.',
        ejemplo:
          'El sistema de control escolar de la SEP tardó 5 años en desarrollo en cascada, costó 1,800 MDP, y cuando se entregó no cubría las necesidades reales de las escuelas. Una metodología ágil habría entregado versiones usables cada 3 meses con ajustes continuos.',
      },
      {
        titulo: 'Scrum adaptado a gobierno: sprints de 2 semanas',
        texto: 'Sprint de 2 semanas, daily standup de 15 min, sprint review con stakeholders ciudadanos, retrospectiva del equipo. Adaptaciones necesarias para gobierno: el "product owner" debe tener autorización real para tomar decisiones (no solo recomendar), los sprints deben alinearse a ciclos presupuestales, y las "historias de usuario" se escriben desde perspectiva ciudadana.',
        ejemplo: null,
      },
      {
        titulo: 'Kanban para operación cotidiana',
        texto: 'Kanban no requiere roles especiales ni ceremonias. Solo visualizar el flujo de trabajo: Por hacer → En progreso → En revisión → Listo. Limitar el trabajo en progreso (WIP) es la clave: si 10 cosas están "en progreso", nada avanza. La regla de oro: terminar antes de empezar.',
        ejemplo:
          'La oficina de trámites del Estado de México adoptó Kanban físico (tablero con post-its) para gestionar 200 trámites mensuales. Al limitar a 5 trámites simultáneos por oficial, el tiempo promedio de resolución bajó de 22 a 8 días.',
      },
    ],
    cierre:
      'Ágil en gobierno no es "hacer todo rápido": es entregar valor en ciclos cortos, medir con el ciudadano y ajustar. Empezar por un equipo piloto y un servicio concreto es más efectivo que intentar transformar toda la dependencia de golpe.',
  },
  bibliografia: [
    { titulo: 'Scrum Guide', autor: 'Scrum.org', año: '2020', url: 'https://scrumguides.org', tipo: 'guia' },
    { titulo: 'Kanban: Successful Evolutionary Change', autor: 'David J. Anderson', año: '2010', tipo: 'libro' },
    { titulo: 'Ágil en gobierno: experiencias en Latinoamérica', autor: 'BID', año: '2019', tipo: 'articulo' },
  ],
  quiz: [
    {
      id: 'q1',
      texto: '¿Qué porcentaje de proyectos TIC en cascada suelen fracasar o salir de tiempo/costo según Standish Group?',
      opciones: ['20%', '40%', '67%', '90%'],
      correcta: 2,
      explicacion: 'Estudios como el Standish Group reportan que alrededor de dos tercios de los proyectos grandes en cascada fracasan o se entregan con sobrecostos o retrasos.',
    },
    {
      id: 'q2',
      texto: '¿Cuál es la duración típica de un sprint en Scrum?',
      opciones: ['1 mes', '2 semanas', '6 meses', '1 año'],
      correcta: 1,
      explicacion: 'Los sprints en Scrum suelen ser de 2 semanas (o 1 mes como máximo), para poder entregar incrementos de valor y recibir retroalimentación con frecuencia.',
    },
    {
      id: 'q3',
      texto: '¿Qué significa limitar el WIP en Kanban?',
      opciones: [
        'Limitar el trabajo en progreso para que el equipo termine tareas antes de empezar más',
        'Reducir el presupuesto',
        'Contratar menos personas',
        'No aceptar más trámites',
      ],
      correcta: 0,
      explicacion: 'WIP = Work In Progress. Limitar cuántas tareas pueden estar "en progreso" a la vez obliga a terminar antes de empezar nuevas y reduce el tiempo total de entrega.',
    },
    {
      id: 'q4',
      texto: '¿Qué rol en Scrum debe tener autorización real para tomar decisiones en contexto gubernamental?',
      opciones: ['El desarrollador', 'El Scrum Master', 'El product owner', 'El auditor'],
      correcta: 2,
      explicacion: 'En gobierno, el product owner (quien prioriza qué se construye) debe tener mandato real para decidir, no solo "recomendar", o los sprints se bloquean.',
    },
    {
      id: 'q5',
      texto: 'En el ejemplo del Estado de México con Kanban, ¿qué cambio redujo el tiempo de resolución de trámites?',
      opciones: [
        'Contratar más oficiales',
        'Limitar a 5 trámites simultáneos por oficial (WIP)',
        'Comprar más computadoras',
        'Eliminar trámites',
      ],
      correcta: 1,
      explicacion: 'Al limitar el trabajo en progreso por oficial, cada uno terminaba los trámites antes de tomar nuevos. El tiempo promedio bajó de 22 a 8 días.',
    },
  ],
  reto: {
    titulo: 'Diseña tu primer sprint de mejora de servicio',
    contexto:
      'Un sprint ágil no tiene que ser de software: puede ser una mejora de proceso, un rediseño de formulario o una campaña de comunicación. Lo importante es definir un entregable concreto en 2 semanas.',
    problema:
      'Elige una mejora concreta de tu servicio que puedas entregar en 2 semanas. Define: qué entregarás, quién lo hará, cómo sabrás si salió bien, y cómo lo medirás con el ciudadano.',
    entregable: 'Documento de 1 página: objetivo del sprint, entregable, equipo, criterio de éxito y métrica de impacto en el ciudadano.',
    ejemplo_respuesta:
      'Objetivo: reducir el tiempo de respuesta a solicitudes de información. Entregable: plantilla de respuestas frecuentes + capacitación a 3 personas de ventanilla. Equipo: responsable de trámites + 2 oficiales. Criterio de éxito: 80% de consultas frecuentes resueltas en primera respuesta. Métrica: tiempo promedio de respuesta (antes/después) en 30 días.',
  },
}

export default function Page() {
  return <ConceptoLeccionPage data={DATA} />
}
