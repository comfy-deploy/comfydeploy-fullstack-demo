import type { Config } from 'drizzle-kit';

export default {
	out: './migrations',
	schema: './src/db/schema.ts',
	breakpoints: true,
	driver: 'libsql',
	dbCredentials: {
		url: process.env.DATABASE_URL,
	},
} satisfies Config;

