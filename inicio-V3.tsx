"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const FRASES = [
  "Los grandes cambios en el gobierno los hacen personas comunes con ideas extraordinarias.",
  "La innovación pública no es un lujo — es una responsabilidad.",
  "Cada trámite simplificado es tiempo devuelto a un ciudadano.",
  "El mejor momento para modernizar fue ayer. El segundo mejor es hoy.",
  "Gobernar bien es escuchar, aprender y actuar.",
  "La transformación digital empieza con una persona que decide hacerlo diferente.",
  "Tu institución cambia cuando tú cambias primero.",
];

// Neumorfismo calibrado para #ECEEF0 (imagen 4)
const NEU = {
  card:    "8px 8px 16px #b8bec7, -8px -8px 16px #ffffff",
  cardSm:  "4px 4px 10px #b8bec7, -4px -4px 10px #ffffff",
  inset:   "inset 4px 4px 8px #b8bec7, inset -4px -4px 8px #ffffff",
  insetSm: "inset 2px 2px 5px #b8bec7, inset -2px -2px 5px #ffffff",
};
const BG   = "#ECEEF0";  // fondo exacto imagen 4
const AZ   = "#1428d4";  // azul Política Digital
const AZD  = "#0a0f8a";  // azul oscuro
const MN   = "#00e5a0";  // verde menta
const FONT = "'Plus Jakarta Sans',sans-serif";

const TAREAS = [
  { id:1, t:"Reflexión módulo 1",     urgente:true  },
  { id:2, t:"Quiz módulo 2",          urgente:false },
  { id:3, t:"Carta al yo futuro",     urgente:false },
];
const BADGES = [
  { id:1, n:"Primera lección", on:true  },
  { id:2, n:"Quiz perfecto",   on:true  },
  { id:3, n:"7 días racha",    on:false },
  { id:4, n:"Certificado",     on:false },
];
const OB = [
  { id:"a", l:"Perfil",        done:true         },
  { id:"b", l:"Diagnóstico",   done:true         },
  { id:"c", l:"1ª lección",    done:false, act:true },
  { id:"d", l:"Recordatorios", done:false        },
  { id:"e", l:"Comunidad",     done:false        },
];

export default function InicioPage() {
  const [ck,  setCk]  = useState(false);
  const [mood,setMood]= useState<string|null>(null);
  const [obH, setObH] = useState(false);

  useEffect(()=>{
    const d = new Date().toISOString().split("T")[0];
    if (localStorage.getItem("ck_"+d))   setCk(true);
    if (localStorage.getItem("ob_hidden")) setObH(true);
  },[]);

  const doCheckin = (v:string) => {
    setMood(v); setCk(true);
    localStorage.setItem("ck_"+new Date().toISOString().split("T")[0], v);
  };

  const h = new Date().getHours();
  const saludo = h<12?"Buenos días":h<19?"Buenas tardes":"Buenas noches";
  const frase  = FRASES[new Date().getDay()];
  const prog   = 30;
  const c2     = 2*Math.PI*26;

  // Componente card base
  const Card = ({children, style}: {children:React.ReactNode, style?:React.CSSProperties}) => (
    <div style={{background:BG, borderRadius:16, boxShadow:NEU.card, ...style}}>
      {children}
    </div>
  );

  return (
    <div style={{
      background: BG,
      minHeight: "100vh",
      padding: 20,
      fontFamily: FONT,
      display: "grid",
      gridTemplateColumns: "1fr 240px",
      gap: 18,
      alignItems: "start",
    }}>

      {/* ══ COLUMNA PRINCIPAL ══ */}
      <div style={{display:"flex",flexDirection:"column",gap:14}}>

        {/* 1 · Header de bienvenida + check-in */}
        <Card style={{padding:"18px 22px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>
            <div style={{flex:1}}>
              <p style={{fontSize:11,color:"#9ca3af",fontWeight:500,marginBottom:4,letterSpacing:"0.05em"}}>{saludo}</p>
              <h1 style={{fontSize:22,fontWeight:700,color:AZD,marginBottom:2,lineHeight:1.2}}>
                Hola, María 👋
              </h1>
              <p style={{fontSize:12,color:"#6b7280",fontWeight:400,lineHeight:1.5,maxWidth:400}}>
                {ck && mood ? (
                  <>
                    {mood==="bien"&&"Con energía hoy. "}
                    {mood==="regular"&&"Un paso pequeño cuenta. "}
                    {mood==="dificil"&&"Los días difíciles también suman. "}
                    <span style={{color:AZ}}>{frase}</span>
                  </>
                ) : frase}
              </p>
            </div>
            {/* Check-in compacto */}
            {!ck ? (
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,flexShrink:0}}>
                <p style={{fontSize:10,color:"#9ca3af",marginBottom:2}}>¿Cómo llegaste hoy?</p>
                <div style={{display:"flex",gap:6}}>
                  {([["bien",MN,"Bien"],["regular","#f59e0b","Regular"],["dificil","#ef4444","Difícil"]] as [string,string,string][]).map(([v,c,l])=>(
                    <button key={v} onClick={()=>doCheckin(v)} style={{
                      padding:"6px 12px",background:BG,border:"none",borderRadius:50,
                      cursor:"pointer",fontSize:11,fontWeight:500,color:"#374151",
                      fontFamily:FONT,boxShadow:NEU.cardSm,
                      display:"flex",alignItems:"center",gap:5,transition:"all 0.15s",
                    }}>
                      <span style={{width:7,height:7,borderRadius:"50%",background:c}}/>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{
                background:AZ,borderRadius:12,padding:"10px 16px",
                textAlign:"center",flexShrink:0,
                boxShadow:`4px 4px 12px rgba(20,40,212,0.3)`,
              }}>
                <p style={{fontSize:22,fontWeight:700,color:"#fff",lineHeight:1}}>{prog}%</p>
                <p style={{fontSize:9,color:"rgba(255,255,255,0.6)",textTransform:"uppercase",letterSpacing:"0.1em",marginTop:2}}>Completado</p>
              </div>
            )}
          </div>
        </Card>

        {/* 2 · Stats en fila neumórfica */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
          {[
            {icon:"📚",v:"5/12",   l:"Lecciones"},
            {icon:"⏱", v:"18h",   l:"Aprendizaje"},
            {icon:"⭐", v:"8.7",   l:"Calificación"},
            {icon:"🔥", v:"7 días",l:"Racha"},
          ].map((s,i)=>(
            <div key={i} style={{background:BG,borderRadius:14,boxShadow:NEU.inset,padding:"14px 16px",textAlign:"center"}}>
              <p style={{fontSize:18,marginBottom:4}}>{s.icon}</p>
              <p style={{fontSize:18,fontWeight:700,color:AZ,lineHeight:1,marginBottom:2}}>{s.v}</p>
              <p style={{fontSize:9,color:"#9ca3af",textTransform:"uppercase",letterSpacing:"0.1em"}}>{s.l}</p>
            </div>
          ))}
        </div>

        {/* 3 · Banner siguiente paso — el CTA principal */}
        <div style={{
          background:`linear-gradient(135deg, ${AZ} 0%, #2b4fff 100%)`,
          borderRadius:16,
          padding:"20px 24px",
          display:"flex",
          alignItems:"center",
          gap:16,
          boxShadow:`8px 8px 20px rgba(20,40,212,0.25), -2px -2px 10px rgba(255,255,255,0.5)`,
          position:"relative",
          overflow:"hidden",
        }}>
          {/* Patrón de fondo */}
          <div style={{
            position:"absolute",top:0,right:0,bottom:0,
            width:"40%",
            background:"radial-gradient(circle at 80% 50%, rgba(255,255,255,0.08) 0%, transparent 60%)",
          }}/>
          <div style={{
            width:48,height:48,borderRadius:12,
            background:"rgba(255,255,255,0.15)",
            display:"flex",alignItems:"center",justifyContent:"center",
            flexShrink:0,fontSize:22,
          }}>
            📖
          </div>
          <div style={{flex:1,zIndex:1}}>
            <p style={{fontSize:9,fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase",color:"rgba(255,255,255,0.6)",marginBottom:4}}>Siguiente paso</p>
            <p style={{fontSize:16,fontWeight:700,color:"#fff",marginBottom:2}}>Co-diseño ciudadano</p>
            <p style={{fontSize:11,color:"rgba(255,255,255,0.7)"}}>Módulo 2 · ~12 min · Quiz al final</p>
          </div>
          <Link href="/curso" style={{
            background:"#fff",color:AZ,
            borderRadius:50,padding:"10px 22px",
            fontSize:12,fontWeight:700,
            cursor:"pointer",textDecoration:"none",
            flexShrink:0,fontFamily:FONT,
            boxShadow:"0 4px 12px rgba(0,0,0,0.15)",
            zIndex:1,
          }}>
            Continuar →
          </Link>
        </div>

        {/* 4 · Grid Tareas + Badges */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>

          {/* Tareas */}
          <Card style={{padding:"16px 18px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <p style={{fontSize:11,fontWeight:700,color:AZD}}>Tareas pendientes</p>
              <span style={{
                fontSize:9,fontWeight:600,background:AZ,color:"#fff",
                borderRadius:20,padding:"2px 8px",
              }}>3</span>
            </div>
            {TAREAS.map(t=>(
              <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"0.5px solid rgba(174,183,194,0.3)"}}>
                <div style={{width:16,height:16,borderRadius:5,flexShrink:0,background:BG,boxShadow:NEU.insetSm}}/>
                <span style={{flex:1,fontSize:11,color:"#374151",fontWeight:400}}>{t.t}</span>
                {t.urgente&&<span style={{fontSize:9,fontWeight:700,background:"rgba(239,68,68,0.1)",color:"#dc2626",borderRadius:6,padding:"2px 7px",flexShrink:0}}>Hoy</span>}
              </div>
            ))}
            <Link href="/tareas" style={{fontSize:10,color:AZ,display:"block",marginTop:10,textDecoration:"none",fontWeight:500}}>Ver todas →</Link>
          </Card>

          {/* Badges */}
          <Card style={{padding:"16px 18px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <p style={{fontSize:11,fontWeight:700,color:AZD}}>Mis logros</p>
              <span style={{fontSize:10,color:"#9ca3af"}}>2/4</span>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {BADGES.map(b=>(
                <span key={b.id} style={{
                  fontSize:10,fontWeight:500,
                  padding:"5px 10px",borderRadius:20,
                  background: b.on ? "rgba(0,229,160,0.12)" : BG,
                  color: b.on ? "#00b87d" : "#9ca3af",
                  border: b.on ? "0.5px solid rgba(0,229,160,0.4)" : "none",
                  boxShadow: b.on ? undefined : NEU.insetSm,
                }}>{b.n}</span>
              ))}
            </div>
            <Link href="/perfil" style={{fontSize:10,color:AZ,display:"block",marginTop:10,textDecoration:"none",fontWeight:500}}>Ver todos →</Link>
          </Card>
        </div>

        {/* 5 · Onboarding compacto */}
        {!obH && (
          <Card style={{padding:"12px 16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <p style={{fontSize:10,fontWeight:700,color:AZD}}>Primeros pasos — 2 de 5</p>
              <button onClick={()=>{setObH(true);localStorage.setItem("ob_hidden","1");}}
                style={{fontSize:10,color:"#9ca3af",background:"none",border:"none",cursor:"pointer",fontFamily:FONT}}>
                Ocultar
              </button>
            </div>
            <div style={{display:"flex",gap:5,marginBottom:8}}>
              {OB.map(s=>(
                <div key={s.id} style={{
                  flex:1,padding:"7px 4px",borderRadius:8,textAlign:"center",
                  background:BG,
                  border: s.done ? "0.5px solid rgba(0,229,160,0.5)" : s.act ? `0.5px solid ${AZ}` : "0.5px solid rgba(174,183,194,0.3)",
                  boxShadow: (s.done||s.act) ? undefined : NEU.insetSm,
                }}>
                  <p style={{fontSize:9,fontWeight:600,color:s.done?"#00b87d":s.act?AZ:"#9ca3af",lineHeight:1.3}}>{s.l}</p>
                </div>
              ))}
            </div>
            <div style={{height:3,background:BG,borderRadius:2,overflow:"hidden",boxShadow:NEU.insetSm}}>
              <div style={{height:"100%",width:"40%",background:`linear-gradient(90deg,${AZ},#2b4fff)`,borderRadius:2}}/>
            </div>
          </Card>
        )}

      </div>

      {/* ══ COLUMNA DERECHA ══ */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>

        {/* Progreso */}
        <Card style={{padding:16}}>
          <p style={{fontSize:10,fontWeight:700,color:AZD,marginBottom:12}}>Tu progreso</p>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{position:"relative",width:56,height:56,flexShrink:0}}>
              <svg width="56" height="56" style={{position:"absolute",top:0,left:0,transform:"rotate(-90deg)"}}>
                <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(174,183,194,0.3)" strokeWidth="4"/>
                <circle cx="28" cy="28" r="24" fill="none" stroke={AZ} strokeWidth="4"
                  strokeDasharray={2*Math.PI*24} strokeDashoffset={2*Math.PI*24*0.7} strokeLinecap="round"/>
              </svg>
              <span style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontSize:12,fontWeight:700,color:AZ}}>{prog}%</span>
            </div>
            <div>
              <p style={{fontSize:13,fontWeight:600,color:AZD,marginBottom:2}}>{prog}% listo</p>
              <p style={{fontSize:10,color:"#9ca3af"}}>Módulo 2 activo</p>
              <p style={{fontSize:10,color:"#9ca3af"}}>5 de 12 lecciones</p>
            </div>
          </div>
          {/* Barra */}
          <div style={{marginTop:12,height:5,background:BG,borderRadius:3,overflow:"hidden",boxShadow:NEU.insetSm}}>
            <div style={{height:"100%",width:`${prog}%`,background:`linear-gradient(90deg,${AZ},#2b4fff)`,borderRadius:3,boxShadow:`0 0 8px rgba(20,40,212,0.4)`}}/>
          </div>
        </Card>

        {/* Misión del día */}
        <div style={{
          background:`linear-gradient(135deg,${AZ},#2b4fff)`,
          borderRadius:14,padding:16,
          boxShadow:`6px 6px 16px rgba(20,40,212,0.2),-2px -2px 8px rgba(255,255,255,0.5)`,
        }}>
          <p style={{fontSize:9,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"rgba(255,255,255,0.55)",marginBottom:6}}>Misión de hoy</p>
          <p style={{fontSize:12,color:"rgba(255,255,255,0.92)",lineHeight:1.5,marginBottom:10}}>Completa la lección de co-diseño y escribe tu reflexión.</p>
          <div style={{height:3,background:"rgba(255,255,255,0.15)",borderRadius:2,overflow:"hidden"}}>
            <div style={{height:"100%",width:"60%",background:MN,borderRadius:2}}/>
          </div>
          <p style={{fontSize:9,color:"rgba(255,255,255,0.5)",marginTop:4}}>60% completada</p>
        </div>

        {/* Comunidad */}
        <Card style={{padding:16}}>
          <p style={{fontSize:10,fontWeight:700,color:AZD,marginBottom:8}}>Comunidad</p>
          <p style={{fontSize:11,color:"#9ca3af",marginBottom:10,lineHeight:1.5}}>Sé el primero en publicar algo hoy.</p>
          <Link href="/comunidad" style={{
            display:"block",textAlign:"center",
            fontSize:11,fontWeight:600,color:AZ,
            background:BG,borderRadius:8,padding:"8px",
            textDecoration:"none",boxShadow:NEU.cardSm,
          }}>
            Crear post
          </Link>
        </Card>

        {/* Próxima sesión */}
        <Card style={{padding:16}}>
          <p style={{fontSize:10,fontWeight:700,color:AZD,marginBottom:8}}>Próxima sesión</p>
          <p style={{fontSize:11,color:"#9ca3af",marginBottom:10,lineHeight:1.5}}>Sin sesiones programadas.</p>
          <Link href="/sesiones" style={{
            display:"block",textAlign:"center",
            fontSize:11,color:"#6b7280",
            background:BG,borderRadius:8,padding:"8px",
            textDecoration:"none",boxShadow:NEU.insetSm,
          }}>
            Ver sesiones
          </Link>
        </Card>

      </div>
    </div>
  );
}
