import { handlers } from "@/auth";

export const { GET, POST } = handlers;
// Oops, NextAuth v5Beta exports { handlers: { GET, POST }, auth, signIn, signOut } usually
// Let's check auth.ts export.
