import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Load environment variables
config();

const dbPath = process.env.SQLITE_DB_PATH || 'sqlite.db';

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: dbPath,
  },
});
