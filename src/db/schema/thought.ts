import { sqliteTable, integer, text, } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { situation } from './index';

export const thought = sqliteTable("thought", {
    id: integer("id").primaryKey().unique(),
    name: text("name").notNull(),
    strength: integer("strength"),

    situation_id: text("situation_id")
        .notNull()
        .references(() => situation.id, { onDelete: "cascade" }),

    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`)
});