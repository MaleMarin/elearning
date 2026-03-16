export default function PrivacidadPage() {
  return (
    <div
      style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: "48px 24px",
        fontFamily: "var(--font-heading)",
        background: "#e8eaf0",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #0a0f8a, #1428d4)",
          borderRadius: 20,
          padding: "32px",
          marginBottom: 32,
          boxShadow:
            "7px 7px 18px rgba(10,15,138,0.35), -4px -4px 12px rgba(255,255,255,0.6)",
        }}
      >
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "white",
            marginBottom: 8,
            letterSpacing: "-0.5px",
          }}
        >
          Aviso de Privacidad
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
          Política Digital · Última actualización: Marzo 2026
        </p>
      </div>

      {[
        {
          titulo: "1. Responsable del tratamiento",
          contenido:
            "Política Digital es responsable del tratamiento de sus datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento.",
        },
        {
          titulo: "2. Datos personales que recabamos",
          contenido:
            "Recabamos: nombre completo, correo electrónico institucional, cargo, institución pública a la que pertenece, progreso de aprendizaje, respuestas a evaluaciones y diario de aprendizaje (cifrado).",
        },
        {
          titulo: "3. Finalidades del tratamiento",
          contenido:
            "Sus datos se usan para: impartir los cursos de formación, emitir certificados, personalizar la experiencia de aprendizaje, generar estadísticas agregadas y cumplir obligaciones legales.",
        },
        {
          titulo: "4. Transferencia de datos",
          contenido:
            "No transferimos sus datos a terceros, salvo que sea requerido por autoridad competente o necesario para el servicio (Firebase/Google como encargado del tratamiento bajo acuerdo de confidencialidad).",
        },
        {
          titulo: "5. Derechos ARCO",
          contenido:
            "Tiene derecho a Acceder, Rectificar, Cancelar y Oponerse al tratamiento de sus datos. Para ejercerlos, contacte: privacidad@politicadigital.mx con su nombre, datos de contacto y descripción de su solicitud.",
        },
        {
          titulo: "6. Datos sensibles",
          contenido:
            "El diario de aprendizaje y la carta al yo futuro se almacenan cifrados con AES-256. Solo usted puede descifrarlos con su cuenta. Política Digital no tiene acceso a su contenido.",
        },
        {
          titulo: "7. Cambios al aviso",
          contenido:
            "Cualquier cambio a este aviso se notificará por correo electrónico con 30 días de anticipación.",
        },
        {
          titulo: "8. Contacto",
          contenido: "Para cualquier consulta: privacidad@politicadigital.mx",
        },
      ].map((section, i) => (
        <div
          key={i}
          style={{
            background: "#e8eaf0",
            borderRadius: 16,
            padding: "20px 24px",
            marginBottom: 14,
            boxShadow: "5px 5px 12px #c2c8d6, -5px -5px 12px #ffffff",
          }}
        >
          <h2
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#0a0f8a",
              marginBottom: 10,
            }}
          >
            {section.titulo}
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "#4a5580",
              lineHeight: 1.7,
            }}
          >
            {section.contenido}
          </p>
        </div>
      ))}

      <div style={{ marginTop: 32, textAlign: "center" }}>
        <a
          href="/inicio"
          style={{
            color: "#1428d4",
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          ← Volver al inicio
        </a>
      </div>
    </div>
  );
}
