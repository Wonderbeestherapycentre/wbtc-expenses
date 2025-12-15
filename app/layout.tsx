import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { ExpenseProvider } from "@/lib/context";
import { auth } from "@/auth";
import { User } from "@/lib/types";

export const metadata: Metadata = {
  title: "VR Expense Tracker",
  description: "Track your expenses easily",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  // Map session user to app User type
  const initialUser: User | undefined = session?.user
    ? {
      id: session.user.id || "guest",
      name: session.user.name || "Guest",
      color: (session.user as any).color || "#3b82f6", // Default blue if missing (though we patched it)
      avatar: session.user.image || undefined,
    }
    : undefined;
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-gray-100 transition-colors duration-300`}
      >
        <ExpenseProvider initialUser={initialUser}>
          <Toaster
            position="top-right"
            richColors
            closeButton
            visibleToasts={3}
            toastOptions={{
              classNames: {
                toast: "bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-gray-200 dark:border-neutral-800 shadow-xl rounded-xl p-4",
                description: "text-gray-500 dark:text-gray-400 mt-1 text-sm font-medium",
                actionButton: "bg-red-500 hover:bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg transition-transform hover:scale-105 shadow-sm",
                cancelButton: "bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-gray-100 font-medium px-3 py-1.5 rounded-lg",
                title: "text-base font-bold text-gray-900 dark:text-white",
              },
            }}
          />
          {children}
        </ExpenseProvider>
      </body>
    </html>
  );
}
