ALTER TABLE "roles" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "roles" CASCADE;--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "role_id" TO "full_name";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_role_id_roles_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_url" text;