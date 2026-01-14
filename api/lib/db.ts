import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { pgTable, text, integer, boolean, real, json, timestamp, uuid } from 'drizzle-orm/pg-core';

// Define schema inline to avoid import issues with serverless
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

export const schema = { vehicles };

// Singleton pattern for serverless - reuse connection across invocations
let db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!db) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    const queryClient = postgres(connectionString, {
      max: 1, // Limit connections for serverless
      idle_timeout: 20,
      connect_timeout: 10,
    });
    db = drizzle(queryClient, { schema });
  }
  return db;
}
