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

export type VehicleSelect = typeof vehicles.$inferSelect;
export type VehicleInsert = typeof vehicles.$inferInsert;
