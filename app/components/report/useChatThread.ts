"use client";

import { useEffect, useState } from "react";
import type { Institution } from "./reportData";
import type { PublicReport } from "../../hooks/publicReportTypes";
import { type Message, greeting } from "./chatEngine";
import { useSession } from "next-auth/react";

export function useChatThread(institution: Institution, report: PublicReport, previousReport?: PublicReport) {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([greeting(institution, report, false)]);
  const [typing, setTyping] = useState(false);

  // Load history from API if authenticated
  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated") {
      setMessages([greeting(institution, report, true)]); // Initial greeting

      fetch(`/api/chat?reportId=${report.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.messages && data.messages.length > 0) {
            // Append history from DB
            setMessages((prev) => [...prev, ...data.messages]);
          }
        })
        .catch(console.error);
    } else {
      setMessages([greeting(institution, report, false)]);
    }
  }, [status, report.id, institution]);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean) return;

    // Optimistic UI update
    const userMsg: Message = { id: Date.now(), role: "user", text: clean };
    setMessages((m) => [...m, userMsg]);
    setTyping(true);

    try {
      // Send to API — drop the greeting (id 0) since it's a UI-only message, not part of the Q&A
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: clean,
          reportId: report.id,
          history: messages.filter((m) => m.id !== 0),
        }),
      });

      const data = await res.json();

      if (data.text) {
        setMessages((m) => [...m, { id: Date.now() + 1, role: "assistant", text: data.text }]);
      } else {
        throw new Error("No text in response");
      }
    } catch (e) {
      console.error(e);
      setMessages((m) => [...m, { id: Date.now() + 1, role: "assistant", text: "Sorry, I ran into an error processing your request." }]);
    } finally {
      setTyping(false);
    }
  }

  async function clear() {
    setMessages([greeting(institution, report, status === "authenticated")]);
    if (status === "authenticated") {
      try {
        await fetch(`/api/chat?reportId=${report.id}`, { method: "DELETE" });
      } catch (e) {
        console.error(e);
      }
    }
  }

  return { user: session?.user, messages, typing, send, clear };
}
