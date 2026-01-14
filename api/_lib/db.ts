import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Schema definition for serverless
import { pgTable, text, integer, boolean, real, json, timestamp, uuid } from 'drizzle-orm/pg-core';

export const vehicles = pgTable('vehicles', {
  id: uuid('id').defaultRandom().primaryKey(),
  year: integer('year').notNull(),
  make: text('make').notNull(),
  model: text('model').notNull(),
  trim: text('trim'),
  price: real('price').notNull(),
  mileage: integer('mileage').notNull(),
  bodyStyle: text('body_style').notNull(),
  seats: integer('seats'),
  color: text('color').notNull(),
  fuelType: text('fuel_type').notNull(),
  transmission: text('transmission').notNull(),
  drivetrain: text('drivetrain').notNull(),
  mpgCity: integer('mpg_city'),
  mpgHighway: integer('mpg_highway'),
  features: json('features').$type<string[]>().default([]),
  description: text('description'),
  imageUrl: text('image_url'),
  isAvailable: boolean('is_available').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Singleton pattern for serverless database connection
let db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!db) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Use connection pooling settings suitable for serverless
    const queryClient = postgres(connectionString, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });

    db = drizzle(queryClient, { schema: { vehicles } });
  }

  return db;
}

export const schema = { vehicles };
