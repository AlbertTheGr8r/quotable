import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'quotable-storage';
const STORE_NAME = 'logos';

export interface LogoRecord {
  id: string;
  data: Blob;
  mimeType: string;
  updatedAt: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export const LogoStorage = {
  async saveLogo(id: string, data: Blob): Promise<void> {
    const db = await getDB();
    await db.put(STORE_NAME, {
      id,
      data,
      mimeType: data.type,
      updatedAt: Date.now(),
    });
  },

  async getLogo(id: string): Promise<LogoRecord | undefined> {
    const db = await getDB();
    return db.get(STORE_NAME, id);
  },

  async deleteLogo(id: string): Promise<void> {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
  },
};
