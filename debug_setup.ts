
import * as dotenv from "dotenv";
dotenv.config();

// Imports after config
import { db } from "./lib/db/index"; // Explicit path
import { users } from "./lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Checking Environment...");
    console.log("AUTH_SECRET exists:", !!process.env.AUTH_SECRET);
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);

    // Masked DB URL for debugging safe output
    if (process.env.DATABASE_URL) {
        console.log("DATABASE_URL starts with:", process.env.DATABASE_URL.substring(0, 15) + "...");
    }

    console.log("Checking User...");
    const email = "velliesgce113@gmail.com";
    try {
        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });
        if (user) {
            console.log("User found:", user.email, "Role:", user.role);
            console.log("Password Hash starts with:", user.passwordHash.substring(0, 10));
        } else {
            console.log("User NOT found:", email);
        }
    } catch (e) {
        console.error("Database Error:", e);
    }
    process.exit(0);
}

main();
