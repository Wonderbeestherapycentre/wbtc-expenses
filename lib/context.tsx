"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Expense, User, Period } from "./types";
import { store, USERS } from "./store";

interface ExpenseContextType {
    expenses: Expense[];
    users: User[];
    currentUser: User;
    period: Period;
    currentDate: Date; // The reference date for the period (e.g. "today" or a specific month)
    addExpense: (expense: Omit<Expense, "id" | "userId">) => void;
    setCurrentUser: (user: User) => void;
    setPeriod: (period: Period) => void;
    setCurrentDate: (date: Date) => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({
    children,
    initialUser
}: {
    children: React.ReactNode;
    initialUser?: User;
}) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [currentUser, setCurrentUser] = useState<User>(initialUser || USERS[0]);
    const [period, setPeriod] = useState<Period>("week");
    const [currentDate, setCurrentDate] = useState<Date>(new Date());

    useEffect(() => {
        // Load initial mock data
        setExpenses(store.getExpenses());

        // If initialUser is provided, ensure it's set (useful if it changes or on hydration)
        if (initialUser) {
            setCurrentUser(initialUser);
        }
    }, [initialUser]);

    const addExpense = (data: Omit<Expense, "id" | "userId">) => {
        const newExpense = store.addExpense({
            ...data,
            userId: currentUser.id,
        });
        setExpenses(store.getExpenses()); // Refresh list
    };

    return (
        <ExpenseContext.Provider
            value={{
                expenses,
                users: USERS,
                currentUser,
                period,
                currentDate,
                addExpense,
                setCurrentUser,
                setPeriod,
                setCurrentDate,
            }}
        >
            {children}
        </ExpenseContext.Provider>
    );
}

export function useExpenses() {
    const context = useContext(ExpenseContext);
    if (context === undefined) {
        throw new Error("useExpenses must be used within an ExpenseProvider");
    }
    return context;
}
