import * as schema from './schema';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

// Initialize SQLite database with better-sqlite3
const sqlite = new Database('sqlite.db');
export const db = drizzle(sqlite, { schema });

// Apply migrations
export const runMigrations = () => {
  try {
    migrate(db, { migrationsFolder: './drizzle' });
  } catch (error) {
    console.error('Error applying migrations:', error);
  }
};

// Run migrations
runMigrations();
