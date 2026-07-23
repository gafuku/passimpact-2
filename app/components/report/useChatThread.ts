"use client";

import { useEffect, useRef, useState } from "react";
import type { Institution, Report } from "./reportData";
import { type Message, greeting, chatStorageKey, answerFor } from "./chatEngine";
import { useAuth } from "../portal/AuthContext";

/**
 * Shared chat-thread state for both the floating guest widget and the large portal panel.
 * Signed-in users get their thread restored from localStorage and re-saved on every change;
 * guests always start fresh and nothing they type is ever written to storage.
 *
 * The load and save effects both react to `hydrated`/`user` changing, which land in the same
 * render pass — without `skipNextSaveRef`, the save effect would fire with the pre-load
 * (stale/default) `messages` value and clobber the history the load effect just restored.
 */
export function useChatThread(institution: Institution, report: Report, previousReport?: Report) {
  const { user, hydrated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([greeting(institution, report, false)]);
  const [typing, setTyping] = useState(false);
  const skipNextSaveRef = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
    skipNextSaveRef.current = true;
    if (user) {
      const key = chatStorageKey(user.email, institution.slug, report.year);
      try {
        const raw = localStorage.getItem(key);
        setMessages(raw ? JSON.parse(raw) : [greeting(institution, report, true)]);
      } catch {
        setMessages([greeting(institution, report, true)]);
      }
    } else {
      setMessages([greeting(institution, report, false)]);
    }
  }, [hydrated, user, institution.slug, report.year]);

  useEffect(() => {
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    if (!hydrated || !user) return;
    const key = chatStorageKey(user.email, institution.slug, report.year);
    try {
      localStorage.setItem(key, JSON.stringify(messages));
    } catch {
      // storage unavailable — the conversation just won't survive a refresh
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  function send(text: string) {
    const clean = text.trim();
    if (!clean) return;
    setMessages((m) => [...m, { id: Date.now(), role: "user", text: clean }]);
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { id: Date.now() + 1, role: "assistant", text: answerFor(clean, institution, report, previousReport) }]);
      setTyping(false);
    }, 500 + Math.random() * 400);
  }

  function clear() {
    skipNextSaveRef.current = false;
    setMessages([greeting(institution, report, !!user)]);
    if (user) {
      try {
        localStorage.removeItem(chatStorageKey(user.email, institution.slug, report.year));
      } catch {
        // ignore
      }
    }
  }

  return { user, messages, typing, send, clear };
}
