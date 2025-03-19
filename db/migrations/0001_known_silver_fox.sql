CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"message" text NOT NULL,
	"read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rentals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"price_per_day" integer NOT NULL,
	"location" varchar(255) NOT NULL,
	"image_url" text NOT NULL,
	"available" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "bookings" RENAME COLUMN "user_email" TO "rental_id";--> statement-breakpoint
ALTER TABLE "bookings" RENAME COLUMN "date" TO "start_date";--> statement-breakpoint
ALTER TABLE "bookings" RENAME COLUMN "duration" TO "end_date";--> statement-breakpoint
ALTER TABLE "bookings" RENAME COLUMN "notes" TO "status";--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rentals" ADD CONSTRAINT "rentals_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_rental_id_rentals_id_fk" FOREIGN KEY ("rental_id") REFERENCES "public"."rentals"("id") ON DELETE no action ON UPDATE no action;