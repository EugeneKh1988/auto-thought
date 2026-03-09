import Database from 'better-sqlite3';
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import os from "os";

export function getDbPath() {
  return path.join(
    os.homedir(),
    "AppData",
    "Roaming",
    "com.tauri.autothought",
    "database.db"
  );
}

const sqlite = new Database(getDbPath());

export const db = drizzle(sqlite, { schema });