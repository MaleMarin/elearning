"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface Badge {
  icon: string;
  name: string;
  desc: string;
}

export interface FinDeCursoPageProps {
  nombre?: string;
  curso?: string;
  horas?: number;
  calificacion?: string;
  leccionesTotal?: number;
  badges?: Badge[];
  carta?: string;
  cartaFecha?: string;
  idCert?: string;
  cohorte?: string;
  /** URL base para verificación (ej. https://politicadigital.gob.mx o origin). */
  verifyUrl?: string;
}

const DEFAULT_BADGES: Badge[] = [
  { icon: "🏆", name: "Programa completo", desc: "100% completado" },
  { icon: "🔥", name: "Racha 7 días", desc: "7 días seguidos" },
  { icon: "💬", name: "Contribuidor", desc: "5 respuestas dadas" },
  { icon: "🧠", name: "Hablas humano", desc: "50 términos tech" },
  { icon: "🎓", name: "Certificado", desc: "Sobresaliente" },
];

export default function FinDeCursoPage({
  nombre = "María González Reyes",
  curso = "Innovación Pública y Transformación Digital del Estado",
  horas = 40,
  calificacion = "9.2",
  leccionesTotal = 12,
  badges = DEFAULT_BADGES,
  carta,
  cartaFecha = "10 de enero de 2025",
  idCert = "PD-2025-0842-MX",
  cohorte = "2025-I",
  verifyUrl,
}: FinDeCursoPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  const certUrl = verifyUrl ?? (typeof window !== "undefined" ? `${window.location.origin}/verificar/${idCert}` : `/verificar/${idCert}`);
  const textoLI = `¡Completé el programa de Innovación Pública y Transformación Digital del Estado en @PoliticaDigital México! 🎓 #InnovaciónPública #GobiernoDigital`;
  const textoWA = `¡Terminé el programa de Política Digital! 🎓 Fue una experiencia increíble. Mira mi certificado: ${certUrl}`;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const cols = ["#1428d4", "#00e5a0", "#ffffff", "#6b9fff", "#00b87d", "#25d366"];
    const ps = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: Math.random() * 10 + 3,
      h: Math.random() * 5 + 2,
      col: cols[Math.floor(Math.random() * cols.length)]!,
      rot: Math.random() * 360,
      rs: (Math.random() - 0.5) * 4,
      vx: (Math.random() - 0.5) * 2,
      vy: Math.random() * 3 + 1.5,
      op: 1,
    }));
    let frame = 0;
    let raf: number;
    const animate = () => {
      if (frame > 260) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ps.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rs;
        if (frame > 180) p.op = Math.max(0, p.op - 0.018);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.globalAlpha = p.op;
        ctx.fillStyle = p.col;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      frame++;
      raf = requestAnimationFrame(animate);
    };
    const t = setTimeout(animate, 300);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, []);

  const share = (url: string) => window.open(url, "_blank");
  const shareLinkedIn = () => share(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certUrl)}`);
  const shareWhatsApp = () => share(`https://wa.me/?text=${encodeURIComponent(textoWA)}`);
  const shareTwitter = () => share(`https://twitter.com/intent/tweet?text=${encodeURIComponent(textoLI)}&url=${encodeURIComponent(certUrl)}`);
  const shareFacebook = () => share(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(certUrl)}`);
  const copyLink = () => {
    navigator.clipboard.writeText(certUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;1,300;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        .fc-page *, .fc-page *::before, .fc-page *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .fc-page { font-family: 'DM Sans', sans-serif; background: #fff; color: #0a1628; overflow-x: hidden; }
        .fc-hero { background: #1428d4; position: relative; overflow: hidden; padding: 48px 24px 56px; text-align: center; }
        .fc-hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 15% 50%, rgba(255,255,255,0.06) 0%, transparent 50%), radial-gradient(circle at 85% 20%, rgba(0,229,160,0.1) 0%, transparent 40%); }
        .fc-dots { position: absolute; inset: 0; background-image: radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px); background-size: 28px 28px; }
        .fc-logo { position: relative; z-index: 1; display: inline-flex; align-items: center; gap: 10px; margin-bottom: 32px; }
        .fc-logo-mark { width: 36px; height: 36px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .fc-logo-mark svg { width: 20px; height: 20px; }
        .fc-logo-name { font-size: 13px; font-weight: 600; color: #fff; line-height: 1.2; display: block; }
        .fc-logo-sub { font-size: 10px; color: rgba(255,255,255,0.5); letter-spacing: 0.08em; display: block; }
        .fc-badge-pill { position: relative; z-index: 1; display: inline-flex; align-items: center; gap: 6px; background: rgba(0,229,160,0.15); border: 1px solid rgba(0,229,160,0.4); border-radius: 100px; padding: 6px 16px; font-size: 11px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: #00e5a0; margin-bottom: 24px; }
        .fc-title { position: relative; z-index: 1; font-family: 'Fraunces', serif; font-size: clamp(40px, 9vw, 76px); font-weight: 700; color: #fff; line-height: 1; margin-bottom: 6px; }
        .fc-title em { font-style: italic; font-weight: 300; color: #00e5a0; }
        .fc-alumno { position: relative; z-index: 1; font-family: 'Fraunces', serif; font-size: clamp(18px, 4vw, 28px); font-style: italic; font-weight: 300; color: rgba(255,255,255,0.8); margin-bottom: 20px; }
        .fc-divider { position: relative; z-index: 1; display: flex; align-items: center; gap: 10px; justify-content: center; margin-bottom: 20px; }
        .fc-dline { width: 36px; height: 1px; background: rgba(0,229,160,0.5); }
        .fc-ddot { width: 4px; height: 4px; border-radius: 50%; background: #00e5a0; opacity: 0.6; }
        .fc-desc { position: relative; z-index: 1; font-size: 15px; font-weight: 300; color: rgba(255,255,255,0.7); line-height: 1.75; max-width: 460px; margin: 0 auto 32px; }
        .fc-ctas { position: relative; z-index: 1; display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
        .fc-btn { display: inline-flex; align-items: center; gap: 8px; padding: 13px 22px; border-radius: 100px; font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; border: none; transition: all 0.2s; text-decoration: none; }
        .fc-btn-white { background: #fff; color: #1428d4; }
        .fc-btn-white:hover { background: #f0f4ff; }
        .fc-btn-gold { background: rgba(0,229,160,0.15); color: #00e5a0; border: 1px solid rgba(0,229,160,0.4); }
        .fc-btn-gold:hover { background: rgba(0,229,160,0.25); }
        .fc-btn-ghost { background: transparent; color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.2); }
        .fc-btn-ghost:hover { background: rgba(255,255,255,0.07); color: #fff; }
        .fc-stats { display: grid; grid-template-columns: repeat(3,1fr); border-bottom: 1px solid #e5e7eb; }
        .fc-stat { padding: 28px 20px; text-align: center; border-right: 1px solid #e5e7eb; }
        .fc-stat:last-child { border-right: none; }
        .fc-stat-num { font-family: 'Fraunces', serif; font-size: clamp(24px, 4vw, 38px); font-weight: 700; color: #0a1628; line-height: 1; margin-bottom: 4px; }
        .fc-stat-num span { color: #1428d4; }
        .fc-stat-label { font-size: 11px; color: #9ca3af; letter-spacing: 0.08em; text-transform: uppercase; }
        .fc-section { padding: 48px 24px; max-width: 620px; margin: 0 auto; }
        .fc-section-label { font-size: 10px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: #9ca3af; margin-bottom: 20px; text-align: center; }
        .fc-badges { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px,1fr)); gap: 10px; }
        .fc-badge-item { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 14px; padding: 18px 12px; text-align: center; transition: border-color 0.2s, background 0.2s; }
        .fc-badge-item:hover { border-color: #1428d4; background: #f0f4ff; }
        .fc-badge-icon { font-size: 26px; margin-bottom: 6px; display: block; }
        .fc-badge-name { font-size: 11px; font-weight: 500; color: #0a1628; margin-bottom: 2px; }
        .fc-badge-desc { font-size: 10px; color: #9ca3af; }
        .fc-letter-wrap { padding: 0 24px 48px; max-width: 620px; margin: 0 auto; }
        .fc-letter-card { background: linear-gradient(135deg, #f0f4ff, #faf8f0); border: 1px solid rgba(30,58,138,0.15); border-radius: 20px; padding: 28px; position: relative; overflow: hidden; }
        .fc-letter-card::before { content: '"'; position: absolute; top: -16px; right: 16px; font-family: 'Fraunces', serif; font-size: 100px; color: rgba(30,58,138,0.06); line-height: 1; }
        .fc-letter-title { font-family: 'Fraunces', serif; font-size: 18px; font-style: italic; font-weight: 300; color: #1428d4; margin-bottom: 12px; }
        .fc-letter-text { font-size: 14px; color: #4b5563; line-height: 1.8; font-style: italic; }
        .fc-letter-date { font-size: 10px; color: #9ca3af; margin-top: 12px; text-align: right; }
        .fc-next-wrap { padding: 0 24px 48px; max-width: 620px; margin: 0 auto; }
        .fc-next-list { display: flex; flex-direction: column; gap: 10px; }
        .fc-next-item { display: flex; align-items: center; gap: 14px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 14px; padding: 14px 18px; transition: border-color 0.2s, background 0.2s; cursor: pointer; text-decoration: none; color: inherit; }
        .fc-next-item:hover { border-color: #1428d4; background: #f0f4ff; }
        .fc-next-num { width: 30px; height: 30px; border-radius: 50%; background: #e8edfc; color: #1428d4; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; }
        .fc-next-title { font-size: 13px; font-weight: 500; color: #0a1628; margin-bottom: 1px; }
        .fc-next-desc { font-size: 11px; color: #9ca3af; }
        .fc-next-arrow { color: #d1d5db; margin-left: auto; font-size: 14px; }
        .fc-share { background: #1428d4; padding: 48px 24px; text-align: center; position: relative; overflow: hidden; }
        .fc-share::before { content: ''; position: absolute; inset: 0; background-image: radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 24px 24px; }
        .fc-share-title { position: relative; z-index: 1; font-family: 'Fraunces', serif; font-size: clamp(20px, 4vw, 28px); font-style: italic; font-weight: 300; color: #fff; margin-bottom: 8px; }
        .fc-share-sub { position: relative; z-index: 1; font-size: 13px; color: rgba(255,255,255,0.55); margin-bottom: 28px; }
        .fc-share-grid { position: relative; z-index: 1; display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-bottom: 20px; }
        .fc-soc-btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 20px; border-radius: 100px; font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; border: none; color: #fff; transition: opacity 0.2s, transform 0.15s; }
        .fc-soc-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .fc-soc-btn svg { width: 18px; height: 18px; flex-shrink: 0; }
        .soc-li { background: #0077b5; }
        .soc-wa { background: #25d366; }
        .soc-tw { background: #000; }
        .soc-fb { background: #1877f2; }
        .fc-copy-wrap { position: relative; z-index: 1; display: inline-flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); border-radius: 100px; padding: 10px 16px 10px 20px; max-width: 100%; }
        .fc-copy-url { font-size: 12px; color: rgba(255,255,255,0.65); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 220px; }
        .fc-copy-btn { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); border-radius: 100px; color: #fff; font-size: 11px; font-weight: 500; font-family: 'DM Sans', sans-serif; padding: 6px 14px; cursor: pointer; transition: background 0.2s; white-space: nowrap; flex-shrink: 0; }
        .fc-copy-btn:hover { background: rgba(255,255,255,0.25); }
        .fc-copy-btn.copied { background: rgba(37,211,102,0.3); border-color: rgba(37,211,102,0.5); }
        @media (max-width: 480px) { .fc-stats { grid-template-columns: 1fr; } .fc-stat { border-right: none; border-bottom: 1px solid #e5e7eb; padding: 20px; } .fc-badges { grid-template-columns: repeat(2, 1fr); } .fc-ctas { flex-direction: column; align-items: stretch; } .fc-btn { justify-content: center; } .fc-soc-btn span { display: none; } .fc-soc-btn { padding: 12px 14px; } .fc-copy-url { max-width: 160px; } }
      `}</style>

      <canvas
        ref={canvasRef}
        style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 99 }}
      />

      <div className="fc-page">
        <section className="fc-hero">
          <div className="fc-dots" />
          <div className="fc-logo">
            <div className="fc-logo-mark">
              <svg viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="white" strokeWidth="1.2" />
                <path d="M10 4l1.6 4.9H16l-4.2 3.1 1.6 4.9L10 13.9l-4.4 3 1.6-4.9L3 9l5.4-.1z" fill="white" fillOpacity="0.9" />
              </svg>
            </div>
            <div>
              <span className="fc-logo-name">Política Digital</span>
              <span className="fc-logo-sub">Innovación Pública · México</span>
            </div>
          </div>
          <div className="fc-badge-pill">★ Programa completado · Cohorte {cohorte}</div>
          <h1 className="fc-title">¡Lo<br /><em>lograste!</em></h1>
          <p className="fc-alumno">{nombre}</p>
          <div className="fc-divider">
            <div className="fc-dline" /><div className="fc-ddot" /><div className="fc-dline" />
          </div>
          <p className="fc-desc">
            Completaste el programa de {curso}. Eres parte de una generación que está cambiando México desde adentro.
          </p>
          <div className="fc-ctas">
            <Link href="/certificado" className="fc-btn fc-btn-white">🎓 Descargar certificado</Link>
            <Link href="/curso" className="fc-btn fc-btn-gold">📖 Ver mi curso</Link>
            <Link href="/egresados" className="fc-btn fc-btn-ghost">🌐 Red de egresados</Link>
          </div>
        </section>

        <div className="fc-stats">
          <div className="fc-stat">
            <div className="fc-stat-num">{leccionesTotal}<span>/{leccionesTotal}</span></div>
            <div className="fc-stat-label">Lecciones</div>
          </div>
          <div className="fc-stat">
            <div className="fc-stat-num">{horas}<span>h</span></div>
            <div className="fc-stat-label">Horas de aprendizaje</div>
          </div>
          <div className="fc-stat">
            <div className="fc-stat-num">{calificacion}</div>
            <div className="fc-stat-label">Calificación final</div>
          </div>
        </div>

        <section className="fc-section">
          <p className="fc-section-label">Badges obtenidos</p>
          <div className="fc-badges">
            {badges.map((b, i) => (
              <div key={i} className="fc-badge-item">
                <span className="fc-badge-icon">{b.icon}</span>
                <div className="fc-badge-name">{b.name}</div>
                <div className="fc-badge-desc">{b.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {carta && (
          <div className="fc-letter-wrap">
            <p className="fc-section-label" style={{ textAlign: "center", marginBottom: 16 }}>Tu carta al yo futuro · escrita el primer día</p>
            <div className="fc-letter-card">
              <div className="fc-letter-title">Lo que te prometiste al empezar</div>
              <p className="fc-letter-text">&ldquo;{carta}&rdquo;</p>
              <p className="fc-letter-date">Escrita el {cartaFecha}</p>
            </div>
          </div>
        )}

        <div className="fc-next-wrap">
          <p className="fc-section-label" style={{ textAlign: "center", marginBottom: 16 }}>¿Qué sigue para ti?</p>
          <div className="fc-next-list">
            <Link href="/certificado" className="fc-next-item">
              <div className="fc-next-num">1</div>
              <div>
                <div className="fc-next-title">Descarga tu certificado oficial</div>
                <div className="fc-next-desc">PDF con QR de verificación listo para compartir</div>
              </div>
              <span className="fc-next-arrow">→</span>
            </Link>
            <button type="button" className="fc-next-item" onClick={shareLinkedIn}>
              <div className="fc-next-num">2</div>
              <div>
                <div className="fc-next-title">Agrega el logro a LinkedIn</div>
                <div className="fc-next-desc">Con un clic, comparte tu certificado verificado</div>
              </div>
              <span className="fc-next-arrow">→</span>
            </button>
            <Link href="/egresados" className="fc-next-item">
              <div className="fc-next-num">3</div>
              <div>
                <div className="fc-next-title">Únete a la red de egresados</div>
                <div className="fc-next-desc">Conecta con servidores públicos egresados</div>
              </div>
              <span className="fc-next-arrow">→</span>
            </Link>
            <Link href="/mentores" className="fc-next-item">
              <div className="fc-next-num">4</div>
              <div>
                <div className="fc-next-title">Sé mentor de la próxima cohorte</div>
                <div className="fc-next-desc">Tu experiencia puede guiar a otros funcionarios</div>
              </div>
              <span className="fc-next-arrow">→</span>
            </Link>
          </div>
        </div>

        <section className="fc-share">
          <h2 className="fc-share-title">Cuéntale al mundo lo que lograste</h2>
          <p className="fc-share-sub">Comparte tu logro y celebra con quienes te importan</p>
          <div className="fc-share-grid">
            <button type="button" className="fc-soc-btn soc-li" onClick={shareLinkedIn}>
              <svg viewBox="0 0 24 24" fill="white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              <span>LinkedIn</span>
            </button>
            <button type="button" className="fc-soc-btn soc-wa" onClick={shareWhatsApp}>
              <svg viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              <span>WhatsApp</span>
            </button>
            <button type="button" className="fc-soc-btn soc-tw" onClick={shareTwitter}>
              <svg viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              <span>X / Twitter</span>
            </button>
            <button type="button" className="fc-soc-btn soc-fb" onClick={shareFacebook}>
              <svg viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              <span>Facebook</span>
            </button>
          </div>
          <div className="fc-copy-wrap">
            <span className="fc-copy-url">{certUrl}</span>
            <button type="button" className={`fc-copy-btn${copied ? " copied" : ""}`} onClick={copyLink}>
              {copied ? "¡Copiado!" : "Copiar link"}
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
