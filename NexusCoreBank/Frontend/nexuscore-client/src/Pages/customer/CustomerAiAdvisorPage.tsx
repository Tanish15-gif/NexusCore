import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  Bot,
  Check,
  Copy,
  LoaderCircle,
  MessageSquarePlus,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import { useCustomerDashboard } from "../../Components/customer/CustomerDashboardLayout";
import { askAiAdvisor } from "../../services/aiAdvisorService";

type ChatRole = "assistant" | "user";

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  isError?: boolean;
}

const CHAT_STORAGE_PREFIX = "nexuscore-ai-advisor-chat";

const LEGACY_CHAT_STORAGE_KEY = "nexuscore-ai-advisor-chat";

const quickPrompts = [
  "Summarize my recent spending",
  "How is my account balance?",
  "Where can I reduce expenses?",
];

function createMessageId() {
  if ("randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
}

function createGreeting(customerName: string): ChatMessage {
  const firstName = customerName.split(" ")[0] || "there";

  return {
    id: createMessageId(),
    role: "assistant",
    content:
      `Hello ${firstName}. I’m NexusAI, your financial advisor. ` +
      "I can analyze your NexusCore accounts, ledger and spending activity. What would you like to know?",
    createdAt: new Date().toISOString(),
  };
}

function loadStoredMessages(storageKey: string): ChatMessage[] {
  try {
    const storedValue = sessionStorage.getItem(storageKey);

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);

    return Array.isArray(parsedValue) ? (parsedValue as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function CustomerAiAdvisorPage() {
  const { profile } = useCustomerDashboard();

  const profileName = profile?.fullName?.trim() || "";

  const customerName =
    profileName ||
    localStorage.getItem("nexus_google_name")?.trim() ||
    "Customer";

  const customerIdentity = useMemo(() => {
    if (!profileName) {
      return "";
    }

    const email = profile?.email?.trim().toLowerCase();

    const userId = localStorage.getItem("userid")?.trim();

    if (email) {
      return email;
    }

    if (userId) {
      return `user-${userId}`;
    }

    return profileName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }, [profile?.email, profileName]);

  const chatStorageKey = useMemo(() => {
    if (!customerIdentity) {
      return "";
    }

    return `${CHAT_STORAGE_PREFIX}:${encodeURIComponent(customerIdentity)}`;
  }, [customerIdentity]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [messageOwnerKey, setMessageOwnerKey] = useState("");

  const [input, setInput] = useState("");

  const [isSending, setIsSending] = useState(false);

  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const hasUserMessages = useMemo(
    () => messages.some((message) => message.role === "user"),
    [messages],
  );

  const isChatReady =
    Boolean(chatStorageKey) &&
    messageOwnerKey === chatStorageKey &&
    messages.length > 0;

  useEffect(() => {
    document.title = "AI Advisor | NexusCore Bank";
  }, []);

  /*
   * Remove the old shared chat history.
   * This old key caused one customer's
   * greeting to appear for another customer.
   */
  useEffect(() => {
    sessionStorage.removeItem(LEGACY_CHAT_STORAGE_KEY);
  }, []);

  /*
   * Load chat history belonging only
   * to the currently logged-in customer.
   */
  useEffect(() => {
    if (!chatStorageKey || !profileName) {
      return;
    }

    const storedMessages = loadStoredMessages(chatStorageKey);

    const nextMessages =
      storedMessages.length > 0
        ? storedMessages
        : [createGreeting(profileName)];

    setMessages(nextMessages);
    setMessageOwnerKey(chatStorageKey);
    setInput("");
    setCopiedMessageId(null);
  }, [chatStorageKey, profileName]);

  /*
   * Save messages only when the messages
   * belong to the current customer's key.
   *
   * This prevents the previous customer's
   * messages from being written into the
   * next customer's storage.
   */
  useEffect(() => {
    if (
      !chatStorageKey ||
      messageOwnerKey !== chatStorageKey ||
      messages.length === 0
    ) {
      return;
    }

    sessionStorage.setItem(chatStorageKey, JSON.stringify(messages));
  }, [messages, chatStorageKey, messageOwnerKey]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isSending]);

  const startNewChat = () => {
    if (!chatStorageKey) {
      return;
    }

    const initialMessages = [createGreeting(customerName)];

    setMessages(initialMessages);
    setMessageOwnerKey(chatStorageKey);
    setInput("");

    sessionStorage.setItem(chatStorageKey, JSON.stringify(initialMessages));

    window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  const sendMessage = async (messageValue?: string) => {
    const userMessage = (messageValue ?? input).trim();

    if (!userMessage || isSending || !isChatReady) {
      return;
    }

    const newUserMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: userMessage,
      createdAt: new Date().toISOString(),
    };

    setMessages((currentMessages) => [...currentMessages, newUserMessage]);

    setInput("");
    setIsSending(true);

    try {
      const response = await askAiAdvisor(userMessage);

      const assistantMessage: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        content: response.reply,
        createdAt: new Date().toISOString(),
      };

      setMessages((currentMessages) => [...currentMessages, assistantMessage]);
    } catch (requestError) {
      const errorMessage: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        content:
          requestError instanceof Error
            ? requestError.message
            : "NexusAI is temporarily unavailable.",
        createdAt: new Date().toISOString(),
        isError: true,
      };

      setMessages((currentMessages) => [...currentMessages, errorMessage]);
    } finally {
      setIsSending(false);

      window.setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  const copyMessage = async (message: ChatMessage) => {
    try {
      await navigator.clipboard.writeText(message.content);

      setCopiedMessageId(message.id);

      window.setTimeout(() => {
        setCopiedMessageId(null);
      }, 1500);
    } catch {
      setCopiedMessageId(null);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-9rem)] flex-col">
      {/* Page heading */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
            Nexus intelligence
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl dark:text-white">
            AI Financial Advisor
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Ask questions about your accounts, transactions and spending.
          </p>
        </div>

        <button
          type="button"
          onClick={startNewChat}
          disabled={!isChatReady}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-indigo-400 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300 dark:hover:text-indigo-400"
        >
          <MessageSquarePlus size={17} />
          New chat
        </button>
      </div>

      {/* Chat application */}
      <section className="flex min-h-[620px] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1526]">
        {/* Chat header */}
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-white/10">
          <div className="flex min-w-0 items-center gap-3">
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Sparkles size={20} />

              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-[#0b1526]" />
            </span>

            <div className="min-w-0">
              <h3 className="truncate font-black text-slate-950 dark:text-white">
                NexusAI
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Financial assistant • Online
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 text-xs font-semibold text-slate-400 sm:flex">
            <ShieldCheck size={15} className="text-emerald-500" />
            Secure banking context
          </div>
        </header>

        {/* Messages */}
        <div className="nexus-scrollbar flex-1 overflow-y-auto bg-slate-50 px-4 py-6 sm:px-6 dark:bg-[#07101d]">
          <div className="mx-auto flex max-w-4xl flex-col gap-6">
            {!isChatReady && (
              <div className="flex min-h-40 items-center justify-center">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <LoaderCircle
                    size={18}
                    className="animate-spin text-indigo-500"
                  />
                  Preparing your private chat...
                </div>
              </div>
            )}

            {isChatReady &&
              messages.map((message) => {
                const isUser = message.role === "user";

                return (
                  <article
                    key={message.id}
                    className={[
                      "flex items-start gap-3",
                      isUser ? "flex-row-reverse" : "",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                        isUser
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                          : "bg-indigo-600 text-white",
                      ].join(" ")}
                    >
                      {isUser ? <UserRound size={17} /> : <Bot size={17} />}
                    </span>

                    <div
                      className={[
                        "group min-w-0 max-w-[85%] sm:max-w-[75%]",
                        isUser ? "text-right" : "",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "rounded-2xl px-4 py-3 text-left text-sm leading-7",
                          isUser
                            ? "rounded-tr-md bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                            : message.isError
                              ? "rounded-tl-md border border-red-200 bg-red-50 text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300"
                              : "rounded-tl-md border border-slate-200 bg-white text-slate-700 shadow-sm dark:border-white/10 dark:bg-[#0b1526] dark:text-slate-200",
                        ].join(" ")}
                      >
                        <MessageContent content={message.content} />
                      </div>

                      <div
                        className={[
                          "mt-1.5 flex items-center gap-2 text-[11px] text-slate-400",
                          isUser ? "justify-end" : "",
                        ].join(" ")}
                      >
                        <span>{isUser ? "You" : "NexusAI"}</span>

                        <span>•</span>

                        <span>{formatTime(message.createdAt)}</span>

                        {!isUser && !message.isError && (
                          <button
                            type="button"
                            onClick={() => void copyMessage(message)}
                            aria-label="Copy response"
                            className="ml-1 inline-flex items-center gap-1 rounded px-1.5 py-0.5 transition hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                          >
                            {copiedMessageId === message.id ? (
                              <>
                                <Check size={12} />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                Copy
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}

            {/* Typing indicator */}
            {isSending && (
              <article className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Bot size={17} />
                </span>

                <div className="rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-[#0b1526]">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.3s]" />

                    <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.15s]" />

                    <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500" />
                  </div>
                </div>
              </article>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Quick prompts */}
        {isChatReady && !hasUserMessages && (
          <div className="border-t border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#0b1526]">
            <div className="nexus-scrollbar mx-auto flex max-w-4xl gap-2 overflow-x-auto">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={isSending || !isChatReady}
                  onClick={() => void sendMessage(prompt)}
                  className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300 dark:hover:text-indigo-400"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Composer */}
        <footer className="border-t border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0b1526]">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-end gap-3 rounded-2xl border border-slate-300 bg-slate-50 p-2 transition focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[0.035]">
              <textarea
                ref={textareaRef}
                value={input}
                disabled={isSending || !isChatReady}
                rows={1}
                maxLength={1000}
                placeholder={
                  isChatReady
                    ? "Ask NexusAI about your finances..."
                    : "Loading your private chat..."
                }
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleInputKeyDown}
                className="nexus-scrollbar max-h-36 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm leading-6 text-slate-950 outline-none placeholder:text-slate-400 disabled:opacity-60 dark:text-white dark:placeholder:text-slate-500"
              />

              <button
                type="button"
                onClick={() => void sendMessage()}
                disabled={!input.trim() || isSending || !isChatReady}
                aria-label="Send message"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSending ? (
                  <LoaderCircle size={19} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>

            <p className="mt-2 text-center text-[11px] text-slate-400">
              Press Enter to send • Shift + Enter for a new line
            </p>
          </div>
        </footer>
      </section>
    </div>
  );
}

function MessageContent({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        const trimmedLine = line.trim();

        if (!trimmedLine) {
          return <div key={`empty-${index}`} className="h-2" />;
        }

        const isBullet =
          trimmedLine.startsWith("- ") || trimmedLine.startsWith("• ");

        if (isBullet) {
          return (
            <div
              key={`${trimmedLine}-${index}`}
              className="flex items-start gap-2"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />

              <span>{trimmedLine.slice(2)}</span>
            </div>
          );
        }

        return <p key={`${trimmedLine}-${index}`}>{trimmedLine}</p>;
      })}
    </div>
  );
}
