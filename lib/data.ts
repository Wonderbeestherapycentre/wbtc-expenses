import { db } from "./db";
import { expenses, users, categories, children, staffs } from "./db/schema";

import { eq, desc, asc, and, gte, lte, sql } from "drizzle-orm";
import { auth } from "@/auth";

interface ExpenseFilters {
    categoryId?: string;
    childId?: string;
    staffId?: string;
    startDate?: Date;
    endDate?: Date;
    type?: "EXPENSE" | "INCOME" | "DUE";
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
    if (filters?.childId) {
        conditions.push(eq(expenses.childId, filters.childId));
    }
    if (filters?.staffId) {
        conditions.push(eq(expenses.staffId, filters.staffId));
    }
    if (filters?.startDate) {
        conditions.push(gte(expenses.date, filters.startDate));
    }
    if (filters?.endDate) {
        conditions.push(lte(expenses.date, filters.endDate));
    }
    if (filters?.type) {
        conditions.push(eq(expenses.type, filters.type));
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
            child: true, // Fetch child relation
            staff: true // Fetch staff relation
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
        staffId: e.staffId,
        staffName: e.staff?.name, // Map staff name
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

export async function fetchStats(startDate?: Date, endDate?: Date, childId?: string, staffId?: string) {
    // We should probably optimize this with DB aggregation, but for now:
    const { data: all } = await fetchExpenses(undefined, { startDate, endDate, childId, staffId }); // Fetches filtered transactions

    let totalExpenses = 0;
    let totalIncome = 0;
    let totalDue = 0;
    let dueCount = 0;
    const byCategory: Record<string, number> = {};
    const incomeByCategory: Record<string, number> = {};
    const incomeByMember: Record<string, number> = {};
    const expenseByMember: Record<string, number> = {};

    all.forEach(e => {
        const val = Number(e.amount);
        const userName = e.user?.name || "Unknown";
        const catName = e.category || "Uncategorized";

        if (e.type === "INCOME") {
            totalIncome += val;
            incomeByMember[userName] = (incomeByMember[userName] || 0) + val;
            incomeByCategory[catName] = (incomeByCategory[catName] || 0) + val;
        } else if (e.type === "DUE") {
            totalDue += val;
            dueCount++;
        } else {
            totalExpenses += val;
            byCategory[catName] = (byCategory[catName] || 0) + val;
            expenseByMember[userName] = (expenseByMember[userName] || 0) + val;
        }
    });

    return {
        totalExpenses,
        totalIncome,
        totalDue,
        dueCount,
        balance: totalIncome - totalExpenses,
        byCategory, // Expenses by category
        incomeByCategory, // Income by category
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
        orderBy: [asc(children.name)]
    });

    return data;
}

export async function fetchChildrenPaginated(page: number, limit: number, includeInactive = true) {
    const session = await auth();
    if (!session?.user?.familyId) return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };

    const conditions = [eq(children.familyId, session.user.familyId)];
    if (!includeInactive) {
        conditions.push(eq(children.status, "ACTIVE"));
    }

    // Get Total Count
    const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(children)
        .where(and(...conditions));
    const totalCount = Number(countResult.count);

    const offset = (page - 1) * limit;

    const data = await db.query.children.findMany({
        where: and(...conditions),
        orderBy: [asc(children.name)],
        limit: limit,
        offset: offset
    });

    return {
        data,
        meta: {
            total: totalCount,
            page: page,
            limit: limit,
            totalPages: Math.ceil(totalCount / limit)
        }
    };
}

export async function fetchChild(id: string) {
    const session = await auth();
    if (!session?.user?.familyId) return null;

    const child = await db.query.children.findFirst({
        where: and(
            eq(children.id, id),
            eq(children.familyId, session.user.familyId)
        )
    });

    return child || null;
}

export async function fetchStaffs(includeInactive = false) {
    const session = await auth();
    if (!session?.user?.familyId) return [];

    const conditions = [eq(staffs.familyId, session.user.familyId)];
    if (!includeInactive) {
        conditions.push(eq(staffs.status, "ACTIVE"));
    }

    const data = await db.query.staffs.findMany({
        where: and(...conditions),
        orderBy: [asc(staffs.name)]
    });

    return data;
}

export async function fetchStaff(id: string) {
    const session = await auth();
    if (!session?.user?.familyId) return null;

    const staff = await db.query.staffs.findFirst({
        where: and(
            eq(staffs.id, id),
            eq(staffs.familyId, session.user.familyId)
        )
    });

    return staff || null;
}
