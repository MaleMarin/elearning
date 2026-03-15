"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const FRASES = [
  "Los grandes cambios en el gobierno los hacen personas comunes con ideas extraordinarias.",
  "La innovación pública no es un lujo — es una responsabilidad.",
  "Cada trámite simplificado es tiempo devuelto a un ciudadano.",
  "El mejor momento para modernizar tu institución fue ayer. El segundo mejor es hoy.",
  "Gobernar bien es escuchar, aprender y actuar.",
  "La transformación digital empieza con una persona que decide hacerlo diferente.",
  "Tu institución cambia cuando tú cambias primero.",
];

const S = {
  out:   "8px 8px 18px rgba(174,183,194,0.65),-8px -8px 18px rgba(255,255,255,0.92)",
  outSm: "4px 4px 10px rgba(174,183,194,0.6),-4px -4px 10px rgba(255,255,255,0.9)",
  in:    "inset 4px 4px 10px rgba(174,183,194,0.55),inset -4px -4px 10px rgba(255,255,255,0.85)",
  inSm:  "inset 2px 2px 6px rgba(174,183,194,0.45),inset -2px -2px 6px rgba(255,255,255,0.8)",
};
const BG   = "#f0f2f5";
const AZUL = "#1428d4";
const FONT = "'Plus Jakarta Sans',sans-serif";

const TAREAS = [
  { id:1, titulo:"Reflexión módulo 1", hoy:true },
  { id:2, titulo:"Quiz módulo 2",      hoy:false },
  { id:3, titulo:"Carta al yo futuro", hoy:false },
];
const BADGES = [
  { id:1, nombre:"Primera lección", on:true },
  { id:2, nombre:"Quiz perfecto",   on:true },
  { id:3, nombre:"7 días racha",    on:false },
  { id:4, nombre:"Certificado",     on:false },
];
const OB = [
  { id:"perfil",   label:"Perfil completo", done:true  },
  { id:"diag",     label:"Diagnóstico",     done:true  },
  { id:"leccion",  label:"Primera lección", done:false, active:true },
  { id:"notif",    label:"Recordatorios",   done:false },
  { id:"comunidad",label:"Comunidad",       done:false },
];

export default function InicioPage() {
  const [checkinDone, setCheckinDone] = useState(false);
  const [mood,        setMood]        = useState<string|null>(null);
  const [offlineOk,   setOfflineOk]   = useState(false);
  const [obHidden,    setObHidden]    = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    if (localStorage.getItem("ck_"+today))  setCheckinDone(true);
    if (localStorage.getItem("offline_ok")) setOfflineOk(true);
    if (localStorage.getItem("ob_hidden"))  setObHidden(true);
  }, []);

  const doCheckin = (v:string) => {
    setMood(v); setCheckinDone(true);
    localStorage.setItem("ck_"+new Date().toISOString().split("T")[0], v);
  };

  const hora   = new Date().getHours();
  const saludo = hora<12?"Buenos días":hora<19?"Buenas tardes":"Buenas noches";
  const frase  = FRASES[new Date().getDay()];
  const obDone = OB.filter(s=>s.done).length;

  return (
    <div style={{background:BG,minHeight:"100vh",padding:20,fontFamily:FONT}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 240px",gap:18,alignItems:"start"}}>

        {/* ══ COLUMNA IZQUIERDA ══ */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>

          {/* 1 · Banner offline (solo 1 vez) */}
          {!offlineOk && (
            <div style={{background:BG,borderRadius:14,boxShadow:S.out,padding:"12px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",borderLeft:"3px solid #00e5a0"}}>
              <span style={{fontSize:12,color:"#6b7280"}}>Descargamos las próximas lecciones para que puedas aprender sin internet.</span>
              <button onClick={()=>{setOfflineOk(true);localStorage.setItem("offline_ok","1");}}
                style={{marginLeft:14,fontSize:11,fontWeight:600,color:AZUL,background:"none",border:"none",cursor:"pointer",flexShrink:0,fontFamily:FONT}}>
                Entendido
              </button>
            </div>
          )}

          {/* 2 · Check-in */}
          {!checkinDone ? (
            <div style={{background:BG,borderRadius:14,boxShadow:S.out,padding:"14px 18px"}}>
              <p style={{fontSize:11,color:"#9ca3af",marginBottom:10}}>¿Cómo llegaste hoy?</p>
              <div style={{display:"flex",gap:8}}>
                {([["bien","#00e5a0","Bien"],["regular","#f59e0b","Regular"],["dificil","#ef4444","Difícil"]] as [string,string,string][]).map(([v,c,l])=>(
                  <button key={v} onClick={()=>doCheckin(v)}
                    style={{flex:1,padding:"9px 6px",background:BG,border:"none",borderRadius:10,cursor:"pointer",fontSize:11,fontWeight:500,color:"#4b5563",fontFamily:FONT,boxShadow:S.outSm,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                    <span style={{width:7,height:7,borderRadius:"50%",background:c,flexShrink:0}}/>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          ) : mood && (
            <div style={{background:BG,borderRadius:12,boxShadow:S.outSm,padding:"10px 16px",borderLeft:"3px solid "+AZUL}}>
              <p style={{fontSize:12,color:"#6b7280",lineHeight:1.6}}>
                {mood==="bien"    && "Hoy llegas con energía. "}
                {mood==="regular" && "Un paso pequeño cuenta. "}
                {mood==="dificil" && "Los días difíciles también suman. "}
                <span style={{color:AZUL}}>{frase}</span>
              </p>
            </div>
          )}

          {/* 3 · Banner hero */}
          <div style={{background:AZUL,borderRadius:16,padding:"22px 26px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.05) 1px,transparent 1px)",backgroundSize:"22px 22px",boxShadow:"10px 10px 24px rgba(20,40,212,0.2),-4px -4px 14px rgba(255,255,255,0.4)"}}>
            <div style={{flex:1}}>
              <p style={{fontSize:9,fontWeight:600,letterSpacing:"0.16em",textTransform:"uppercase",color:"rgba(255,255,255,0.5)",marginBottom:8}}>{saludo}, María</p>
              <p style={{fontSize:17,fontWeight:300,fontStyle:"normal",color:"rgba(255,255,255,0.93)",lineHeight:1.45,marginBottom:18,maxWidth:400,fontFamily:FONT}}>{frase}</p>
              <div style={{display:"flex",gap:8}}>
                <Link href="/curso" style={{background:"#fff",color:AZUL,border:"none",borderRadius:50,padding:"9px 20px",fontSize:11,fontWeight:600,cursor:"pointer",textDecoration:"none",fontFamily:FONT}}>Continuar →</Link>
                <Link href="/curso" style={{background:"transparent",color:"rgba(255,255,255,0.85)",border:"0.5px solid rgba(255,255,255,0.35)",borderRadius:50,padding:"9px 20px",fontSize:11,cursor:"pointer",textDecoration:"none",fontFamily:FONT}}>Ver programa</Link>
              </div>
            </div>
            <div style={{position:"relative",width:72,height:72,flexShrink:0}}>
              <svg width="72" height="72" style={{position:"absolute",top:0,left:0,transform:"rotate(-90deg)"}}>
                <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="5"/>
                <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="5"
                  strokeDasharray={`${2*Math.PI*30}`} strokeDashoffset={`${2*Math.PI*30*0.7}`} strokeLinecap="round"/>
              </svg>
              <span style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontSize:14,fontWeight:500,color:"#fff"}}>30%</span>
            </div>
          </div>

          {/* 4 · Stats */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
            {[["LECCIONES","5 / 12"],["HORAS","18 h"],["CALIFICACIÓN","8.7"],["RACHA","7 días"]].map(([l,v])=>(
              <div key={l} style={{background:BG,borderRadius:12,boxShadow:S.in,padding:"14px 16px",textAlign:"center"}}>
                <p style={{fontSize:8,fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",color:"#9ca3af",marginBottom:6}}>{l}</p>
                <p style={{fontSize:22,fontWeight:500,color:AZUL,lineHeight:1}}>{v}</p>
              </div>
            ))}
          </div>

          {/* 5 · Siguiente paso */}
          <div style={{background:BG,borderRadius:14,boxShadow:S.out,padding:"16px 20px",borderLeft:"3px solid "+AZUL,display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:42,height:42,borderRadius:10,background:"rgba(20,40,212,0.08)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill={AZUL}><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/></svg>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontSize:9,fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",color:AZUL,marginBottom:3}}>Siguiente paso</p>
              <p style={{fontSize:13,fontWeight:500,color:"#0a1628",marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>Co-diseño ciudadano</p>
              <p style={{fontSize:11,color:"#9ca3af"}}>Módulo 2 · ~12 min · Quiz al final</p>
            </div>
            <Link href="/curso" style={{background:AZUL,color:"#fff",border:"none",borderRadius:50,padding:"9px 18px",fontSize:11,fontWeight:600,cursor:"pointer",textDecoration:"none",flexShrink:0,fontFamily:FONT}}>Continuar →</Link>
          </div>

          {/* 6 · Grid Tareas + Badges */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <div style={{background:BG,borderRadius:14,boxShadow:S.out,padding:"16px 18px"}}>
              <p style={{fontSize:9,fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",color:"#9ca3af",marginBottom:12}}>Tareas pendientes</p>
              {TAREAS.map(t=>(
                <div key={t.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:"0.5px solid rgba(174,183,194,0.25)"}}>
                  <div style={{width:14,height:14,borderRadius:4,flexShrink:0,background:BG,boxShadow:S.inSm}}/>
                  <span style={{flex:1,fontSize:11,color:"#374151"}}>{t.titulo}</span>
                  {t.hoy && <span style={{fontSize:9,fontWeight:600,background:"rgba(239,68,68,0.1)",color:"#dc2626",borderRadius:8,padding:"2px 7px"}}>Hoy</span>}
                </div>
              ))}
              <Link href="/tareas" style={{fontSize:11,color:AZUL,display:"block",marginTop:10,textDecoration:"none"}}>Ver todas →</Link>
            </div>
            <div style={{background:BG,borderRadius:14,boxShadow:S.out,padding:"16px 18px"}}>
              <p style={{fontSize:9,fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",color:"#9ca3af",marginBottom:12}}>Mis logros</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
                {BADGES.map(b=>(
                  <span key={b.id} style={{fontSize:10,fontWeight:500,padding:"4px 10px",borderRadius:20,background:b.on?"rgba(0,229,160,0.12)":"rgba(174,183,194,0.2)",color:b.on?"#00b87d":"#9ca3af",border:b.on?"0.5px solid rgba(0,229,160,0.3)":"none"}}>{b.nombre}</span>
                ))}
              </div>
              <Link href="/perfil" style={{fontSize:11,color:AZUL,display:"block",textDecoration:"none"}}>Ver todos →</Link>
            </div>
          </div>

          {/* 7 · Onboarding */}
          {!obHidden && (
            <div style={{background:BG,borderRadius:14,boxShadow:S.out,padding:"14px 18px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <p style={{fontSize:9,fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",color:"#9ca3af"}}>Primeros pasos — {obDone} de 5</p>
                <button onClick={()=>{setObHidden(true);localStorage.setItem("ob_hidden","1");}} style={{fontSize:10,color:"#9ca3af",background:"none",border:"none",cursor:"pointer",fontFamily:FONT}}>Ocultar</button>
              </div>
              <div style={{display:"flex",gap:6}}>
                {OB.map(s=>(
                  <div key={s.id} style={{flex:1,padding:"8px 6px",borderRadius:8,background:BG,border:s.done?"0.5px solid rgba(0,229,160,0.4)":s.active?"0.5px solid rgba(20,40,212,0.4)":"0.5px solid rgba(174,183,194,0.25)",boxShadow:(s.done||s.active)?undefined:S.inSm}}>
                    <p style={{fontSize:9,fontWeight:500,textAlign:"center",lineHeight:1.4,color:s.done?"#00b87d":s.active?AZUL:"#9ca3af"}}>{s.label}</p>
                  </div>
                ))}
              </div>
              <div style={{marginTop:10,height:3,background:BG,borderRadius:2,overflow:"hidden",boxShadow:S.inSm}}>
                <div style={{height:"100%",width:`${(obDone/5)*100}%`,background:`linear-gradient(90deg,${AZUL},#2b4fff)`,borderRadius:2}}/>
              </div>
            </div>
          )}

        </div>

        {/* ══ COLUMNA DERECHA ══ */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>

          <div style={{background:BG,borderRadius:14,boxShadow:S.out,padding:16}}>
            <p style={{fontSize:9,fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",color:"#9ca3af",marginBottom:12}}>Tu progreso</p>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{position:"relative",width:52,height:52,flexShrink:0}}>
                <svg width="52" height="52" style={{position:"absolute",top:0,left:0,transform:"rotate(-90deg)"}}>
                  <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(174,183,194,0.35)" strokeWidth="4"/>
                  <circle cx="26" cy="26" r="22" fill="none" stroke={AZUL} strokeWidth="4"
                    strokeDasharray={`${2*Math.PI*22}`} strokeDashoffset={`${2*Math.PI*22*0.7}`} strokeLinecap="round"/>
                </svg>
                <span style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontSize:11,fontWeight:500,color:AZUL}}>30%</span>
              </div>
              <div>
                <p style={{fontSize:11,fontWeight:500,color:"#0a1628",marginBottom:2}}>30% completado</p>
                <p style={{fontSize:10,color:"#9ca3af"}}>Módulo 2 activo</p>
              </div>
            </div>
          </div>

          <div style={{background:BG,borderRadius:14,boxShadow:S.out,padding:16}}>
            <p style={{fontSize:9,fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",color:"#9ca3af",marginBottom:8}}>Comunidad</p>
            <p style={{fontSize:11,color:"#9ca3af",marginBottom:10,lineHeight:1.5}}>Sé el primero en publicar algo.</p>
            <Link href="/comunidad" style={{display:"block",textAlign:"center",fontSize:11,fontWeight:500,color:AZUL,background:"rgba(20,40,212,0.07)",borderRadius:8,padding:"7px",textDecoration:"none"}}>Crear post</Link>
          </div>

          <div style={{background:BG,borderRadius:14,boxShadow:S.out,padding:16}}>
            <p style={{fontSize:9,fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",color:"#9ca3af",marginBottom:8}}>Próxima sesión</p>
            <p style={{fontSize:11,color:"#9ca3af",marginBottom:10,lineHeight:1.5}}>Sin sesiones programadas.</p>
            <Link href="/sesiones" style={{display:"block",textAlign:"center",fontSize:11,fontWeight:500,color:"#6b7280",background:"rgba(174,183,194,0.15)",borderRadius:8,padding:"7px",textDecoration:"none"}}>Ver sesiones</Link>
          </div>

        </div>
      </div>
    </div>
  );
}
