import { defineConfig } from "drizzle-kit";

const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    // database: "postgres",
    // port: 5432,
    // host: "db.nuamybopwmunwxwmrzgs.supabase.co",
    // user: "postgres",
    // password: process.env.PW,
  },
});
