import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  boolean,
  text,
  primaryKey,
} from "drizzle-orm/pg-core";

// Users Table (Linked to Supabase Auth)
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(), // Auto-generated by Drizzle
  supabaseId: uuid("supabase_id")
    .notNull()
    .unique()
    .references(() => auth.users.id, { onDelete: "cascade" }), // Links to auth.users
  email: varchar("email", { length: 255 }).unique().notNull(),
  fullName: varchar("full_name", { length: 255 }), // Profile details
  avatarUrl: text("avatar_url"), // Optional profile image
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Rentals Table
export const rentals = pgTable("rentals", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id")
    .references(() => users.id, { onDelete: "cascade" }) // If the host is deleted, remove their listings
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  pricePerDay: integer("price_per_day").notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  imageUrl: text("image_url").notNull(),
  available: boolean("available").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Bookings Table
export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" }) // If the user is deleted, remove their bookings
    .notNull(),
  rentalId: uuid("rental_id")
    .references(() => rentals.id, { onDelete: "cascade" }) // If rental is deleted, remove bookings
    .notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: varchar("status", { length: 50 }).default("pending"), // pending, confirmed, canceled
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Notifications Table
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
