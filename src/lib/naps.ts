import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import type { NapRecord, NapType } from "./types";
import { getDateString, toTimestamp } from "./date-utils";

const napsCol = () => collection(db, "naps");

interface AddNapInput {
  startTime: Date;
  durationMin: number;
  napType: NapType;
  notes?: string;
}

export async function addNap(input: AddNapInput): Promise<string> {
  const date = getDateString(input.startTime);
  const data = {
    date,
    startTime: toTimestamp(input.startTime),
    durationMin: input.durationMin,
    napType: input.napType,
    notes: input.notes || null,
  };
  const docRef = await addDoc(napsCol(), data);
  return docRef.id;
}

export async function updateNap(
  id: string,
  updates: Partial<Omit<NapRecord, "id">>
): Promise<void> {
  const docRef = doc(db, "naps", id);
  await updateDoc(docRef, { ...updates });
}

export async function deleteNap(id: string): Promise<void> {
  await deleteDoc(doc(db, "naps", id));
}

export function subscribeNapsForDate(
  dateStr: string,
  callback: (naps: NapRecord[]) => void
): () => void {
  const q = query(napsCol(), where("date", "==", dateStr), orderBy("startTime", "asc"));
  return onSnapshot(
    q,
    (snap) => {
      const naps: NapRecord[] = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as NapRecord[];
      callback(naps);
    },
    (error) => {
      console.error("subscribeNapsForDate error:", error);
      callback([]);
    }
  );
}
