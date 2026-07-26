"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Institution } from "./reportData";
import type { PublicReport } from "../../hooks/publicReportTypes";
import { type Message, greeting } from "./chatEngine";
import { useSession } from "next-auth/react";

export type PastSession = {
  id: string;
  createdAt: number;
  lastActivity: number;
  messageCount: number;
  preview: string;
};

export function useChatThread(institution: Institution, report: PublicReport, previousReport?: PublicReport) {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([greeting(institution, report, false)]);
  const [typing, setTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pastSessions, setPastSessions] = useState<PastSession[]>([]);
  // Guards the initial "load most recent thread" fetch so it only fires once per report —
  // otherwise an effect re-run (Strict Mode's dev double-invoke, or any future remount)
  // would silently re-fetch the old conversation and clobber a just-started new chat.
  const autoLoadedReportId = useRef<string | null>(null);

  const refreshPastSessions = useCallback(() => {
    if (status !== "authenticated") return;
    fetch(`/api/chat/sessions?reportId=${report.id}`)
      .then((res) => res.json())
      .then((data) => setPastSessions(data.sessions ?? []))
      .catch(console.error);
  }, [status, report.id]);

  // Load the most recent thread (if any) on open, plus the list of past threads to resume.
  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated") {
      if (autoLoadedReportId.current !== report.id) {
        autoLoadedReportId.current = report.id;
        setMessages([greeting(institution, report, true)]);

        fetch(`/api/chat?reportId=${report.id}`)
          .then((res) => res.json())
          .then((data) => {
            setSessionId(data.sessionId ?? null);
            if (data.messages && data.messages.length > 0) {
              setMessages((prev) => [...prev, ...data.messages]);
            }
          })
          .catch(console.error);
      }

      refreshPastSessions();
    } else {
      setMessages([greeting(institution, report, false)]);
      setSessionId(null);
      setPastSessions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          sessionId,
          history: messages.filter((m) => m.id !== 0),
        }),
      });

      const data = await res.json();

      if (data.text) {
        setMessages((m) => [...m, { id: Date.now() + 1, role: "assistant", text: data.text }]);
        if (data.sessionId) setSessionId(data.sessionId);
        refreshPastSessions();
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

  /** Starts a fresh, empty thread — the next message sent creates a brand-new ChatSession. */
  function startNew() {
    setMessages([greeting(institution, report, status === "authenticated")]);
    setSessionId(null);
  }

  /** Loads a past thread back into view so the conversation can continue where it left off. */
  async function resume(id: string) {
    if (status !== "authenticated") return;
    try {
      const res = await fetch(`/api/chat?reportId=${report.id}&sessionId=${id}`);
      const data = await res.json();
      setMessages([greeting(institution, report, true), ...(data.messages ?? [])]);
      setSessionId(data.sessionId ?? id);
    } catch (e) {
      console.error(e);
    }
  }

  /** Deletes a past thread entirely. If it's the one currently open, resets to a fresh thread. */
  async function remove(id: string) {
    try {
      await fetch(`/api/chat?sessionId=${id}`, { method: "DELETE" });
    } catch (e) {
      console.error(e);
    }
    if (id === sessionId) startNew();
    refreshPastSessions();
  }

  /** Deletes the conversation currently open and starts fresh. */
  async function clear() {
    if (sessionId) {
      await remove(sessionId);
    } else {
      startNew();
    }
  }

  return { user: session?.user, messages, typing, sessionId, pastSessions, send, clear, startNew, resume, remove };
}
