"use client";

import { useEffect, useRef, useState } from "react";
import type { Institution } from "../report/reportData";
import type { PublicReport } from "../../hooks/publicReportTypes";
import { useChatThread } from "../report/useChatThread";
import { IconHistory, IconPlus, IconX } from "../icons";

const SUGGESTIONS = [
  "How much came from tuition?",
  "What's the endowment payout this year?",
  "How do expenses break down?",
  "What was the audit opinion?",
];

type LargeReportChatProps = {
  institution: Institution;
  report: PublicReport;
  previousReport?: PublicReport;
  open: boolean;
  onClose: () => void;
};

function formatRelativeTime(ms: number) {
  const diff = Date.now() - ms;
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function LargeReportChat({ institution, report, previousReport, open, onClose }: LargeReportChatProps) {
  const { user, messages, typing, sessionId, pastSessions, send, clear, startNew, resume, remove } = useChatThread(
    institution,
    report,
    previousReport
  );
  const [input, setInput] = useState("");
  const [showHistory, setShowHistory] = useState(false);
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

  function handleResume(id: string) {
    resume(id);
    setShowHistory(false);
  }

  function handleNewChat() {
    startNew();
    setShowHistory(false);
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
              {report.fy} · {user ? `Signed in as ${(user.name ?? "you").split(" ")[0]} — history saved` : "Guest session"}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {user && (
              <>
                <button
                  onClick={handleNewChat}
                  title="Start a new chat"
                  aria-label="Start a new chat"
                  className="text-text-faint hover:text-text transition-colors"
                >
                  <IconPlus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowHistory((v) => !v)}
                  title="Past conversations"
                  aria-label="Past conversations"
                  className={`transition-colors ${showHistory ? "text-text" : "text-text-faint hover:text-text"}`}
                >
                  <IconHistory className="h-4 w-4" />
                </button>
                <button onClick={clear} className="text-xs text-text-faint hover:text-text transition-colors">
                  Clear
                </button>
              </>
            )}
            <button onClick={onClose} aria-label="Close chat" className="text-text-muted hover:text-text text-xl leading-none px-1">
              ×
            </button>
          </div>
        </div>

        {showHistory ? (
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-text">Past conversations</p>
              <button onClick={() => setShowHistory(false)} className="text-xs text-brand hover:underline">
                Back to chat
              </button>
            </div>
            {pastSessions.length === 0 ? (
              <p className="text-xs text-text-faint italic">No past conversations for this report yet.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {pastSessions.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => handleResume(s.id)}
                      className={`w-full text-left rounded border px-3 py-2.5 transition-colors ${
                        s.id === sessionId ? "border-text bg-surface-raised" : "border-border hover:bg-surface-raised"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs text-text line-clamp-2 flex-1">{s.preview}</p>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            remove(s.id);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.stopPropagation();
                              remove(s.id);
                            }
                          }}
                          aria-label="Delete conversation"
                          className="shrink-0 text-text-faint hover:text-[#d03b3b] transition-colors"
                        >
                          <IconX className="h-3.5 w-3.5" />
                        </span>
                      </div>
                      <p className="mt-1.5 text-[10px] text-text-faint">
                        {s.messageCount} {s.messageCount === 1 ? "message" : "messages"} · {formatRelativeTime(s.lastActivity)}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </>
  );
}
