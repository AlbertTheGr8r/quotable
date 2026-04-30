import { type IDBPDatabase, openDB } from "idb";

const DB_NAME = "quotable-storage";
const DB_VERSION = 2;
const LOGO_STORE = "logos";
const YAML_STORE = "custom-yamls";

export interface LogoRecord {
  id: string;
  data: Blob;
  mimeType: string;
  updatedAt: number;
}

export interface YamlRecord {
  id: string;
  name: string;
  content: string;
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
        if (oldVersion < 2) {
          if (!db.objectStoreNames.contains(YAML_STORE)) {
            db.createObjectStore(YAML_STORE, { keyPath: "id" });
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

export const YamlStorage = {
  async saveYaml(id: string, name: string, content: string): Promise<void> {
    const db = await getDB();
    await db.put(YAML_STORE, {
      id,
      name,
      content,
      updatedAt: Date.now(),
    });
  },

  async getYaml(id: string): Promise<YamlRecord | undefined> {
    const db = await getDB();
    return db.get(YAML_STORE, id);
  },

  async getAllYamls(): Promise<YamlRecord[]> {
    const db = await getDB();
    const yamls = await db.getAll(YAML_STORE);
    return yamls.sort((a, b) => b.updatedAt - a.updatedAt);
  },

  async deleteYaml(id: string): Promise<void> {
    const db = await getDB();
    await db.delete(YAML_STORE, id);
  },
};
