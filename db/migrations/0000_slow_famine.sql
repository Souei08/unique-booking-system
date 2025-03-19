CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_email" text NOT NULL,
	"date" timestamp NOT NULL,
	"duration" integer DEFAULT 1,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
