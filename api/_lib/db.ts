import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { pgTable, text, integer, boolean, real, json, timestamp, uuid } from 'drizzle-orm/pg-core';

// Define schema inline for serverless functions
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

// Create database connection for serverless
const connectionString = process.env.DATABASE_URL!;

// Use connection pooling for serverless
const client = postgres(connectionString, {
  ssl: 'require',
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema: { vehicles } });
