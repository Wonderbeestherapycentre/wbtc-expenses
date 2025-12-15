import { db } from "./db";
import { expenses, users, categories, children } from "./db/schema";

import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { auth } from "@/auth";

interface ExpenseFilters {
    categoryId?: string;
    startDate?: Date;
    endDate?: Date;
}

export async function fetchExpenses(limit?: number, filters?: ExpenseFilters, page?: number) {
    const session = await auth();
    if (!session?.user?.familyId) return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };

    const conditions = [eq(expenses.familyId, session.user.familyId)];

    // Role-based access control: Non-admins only see their own data
    if (session.user.role !== "ADMIN") {
        conditions.push(eq(expenses.userId, session.user.id));
    }

    console.log("Fetching expenses with filters:", filters);

    if (filters?.categoryId && filters.categoryId !== "all") {
        conditions.push(eq(expenses.categoryId, filters.categoryId));
    }
    if (filters?.startDate) {
        conditions.push(gte(expenses.date, filters.startDate));
    }
    if (filters?.endDate) {
        conditions.push(lte(expenses.date, filters.endDate));
    }

    // Get Total Count for Pagination
    const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(expenses)
        .where(and(...conditions));
    const totalCount = Number(countResult.count);

    const pageSize = limit || (page ? 10 : undefined);
    const offset = page ? (page - 1) * (pageSize || 10) : 0;

    const data = await db.query.expenses.findMany({
        where: and(...conditions),
        orderBy: [desc(expenses.date), desc(expenses.createdAt)],
        limit: pageSize,
        offset: offset,
        with: {
            user: true,
            category: true,
            child: true // Fetch child relation
        }
    });

    // Map to application Expense type
    const mappedData = data.map(e => ({
        id: e.id,
        amount: parseFloat(e.amount),
        date: e.date,
        description: e.description,
        category: e.category?.name || "Uncategorized",
        categoryId: e.categoryId,
        childId: e.childId,
        childName: e.child?.name, // Map child name
        userId: e.userId,
        type: e.type,
        user: e.user
    }));

    return {
        data: mappedData,
        meta: {
            total: totalCount,
            page: page || 1,
            limit: pageSize || totalCount,
            totalPages: pageSize ? Math.ceil(totalCount / pageSize) : 1
        }
    };
}

export async function fetchStats(startDate?: Date, endDate?: Date) {
    // We should probably optimize this with DB aggregation, but for now:
    const { data: all } = await fetchExpenses(undefined, { startDate, endDate }); // Fetches filtered transactions

    let totalExpenses = 0;
    let totalIncome = 0;
    const byCategory: Record<string, number> = {};
    const incomeByMember: Record<string, number> = {};
    const expenseByMember: Record<string, number> = {};

    all.forEach(e => {
        const val = Number(e.amount);
        const userName = e.user?.name || "Unknown";

        if (e.type === "INCOME") {
            totalIncome += val;
            incomeByMember[userName] = (incomeByMember[userName] || 0) + val;
        } else {
            totalExpenses += val;
            const catName = e.category || "Uncategorized";
            byCategory[catName] = (byCategory[catName] || 0) + val;
            expenseByMember[userName] = (expenseByMember[userName] || 0) + val;
        }
    });

    return {
        totalExpenses,
        totalIncome,
        balance: totalIncome - totalExpenses,
        byCategory,
        incomeByMember,
        expenseByMember
    };
}

export async function fetchUsers() {
    const session = await auth();
    if (!session?.user?.familyId) return [];

    const familyUsers = await db.query.users.findMany({
        where: eq(users.familyId, session.user.familyId),
        orderBy: [desc(users.createdAt)]
    });

    return familyUsers.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        color: u.color,
        avatar: undefined // Schema doesn't have avatar yet, using color
    }));
}

export async function fetchCategories() {
    const session = await auth();

    if (!session?.user?.familyId) return [];

    const data = await db.query.categories.findMany({
        where: eq(categories.familyId, session.user.familyId),
        orderBy: [desc(categories.name)]
    });

    return data.map(c => ({
        id: c.id,
        name: c.name,
        isSystem: !c.familyId // Helper for UI to disable edit/delete
    }));
}

export async function fetchChildren(includeInactive = false) {
    const session = await auth();
    if (!session?.user?.familyId) return [];

    const conditions = [eq(children.familyId, session.user.familyId)];
    if (!includeInactive) {
        conditions.push(eq(children.status, "ACTIVE"));
    }

    const data = await db.query.children.findMany({
        where: and(...conditions),
        orderBy: [desc(children.createdAt)]
    });

    return data;
}
