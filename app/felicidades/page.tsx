"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FinDeCursoPage from "@/components/FinDeCursoPage";
import { decrypt } from "@/lib/crypto/encryption";

export default function FelicidadesPage() {
  const router = useRouter();
  const [data, setData] = useState<{
    nombre: string;
    curso: string;
    horas: number;
    calificacion: string;
    leccionesTotal: number;
    badges: { icon: string; name: string; desc: string }[];
    carta?: string;
    cartaFecha?: string;
    idCert: string;
    cohorte: string;
    verifyUrl: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/felicidades", { credentials: "include" }).then((r) => {
        if (r.status === 401) {
          router.replace("/login?redirect=/felicidades");
          return null;
        }
        return r.json();
      }),
      fetch("/api/auth/me", { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([d, me]) => {
        if (d && !d.error) {
          const uid = (me as { uid?: string } | null)?.uid;
          const cartaEncrypted = (d as { cartaEncrypted?: string }).cartaEncrypted;
          const carta = uid && cartaEncrypted ? decrypt(cartaEncrypted, uid) : undefined;
          setData({
            ...d,
            carta: carta || undefined,
            cartaFecha: d.cartaFecha,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <p className="text-[var(--ink-muted)]">Cargando…</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <FinDeCursoPage
      nombre={data.nombre}
      curso={data.curso}
      horas={data.horas}
      calificacion={data.calificacion}
      leccionesTotal={data.leccionesTotal}
      badges={data.badges}
      carta={data.carta}
      cartaFecha={data.cartaFecha}
      idCert={data.idCert}
      cohorte={data.cohorte}
      verifyUrl={data.verifyUrl}
    />
  );
}
