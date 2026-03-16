import { sqliteTable, integer, text, } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { thought } from './index';

export const proof = sqliteTable("proof", {
    id: integer("id").primaryKey().unique(),
    name: text("name").notNull(),

    thought_id: integer("thought_id")
        .notNull()
        .references(() => thought.id, { onDelete: "cascade" }),

    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`)
});