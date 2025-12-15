import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard") || nextUrl.pathname.startsWith("/expenses") || nextUrl.pathname.startsWith("/settings") || nextUrl.pathname.startsWith("/profile");
            const isOnHome = nextUrl.pathname === "/";
            const isOnRegister = nextUrl.pathname.startsWith("/register");

            if (isOnHome || isOnRegister) {
                if (isLoggedIn && isOnHome) return Response.redirect(new URL("/dashboard", nextUrl));
                return true; // Allow access to login/register
            }

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page (which is now /)
            }

            // Default protection for other routes? Or allow?
            // Let's assume everything else is protected if not explicitly allowed above?
            // Actually, nextUrl.pathname.startsWith("/") matches everything.
            // Let's simplify:
            // If logged in, and on root, go to dashboard.
            // If not logged in, and on protected route, go to root.

            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id!;
                // @ts-ignore - we know our schema
                token.role = user.role;
                // @ts-ignore
                token.familyId = user.familyId;
                // @ts-ignore
                token.color = user.color;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.familyId = token.familyId;
                // @ts-ignore
                session.user.color = token.color as string;
            }
            return session;
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
