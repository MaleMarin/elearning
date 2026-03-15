"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { SurfaceCard, PrimaryButton, SecondaryButton } from "@/components/ui";
import { Alert } from "@/components/ui/Alert";
import { ChevronLeft, Upload, FileSpreadsheet, Copy, Download } from "lucide-react";

type AlumnoRow = { nombre: string; email: string; institucion: string; cargo: string };
type Resultado = { email: string; uid?: string; error?: string; password?: string };

function parseCsv(csv: string): AlumnoRow[] {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0].toLowerCase();
  const cols = header.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
  const nameIdx = cols.findIndex((c) => c === "nombre" || c === "name");
  const emailIdx = cols.findIndex((c) => c === "email" || c === "correo");
  const instIdx = cols.findIndex((c) => c === "institucion" || c === "institución" || c === "institution");
  const cargoIdx = cols.findIndex((c) => c === "cargo" || c === "position");
  const rows: AlumnoRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",").map((p) => p.replace(/^"|"$/g, "").trim());
    const email = (parts[emailIdx ?? 1] ?? "").trim();
    if (!email) continue;
    rows.push({
      nombre: (parts[nameIdx ?? 0] ?? "").trim(),
      email,
      institucion: (parts[instIdx ?? 2] ?? "").trim(),
      cargo: (parts[cargoIdx ?? 3] ?? "").trim(),
    });
  }
  return rows;
}

export default function AdminAlumnosImportarPage() {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<AlumnoRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ creados: number; total: number; resultados: Resultado[]; mensaje: string } | null>(null);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setResult(null);
    setError(null);
    if (!f) {
      setFile(null);
      setRows([]);
      return;
    }
    if (!f.name.toLowerCase().endsWith(".csv") && f.type !== "text/csv") {
      setError("Selecciona un archivo CSV.");
      setFile(null);
      setRows([]);
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => {
      const text = (reader.result as string) ?? "";
      const parsed = parseCsv(text);
      setRows(parsed);
      if (parsed.length === 0) setError("No se encontraron filas con email en el CSV.");
    };
    reader.readAsText(f, "UTF-8");
  }, []);

  const handleImport = () => {
    if (rows.length === 0) return;
    setError(null);
    setImporting(true);
    setResult(null);
    fetch("/api/admin/alumnos/importar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        alumnos: rows.map((r) => ({
          nombre: r.nombre,
          email: r.email,
          institucion: r.institucion,
          cargo: r.cargo || undefined,
        })),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setResult({
          creados: data.creados ?? 0,
          total: data.total ?? 0,
          resultados: data.resultados ?? [],
          mensaje: data.mensaje ?? "",
        });
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error al importar"))
      .finally(() => setImporting(false));
  };

  const downloadPasswords = () => {
    if (!result?.resultados?.length) return;
    const lines = ["email,contraseña_temporal,uid"];
    result.resultados.forEach((r) => {
      if (r.uid && r.password) lines.push(`${r.email},${r.password},${r.uid}`);
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contraseñas_temporales.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const preview = rows.slice(0, 5);
  const withPassword = result?.resultados?.filter((r) => r.password) ?? [];

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="inline-flex items-center gap-2 text-[var(--ink-muted)] hover:text-[var(--ink)] no-underline text-sm font-medium">
            <ChevronLeft className="w-4 h-4" /> Volver
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-[var(--ink)] mb-2">Importar alumnos por CSV</h1>
        <p className="text-[var(--ink-muted)] mb-6">
          Sube un CSV con columnas: <strong>nombre</strong>, <strong>email</strong>, <strong>institucion</strong>, <strong>cargo</strong> (opcional). Se crearán cuentas y se generarán contraseñas temporales.
        </p>

        {error && <Alert message={error} variant="error" className="mb-4" />}

        <SurfaceCard padding="lg" clickable={false} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileSpreadsheet className="w-6 h-6 text-[var(--primary)]" />
            <h2 className="text-lg font-semibold text-[var(--ink)]">Archivo CSV</h2>
          </div>
          <label className="flex flex-col items-center justify-center w-full min-h-[120px] border-2 border-dashed border-[var(--line)] rounded-xl cursor-pointer hover:bg-[var(--surface-soft)] transition-colors">
            <input type="file" accept=".csv,text/csv" onChange={onFileChange} className="hidden" />
            <Upload className="w-10 h-10 text-[var(--ink-muted)] mb-2" />
            <span className="text-sm text-[var(--ink-muted)]">
              {file ? file.name : "Haz clic o arrastra un CSV aquí"}
            </span>
            {rows.length > 0 && (
              <span className="text-sm text-[var(--primary)] mt-1">{rows.length} filas detectadas</span>
            )}
          </label>

          {preview.length > 0 && (
            <>
              <h3 className="text-sm font-medium text-[var(--ink)] mt-6 mb-2">Vista previa (primeras 5 filas)</h3>
              <div className="overflow-x-auto rounded-lg border border-[var(--line-subtle)]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--line-subtle)] bg-[var(--bg)]">
                      <th className="text-left py-2 px-3 font-medium text-[var(--ink)]">Nombre</th>
                      <th className="text-left py-2 px-3 font-medium text-[var(--ink)]">Email</th>
                      <th className="text-left py-2 px-3 font-medium text-[var(--ink)]">Institución</th>
                      <th className="text-left py-2 px-3 font-medium text-[var(--ink)]">Cargo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((r, i) => (
                      <tr key={i} className="border-b border-[var(--line-subtle)] last:border-b-0">
                        <td className="py-2 px-3 text-[var(--ink)]">{r.nombre || "—"}</td>
                        <td className="py-2 px-3 text-[var(--ink)]">{r.email}</td>
                        <td className="py-2 px-3 text-[var(--ink-muted)]">{r.institucion || "—"}</td>
                        <td className="py-2 px-3 text-[var(--ink-muted)]">{r.cargo || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PrimaryButton
                className="mt-4"
                onClick={handleImport}
                disabled={importing || rows.length === 0}
              >
                {importing ? "Importando…" : `Importar ${rows.length} alumno(s)`}
              </PrimaryButton>
            </>
          )}
        </SurfaceCard>

        {result && (
          <SurfaceCard padding="lg" clickable={false} className="mb-8">
            <h2 className="text-lg font-semibold text-[var(--ink)] mb-2">Resultado de la importación</h2>
            <p className="text-[var(--ink-muted)] mb-4">{result.mensaje}</p>
            <p className="text-sm text-[var(--ink)] mb-4">
              Creados: <strong>{result.creados}</strong> de {result.total}.
            </p>
            {withPassword.length > 0 && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <SecondaryButton onClick={downloadPasswords}>
                    <Download className="w-4 h-4" /> Descargar contraseñas (CSV)
                  </SecondaryButton>
                </div>
                <p className="text-xs text-[var(--ink-muted)] mb-2">
                  Guarda este archivo en un lugar seguro y distribuye las contraseñas a cada usuario. No se volverán a mostrar aquí.
                </p>
                <div className="overflow-x-auto rounded-lg border border-[var(--line-subtle)] max-h-48 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-[var(--bg)]">
                      <tr className="border-b border-[var(--line-subtle)]">
                        <th className="text-left py-2 px-3 font-medium text-[var(--ink)]">Email</th>
                        <th className="text-left py-2 px-3 font-medium text-[var(--ink)]">Contraseña temporal</th>
                        <th className="text-right py-2 px-3 font-medium text-[var(--ink)]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {withPassword.slice(0, 20).map((r, i) => (
                        <tr key={i} className="border-b border-[var(--line-subtle)] last:border-b-0">
                          <td className="py-2 px-3 font-mono text-[var(--ink)]">{r.email}</td>
                          <td className="py-2 px-3 font-mono text-[var(--ink)]">{r.password}</td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => navigator.clipboard.writeText(`${r.email}\t${r.password}`)}
                              className="text-[var(--primary)] hover:underline text-xs flex items-center gap-1 ml-auto"
                            >
                              <Copy className="w-3 h-3" /> Copiar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {withPassword.length > 20 && (
                  <p className="text-xs text-[var(--ink-muted)] mt-2">
                    Mostrando 20 de {withPassword.length}. Usa el botón de descarga para ver todas.
                  </p>
                )}
              </>
            )}
            {result.resultados.some((r) => r.error) && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-[var(--coral)] mb-2">Errores</h3>
                <ul className="text-sm text-[var(--ink-muted)] space-y-1">
                  {result.resultados.filter((r) => r.error).map((r, i) => (
                    <li key={i}>{r.email || "—"}: {r.error}</li>
                  ))}
                </ul>
              </div>
            )}
          </SurfaceCard>
        )}
      </div>
    </div>
  );
}
