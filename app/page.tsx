"use client";

import { useActionState } from "react";
import { authenticate } from "@/lib/actions";


import NextImage from "next/image";
import card1 from "./assets/1.jpeg";
import card2 from "./assets/2.jpeg";
import card3 from "./assets/3.jpeg";
export default function LoginPage() {
  const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black p-4 relative overflow-hidden">
      {/* Background Decorations */}
      {/* Background Decorations: Gallery of Empty Cards */}
      <div className="absolute inset-0 overflow-hidden opacity-20 dark:opacity-10 pointer-events-none">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 -rotate-12 scale-110 transform origin-center animate-pulse-slow">
          {/* Column 1 */}
          <div className="space-y-4 -mt-32">
            <div className="h-32 relative rounded-xl w-full overflow-hidden">
              <NextImage src={card3} alt="Card Design" fill className="object-cover" placeholder="blur" />
            </div>
            <div className="h-48 relative rounded-xl w-full overflow-hidden">
              <NextImage src={card2} alt="Card Design" fill className="object-cover" placeholder="blur" />
            </div>
            <div className="h-40 relative rounded-xl w-full overflow-hidden">
              <NextImage src={card1} alt="Card Design" fill className="object-cover" placeholder="blur" />
            </div>
            <div className="h-48 relative rounded-xl w-full overflow-hidden">
              <NextImage src={card2} alt="Card Design" fill className="object-cover" placeholder="blur" />
            </div>
            <div className="h-48 relative rounded-xl w-full overflow-hidden">
              <NextImage src={card3} alt="Card Design" fill className="object-cover" placeholder="blur" />
            </div>
          </div>
          {/* Column 2 */}
          <div className="space-y-4 -mt-48">
            <div className="h-40 relative rounded-xl w-full overflow-hidden">
              <NextImage src={card1} alt="Card Design" fill className="object-cover" placeholder="blur" />
            </div>
            <div className="h-56 relative rounded-xl w-full overflow-hidden">
              <NextImage src={card2} alt="Card Design" fill className="object-cover" placeholder="blur" />
            </div>
            <div className="h-32 relative rounded-xl w-full overflow-hidden">
              <NextImage src={card3} alt="Card Design" fill className="object-cover" placeholder="blur" />
            </div>
            <div className="h-48 relative rounded-xl w-full overflow-hidden">
              <NextImage src={card3} alt="Card Design" fill className="object-cover" placeholder="blur" />
            </div>
            <div className="h-40 relative rounded-xl w-full overflow-hidden">
              <NextImage src={card1} alt="Card Design" fill className="object-cover" placeholder="blur" />
            </div>
          </div>
          {/* Column 3 */}
          <div className="space-y-4 hidden md:block">
            <div className="h-32 relative rounded-xl w-full overflow-hidden">
              <NextImage src={card2} alt="Card Design" fill className="object-cover" placeholder="blur" />
            </div>
            <div className="h-48 relative rounded-xl w-full overflow-hidden">
              <NextImage src={card1} alt="Card Design" fill className="object-cover" placeholder="blur" />
            </div>
            <div className="h-64 relative rounded-xl w-full overflow-hidden">
              <NextImage src={card2} alt="Card Design" fill className="object-cover" placeholder="blur" />
            </div>
            <div className="h-24 relative rounded-xl w-full overflow-hidden">
              <NextImage src={card3} alt="Card Design" fill className="object-cover" placeholder="blur" />
            </div>
          </div>
          {/* Column 4 */}
          <div className="space-y-4 mt-8 hidden md:block">
            <div className="h-40 relative rounded-xl w-full overflow-hidden">
              <NextImage src={card1} alt="Card Design" fill className="object-cover" placeholder="blur" />
            </div>
            <div className="h-24 relative rounded-xl w-full overflow-hidden">
              <NextImage src={card2} alt="Card Design" fill className="object-cover" placeholder="blur" />
            </div>
            <div className="h-56 relative rounded-xl w-full overflow-hidden">
              <NextImage src={card3} alt="Card Design" fill className="object-cover" placeholder="blur" />
            </div>
            <div className="h-32 relative rounded-xl w-full overflow-hidden">
              <NextImage src={card1} alt="Card Design" fill className="object-cover" placeholder="blur" />
            </div>
            <div className="h-48 relative rounded-xl w-full overflow-hidden">
              <NextImage src={card2} alt="Card Design" fill className="object-cover" placeholder="blur" />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md p-8 glass-card rounded-2xl relative z-10 animate-fade-in">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Sign in to manage your expenses</p>
        </div>

        <form action={dispatch} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Email Address</label>
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white/50 dark:bg-neutral-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">Password</label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white/50 dark:bg-neutral-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            {isPending ? "Logging in..." : "Sign In"}
          </button>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm text-center border border-red-100 dark:border-red-900/30">
              {errorMessage}
            </div>
          )}
        </form>

        {/* <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
            Create one
          </a>
        </p> */}
      </div>
    </div>
  );
}
