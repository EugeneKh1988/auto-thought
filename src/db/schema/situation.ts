import { sqliteTable, integer, text, } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

const situation = sqliteTable("situation", {
	id: integer("id").primaryKey().unique(),
	name: text("name").notNull(),
	description: text("description"),

	user_id: integer("user_id")
		.notNull(),
		//.references(() => user.id, { onDelete: "cascade" }),

	created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
	updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export default situation;