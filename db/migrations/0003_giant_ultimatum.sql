CREATE TABLE "auth.users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	CONSTRAINT "auth.users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_role_id_roles_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_id_auth.users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."auth.users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "password_hash";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "name";