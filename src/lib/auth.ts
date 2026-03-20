import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; // your drizzle instance
import { tanstackStartCookies } from "better-auth/tanstack-start";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite", // or "mysql", "sqlite"
  }),
  session: {
    expiresIn: 60 * 60 * 6, // 6 hours
    freshAge: 60 * 60, // 1 hour
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [tanstackStartCookies()]
});
