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

const S = {
  out:  "6px 6px 14px rgba(174,183,194,0.6),-6px -6px 14px rgba(255,255,255,0.9)",
  in:   "inset 3px 3px 8px rgba(174,183,194,0.5),inset -3px -3px 8px rgba(255,255,255,0.82)",
};
const BG="#f0f2f5", AZ="#1428d4", MN="#00e5a0", F="'Plus Jakarta Sans',sans-serif";

const TAREAS=[
  {id:1,titulo:"Reflexión módulo 1",urgente:true},
  {id:2,titulo:"Quiz módulo 2",urgente:false},
  {id:3,titulo:"Carta al yo futuro",urgente:false},
];
const BADGES=[
  {id:1,n:"Primera lección",on:true},
  {id:2,n:"Quiz perfecto",on:true},
  {id:3,n:"7 días racha",on:false},
  {id:4,n:"Certificado",on:false},
];
const OB=[
  {id:"a",l:"Perfil",done:true},
  {id:"b",l:"Diagnóstico",done:true},
  {id:"c",l:"1ª lección",done:false,active:true},
  {id:"d",l:"Recordatorios",done:false},
  {id:"e",l:"Comunidad",done:false},
];

export default function InicioPage() {
  const [ckDone,setCkDone]=useState(false);
  const [mood,setMood]=useState<string|null>(null);
  const [obHidden,setObHidden]=useState(false);

  useEffect(()=>{
    const d=new Date().toISOString().split("T")[0];
    if(localStorage.getItem("ck_"+d)) setCkDone(true);
    if(localStorage.getItem("ob_hidden")) setObHidden(true);
  },[]);

  const doCheckin=(v:string)=>{
    setMood(v); setCkDone(true);
    localStorage.setItem("ck_"+new Date().toISOString().split("T")[0],v);
  };

  const h=new Date().getHours();
  const saludo=h<12?"Buenos días":h<19?"Buenas tardes":"Buenas noches";
  const frase=FRASES[new Date().getDay()];
  const prog=30;
  const circ=2*Math.PI*28;

  return (
    <div style={{
      background:BG,height:"100vh",overflow:"hidden",
      display:"grid",gridTemplateColumns:"1fr 220px",
      gap:16,padding:16,fontFamily:F,boxSizing:"border-box"
    }}>

      {/* ══ COLUMNA PRINCIPAL ══ */}
      <div style={{display:"flex",flexDirection:"column",gap:12,minHeight:0,overflow:"hidden"}}>

        {/* 1 · Check-in compacto — 1 línea horizontal */}
        {!ckDone ? (
          <div style={{background:BG,borderRadius:12,boxShadow:S.out,padding:"10px 16px",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
            <span style={{fontSize:11,color:"#9ca3af",whiteSpace:"nowrap"}}>¿Cómo llegaste hoy?</span>
            <div style={{display:"flex",gap:6,flex:1}}>
              {([["bien",MN,"Bien"],["regular","#f59e0b","Regular"],["dificil","#ef4444","Difícil"]] as [string,string,string][]).map(([v,c,l])=>(
                <button key={v} onClick={()=>doCheckin(v)} style={{flex:1,padding:"6px 4px",background:BG,border:"none",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:500,color:"#4b5563",fontFamily:F,boxShadow:S.out,display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                  <span style={{width:6,height:6,borderRadius:"50%",background:c,flexShrink:0}}/>
                  {l}
                </button>
              ))}
            </div>
          </div>
        ) : mood && (
          <div style={{background:BG,borderRadius:10,boxShadow:S.out,padding:"9px 14px",flexShrink:0,borderLeft:"2px solid "+AZ}}>
            <p style={{fontSize:11,color:"#6b7280",lineHeight:1.5}}>
              {mood==="bien"&&"Con energía hoy. "}{mood==="regular"&&"Un paso pequeño cuenta. "}{mood==="dificil"&&"Los días difíciles también suman. "}
              <span style={{color:AZ,fontWeight:400}}>{frase}</span>
            </p>
          </div>
        )}

        {/* 2 · Banner hero compacto */}
        <div style={{
          background:AZ,borderRadius:14,padding:"18px 22px",
          display:"flex",alignItems:"center",gap:16,flexShrink:0,
          backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.05) 1px,transparent 1px)",
          backgroundSize:"20px 20px",
          boxShadow:"8px 8px 20px rgba(20,40,212,0.2)"
        }}>
          <div style={{flex:1}}>
            <p style={{fontSize:9,fontWeight:600,letterSpacing:"0.16em",textTransform:"uppercase",color:"rgba(255,255,255,0.5)",marginBottom:5}}>{saludo}, María</p>
            <p style={{fontSize:15,fontWeight:300,fontStyle:"normal",color:"rgba(255,255,255,0.93)",lineHeight:1.35,marginBottom:14,fontFamily:F,maxWidth:380,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{frase}</p>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <Link href="/curso" style={{background:"#fff",color:AZ,borderRadius:50,padding:"8px 18px",fontSize:11,fontWeight:700,cursor:"pointer",textDecoration:"none",fontFamily:F,boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}>Continuar →</Link>
              <Link href="/curso" style={{color:"rgba(255,255,255,0.8)",border:"0.5px solid rgba(255,255,255,0.3)",borderRadius:50,padding:"8px 16px",fontSize:11,cursor:"pointer",textDecoration:"none",fontFamily:F}}>Ver programa</Link>
            </div>
          </div>
          {/* Círculo de progreso */}
          <div style={{position:"relative",width:64,height:64,flexShrink:0}}>
            <svg width="64" height="64" style={{position:"absolute",top:0,left:0,transform:"rotate(-90deg)"}}>
              <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4"/>
              <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="4"
                strokeDasharray={circ} strokeDashoffset={circ*(1-prog/100)} strokeLinecap="round"/>
            </svg>
            <span style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontSize:13,fontWeight:600,color:"#fff"}}>{prog}%</span>
          </div>
        </div>

        {/* 3 · Métricas en 1 línea horizontal */}
        <div style={{background:BG,borderRadius:12,boxShadow:S.in,padding:"10px 16px",display:"flex",alignItems:"center",gap:0,flexShrink:0}}>
          {[
            {icon:"📚",label:"Lecciones",val:"5/12"},
            {icon:"⏱",label:"Horas",val:"18h"},
            {icon:"⭐",label:"Calificación",val:"8.7"},
            {icon:"🔥",label:"Racha",val:"7 días"},
          ].map((m,i)=>(
            <div key={m.label} style={{flex:1,display:"flex",alignItems:"center",gap:8,padding:"0 12px",borderLeft:i>0?"0.5px solid rgba(174,183,194,0.4)":"none"}}>
              <span style={{fontSize:16}}>{m.icon}</span>
              <div>
                <p style={{fontSize:14,fontWeight:600,color:AZ,lineHeight:1}}>{m.val}</p>
                <p style={{fontSize:9,color:"#9ca3af",textTransform:"uppercase",letterSpacing:"0.08em"}}>{m.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 4 · Siguiente paso */}
        <div style={{background:BG,borderRadius:12,boxShadow:S.out,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,borderLeft:"3px solid "+AZ,flexShrink:0}}>
          <div style={{width:36,height:36,borderRadius:9,background:"rgba(20,40,212,0.08)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill={AZ}><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/></svg>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <p style={{fontSize:8,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:AZ,marginBottom:2}}>Siguiente paso</p>
            <p style={{fontSize:12,fontWeight:600,color:"#0a1628",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>Co-diseño ciudadano</p>
            <p style={{fontSize:10,color:"#9ca3af"}}>Módulo 2 · ~12 min · Quiz al final</p>
          </div>
          <Link href="/curso" style={{background:AZ,color:"#fff",borderRadius:50,padding:"8px 16px",fontSize:11,fontWeight:600,textDecoration:"none",flexShrink:0,fontFamily:F}}>Continuar →</Link>
        </div>

        {/* 5 · Grid Tareas + Badges — con scroll interno */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,flex:1,minHeight:0}}>
          <div style={{background:BG,borderRadius:12,boxShadow:S.out,padding:"12px 14px",display:"flex",flexDirection:"column",minHeight:0}}>
            <p style={{fontSize:8,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"#9ca3af",marginBottom:8,flexShrink:0}}>Tareas pendientes</p>
            <div style={{flex:1,overflowY:"auto",minHeight:0}}>
              {TAREAS.map(t=>(
                <div key={t.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"0.5px solid rgba(174,183,194,0.2)"}}>
                  <div style={{width:13,height:13,borderRadius:4,flexShrink:0,background:BG,boxShadow:S.in}}/>
                  <span style={{flex:1,fontSize:11,color:"#374151"}}>{t.titulo}</span>
                  {t.urgente&&<span style={{fontSize:9,fontWeight:600,background:"rgba(239,68,68,0.1)",color:"#dc2626",borderRadius:6,padding:"2px 6px",flexShrink:0}}>Hoy</span>}
                </div>
              ))}
            </div>
            <Link href="/tareas" style={{fontSize:10,color:AZ,display:"block",marginTop:8,textDecoration:"none",flexShrink:0}}>Ver todas →</Link>
          </div>

          <div style={{background:BG,borderRadius:12,boxShadow:S.out,padding:"12px 14px",display:"flex",flexDirection:"column",minHeight:0}}>
            <p style={{fontSize:8,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"#9ca3af",marginBottom:8,flexShrink:0}}>Mis logros</p>
            <div style={{flex:1,display:"flex",flexWrap:"wrap",gap:5,alignContent:"flex-start",overflowY:"auto",minHeight:0}}>
              {BADGES.map(b=>(
                <span key={b.id} style={{fontSize:10,fontWeight:500,padding:"4px 9px",borderRadius:16,background:b.on?"rgba(0,229,160,0.12)":"rgba(174,183,194,0.18)",color:b.on?"#00b87d":"#9ca3af",border:b.on?"0.5px solid rgba(0,229,160,0.35)":"none"}}>{b.n}</span>
              ))}
            </div>
            <Link href="/perfil" style={{fontSize:10,color:AZ,display:"block",marginTop:8,textDecoration:"none",flexShrink:0}}>Ver todos →</Link>
          </div>
        </div>

        {/* 6 · Onboarding compacto al pie */}
        {!obHidden && (
          <div style={{background:BG,borderRadius:12,boxShadow:S.out,padding:"10px 14px",flexShrink:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <p style={{fontSize:8,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"#9ca3af"}}>Primeros pasos — 2 de 5</p>
              <button onClick={()=>{setObHidden(true);localStorage.setItem("ob_hidden","1");}} style={{fontSize:9,color:"#9ca3af",background:"none",border:"none",cursor:"pointer",fontFamily:F}}>Ocultar</button>
            </div>
            <div style={{display:"flex",gap:5}}>
              {OB.map(s=>(
                <div key={s.id} style={{flex:1,padding:"6px 4px",borderRadius:7,textAlign:"center",background:BG,border:s.done?"0.5px solid rgba(0,229,160,0.4)":s.active?"0.5px solid rgba(20,40,212,0.35)":"0.5px solid rgba(174,183,194,0.25)",boxShadow:(s.done||s.active)?undefined:S.in}}>
                  <p style={{fontSize:9,fontWeight:500,color:s.done?"#00b87d":s.active?AZ:"#9ca3af",lineHeight:1.3}}>{s.l}</p>
                </div>
              ))}
            </div>
            <div style={{marginTop:7,height:2,background:BG,borderRadius:1,overflow:"hidden",boxShadow:S.in}}>
              <div style={{height:"100%",width:"40%",background:`linear-gradient(90deg,${AZ},#2b4fff)`,borderRadius:1}}/>
            </div>
          </div>
        )}

      </div>

      {/* ══ COLUMNA DERECHA ══ */}
      <div style={{display:"flex",flexDirection:"column",gap:12,minHeight:0,overflow:"hidden"}}>

        <div style={{background:BG,borderRadius:12,boxShadow:S.out,padding:14}}>
          <p style={{fontSize:8,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"#9ca3af",marginBottom:10}}>Tu progreso</p>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{position:"relative",width:48,height:48,flexShrink:0}}>
              <svg width="48" height="48" style={{position:"absolute",top:0,left:0,transform:"rotate(-90deg)"}}>
                <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(174,183,194,0.3)" strokeWidth="4"/>
                <circle cx="24" cy="24" r="20" fill="none" stroke={AZ} strokeWidth="4"
                  strokeDasharray={2*Math.PI*20} strokeDashoffset={2*Math.PI*20*0.7} strokeLinecap="round"/>
              </svg>
              <span style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontSize:10,fontWeight:600,color:AZ}}>30%</span>
            </div>
            <div>
              <p style={{fontSize:11,fontWeight:500,color:"#0a1628",marginBottom:1}}>30% completado</p>
              <p style={{fontSize:10,color:"#9ca3af"}}>Módulo 2 activo</p>
            </div>
          </div>
        </div>

        <div style={{background:BG,borderRadius:12,boxShadow:S.out,padding:14}}>
          <p style={{fontSize:8,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"#9ca3af",marginBottom:8}}>Comunidad</p>
          <p style={{fontSize:11,color:"#9ca3af",marginBottom:10,lineHeight:1.5}}>Sé el primero en publicar.</p>
          <Link href="/comunidad" style={{display:"block",textAlign:"center",fontSize:11,fontWeight:500,color:AZ,background:"rgba(20,40,212,0.07)",borderRadius:8,padding:"7px",textDecoration:"none"}}>Crear post</Link>
        </div>

        <div style={{background:BG,borderRadius:12,boxShadow:S.out,padding:14}}>
          <p style={{fontSize:8,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"#9ca3af",marginBottom:8}}>Próxima sesión</p>
          <p style={{fontSize:11,color:"#9ca3af",marginBottom:10,lineHeight:1.5}}>Sin sesiones programadas.</p>
          <Link href="/sesiones" style={{display:"block",textAlign:"center",fontSize:11,color:"#6b7280",background:"rgba(174,183,194,0.12)",borderRadius:8,padding:"7px",textDecoration:"none"}}>Ver sesiones</Link>
        </div>

        <div style={{flex:1}}/>

        {/* Mini misión del día */}
        <div style={{background:AZ,borderRadius:12,padding:14,boxShadow:"4px 4px 12px rgba(20,40,212,0.2)"}}>
          <p style={{fontSize:8,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"rgba(255,255,255,0.5)",marginBottom:6}}>Misión de hoy</p>
          <p style={{fontSize:11,color:"rgba(255,255,255,0.9)",lineHeight:1.5,marginBottom:10}}>Completa la lección de co-diseño y escribe tu reflexión.</p>
          <div style={{height:3,background:"rgba(255,255,255,0.15)",borderRadius:2,overflow:"hidden"}}>
            <div style={{height:"100%",width:"60%",background:MN,borderRadius:2}}/>
          </div>
          <p style={{fontSize:9,color:"rgba(255,255,255,0.5)",marginTop:4}}>60% de la misión completada</p>
        </div>

      </div>
    </div>
  );
}
