import db from "../index"; // Adjust the import based on your setup
import { roles } from "../schema"; // Import your roles table
import { eq } from "drizzle-orm";

// Define the roles you want to insert
const roleData = [
  { name: "superadmin" },
  { name: "admin" },
  { name: "host" },
  { name: "customer" },
];

async function seedRoles() {
  // Check if roles already exist
  const existingRoles = await db.select().from(roles);
  if (existingRoles.length > 0) {
    console.log("Roles already exist. Skipping seeding.");
    return;
  }

  // Insert the roles into the database
  await db.insert(roles).values(roleData);
  console.log("Roles seeded successfully!");
}

seedRoles();
