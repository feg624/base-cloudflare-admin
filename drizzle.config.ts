import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts', // Path to your schema
  out: './drizzle/migrations', // Output folder for migrations
  dialect: 'sqlite',
  driver: 'd1-http', // Use d1-http for D1
});
