
import * as dotenv from "dotenv";
dotenv.config();

import { db } from "./lib/db/index";
import { categories } from "./lib/db/schema";
import { eq } from "drizzle-orm";

const DEFAULT_CATEGORIES = ["Food", "Transport", "Utilities", "Entertainment", "Health", "Shopping", "Housing", "Education"];

async function main() {
    console.log("Seeding Categories...");

    // We can insert them as "Global" categories (familyId: null) or per-family.
    // Schema says: familyId: uuid("family_id").references(() => families.id),
    // If we make familyId nullable in schema (it is implicitly nullable unless .notNull() is called), 
    // let's check schema again.

    // Schema: familyId: uuid("family_id").references(() => families.id)
    // It is NOT marked .notNull(). So it can be null.
    // We will treat null familyId as System Default Categories.

    for (const name of DEFAULT_CATEGORIES) {
        // Check if exists
        // Note: We need to handle case where multiple 'Food' exist for different families.
        // We only care about global ones here.
        const existing = await db.query.categories.findFirst({
            where: (categories, { and, isNull }) =>
                and(eq(categories.name, name), isNull(categories.familyId))
        });

        if (!existing) {
            console.log(`Creating category: ${name}`);
            await db.insert(categories).values({
                name,
                familyId: null
            });
        } else {
            console.log(`Skipping ${name} (already exists)`);
        }
    }

    console.log("Done.");
    process.exit(0);
}

main();
