import NextAuth, { type DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            id: string
            role: "ADMIN" | "USER"
            familyId?: string | null
        } & DefaultSession["user"]
    }
}

import { JWT } from "next-auth/jwt"

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: "ADMIN" | "USER"
        familyId?: string | null
    }
}
