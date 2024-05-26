import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const runs = sqliteTable('runs', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	user_id: text('user_id').notNull(),
	run_id: text('run_id').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
	image_url: text('image_url'),
});