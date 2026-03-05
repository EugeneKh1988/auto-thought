import { defineConfig } from 'drizzle-kit';
import type { Config } from 'drizzle-kit';

export default defineConfig({
  out: "./src-tauri/migrations",
  schema: './src/db/schema',
  dialect: 'sqlite',
} as Config);
