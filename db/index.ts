import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

const client = postgres(connectionString!, { prepare: false });
const db = drizzle(client);

export default db;
