import { useEffect, useState } from "react";
import axiosInstance from "../lib/axiosInstance";

export type RecentChat = {
  institutionSlug: string;
  institutionName: string;
  year: number;
  lastMessage: string;
  lastActivity: number;
};

export function useRecentChats() {
  const [chats, setChats] = useState<RecentChat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    axiosInstance
      .get("/api/chat/recent")
      .then((res) => {
        if (!cancelled) setChats(res.data.chats);
      })
      .catch(() => {
        // recent chats are a nice-to-have — fail quiet, empty state handles it
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { chats, loading };
}
