export type RecentChat = {
  institutionSlug: string;
  year: number;
  lastMessage: string;
  lastActivity: number;
};

/** Scans localStorage for this user's chat threads that have more than just the greeting. */
export function getRecentChats(email: string, limit = 6): RecentChat[] {
  if (typeof window === "undefined") return [];
  const prefix = `pass-impact:chat:${email}:`;
  const results: RecentChat[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(prefix)) continue;

    const rest = key.slice(prefix.length); // "institutionSlug:year"
    const lastColon = rest.lastIndexOf(":");
    if (lastColon === -1) continue;
    const institutionSlug = rest.slice(0, lastColon);
    const year = Number(rest.slice(lastColon + 1));
    if (!institutionSlug || Number.isNaN(year)) continue;

    try {
      const messages = JSON.parse(localStorage.getItem(key) ?? "[]") as { id: number; role: string; text: string }[];
      if (!Array.isArray(messages) || messages.length <= 1) continue; // greeting only — not a real conversation
      const last = messages[messages.length - 1];
      results.push({ institutionSlug, year, lastMessage: last.text, lastActivity: last.id });
    } catch {
      // skip malformed entries
    }
  }

  return results.sort((a, b) => b.lastActivity - a.lastActivity).slice(0, limit);
}
