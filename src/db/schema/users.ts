import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

export const sessions = sqliteTable("sessions", {
  token: text("token").primaryKey(),
  user_id: integer("user_id", { mode: "number" }).notNull(),
});
