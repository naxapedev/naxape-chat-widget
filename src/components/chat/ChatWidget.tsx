import { useEffect, useRef, useState } from "react";
import { ArrowUp, Minus, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import LeadCaptureForm from "./LeadCaptureForm";

type MessageStatus = "sent" | "error";

interface ChatMessage {
  id: string;
  role: "assistant" | "visitor";
  text: string;
  time: string;
  status?: MessageStatus;
}

interface QuickReply {
  label: string;
  query: string;
}

const QUICK_REPLIES: QuickReply[] = [
  { label: "Our services", query: "What are the services that you provide?" },
  { label: "Book a consultation", query: "I would like to book a Consulation." },
];

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function NaxapeMark({ name, className }: { name: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-slate-800 font-semibold text-white",
        className
      )}
      aria-hidden
    >
      {(name || "N").charAt(0).toUpperCase()}
    </div>
  );
}

function ThinkingIndicator({ botName }: { botName: string }) {
  const statusMessages = [
    "Assistant is thinking...",
    "Searching knowledge base...",
    "Crafting your response...",
    "Ensuring best answer...",
  ];
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % statusMessages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-start gap-2 animate-nx-message-in">
      <NaxapeMark name={botName} className="size-7 shrink-0 rounded-md text-[10px] mt-1" />
      <div className="flex flex-col gap-2 w-full max-w-[80%]">
        <div className="flex w-fit items-center gap-2.5 rounded-md rounded-tl-none border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="nx-typing-dot size-2 rounded-full bg-slate-400"
                style={{ animationDelay: `${i * 160}ms` }}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-slate-500 transition-opacity duration-300">
            {statusMessages[msgIndex]}
          </span>
        </div>
        <div className="space-y-2">
          <div className="h-2.5 w-3/4 rounded-full bg-slate-200 animate-pulse"></div>
          <div className="h-2.5 w-1/2 rounded-full bg-slate-200 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

const markdownComponents = {
  p: ({ node, ...props }: any) => <p className="mb-2 last:mb-0 text-slate-700 leading-relaxed" {...props} />,
  a: ({ node, ...props }: any) => (
    <a className="text-indigo-600 underline underline-offset-2 hover:text-indigo-500" target="_blank" rel="noopener noreferrer" {...props} />
  ),
  ul: ({ node, ...props }: any) => <ul className="list-disc pl-4 mb-2 text-slate-700" {...props} />,
  ol: ({ node, ...props }: any) => <ol className="list-decimal pl-4 mb-2 text-slate-700" {...props} />,
  li: ({ node, ...props }: any) => <li className="mb-1 text-slate-700" {...props} />,
  h1: ({ node, ...props }: any) => <h1 className="text-base font-bold mb-1 text-slate-900" {...props} />,
  h2: ({ node, ...props }: any) => <h2 className="text-sm font-bold mb-1 text-slate-900" {...props} />,
  h3: ({ node, ...props }: any) => <h3 className="text-sm font-semibold mb-1 text-slate-900" {...props} />,
  table: ({ node, ...props }: any) => (
    <div className="overflow-x-auto my-2">
      <table className="w-full border-collapse text-left text-[12px]" {...props} />
    </div>
  ),
  th: ({ node, ...props }: any) => <th className="border border-slate-200 bg-slate-50 px-2 py-1 font-semibold text-slate-700" {...props} />,
  td: ({ node, ...props }: any) => <td className="border border-slate-200 px-2 py-1 text-slate-600" {...props} />,
};

function MessageBubble({
  message,
  onRetry,
}: {
  message: ChatMessage;
  onRetry?: (id: string) => void;
}) {
  const isVisitor = message.role === "visitor";
  const failed = message.status === "error";

  return (
    <div
      className={cn(
        "animate-nx-message-in flex flex-col gap-1",
        isVisitor ? "items-end" : "items-start"
      )}
    >
      <div
        className={cn(
          "max-w-[90%] rounded-md px-3 py-2 text-[13px] leading-snug shadow-sm",
          isVisitor
            ? "rounded-br-none bg-indigo-600 text-white"
            : failed
              ? "rounded-tl-none border border-rose-200 bg-rose-50 text-rose-700"
              : "rounded-tl-none border border-slate-200 bg-white text-slate-800",
          failed && "opacity-90"
        )}
      >
        {isVisitor ? (
          message.text
        ) : (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {message.text}
            </ReactMarkdown>
          </div>
        )}
      </div>
      <div
        className={cn(
          "flex items-center gap-1.5 text-[11px] text-slate-400",
          isVisitor && "flex-row-reverse"
        )}
      >
        <span>{message.time}</span>
        {failed && isVisitor ? (
          <button
            type="button"
            onClick={() => onRetry?.(message.id)}
            className="flex items-center gap-1 font-medium text-red-500 hover:underline"
          >
            <RotateCcw className="size-3" />
            Not delivered — retry
          </button>
        ) : (
          isVisitor && <span aria-label="Sent">✓</span>
        )}
      </div>
    </div>
  );
}

export function ChatWidget() {
  // Read config directly from window.naxapeWidgetConfig
  const widgetConfig = typeof window !== "undefined" ? ((window as any).naxapeWidgetConfig || {}) : {};
  const chatbotId = widgetConfig.chatbotId || "1";
  const chatbotName = widgetConfig.chatbotName || "Naxape";
  const secureKey = widgetConfig.secureKey || "";

  // Dynamic API endpoint from environment
  const API_BASE = (import.meta.env.VITE_API_BASE || "http://192.168.1.19:8000").replace(/\/+$/, "");
  const API_ENDPOINT = `${API_BASE}/chat`;

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [showLeadForm, setShowLeadForm] = useState(false);
  const [chatLocked, setChatLocked] = useState(false);

  const showEmptyState = messages.length === 0;
  const hasUnread = !open;

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isStreaming, open, showLeadForm]);

  const send = async (text: string, retryId?: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming || chatLocked) return;

    const visitorMsgId = retryId || generateId();
    const visitorMsg: ChatMessage = {
      id: visitorMsgId,
      role: "visitor",
      text: trimmed,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "sent",
    };

    setMessages((prev) =>
      retryId
        ? prev.map((m) => (m.id === retryId ? visitorMsg : m))
        : [...prev, visitorMsg]
    );

    setInput("");
    setIsStreaming(true);

    const token = typeof localStorage !== "undefined" ? localStorage.getItem("naxape_token") : null;
    const parsedChatbotId =
      !isNaN(Number(chatbotId)) && String(Number(chatbotId)) === String(chatbotId).trim()
        ? Number(chatbotId)
        : chatbotId;

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream, application/json",
          ...(secureKey ? { "x-widget-key": secureKey } : {}),
          ...(token && !secureKey ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: trimmed,
          chatbot_id: parsedChatbotId,
          thread_id: threadId,
        }),
      });

      if (!response.ok) {
        let errorMessage = "⚠️ Network response was not ok";
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch (_) {}

        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            role: "assistant",
            text: errorMessage,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: "error",
          },
        ]);

        setMessages((prev) => prev.map((m) => (m.id === visitorMsgId ? { ...m, status: "error" } : m)));
        return;
      }

      if (!response.body) throw new Error("Network response was not ok");

      const assistantMsgId = generateId();
      let assistantMsgCreated = false;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.replace("data: ", "").trim();
            if (!jsonStr || jsonStr === "[DONE]") continue;

            try {
              const data = JSON.parse(jsonStr);

              // Limit reached: trigger lead form
              if (data.action === "show_lead_form") {
                if (data.error) {
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: generateId(),
                      role: "assistant",
                      text: data.error,
                      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                      status: "error",
                    },
                  ]);
                }
                setShowLeadForm(true);
                setChatLocked(true);
                setIsStreaming(false);
                return;
              }

              if (data.error) {
                if (!assistantMsgCreated) {
                  assistantMsgCreated = true;
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: assistantMsgId,
                      role: "assistant",
                      text: data.error,
                      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                      status: "error",
                    },
                  ]);
                } else {
                  setMessages((prev) =>
                    prev.map((m) => (m.id === assistantMsgId ? { ...m, text: data.error, status: "error" } : m))
                  );
                }
                setIsStreaming(false);
                break;
              }

              if (data.thread_id) {
                setThreadId(data.thread_id);
              }

              if (data.token) {
                if (!assistantMsgCreated) {
                  assistantMsgCreated = true;
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: assistantMsgId,
                      role: "assistant",
                      text: data.token,
                      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                      status: "sent",
                    },
                  ]);
                } else {
                  setMessages((prev) =>
                    prev.map((m) => {
                      if (m.id !== assistantMsgId) return m;
                      if (data.token.startsWith(m.text)) {
                        return { ...m, text: data.token };
                      }
                      return { ...m, text: m.text + data.token };
                    })
                  );
                }
              }
            } catch (e) {
              console.error("Failed to parse SSE data:", jsonStr, e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat fetch error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "assistant",
          text: "⚠️ Failed to connect to the server. Please check your internet connection.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: "error",
        },
      ]);
      setMessages((prev) => prev.map((m) => (m.id === visitorMsgId ? { ...m, status: "error" } : m)));
    } finally {
      setIsStreaming(false);
    }
  };

  const handleRetry = (id: string) => {
    const failedMsg = messages.find((m) => m.id === id);
    if (failedMsg) {
      send(failedMsg.text, id);
    }
  };

  return (
    <>
      {/* Launcher Button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? `Close ${chatbotName} chat` : `Open ${chatbotName} chat`}
        className="fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-slate-900 text-lg text-white shadow-xl transition-transform duration-200 ease-out hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
      >
        <span className="font-semibold tracking-tight">{chatbotName.charAt(0).toUpperCase()}</span>
        {hasUnread && (
          <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-semibold text-white ring-2 ring-white">
            1
          </span>
        )}
      </button>

      {/* Chat Window */}
      {open && (
        <section
          aria-label={`${chatbotName} Assistant chat`}
          className={cn(
            "animate-nx-window-in fixed z-50 flex flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl",
            "inset-x-0 bottom-0 h-[85dvh] rounded-t-xl",
            "sm:inset-x-auto sm:bottom-24 sm:right-5 sm:h-[560px] sm:max-h-[calc(100dvh-8rem)] sm:w-[380px] sm:rounded-xl"
          )}
        >
          {/* Header */}
          <header className="flex items-center gap-3 bg-slate-900 px-4 py-3 text-white">
            <NaxapeMark name={chatbotName} className="size-9 rounded-md bg-slate-800 text-sm ring-1 ring-white/10" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight">{chatbotName} Assistant</p>
              <p className="flex items-center gap-1.5 text-xs leading-tight text-slate-400">
                <span className={cn("size-1.5 rounded-full bg-emerald-400", isStreaming && "animate-pulse")} />
                {isStreaming ? "Generating response..." : "Online — typically replies instantly"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Minimize chat"
              className="flex size-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Minus className="size-4" />
            </button>
          </header>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex flex-1 flex-col gap-3 overflow-y-auto bg-slate-50 px-4 py-4"
          >
            {showEmptyState ? (
              <div className="flex flex-col gap-3">
                <MessageBubble
                  message={{
                    id: generateId(),
                    role: "assistant",
                    text: `Hi, I'm ${chatbotName}'s assistant — ask me anything about our services.`,
                    time: new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  }}
                />
              </div>
            ) : (
              <>
                {messages.map((m) => (
                  <MessageBubble key={m.id} message={m} onRetry={handleRetry} />
                ))}
                {isStreaming && messages[messages.length - 1]?.role === "visitor" && (
                  <ThinkingIndicator botName={chatbotName} />
                )}

                {showLeadForm && (
                  <LeadCaptureForm
                    chatbotId={String(chatbotId)}
                    onLeadSubmitted={() => {
                      setShowLeadForm(false);
                      setMessages((prev) => [
                        ...prev,
                        {
                          id: generateId(),
                          role: "assistant",
                          text: "✅ Thank you! Your details have been submitted. Our team will contact you soon.",
                          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                          status: "sent",
                        },
                      ]);
                    }}
                  />
                )}
              </>
            )}
          </div>

          {/* Quick replies */}
          <div className={cn("flex gap-2 overflow-x-auto bg-slate-50 px-4 pb-2 transition-opacity", chatLocked && "opacity-50 pointer-events-none")}>
            {QUICK_REPLIES.map((reply) => (
              <button
                key={reply.label}
                type="button"
                disabled={isStreaming || chatLocked}
                onClick={() => send(reply.query)}
                className="shrink-0 rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-medium text-indigo-700 shadow-sm transition-colors hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {reply.label}
              </button>
            ))}
          </div>

          {/* Input row */}
          <form
            className={cn(
              "flex items-center gap-2 border-t border-slate-200 bg-white px-3 py-3 transition-opacity",
              chatLocked && "opacity-50 pointer-events-none"
            )}
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about our services…"
              disabled={chatLocked}
              aria-label={`Message ${chatbotName} Assistant`}
              className="min-w-0 flex-1 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-transparent disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming || chatLocked}
              aria-label="Send message"
              className="flex size-9 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              <ArrowUp className="size-4" />
            </button>
          </form>

          {/* Brand footer */}
          <p className="border-t border-slate-200 bg-white px-4 py-2 text-center text-[11px] text-slate-400">
            Powered by <span className="font-semibold text-slate-700">Naxape</span> — enterprise-grade support
          </p>
        </section>
      )}
    </>
  );
}
export default ChatWidget;

