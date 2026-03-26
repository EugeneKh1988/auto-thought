import Database from 'better-sqlite3';
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import os from "os";

function getDbPath() {
  const home = os.homedir();
  const platform = process.platform;

  let basePath: string;

  if (platform === "win32") {
    basePath = path.join(home, "AppData", "Roaming", "com.tauri.autothought");
  } else if (platform === "darwin") {
    basePath = path.join(
      home,
      "Library",
      "Application Support",
      "com.tauri.autothought",
    );
  } else {
    // linux
    basePath = path.join(home, ".local", "share", "com.tauri.autothought");
  }

  return path.join(basePath, "database.db");
}

/* export function getDbPath() {
  return path.join(
    os.homedir(),
    "AppData",
    "Roaming",
    "com.tauri.autothought",
    "database.db"
  );
} */

const sqlite = new Database(getDbPath());

const db = drizzle(sqlite, { schema });