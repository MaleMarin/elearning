import { NextRequest, NextResponse } from "next/server";
import { getDemoMode, useFirebase } from "@/lib/env";
import { getAuthFromRequest } from "@/lib/firebase/auth-request";
import { getFirebaseAdminStorage } from "@/lib/firebase/admin";
import * as profileService from "@/lib/services/profile";

export const dynamic = "force-dynamic";

const MAX_SIZE = 4 * 1024 * 1024; // 4 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** POST: subir foto de perfil a Firebase Storage y actualizar profile.photoURL */
export async function POST(req: NextRequest) {
  try {
    if (getDemoMode()) {
      return NextResponse.json({ photoURL: null, message: "Modo demo: no se suben archivos." });
    }
    const auth = await getAuthFromRequest(req);
    if (!useFirebase()) {
      return NextResponse.json({ photoURL: null });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "El archivo no puede superar 4 MB" }, { status: 400 });
    }
    const type = file.type?.toLowerCase() ?? "";
    if (!ALLOWED_TYPES.includes(type)) {
      return NextResponse.json({ error: "Solo se permiten JPEG, PNG o WebP" }, { status: 400 });
    }

    const ext = type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
    const path = `users/${auth.uid}/avatar.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const storage = getFirebaseAdminStorage();
    const bucket = storage.bucket();
    const bucketFile = bucket.file(path);
    await bucketFile.save(buffer, {
      metadata: { contentType: type },
      resumable: false,
    });

    const [signedUrl] = await bucketFile.getSignedUrl({
      action: "read",
      expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 año
    });

    await profileService.updateProfile(auth.uid, { photoURL: signedUrl });

    return NextResponse.json({ photoURL: signedUrl });
  } catch (e) {
    console.error("Avatar upload:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al subir la foto" },
      { status: 500 }
    );
  }
}
