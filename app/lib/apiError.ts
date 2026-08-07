import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

// Prisma error codes that mean "couldn't reach/keep the connection to the DB" —
// on serverless Postgres (Neon) these are usually a cold-start blip, not a real
// failure, so they're worth retrying and worth telling the client to retry too.
const TRANSIENT_PRISMA_CODES = new Set(["P1001", "P1002", "P1008", "P1017"]);

export function isTransientDbError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) return true;
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return TRANSIENT_PRISMA_CODES.has(error.code);
  }
  return false;
}

/**
 * Turns any thrown error into a safe JSON response — full detail always goes to
 * the server log via `context`, but the client only ever sees a generic message.
 * Never forwards `error.message` directly: raw Prisma errors can contain the
 * database hostname, which has no business reaching a browser.
 *
 * `field` lets a route match its existing response shape (most use `error`;
 * the auth routes were already shipping `message` before this existed).
 */
export function apiError(error: unknown, context: string, field: "error" | "message" = "error") {
  console.error(`[${context}]`, error);

  if (isTransientDbError(error)) {
    return NextResponse.json(
      { [field]: "We're having trouble reaching the database. Please try again in a moment." },
      { status: 503 }
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json({ [field]: "That record already exists." }, { status: 409 });
    }
    if (error.code === "P2025") {
      return NextResponse.json({ [field]: "Record not found." }, { status: 404 });
    }
  }

  return NextResponse.json({ [field]: "Something went wrong. Please try again." }, { status: 500 });
}
