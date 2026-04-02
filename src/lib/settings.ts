import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import type { AppSettings } from "./types";
import { INITIAL_INTERVAL_MIN, MIN_DAILY_OZ } from "./constants";
import { getDateString } from "./date-utils";

const SETTINGS_DOC = "app-settings";

export const defaultSettings: AppSettings = {
  babyName: "",
  startDate: getDateString(new Date()),
  currentIntervalMin: INITIAL_INTERVAL_MIN,
  dailyOzMinimum: MIN_DAILY_OZ,
};

function settingsRef() {
  return doc(db, "settings", SETTINGS_DOC);
}

export async function getSettings(): Promise<AppSettings> {
  const snap = await getDoc(settingsRef());
  if (!snap.exists()) return defaultSettings;
  return { ...defaultSettings, ...snap.data() } as AppSettings;
}

export async function updateSettings(updates: Partial<AppSettings>): Promise<void> {
  await setDoc(settingsRef(), updates, { merge: true });
}

export function subscribeSettings(
  callback: (settings: AppSettings) => void
): () => void {
  return onSnapshot(
    settingsRef(),
    (snap) => {
      if (!snap.exists()) {
        callback(defaultSettings);
        return;
      }
      callback({ ...defaultSettings, ...snap.data() } as AppSettings);
    },
    (error) => {
      console.error("subscribeSettings error:", error);
      callback(defaultSettings);
    }
  );
}
