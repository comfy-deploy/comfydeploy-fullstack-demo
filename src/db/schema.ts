// schema.ts
import { pgTable, serial, text, timestamp, jsonb, real } from 'drizzle-orm/pg-core';

export const runs = pgTable('runs', {
  run_id: serial('run_id').primaryKey(),
  // user_id: text('user_id'),
  image_id: text('image_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  image_url: text('image_url'),
  inputs: jsonb('inputs').notNull(),
  live_status: text('live_status'),
  progress: real('progress'),
});
