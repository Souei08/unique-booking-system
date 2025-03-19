ALTER TABLE "auth.users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "auth.users" CASCADE;--> statement-breakpoint
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_rental_id_rentals_id_fk";
--> statement-breakpoint
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "rentals" DROP CONSTRAINT "rentals_owner_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_id_auth.users_id_fk";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_role_id_roles_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "rentals" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_rental_id_rentals_id_fk" FOREIGN KEY ("rental_id") REFERENCES "public"."rentals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rentals" ADD CONSTRAINT "rentals_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;