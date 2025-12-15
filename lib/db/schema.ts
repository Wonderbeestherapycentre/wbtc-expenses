import { pgTable, serial, text, timestamp, uuid, integer, boolean, decimal, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["ADMIN", "USER"]);

export const families = pgTable("families", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: roleEnum("role").default("USER").notNull(),
    familyId: uuid("family_id").references(() => families.id),
    color: text("color").default("#3b82f6"), // For UI avatar
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    familyId: uuid("family_id").references(() => families.id), // Nullable = System Default? Or all custom? Let's check req.
    // Req says "Default categories ... Admin can add/edit". 
    // Let's assume familyId null = System Default.
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const budgets = pgTable("budgets", {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id").references(() => categories.id).notNull(),
    familyId: uuid("family_id").references(() => families.id).notNull(),
    monthlyLimit: decimal("monthly_limit", { precision: 15, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactionTypeEnum = pgEnum("transaction_type", ["EXPENSE", "INCOME"]);

export const expenses = pgTable("expenses", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    familyId: uuid("family_id").references(() => families.id, { onDelete: "cascade" }).notNull(),
    categoryId: uuid("category_id").references(() => categories.id).notNull(),
    amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
    description: text("description"),
    date: timestamp("date").notNull(),
    type: transactionTypeEnum("type").default("EXPENSE").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const familiesRelations = relations(families, ({ many }) => ({
    users: many(users),
    expenses: many(expenses),
    categories: many(categories),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
    family: one(families, {
        fields: [users.familyId],
        references: [families.id],
    }),
    expenses: many(expenses),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
    user: one(users, {
        fields: [expenses.userId],
        references: [users.id],
    }),
    category: one(categories, {
        fields: [expenses.categoryId],
        references: [categories.id],
    }),
    family: one(families, {
        fields: [expenses.familyId],
        references: [families.id],
    }),
}));
