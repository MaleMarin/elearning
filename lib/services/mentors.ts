/**
 * Mentores voluntarios (egresados que ofrecen 1 sesión de 30 min).
 * Firestore: mentors/{userId}, mentor_requests/{requestId}
 * No exponer WhatsApp sin consentimiento (solo tras aprobación admin).
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

const MENTORS = "mentors";
const REQUESTS = "mentor_requests";

function db() {
  return getFirebaseAdminFirestore();
}

export interface Mentor {
  userId: string;
  fullName: string;
  institution: string | null;
  position: string | null;
  photoURL: string | null;
  cohortName: string | null;
  createdAt: string;
}

export interface MentorRequest {
  id: string;
  studentId: string;
  mentorId: string;
  message: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
}

export async function listMentors(): Promise<Mentor[]> {
  const snap = await db().collection(MENTORS).orderBy("createdAt", "desc").limit(100).get();
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      userId: d.id,
      fullName: (data.fullName as string) ?? "Mentor",
      institution: (data.institution as string) ?? null,
      position: (data.position as string) ?? null,
      photoURL: (data.photoURL as string) ?? null,
      cohortName: (data.cohortName as string) ?? null,
      createdAt: (data.createdAt as string) ?? "",
    };
  });
}

export async function getMentor(userId: string): Promise<Mentor | null> {
  const doc = await db().collection(MENTORS).doc(userId).get();
  if (!doc.exists) return null;
  const data = doc.data()!;
  return {
    userId: doc.id,
    fullName: (data.fullName as string) ?? "Mentor",
    institution: (data.institution as string) ?? null,
    position: (data.position as string) ?? null,
    photoURL: (data.photoURL as string) ?? null,
    cohortName: (data.cohortName as string) ?? null,
    createdAt: (data.createdAt as string) ?? "",
  };
}

export async function registerMentor(
  userId: string,
  data: { fullName: string; institution?: string | null; position?: string | null; photoURL?: string | null; whatsapp?: string | null; cohortName?: string | null }
): Promise<Mentor> {
  const ref = db().collection(MENTORS).doc(userId);
  const now = new Date().toISOString();
  await ref.set(
    {
      fullName: data.fullName.trim() || "Mentor",
      institution: (data.institution ?? "").trim() || null,
      position: (data.position ?? "").trim() || null,
      photoURL: (data.photoURL ?? "").trim() || null,
      whatsapp: (data.whatsapp ?? "").trim() || null,
      cohortName: (data.cohortName ?? "").trim() || null,
      createdAt: now,
      updatedAt: now,
    },
    { merge: true }
  );
  const mentor = await getMentor(userId);
  if (!mentor) throw new Error("Error al registrar");
  return mentor;
}

export async function createRequest(studentId: string, mentorId: string, message?: string | null): Promise<MentorRequest> {
  const mentor = await getMentor(mentorId);
  if (!mentor) throw new Error("Mentor no encontrado");
  const ref = db().collection(REQUESTS).doc();
  const now = new Date().toISOString();
  await ref.set({
    studentId,
    mentorId,
    message: (message ?? "").trim().slice(0, 500) || null,
    status: "pending",
    createdAt: now,
    reviewedAt: null,
    reviewedBy: null,
  });
  const snap = await ref.get();
  const d = snap.data()!;
  return {
    id: snap.id,
    studentId: d.studentId as string,
    mentorId: d.mentorId as string,
    message: (d.message as string) ?? null,
    status: (d.status as MentorRequest["status"]) ?? "pending",
    createdAt: (d.createdAt as string) ?? now,
    reviewedAt: (d.reviewedAt as string) ?? null,
    reviewedBy: (d.reviewedBy as string) ?? null,
  };
}

export async function listRequestsForAdmin(): Promise<(MentorRequest & { studentName?: string; mentorName?: string })[]> {
  const snap = await db().collection(REQUESTS).orderBy("createdAt", "desc").limit(200).get();
  const list = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      studentId: data.studentId as string,
      mentorId: data.mentorId as string,
      message: (data.message as string) ?? null,
      status: (data.status as MentorRequest["status"]) ?? "pending",
      createdAt: (data.createdAt as string) ?? "",
      reviewedAt: (data.reviewedAt as string) ?? null,
      reviewedBy: (data.reviewedBy as string) ?? null,
    };
  });
  return list;
}

export async function approveRequest(requestId: string, adminUid: string): Promise<void> {
  const ref = db().collection(REQUESTS).doc(requestId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Solicitud no encontrada");
  const data = snap.data()!;
  if ((data.status as string) !== "pending") throw new Error("Ya revisada");
  const now = new Date().toISOString();
  await ref.update({ status: "approved", reviewedAt: now, reviewedBy: adminUid });
}

export async function rejectRequest(requestId: string, adminUid: string): Promise<void> {
  const ref = db().collection(REQUESTS).doc(requestId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Solicitud no encontrada");
  const data = snap.data()!;
  if ((data.status as string) !== "pending") throw new Error("Ya revisada");
  const now = new Date().toISOString();
  await ref.update({ status: "rejected", reviewedAt: now, reviewedBy: adminUid });
}

export async function getMyRequests(studentId: string): Promise<MentorRequest[]> {
  const snap = await db().collection(REQUESTS).where("studentId", "==", studentId).orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      studentId: data.studentId as string,
      mentorId: data.mentorId as string,
      message: (data.message as string) ?? null,
      status: (data.status as MentorRequest["status"]) ?? "pending",
      createdAt: (data.createdAt as string) ?? "",
      reviewedAt: (data.reviewedAt as string) ?? null,
      reviewedBy: (data.reviewedBy as string) ?? null,
    };
  });
}

export async function getMentorWhatsapp(mentorId: string): Promise<string | null> {
  const doc = await db().collection(MENTORS).doc(mentorId).get();
  if (!doc.exists) return null;
  return (doc.data()?.whatsapp as string) ?? null;
}
