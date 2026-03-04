export const SUPPORT_FAQ = [
  {
    q: "¿Cómo restablezco mi contraseña?",
    a: "Ve a Iniciar sesión → \"¿Olvidaste tu contraseña?\" e ingresa tu correo. Recibirás un enlace para crear una nueva contraseña.",
  },
  {
    q: "No recibo el correo de verificación",
    a: "Revisa la carpeta de spam. Si sigue sin llegar, usa la opción \"Reenviar verificación\" en tu perfil o en la pantalla de inicio de sesión.",
  },
  {
    q: "¿Cómo cambio mi correo o nombre?",
    a: "Entra en tu perfil (icono de usuario) y edita los campos. Guarda los cambios.",
  },
  {
    q: "No puedo acceder a un curso o cohorte",
    a: "Comprueba que estés inscrito en esa cohorte. Si crees que es un error, abre un ticket de soporte y lo revisamos.",
  },
  {
    q: "Problemas con el reproductor de video o el contenido",
    a: "Prueba otro navegador o desactiva extensiones. Si el problema continúa, abre un ticket indicando el curso, lección y qué ocurre.",
  },
];

export function buildSupportSystemPrompt(): string {
  const faqText = SUPPORT_FAQ.map((f) => `P: ${f.q}\nR: ${f.a}`).join("\n\n");
  return `Eres un asistente de soporte de una plataforma e-learning. Responde en español neutro (LatAm, EEUU, España, Caribe).
Reglas:
- Usa este FAQ para resolver dudas frecuentes:
${faqText}
- Si la duda está en el FAQ, responde con esa información de forma amable y breve.
- Si no puedes resolver (problema técnico, bug, solicitud especial), indica que vas a crear un ticket de soporte y pide un resumen del problema y la categoría (acceso, contraseña, contenido, técnico, otro).
- Para restablecer contraseña o reenviar verificación: solo guía al usuario a usar las opciones oficiales de la plataforma (enlace "¿Olvidaste tu contraseña?" o "Reenviar verificación"); nunca generes enlaces ni códigos tú mismo.
- Sé empático y claro.`;
}
