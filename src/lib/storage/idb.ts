import { type IDBPDatabase, openDB } from "idb";
import type { RateFile } from "../schema/rates";

const DB_NAME = "quotable-storage";
const DB_VERSION = 3;
const LOGO_STORE = "logos";
const RATE_STORE = "custom-rates";

export interface LogoRecord {
  id: string;
  data: Blob;
  mimeType: string;
  updatedAt: number;
}

export interface RateRecord {
  id: string;
  name: string;
  data: RateFile;
  updatedAt: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore(LOGO_STORE, { keyPath: "id" });
        }
        if (oldVersion < 3) {
          if (!db.objectStoreNames.contains(RATE_STORE)) {
            db.createObjectStore(RATE_STORE, { keyPath: "id" });
          }
        }
      },
    });
  }
  return dbPromise;
}

export const LogoStorage = {
  async saveLogo(id: string, data: Blob): Promise<void> {
    const db = await getDB();
    await db.put(LOGO_STORE, {
      id,
      data,
      mimeType: data.type,
      updatedAt: Date.now(),
    });
  },

  async getLogo(id: string): Promise<LogoRecord | undefined> {
    const db = await getDB();
    return db.get(LOGO_STORE, id);
  },

  async deleteLogo(id: string): Promise<void> {
    const db = await getDB();
    await db.delete(LOGO_STORE, id);
  },
};

export const RateStorage = {
  async saveRate(id: string, name: string, data: RateFile): Promise<void> {
    const db = await getDB();
    await db.put(RATE_STORE, {
      id,
      name,
      data,
      updatedAt: Date.now(),
    });
  },

  async getRate(id: string): Promise<RateRecord | undefined> {
    const db = await getDB();
    return db.get(RATE_STORE, id);
  },

  async getAllRates(): Promise<RateRecord[]> {
    const db = await getDB();
    const rates = await db.getAll(RATE_STORE);
    return rates.sort((a, b) => b.updatedAt - a.updatedAt);
  },

  async deleteRate(id: string): Promise<void> {
    const db = await getDB();
    await db.delete(RATE_STORE, id);
  },
};
