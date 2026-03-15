import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import OpenAI from "openai";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { createReadStream } from "fs";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let user: { uid: string };
  try {
    user = await getAuthFromRequest(req);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    return NextResponse.json({ error: "OPENAI_API_KEY no configurada" }, { status: 503 });
  }

  const formData = await req.formData();
  const videoFile = formData.get("video") as File | null;
  const videoUrl = formData.get("url") as string | null;

  if (!videoFile && !videoUrl) {
    return NextResponse.json({ error: "Se requiere video o URL" }, { status: 400 });
  }

  const openai = new OpenAI({ apiKey: key });

  try {
    let transcription: string;

    if (videoFile && videoFile.size > 0) {
      const buffer = Buffer.from(await videoFile.arrayBuffer());
      const tmpPath = join(tmpdir(), `video-${Date.now()}-${user.uid}.mp4`);
      await writeFile(tmpPath, buffer);
      try {
        const stream = createReadStream(tmpPath);
        const resp = await openai.audio.transcriptions.create({
          file: stream,
          model: "whisper-1",
          language: "es",
          response_format: "srt",
        });
        transcription = typeof resp === "string" ? resp : (resp as { text?: string }).text ?? "";
      } finally {
        await unlink(tmpPath).catch(() => {});
      }
    } else if (videoUrl) {
      const res = await fetch(videoUrl);
      if (!res.ok) throw new Error("No se pudo descargar el video");
      const buffer = Buffer.from(await res.arrayBuffer());
      const tmpPath = join(tmpdir(), `video-url-${Date.now()}.mp4`);
      await writeFile(tmpPath, buffer);
      try {
        const stream = createReadStream(tmpPath);
        const resp = await openai.audio.transcriptions.create({
          file: stream,
          model: "whisper-1",
          language: "es",
          response_format: "srt",
        });
        transcription = typeof resp === "string" ? resp : String((resp as { text?: string }).text ?? "");
      } finally {
        await unlink(tmpPath).catch(() => {});
      }
    } else {
      return NextResponse.json({ error: "Se requiere video o URL" }, { status: 400 });
    }

    return NextResponse.json({
      subtitulos: transcription,
      formato: "srt",
    });
  } catch (err) {
    console.error("Error generando subtítulos:", err);
    return NextResponse.json(
      { error: "Error generando subtítulos" },
      { status: 500 }
    );
  }
}
