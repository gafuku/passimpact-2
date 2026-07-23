"use client";

import { useRef, useState, useEffect } from "react";
import type { Institution, Report } from "./reportData";
import { useChatThread } from "./useChatThread";

export function ReportChat({ institution, report, previousReport }: { institution: Institution; report: Report; previousReport?: Report }) {
  const { user, messages, typing, send, clear } = useChatThread(institution, report, previousReport);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  function handleSend() {
    send(input);
    setInput("");
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 md:right-8 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-lg border border-border bg-white shadow-2xl flex flex-col overflow-hidden" style={{ height: "min(32rem, 70vh)" }}>
          <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-surface-raised">
            <div>
              <p className="text-xs font-semibold text-text">Ask about {institution.name} · {report.fy}</p>
              <p className="text-[10px] text-text-faint">
                {user ? `Signed in as ${user.name.split(" ")[0]} — history saved` : "Guest session — nothing is saved"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={clear} className="text-[10px] text-text-faint hover:text-text transition-colors">
                Clear
              </button>
              <button onClick={() => setOpen(false)} aria-label="Close chat" className="text-text-muted hover:text-text text-lg leading-none px-1">
                ×
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                    m.role === "user" ? "bg-text text-text-invert" : "bg-surface-raised text-text border border-border"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="rounded-lg px-3 py-2 text-xs bg-surface-raised border border-border text-text-faint">Thinking…</div>
              </div>
            )}
          </div>

          <div className="border-t border-border p-3 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="e.g. how much came from tuition?"
              className="flex-1 rounded border border-border px-3 py-2 text-xs text-text placeholder:text-text-faint focus:outline-none focus:border-text"
            />
            <button
              onClick={handleSend}
              className="rounded bg-text text-text-invert border border-white/10 px-3 py-2 text-xs font-medium hover:brightness-125 transition-all"
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-4 md:right-8 z-50 inline-flex items-center gap-2 rounded-full bg-text text-text-invert border border-white/10 px-5 py-3 text-xs font-medium shadow-lg hover:brightness-125 transition-all"
      >
        {open ? "Close" : `Ask about ${institution.shortName}`}
      </button>
    </>
  );
}
