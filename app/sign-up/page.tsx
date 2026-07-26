"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, useSession, getSession } from "next-auth/react";
import { Navbar } from "../components/Navbar";

// Admins live in the admin console; everyone else lives in the donor portal.
const homeFor = (role?: string) => (role === "ADMIN" ? "/admin/extract" : "/portal");

function SignUpForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(redirectParam || homeFor(session?.user?.role));
    }
  }, [status, session, redirectParam, router]);

  if (status === "loading" || status === "authenticated") {
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !email.includes("@") || !password) {
      setError("Please fill in all fields correctly.");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // Create user
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

      if (!registerRes.ok) {
        const data = await registerRes.json();
        throw new Error(data.message || "Failed to register");
      }

      // Automatically sign in
      const signInRes = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        setError("Account created, but failed to log in automatically.");
      } else {
        const fresh = await getSession();
        router.push(redirectParam || homeFor(fresh?.user?.role));
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm w-full px-inset py-20">
      <span className="text-xs font-semibold uppercase tracking-wider text-text-faint">Join Pass Impact</span>
      <h1 className="mt-3 text-lg font-sans font-normal tracking-tight text-text">Create an account</h1>
      <p className="mt-3 text-xs text-text-muted">
        Save your favorite universities, track endowments, and chat with AI about impact.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-xs text-text-muted">
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jordan Alumni"
            disabled={loading}
            className="rounded border border-border bg-white px-3 py-2 text-xs text-text placeholder:text-text-faint focus:outline-none focus:border-text"
          />
        </label>
        
        <label className="flex flex-col gap-1.5 text-xs text-text-muted">
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="donor@example.com"
            type="email"
            disabled={loading}
            className="rounded border border-border bg-white px-3 py-2 text-xs text-text placeholder:text-text-faint focus:outline-none focus:border-text"
          />
        </label>
        
        <label className="flex flex-col gap-1.5 text-xs text-text-muted">
          Password
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            disabled={loading}
            className="rounded border border-border bg-white px-3 py-2 text-xs text-text placeholder:text-text-faint focus:outline-none focus:border-text"
          />
        </label>

        {error && <p className="text-xs text-[#d03b3b]">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-full cursor-pointer bg-text text-text-invert border border-white/10 px-5 py-2 text-xs font-medium hover:brightness-125 transition-all disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <p className="mt-6 text-xs text-text-faint">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-text underline underline-offset-2 hover:text-brand">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col font-sans bg-background text-foreground">
      <Navbar />
      <main id="main-content" className="flex flex-1 flex-col items-center bg-surface">
        <Suspense fallback={null}>
          <SignUpForm />
        </Suspense>
      </main>
    </div>
  );
}
