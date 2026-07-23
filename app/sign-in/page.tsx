"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useAuth } from "../components/portal/AuthContext";

function SignInForm() {
  const { signIn, user, hydrated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/portal";

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [error, setError] = useState("");

  // Already signed in and landed here anyway (e.g. typed the URL) — no reason to show the form.
  useEffect(() => {
    if (hydrated && user) router.replace(redirectTo);
  }, [hydrated, user, redirectTo, router]);

  if (hydrated && user) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !email.includes("@")) {
      setError("Enter your name and a valid email to continue.");
      return;
    }
    signIn(name.trim(), email.trim());
    router.push(redirectTo);
  }

  return (
    <div className="mx-auto max-w-sm w-full px-inset py-20">
      <span className="text-xs font-semibold uppercase tracking-wider text-text-faint">Donor portal</span>
      <h1 className="mt-3 text-lg font-sans font-normal tracking-tight text-text">Sign in to your portal</h1>
      <p className="mt-3 text-xs text-text-muted">
        Track institutions and named funds, and keep your chat history across visits. This is a demo sign-in — no
        password, no email is sent, and everything is stored only in this browser.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-xs text-text-muted">
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jordan Alumni"
            className="rounded border border-border bg-white px-3 py-2 text-xs text-text placeholder:text-text-faint focus:outline-none focus:border-text"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-xs text-text-muted">
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jordan@example.com"
            type="email"
            className="rounded border border-border bg-white px-3 py-2 text-xs text-text placeholder:text-text-faint focus:outline-none focus:border-text"
          />
        </label>

        {error && <p className="text-xs text-[#d03b3b]">{error}</p>}

        <button
          type="submit"
          className="mt-2 rounded-full cursor-pointer bg-text text-text-invert border border-white/10 px-5 py-2 text-xs font-medium hover:brightness-125 transition-all"
        >
          Continue to portal
        </button>
      </form>

      <p className="mt-6 text-xs text-text-faint">
        Just here to browse a report?{" "}
        <Link href="/report" className="text-text underline underline-offset-2 hover:text-brand">
          Continue as a guest
        </Link>{" "}
        — no sign-in needed.
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col font-sans bg-background text-foreground">
      <Navbar />
      <main id="main-content" className="flex flex-1 flex-col items-center bg-surface">
        <Suspense fallback={null}>
          <SignInForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
