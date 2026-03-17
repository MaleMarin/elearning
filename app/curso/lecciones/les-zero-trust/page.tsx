import { ConceptoLeccionPage } from '@/components/learning/ConceptoLeccionPage'

const DATA = {
  id: 'les-zero-trust',
  titulo: 'Modelo Zero Trust',
  subtitulo: 'Nunca confíes, siempre verifica: el nuevo perímetro de seguridad',
  familia: 'ciberseguridad' as const,
  duracion: '15 min',
  contenido: {
    introduccion:
      'El modelo de seguridad tradicional confiaba en que todo lo que estaba "dentro" de la red corporativa era seguro. Zero Trust invierte esa lógica: cada acceso se verifica, sin importar desde dónde se solicite. En el gobierno mexicano, donde el trabajo remoto y los sistemas heredados conviven, Zero Trust reduce el riesgo de brechas por credenciales comprometidas.',
    secciones: [
      {
        titulo: '¿Por qué falló el modelo de perímetro tradicional?',
        texto: 'Los firewalls ya no son suficientes. El trabajo remoto y la nube eliminaron el perímetro físico. El 80% de las brechas de seguridad gubernamentales en México provienen de credenciales internas comprometidas.',
        ejemplo:
          'Brecha en el Poder Judicial de la Federación 2021: atacantes usaron credenciales de un empleado con exceso de privilegios. Con Zero Trust, ese empleado no habría tenido acceso a sistemas fuera de su rol específico.',
      },
      {
        titulo: 'Los 3 principios de Zero Trust',
        texto: '(1) Verificar siempre: autenticar y autorizar cada solicitud. (2) Usar mínimo privilegio: cada usuario solo accede a lo estrictamente necesario. (3) Asumir brecha: diseñar como si el atacante ya estuviera dentro.',
        ejemplo:
          'La Guardia Nacional implementó MFA (autenticación multifactor) para todos sus sistemas en 2022. Ahora cada acceso requiere contraseña + código temporal. Las tentativas de phishing cayeron 73%.',
      },
      {
        titulo: 'Implementación gradual en gobierno',
        texto: 'Zero Trust no se implementa de golpe. La ruta recomendada por CISA (EUA) tiene 5 pilares: identidad, dispositivos, redes, aplicaciones y datos. Para un estado mexicano con recursos limitados, empezar por identidad (MFA) da el mayor impacto al menor costo.',
        ejemplo:
          'El estado de Jalisco adoptó Zero Trust por pilares: primero MFA para todos los funcionarios (3 meses), luego segmentación de red entre áreas (6 meses), luego monitoreo continuo (12 meses). Costo total: 40% menor a una implementación simultánea.',
      },
    ],
    cierre:
      'Zero Trust no es un producto que se compra, sino un modelo de seguridad que se adopta por fases. Empezar por MFA y mínimo privilegio en los sistemas más críticos es un primer paso alcanzable para cualquier dependencia.',
  },
  bibliografia: [
    { titulo: 'NIST SP 800-207: Zero Trust Architecture', autor: 'NIST', año: '2020', url: 'https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-207.pdf', tipo: 'guia' },
    { titulo: 'Implementing a Zero Trust Architecture', autor: 'CISA', año: '2021', tipo: 'guia' },
    { titulo: 'Marco de Ciberseguridad para Gobierno Digital', autor: 'CEDN México', año: '2023', tipo: 'guia' },
    { titulo: 'The Zero Trust Model of Information Security', autor: 'John Kindervag', año: '2010', tipo: 'articulo' },
  ],
  quiz: [
    {
      id: 'q1',
      texto: '¿Cuál es el principal cambio de paradigma de Zero Trust vs seguridad tradicional?',
      opciones: [
        'Usar más firewalls',
        'Pasar de confiar por estar dentro de la red a verificar siempre, sin importar la ubicación',
        'Eliminar las contraseñas',
        'Centralizar todos los datos en un solo servidor',
      ],
      correcta: 1,
      explicacion: 'Zero Trust asume que la red interna no es segura y exige verificar cada acceso con identidad y contexto, sin importar si el usuario está dentro o fuera del edificio.',
    },
    {
      id: 'q2',
      texto: '¿Qué significa MFA?',
      opciones: ['Módulo de Firma Avanzada', 'Autenticación Multifactor', 'Marco Federal de Acceso', 'Mínimo Factor de Riesgo'],
      correcta: 1,
      explicacion: 'MFA (Multifactor Authentication) es la autenticación que combina dos o más factores: algo que sabes (contraseña), algo que tienes (teléfono) o algo que eres (biometría).',
    },
    {
      id: 'q3',
      texto: '¿Cuál es el primer pilar recomendado para implementar Zero Trust con recursos limitados?',
      opciones: ['Redes', 'Identidad (MFA)', 'Aplicaciones', 'Datos'],
      correcta: 1,
      explicacion: 'Comenzar por identidad (MFA y mínimo privilegio) ofrece el mayor impacto en la reducción de riesgo con menor inversión inicial.',
    },
    {
      id: 'q4',
      texto: '¿Por qué el trabajo remoto debilitó el modelo de perímetro?',
      opciones: [
        'Porque los empleados no tienen escritorio',
        'Porque los empleados acceden desde redes no controladas por la organización',
        'Porque se eliminaron los firewalls',
        'Porque ya no hay oficinas',
      ],
      correcta: 1,
      explicacion: 'Cuando el empleado trabaja desde casa o desde cualquier lugar, ya no hay un "interior" físico de la red; la confianza por ubicación deja de tener sentido.',
    },
    {
      id: 'q5',
      texto: '¿Qué significa "mínimo privilegio" en Zero Trust?',
      opciones: [
        'Dar la menor cantidad de permisos posible a cada usuario',
        'Cada usuario solo tiene acceso a los recursos que necesita para su función',
        'Usar la contraseña más corta permitida',
        'Tener el menor número de empleados posible',
      ],
      correcta: 1,
      explicacion: 'Mínimo privilegio significa que cada usuario, dispositivo o aplicación solo recibe los permisos estrictamente necesarios para cumplir su función, reduciendo el daño si una cuenta es comprometida.',
    },
  ],
  reto: {
    titulo: 'Diseña la política de acceso Zero Trust para tu dependencia',
    contexto:
      'Tu dependencia tiene 200 funcionarios con acceso a sistemas críticos. Actualmente todos usan solo contraseña y muchos comparten credenciales. Han tenido 3 incidentes de acceso no autorizado en el último año.',
    problema:
      '¿Cómo implementarías los principios de Zero Trust en los próximos 6 meses sin interrumpir la operación diaria?',
    entregable: 'Cronograma de 6 meses con 3 fases, herramientas gratuitas o de bajo costo, y cómo medir el éxito.',
    ejemplo_respuesta:
      'Fase 1 (meses 1-2): Inventario de usuarios y sistemas críticos; implementar MFA con Google Authenticator o similar en los 3 sistemas más sensibles. Fase 2 (meses 3-4): Revisión de permisos por rol; eliminar accesos innecesarios. Fase 3 (meses 5-6): Segmentación de red básica entre áreas (finanzas, RH, operación). Métrica de éxito: cero incidentes de credenciales compartidas y reducción del 50% en intentos de acceso fallidos.',
  },
}

export default function Page() {
  return <ConceptoLeccionPage data={DATA} />
}
