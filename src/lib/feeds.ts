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
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { FeedRecord } from "./types";
import { getFeedType, getDateString, getNightDateRange, toTimestamp } from "./date-utils";

const feedsCol = () => collection(db, "feeds");

export function computeBreastOz(durationMin: number): number {
  return Math.round(durationMin * 0.1 * 10) / 10;
}

interface AddFeedInput {
  startTime: Date;
  method: "bottle" | "breast";
  amountOz?: number;
  durationMin?: number;
  notes?: string;
}

export async function addFeed(input: AddFeedInput): Promise<string> {
  const feedType = getFeedType(input.startTime);
  const date = getDateString(input.startTime);
  const amountOz =
    input.method === "breast"
      ? computeBreastOz(input.durationMin ?? 0)
      : input.amountOz ?? 0;

  const data = {
    date,
    startTime: toTimestamp(input.startTime),
    type: feedType,
    method: input.method,
    amountOz,
    durationMin: input.durationMin ?? null,
    feedNumber: null, // assigned client-side based on sort order
    notes: input.notes || null,
  };

  const docRef = await addDoc(feedsCol(), data);
  return docRef.id;
}

interface UpdateFeedInput {
  startTime?: Date;
  method?: "bottle" | "breast";
  amountOz?: number;
  durationMin?: number | null;
  notes?: string | null;
}

export async function updateFeed(
  id: string,
  updates: UpdateFeedInput
): Promise<void> {
  const docRef = doc(db, "feeds", id);
  const data: Record<string, unknown> = { ...updates };

  if (updates.startTime instanceof Date) {
    data.startTime = toTimestamp(updates.startTime);
    data.type = getFeedType(updates.startTime);
    data.date = getDateString(updates.startTime);
  }

  await updateDoc(docRef, data);
}

export async function deleteFeed(id: string): Promise<void> {
  await deleteDoc(doc(db, "feeds", id));
}

export function subscribeFeedsForDate(
  dateStr: string,
  callback: (feeds: FeedRecord[]) => void
): () => void {
  const q = query(feedsCol(), where("date", "==", dateStr), orderBy("startTime", "asc"));
  return onSnapshot(
    q,
    (snap) => {
      const feeds: FeedRecord[] = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as FeedRecord[];
      callback(feeds);
    },
    (error) => {
      console.error("subscribeFeedsForDate error:", error);
      callback([]);
    }
  );
}

export function subscribeNightFeeds(
  dateStr: string,
  callback: (feeds: FeedRecord[]) => void
): () => void {
  const { start, end } = getNightDateRange(dateStr);
  const q = query(
    feedsCol(),
    where("startTime", ">=", Timestamp.fromDate(start)),
    where("startTime", "<", Timestamp.fromDate(end)),
    orderBy("startTime", "asc")
  );
  return onSnapshot(
    q,
    (snap) => {
      const feeds: FeedRecord[] = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as FeedRecord))
        .filter((f) => f.type === "night");
      callback(feeds);
    },
    (error) => {
      console.error("subscribeNightFeeds error:", error);
      callback([]);
    }
  );
}

/** Subscribe to all feeds in the full day window (8 PM prev day → 8 PM current day). */
export function subscribeDayWindow(
  dateStr: string,
  callback: (dayFeeds: FeedRecord[], nightFeeds: FeedRecord[]) => void
): () => void {
  const { start } = getNightDateRange(dateStr);
  const windowEnd = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  const q = query(
    feedsCol(),
    where("startTime", ">=", Timestamp.fromDate(start)),
    where("startTime", "<", Timestamp.fromDate(windowEnd)),
    orderBy("startTime", "asc")
  );

  return onSnapshot(
    q,
    (snap) => {
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as FeedRecord[];
      callback(
        all.filter((f) => f.type === "day"),
        all.filter((f) => f.type === "night")
      );
    },
    (error) => {
      console.error("subscribeDayWindow error:", error);
      callback([], []);
    }
  );
}

export function assignFeedNumbers(feeds: FeedRecord[]): FeedRecord[] {
  let dayNum = 0;
  return feeds.map((f) => {
    if (f.type === "day") {
      dayNum++;
      return { ...f, feedNumber: dayNum };
    }
    return { ...f, feedNumber: null };
  });
}
