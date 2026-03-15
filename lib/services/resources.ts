/**
 * Biblioteca de recursos por módulo.
 * Firestore: module_resources (module_id, title, type, url, storage_path?, description).
 * Estado "leído/visto": users/{userId}/resource_views/{resourceId} = true.
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export type ResourceType = "pdf" | "link" | "video" | "link_org";

export interface ModuleResource {
  id: string;
  module_id: string;
  title: string;
  type: ResourceType;
  url: string | null;
  storage_path: string | null;
  description: string | null;
  order: number;
  created_at: string;
  updated_at: string;
}

const COLLECTION = "module_resources";
const VIEWS_COLLECTION = "resource_views";

function db() {
  return getFirebaseAdminFirestore();
}

export async function listResourcesByModule(moduleId: string): Promise<ModuleResource[]> {
  try {
    const snap = await db()
      .collection(COLLECTION)
      .where("module_id", "==", moduleId)
      .orderBy("order", "asc")
      .orderBy("created_at", "asc")
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ModuleResource));
  } catch {
    return [];
  }
}

export async function getResource(resourceId: string): Promise<ModuleResource | null> {
  const doc = await db().collection(COLLECTION).doc(resourceId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as ModuleResource;
}

export async function createResource(
  moduleId: string,
  payload: {
    title: string;
    type: ResourceType;
    url?: string | null;
    storage_path?: string | null;
    description?: string | null;
    order?: number;
  }
): Promise<ModuleResource> {
  const ref = db().collection(COLLECTION).doc();
  const now = new Date().toISOString();
  const order = payload.order ?? 0;
  await ref.set({
    module_id: moduleId,
    title: payload.title.trim(),
    type: payload.type,
    url: payload.url?.trim() ?? null,
    storage_path: payload.storage_path ?? null,
    description: payload.description?.trim() ?? null,
    order,
    created_at: now,
    updated_at: now,
  });
  const snap = await ref.get();
  return { id: snap.id, ...snap.data() } as ModuleResource;
}

export async function updateResource(
  resourceId: string,
  updates: Partial<{
    title: string;
    type: ResourceType;
    url: string | null;
    storage_path: string | null;
    description: string | null;
    order: number;
  }>
): Promise<void> {
  const ref = db().collection(COLLECTION).doc(resourceId);
  await ref.update({
    ...updates,
    updated_at: new Date().toISOString(),
  });
}

export async function deleteResource(resourceId: string): Promise<void> {
  await db().collection(COLLECTION).doc(resourceId).delete();
}

/** Marca un recurso como visto/leído por el usuario. */
export async function markResourceViewed(userId: string, resourceId: string): Promise<void> {
  try {
    const ref = db().collection("users").doc(userId).collection(VIEWS_COLLECTION).doc(resourceId);
    await ref.set({ viewedAt: new Date().toISOString() }, { merge: true });
  } catch {
    // demo o sin Firebase
  }
}

/** Obtiene los IDs de recursos que el usuario ya marcó como vistos. */
export async function getViewedResourceIds(userId: string, resourceIds: string[]): Promise<Set<string>> {
  if (resourceIds.length === 0) return new Set();
  try {
    const ref = db().collection("users").doc(userId).collection(VIEWS_COLLECTION);
    const viewed = new Set<string>();
    await Promise.all(
      resourceIds.map(async (id) => {
        const doc = await ref.doc(id).get();
        if (doc.exists) viewed.add(id);
      })
    );
    return viewed;
  } catch {
    return new Set();
  }
}
