"use client";

import { useEffect, useRef, useState } from "react";
import type { Institution, Report } from "../report/reportData";
import { useChatThread } from "../report/useChatThread";

const SUGGESTIONS = [
  "How much came from tuition?",
  "What's the endowment payout this year?",
  "How do expenses break down?",
  "What was the audit opinion?",
];

type LargeReportChatProps = {
  institution: Institution;
  report: Report;
  previousReport?: Report;
  open: boolean;
  onClose: () => void;
};

export function LargeReportChat({ institution, report, previousReport, open, onClose }: LargeReportChatProps) {
  const { user, messages, typing, send, clear } = useChatThread(institution, report, previousReport);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function handleAsk(text: string) {
    send(text);
    setInput("");
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[440px] bg-white border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
        role="dialog"
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-surface-raised shrink-0">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-text truncate">Ask about {institution.name}</p>
            <p className="text-xs text-text-faint mt-0.5">
              {report.fy} · {user ? `Signed in as ${user.name.split(" ")[0]} — history saved` : "Guest session"}
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button onClick={clear} className="text-xs text-text-faint hover:text-text transition-colors">
              Clear
            </button>
            <button onClick={onClose} aria-label="Close chat" className="text-text-muted hover:text-text text-xl leading-none px-1">
              ×
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-lg px-4 py-2.5 text-xs leading-relaxed ${
                  m.role === "user" ? "bg-text text-text-invert" : "bg-surface-raised text-text border border-border"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="rounded-lg px-4 py-2.5 text-xs bg-surface-raised border border-border text-text-faint">Thinking…</div>
            </div>
          )}

          {messages.length === 1 && !typing && (
            <div className="pt-2">
              <p className="text-xs text-text-faint mb-2">Try asking</p>
              <div className="flex flex-col gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleAsk(s)}
                    className="text-left text-xs rounded border border-border px-3 py-2 text-text-muted hover:bg-surface-raised hover:text-text transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border p-4 flex items-center gap-2 shrink-0">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk(input)}
            placeholder="Ask about this report…"
            className="flex-1 rounded border border-border px-3 py-2.5 text-xs text-text placeholder:text-text-faint focus:outline-none focus:border-text"
          />
          <button
            onClick={() => handleAsk(input)}
            className="rounded bg-text text-text-invert border border-white/10 px-4 py-2.5 text-xs font-medium hover:brightness-125 transition-all shrink-0"
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}
