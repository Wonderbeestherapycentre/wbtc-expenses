"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { db } from "./db";
import { users, families, expenses, categories, roleEnum } from "./db/schema";
import bcrypt from "bcryptjs";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        const credentials = Object.fromEntries(formData);
        await signIn("credentials", { ...credentials, redirectTo: "/dashboard" });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Invalid credentials.";
                default:
                    return "Something went wrong.";
            }
        }
        throw error;
    }
}

export async function signOutAction() {
    await signOut({ redirectTo: "/" });
}

export async function register(prevState: string | undefined, formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const familyName = formData.get("familyName") as string; // Optional: if creating new family

    if (!email || !password || !name) return "Missing fields";

    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (existingUser) return "User already exists";

    const hashedPassword = await bcrypt.hash(password, 10);

    // Transaction ideally
    let familyId: string | null = null;

    // Logic: First user creates a family? Or join? Simplified: Create new Family for now.
    // Real app needs "Invite Code".
    if (familyName) {
        const [newFamily] = await db.insert(families).values({ name: familyName }).returning();
        familyId = newFamily.id;
    }

    await db.insert(users).values({
        name,
        email,
        passwordHash: hashedPassword,
        role: familyId ? "ADMIN" : "USER", // Creator is Admin
        familyId: familyId,
    });

    // Automatically sign in? Or redirect to login
    return "Success";
}

export async function createUser(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return { message: "Unauthorized" };

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as "ADMIN" | "USER";

    if (!name || !email || !password || !role) return { message: "Missing fields" };

    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (existingUser) return { message: "User already exists" };

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(users).values({
        name,
        email,
        passwordHash: hashedPassword,
        role,
        familyId: session.user.familyId,
    });

    revalidatePath("/settings");
    return { message: "User created" };
}

export async function addExpenseAction(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id || !session.user.familyId) return { message: "Unauthorized" };

    const amount = parseFloat(formData.get("amount") as string);
    const description = (formData.get("description") as string) || "";
    const categoryName = formData.get("category") as string;
    const dateStr = formData.get("date") as string;
    const type = (formData.get("type") as "EXPENSE" | "INCOME") || "EXPENSE";

    if (!amount || !categoryName || !dateStr) {
        return { message: "Missing fields" };
    }

    // Find category: Prefer family specific, fall back to global
    // Since we seeded null familyId, we look for that.
    const category = await db.query.categories.findFirst({
        where: (categories, { and, or, eq, isNull }) => or(
            and(eq(categories.name, categoryName), eq(categories.familyId, session.user.familyId as string)),
            and(eq(categories.name, categoryName), isNull(categories.familyId))
        ),
        orderBy: (categories, { desc }) => [desc(categories.familyId)] // Prefer family specific (not null) if exists
    });

    if (!category) {
        return { message: "Invalid category" };
    }

    await db.insert(expenses).values({
        userId: session.user.id,
        familyId: session.user.familyId,
        categoryId: category.id,
        amount: amount.toString(), // DB expects decimal/string
        description,
        date: new Date(dateStr),
        type,
    });

    revalidatePath("/");
    revalidatePath("/expenses");
    return { message: "Transaction added" };
}

export async function deleteUser(userId: string) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return { message: "Unauthorized" };

    // Prevent self-deletion
    if (userId === session.user.id) return { message: "Cannot delete yourself" };

    await db.delete(users).where(eq(users.id, userId));
    revalidatePath("/settings");
    return { message: "User deleted" };
}

export async function updateUser(userId: string, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.id !== userId) {
        return { message: "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as "ADMIN" | "USER";

    if (!name || !email) return { message: "Missing fields" };

    // Only Admin can change roles
    const updateData: any = { name, email };
    if (session.user.role === "ADMIN" && role) {
        updateData.role = role;
    }

    await db.update(users)
        .set(updateData)
        .where(eq(users.id, userId));

    revalidatePath("/settings");
    return { message: "User updated" };
}

// --- Category Actions ---
export async function createCategory(formData: FormData) {
    const session = await auth();
    if (!session?.user?.familyId) return { message: "Unauthorized" };

    const name = formData.get("name") as string;
    if (!name) return { message: "Name is required" };

    await db.insert(categories as any).values({ // Type cast if schema issue, but should be fine
        name,
        familyId: session.user.familyId
    });

    revalidatePath("/settings");
    return { message: "Category created" };
}

export async function updateCategory(id: string, formData: FormData) {
    const session = await auth();
    if (!session?.user?.familyId) return { message: "Unauthorized" };

    const name = formData.get("name") as string;
    if (!name) return { message: "Name is required" };

    // Ensure category belongs to family (and not system default)
    const category = await db.query.categories.findFirst({
        where: and(eq(categories.id, id), eq(categories.familyId, session.user.familyId))
    });

    if (!category) return { message: "Cannot edit this category" };

    await db.update(categories).set({ name }).where(eq(categories.id, id));
    revalidatePath("/settings");
    revalidatePath("/");
    revalidatePath("/expenses");
    return { message: "Category updated" };
}

export async function deleteCategory(id: string) {
    const session = await auth();
    if (!session?.user?.familyId) return { message: "Unauthorized" };

    // Ensure category belongs to family
    const category = await db.query.categories.findFirst({
        where: and(eq(categories.id, id), eq(categories.familyId, session.user.familyId))
    });

    if (!category) return { message: "Cannot delete this category" };

    // Check usage? For MVP let's allow (DB might throw foreign key error if used)
    try {
        await db.delete(categories).where(eq(categories.id, id));
    } catch (e) {
        return { message: "Cannot delete category in use" };
    }

    revalidatePath("/settings");
    revalidatePath("/");
    revalidatePath("/expenses");
    return { message: "Category deleted" };
}

// --- Expense Actions --- (Update/Delete)
export async function deleteExpense(id: string) {
    const session = await auth();
    if (!session?.user?.familyId) return { message: "Unauthorized" };

    const expense = await db.query.expenses.findFirst({
        where: and(eq(expenses.id, id), eq(expenses.familyId, session.user.familyId))
    });

    if (!expense) return { message: "Expense not found" };

    await db.delete(expenses).where(eq(expenses.id, id));
    revalidatePath("/");
    revalidatePath("/expenses");
    return { message: "Expense deleted" };
}

export async function updateExpense(id: string, formData: FormData) {
    const session = await auth();
    if (!session?.user?.familyId) return { message: "Unauthorized" };

    const amount = parseFloat(formData.get("amount") as string);
    const description = (formData.get("description") as string) || "";
    const categoryName = formData.get("category") as string;
    const dateStr = formData.get("date") as string;
    const categoryId = formData.get("categoryId") as string; // Ideally use ID if possible, but we use name in other flow.
    const type = (formData.get("type") as "EXPENSE" | "INCOME") || "EXPENSE";

    if (!amount || !dateStr) {
        return { message: "Missing fields" };
    }

    // Resolve Category ID
    let finalCategoryId = categoryId;
    if (!finalCategoryId && categoryName) {
        // Logic same as addExpense: find category by name
        const category = await db.query.categories.findFirst({
            where: (categories, { and, or, eq, isNull }) => or(
                and(eq(categories.name, categoryName), eq(categories.familyId, session.user.familyId as string)),
                and(eq(categories.name, categoryName), isNull(categories.familyId))
            ),
            orderBy: (categories, { desc }) => [desc(categories.familyId)]
        });
        if (category) finalCategoryId = category.id;
    }

    if (!finalCategoryId) return { message: "Invalid category" };

    await db.update(expenses).set({
        amount: amount.toString(),
        description,
        date: new Date(dateStr),
        categoryId: finalCategoryId,
        type,
    }).where(and(eq(expenses.id, id), eq(expenses.familyId, session.user.familyId)));

    revalidatePath("/");
    revalidatePath("/expenses");
    return { message: "Transaction updated" };
}

export async function updatePassword(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return "Unauthorized";

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return "All fields are required";
    }

    if (newPassword !== confirmPassword) {
        return "New passwords do not match";
    }

    if (newPassword.length < 6) {
        return "Password must be at least 6 characters";
    }

    // Verify current password
    const user = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
    });

    if (!user) return "User not found";

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
        return "Incorrect current password";
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.update(users)
        .set({ passwordHash: hashedPassword })
        .where(eq(users.id, session.user.id));

    return "Success";
}
