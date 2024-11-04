// schema.ts
import { pgTable, serial, text, timestamp, real } from 'drizzle-orm/pg-core';

export const runs = pgTable('runs', {
  run_id: serial('run_id').primaryKey(),
  user_id: text('user_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  image_url: text('image_url'),
  inputs: text('inputs').notNull(),
  live_status: text('live_status'),
  progress: real('progress'),
});
