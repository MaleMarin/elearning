import { ConceptoLeccionPage } from '@/components/learning/ConceptoLeccionPage'

const DATA = {
  id: 'les-cifrado-e2e',
  titulo: 'Cifrado de extremo a extremo',
  subtitulo: 'Cómo AES-256 protege la información sensible de los ciudadanos',
  familia: 'ciberseguridad' as const,
  duracion: '12 min',
  contenido: {
    introduccion:
      'El cifrado de extremo a extremo (E2E) garantiza que la información solo pueda ser leída por el emisor y el receptor autorizado. Ni siquiera los administradores del sistema pueden acceder al contenido. En el gobierno digital mexicano, esto es fundamental para proteger expedientes médicos, datos fiscales y comunicaciones oficiales.',
    secciones: [
      {
        titulo: '¿Qué es AES-256?',
        texto: 'AES (Advanced Encryption Standard) con clave de 256 bits es el estándar de cifrado simétrico más seguro disponible. Fue adoptado por el gobierno de Estados Unidos en 2001 y hoy es el estándar global para proteger información clasificada. En términos prácticos: para romper un cifrado AES-256 por fuerza bruta se necesitarían más años que la edad del universo.',
        ejemplo:
          'El SAT México utiliza AES-256 para cifrar las declaraciones fiscales electrónicas de los contribuyentes. Cuando subes tu declaración anual, viaja cifrada desde tu computadora hasta los servidores del SAT. Nadie en el trayecto puede leer el contenido.',
      },
      {
        titulo: 'Cifrado simétrico vs asimétrico',
        texto: 'El cifrado simétrico usa la misma clave para cifrar y descifrar — es rápido y eficiente para grandes volúmenes de datos. El asimétrico (RSA, ECC) usa un par de claves pública/privada — es más lento pero resuelve el problema de distribución de claves. En la práctica, los sistemas modernos usan ambos: asimétrico para intercambiar la clave simétrica, luego simétrico para cifrar los datos.',
        ejemplo:
          'La firma electrónica del gobierno mexicano (e.firma del SAT) usa criptografía asimétrica: tienes una clave privada en tu computadora y el SAT tiene tu clave pública. Solo tú puedes firmar con tu clave privada, y cualquiera puede verificar la firma con tu clave pública.',
      },
      {
        titulo: 'Implementación en servicios de gobierno',
        texto: 'Para implementar cifrado E2E en un servicio gubernamental se requiere: (1) definir qué datos son sensibles según LFPDPPP, (2) elegir el algoritmo apropiado (AES-256 para datos en reposo, TLS 1.3 para datos en tránsito), (3) gestionar las claves de manera segura usando un HSM (Hardware Security Module), y (4) establecer políticas de rotación de claves. El error más común es cifrar bien los datos pero gestionar las claves de manera insegura.',
        ejemplo:
          'El IMSS cifra los expedientes clínicos digitales con AES-256. Las claves de cifrado se almacenan en HSMs físicos con acceso biométrico restringido. Cada clave se rota cada 90 días automáticamente.',
      },
    ],
    cierre:
      'El cifrado E2E no es opcional en el gobierno digital — es una obligación legal bajo la LFPDPPP y una responsabilidad ética con los ciudadanos. La pregunta no es si implementar cifrado, sino cómo hacerlo correctamente y mantenerlo actualizado frente a amenazas emergentes.',
  },
  bibliografia: [
    {
      titulo: 'FIPS 197: Advanced Encryption Standard',
      autor: 'NIST',
      año: '2001',
      url: 'https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197.pdf',
      tipo: 'guia',
    },
    {
      titulo: 'Guía de Seguridad para Datos Personales en Posesión de Sujetos Obligados',
      autor: 'INAI',
      año: '2015',
      url: 'https://www.inai.org.mx',
      tipo: 'guia',
    },
    { titulo: 'Criptografía aplicada', autor: 'Bruce Schneier', año: '1996', tipo: 'libro' },
    {
      titulo: 'Ley Federal de Protección de Datos Personales en Posesión de los Particulares',
      autor: 'Congreso de la Unión',
      año: '2010',
      tipo: 'ley',
    },
  ],
  quiz: [
    {
      id: 'q1',
      texto: '¿Cuántos bits usa la clave en AES-256?',
      opciones: ['128 bits', '192 bits', '256 bits', '512 bits'],
      correcta: 2,
      explicacion:
        'AES-256 usa una clave de 256 bits, lo que genera 2^256 combinaciones posibles — número prácticamente imposible de romper con computadoras actuales.',
    },
    {
      id: 'q2',
      texto: '¿Qué problema principal resuelve la criptografía asimétrica?',
      opciones: ['Cifrar datos más rápido', 'Distribuir claves de forma segura', 'Comprimir archivos', 'Firmar documentos físicos'],
      correcta: 1,
      explicacion:
        'La criptografía asimétrica resuelve el problema de distribución de claves: cómo compartir una clave secreta con alguien sin que nadie más la intercepte.',
    },
    {
      id: 'q3',
      texto: 'En el gobierno mexicano, ¿qué organismo regula el uso de datos personales cifrados?',
      opciones: ['SAT', 'INAI', 'IMSS', 'Banxico'],
      correcta: 1,
      explicacion:
        'El INAI (Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales) es el organismo que regula la protección de datos personales en México.',
    },
    {
      id: 'q4',
      texto: '¿Qué es un HSM en el contexto de cifrado?',
      opciones: [
        'Un tipo de algoritmo de cifrado',
        'Hardware especializado para gestionar claves criptográficas',
        'Un protocolo de comunicación segura',
        'Una firma digital',
      ],
      correcta: 1,
      explicacion:
        'Un HSM (Hardware Security Module) es un dispositivo físico diseñado específicamente para gestionar, proteger y respaldar claves criptográficas de forma segura.',
    },
    {
      id: 'q5',
      texto: '¿Con qué frecuencia se recomienda rotar las claves de cifrado en sistemas gubernamentales?',
      opciones: ['Cada 5 años', 'Solo cuando hay una brecha', 'Cada 90 días o menos', 'Nunca, las claves son permanentes'],
      correcta: 2,
      explicacion:
        'La rotación periódica de claves (cada 90 días es lo común) limita el daño en caso de que una clave sea comprometida sin que el equipo de seguridad lo sepa.',
    },
  ],
  reto: {
    titulo: 'Diagnóstico de cifrado en tu institución',
    contexto:
      'Muchas dependencias estatales en México almacenan expedientes ciudadanos (actas de nacimiento, permisos, datos de salud) en bases de datos sin cifrado o con cifrado débil (MD5, SHA1). Esto viola la LFPDPPP y expone a los ciudadanos a robo de identidad.',
    problema:
      '¿Cómo implementarías cifrado E2E en el sistema de expedientes digitales de tu dependencia, considerando que el presupuesto es limitado y el equipo técnico no es especialista en criptografía?',
    entregable:
      'Un plan de implementación de 3 etapas: (1) diagnóstico de datos sensibles, (2) elección de solución técnica, (3) gestión del cambio con el equipo. Máximo 400 palabras.',
    ejemplo_respuesta:
      'Etapa 1: Mapear todos los campos de la base de datos que contienen CURP, RFC, datos médicos o financieros (30 días). Etapa 2: Implementar cifrado AES-256 a nivel de columna usando las funciones nativas de PostgreSQL, que son gratuitas (60 días). Etapa 3: Capacitar al equipo de TI en gestión básica de claves usando un tutorial del INAI (30 días).',
  },
}

export default function Page() {
  return <ConceptoLeccionPage data={DATA} />
}
