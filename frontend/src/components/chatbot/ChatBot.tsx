"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
import BookingSuccessModal from "@/components/BookingSuccessModal";
import { CHAT_STORAGE_KEY, BRAND_CONFIG } from "@/lib/constants";
import { fileToBase64, formatTimestamp, generateId } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: `Welcome to **${BRAND_CONFIG.brandName}**! 🚗

I'm your professional car expert and damage analysis assistant. I can help you with:

- **Car model information** — specs, features, and comparisons
- **Common issues & maintenance** — what to watch for and when to service
- **Damage analysis** — upload a photo of dents, scratches, or collision damage
- **Repair recommendations** — with estimated costs in ${BRAND_CONFIG.currencySymbol}

Try asking: *"Tell me about Toyota Corolla 2020"* or upload a photo of car damage for AI vision analysis.`,
  timestamp: Date.now(),
};

export default function ChatBot() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(CHAT_STORAGE_KEY);
    if (saved) {
      try {
        const parsed: ChatMessage[] = JSON.parse(saved);
        if (parsed.length > 0) setMessages(parsed);
      } catch {
        /* ignore corrupt storage */
      }
    }
  }, []);

  useEffect(() => {
    const storable = messages.filter((m) => !m.isLoading && !m.isStreaming);
    sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(storable));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleBrandLinkClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      setShowBookingModal(true);
    },
    []
  );

  const handleSend = async (text: string, image?: File) => {
    setError(null);
    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: text,
      timestamp: Date.now(),
      imageUrl: image ? URL.createObjectURL(image) : undefined,
      imageName: image?.name,
    };

    const loadingMessage: ChatMessage = {
      id: generateId(),
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);

    try {
      let imageBase64: string | undefined;
      let imageMimeType: string | undefined;

      if (image) {
        setUploadProgress(0);
        const progressInterval = setInterval(() => {
          setUploadProgress((p) => {
            if (p === null || p >= 90) return p;
            return p + 10;
          });
        }, 100);

        imageBase64 = await fileToBase64(image);
        imageMimeType = image.type;
        clearInterval(progressInterval);
        setUploadProgress(100);
      }

      const apiMessages = messages
        .filter((m) => !m.isLoading && !m.isStreaming && m.id !== "welcome")
        .concat(userMessage)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          image: imageBase64,
          imageMimeType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get AI response");
      }

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: data.message,
        timestamp: Date.now(),
      };

      setMessages((prev) => [
        ...prev.filter((m) => !m.isLoading),
        assistantMessage,
      ]);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Something went wrong";
      setError(errorMsg);

      setMessages((prev) => [
        ...prev.filter((m) => !m.isLoading),
        {
          id: generateId(),
          role: "assistant",
          content: `Sorry, I encountered an error: ${errorMsg}. Please try again.`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setUploadProgress(null);
    }
  };

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE]);
    sessionStorage.removeItem(CHAT_STORAGE_KEY);
    setError(null);
  };

  const latestAssistantId = [...messages]
    .reverse()
    .find((m) => m.role === "assistant" && !m.isLoading)?.id;

  return (
    <>
      <div className="flex h-full min-h-0 flex-col">
        {/* Header */}
        <header
          data-testid="chatbot-header"
          className="shrink-0 border-b border-white/10 bg-black/20 px-4 py-3 backdrop-blur-md sm:px-6"
        >
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                href="/"
                className="shrink-0 rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Back to home"
              >
                <Icon icon="mdi:arrow-left" className="text-xl" />
              </Link>
              <div className="min-w-0">
                <h1 className="truncate text-base font-bold text-white sm:text-lg">
                  {BRAND_CONFIG.brandName}
                </h1>
                <p className="truncate text-xs text-white/60 sm:text-sm">
                  Car expert · Damage analysis · Repair estimates
                </p>
              </div>
            </div>

            <button
              onClick={clearChat}
              className="shrink-0 rounded-lg px-3 py-1.5 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white sm:text-sm"
            >
              Clear chat
            </button>
          </div>
        </header>

        {/* Messages */}
        <div
          ref={bottomRef}
          className="flex-1 overflow-y-auto hide-scrollbar px-3 py-4 sm:px-6 sm:py-6"
        >
          <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:gap-5">
            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                role={msg.role}
                content={msg.content}
                timestamp={msg.timestamp}
                imageUrl={msg.imageUrl}
                isLoading={msg.isLoading}
                isStreaming={msg.isStreaming}
                isLatest={msg.id === latestAssistantId}
                onBrandLinkClick={handleBrandLinkClick}
                formatTime={formatTimestamp}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-auto mb-2 max-w-4xl px-3 sm:px-6">
            <div className="flex items-center gap-2 rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-200">
              <Icon icon="mdi:alert-circle" className="shrink-0 text-lg" />
              {error}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="shrink-0 border-t border-white/10 bg-black/30 px-3 py-3 backdrop-blur-md sm:px-6 sm:py-4">
          <div className="mx-auto max-w-4xl">
            <ChatInput
              onSend={handleSend}
              disabled={isLoading}
              uploadProgress={uploadProgress}
            />
          </div>
        </div>
      </div>

      <BookingSuccessModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />
    </>
  );
}
