import { isTransientDbError } from "./apiError";

/**
 * Retries a Prisma call a couple of times, but only when the failure looks like
 * a transient connection blip (Neon waking from a cold start, a dropped pooler
 * connection, etc). Real query errors (bad input, unique violations, not found)
 * fail immediately — retrying those would just waste time and can't help.
 */
export async function withDbRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isTransientDbError(error) || attempt === attempts - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }
  throw lastError;
}
