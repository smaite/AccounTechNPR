import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '@shared/schema';
import { randomUUID } from 'crypto';

// Create SQLite database file
const sqlite = new Database('./database.db');

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');

// Create drizzle instance
export const db = drizzle(sqlite, { schema });

// Initialize database with default data
export async function initializeDatabase() {
  try {
    // Run migrations if any exist
    try {
      migrate(db, { migrationsFolder: './migrations' });
    } catch (error) {
      console.log('No migrations to run or migration error:', error);
    }

    // Check and add outstandingBalance columns if they don't exist
    try {
      sqlite.exec(`
        ALTER TABLE customers ADD COLUMN outstanding_balance TEXT NOT NULL DEFAULT '0';
      `);
      console.log('Added outstanding_balance column to customers table');
    } catch (error) {
      // Column already exists - ignore
    }

    try {
      sqlite.exec(`
        ALTER TABLE suppliers ADD COLUMN outstanding_balance TEXT NOT NULL DEFAULT '0';
      `);
      console.log('Added outstanding_balance column to suppliers table');
    } catch (error) {
      // Column already exists - ignore
    }

    // Check if we need to seed default data
    const existingCategories = await db.select().from(schema.categories).limit(1);
    
    if (existingCategories.length === 0) {
      console.log('Seeding database with default data...');
      
      // Insert default company settings
      await db.insert(schema.companySettings).values({
        id: randomUUID(),
        companyName: "Your Company Name",
        registrationNumber: "",
        address: "",
        phone: "",
        email: "",
        vatNumber: "",
        panNumber: "",
        vatRate: "13.00",
        taxYear: "2080-81",
        autoVatCalculation: true,
        includeVatInPrice: false,
      });

      // Insert default categories
      const defaultCategories = [
        { name: "Electronics", description: "Electronic products and accessories" },
        { name: "Clothing", description: "Clothing and apparel" },
        { name: "Home & Garden", description: "Home and garden items" },
        { name: "Books", description: "Books and educational materials" },
      ];

      for (const category of defaultCategories) {
        await db.insert(schema.categories).values({
          id: randomUUID(),
          name: category.name,
          description: category.description,
          createdAt: new Date(),
        });
      }

      console.log('Database seeded successfully!');
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export default db;
