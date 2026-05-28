"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Icon } from "@iconify/react";
import { BRAND_CONFIG } from "@/lib/constants";
import { isBrandLink } from "@/lib/utils";
import TypingIndicator from "./TypingIndicator";
import LoadingSkeleton from "./LoadingSkeleton";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  imageUrl?: string;
  isLoading?: boolean;
  isStreaming?: boolean;
  isLatest?: boolean;
  onBrandLinkClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  formatTime: (ts: number) => string;
}

function AnimatedMarkdown({
  content,
  isLatest,
  onBrandLinkClick,
}: {
  content: string;
  isLatest: boolean;
  onBrandLinkClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const [displayed, setDisplayed] = useState(isLatest ? "" : content);

  useEffect(() => {
    if (!isLatest) {
      setDisplayed(content);
      return;
    }

    let index = 0;
    setDisplayed("");

    const interval = setInterval(() => {
      index++;
      setDisplayed(content.slice(0, index));
      if (index >= content.length) clearInterval(interval);
    }, 8);

    return () => clearInterval(interval);
  }, [content, isLatest]);

  const markdownComponents = {
    p: ({ children }: { children?: React.ReactNode }) => (
      <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
    ),
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="mb-2 list-disc pl-5 space-y-1">{children}</ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="mb-2 list-decimal pl-5 space-y-1">{children}</ol>
    ),
    li: ({ children }: { children?: React.ReactNode }) => (
      <li className="leading-relaxed">{children}</li>
    ),
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-semibold">{children}</strong>
    ),
    a: ({
      href,
      children,
    }: {
      href?: string;
      children?: React.ReactNode;
    }) => (
      <a
        href={href}
        onClick={(e) => {
          if (href && isBrandLink(href)) {
            e.preventDefault();
            onBrandLinkClick(e);
          }
        }}
        target={href && isBrandLink(href) ? undefined : "_blank"}
        rel="noopener noreferrer"
        className="text-emerald-600 underline underline-offset-2 hover:text-emerald-800"
      >
        {children}
      </a>
    ),
  };

  return (
    <ReactMarkdown components={markdownComponents}>{displayed}</ReactMarkdown>
  );
}

export default function ChatBubble({
  role,
  content,
  timestamp,
  imageUrl,
  isLoading,
  isStreaming,
  isLatest = false,
  onBrandLinkClick,
  formatTime,
}: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
    >
      <div
        className={`flex max-w-[92%] flex-col gap-1 sm:max-w-[85%] md:max-w-[75%] ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        {!isUser && (
          <div className="mb-0.5 flex items-center gap-1.5 px-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700">
              <Icon icon="mdi:car-wrench" className="text-xs text-white" />
            </div>
            <span className="text-xs font-medium text-white/70">
              {BRAND_CONFIG.brandName}
            </span>
          </div>
        )}

        {imageUrl && isUser && (
          <div className="overflow-hidden rounded-2xl border-2 border-emerald-600/50 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Uploaded car"
              className="max-h-48 w-full object-cover sm:max-h-56"
            />
          </div>
        )}

        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isUser
              ? "rounded-br-md bg-emerald-700 text-white"
              : "rounded-bl-md bg-white text-gray-900"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center gap-2 py-1">
              <TypingIndicator />
              <span className="text-sm text-gray-500">Analyzing...</span>
            </div>
          ) : isStreaming ? (
            <LoadingSkeleton />
          ) : (
            <div className={`text-sm sm:text-base ${isUser ? "" : "prose-chat"}`}>
              {isUser ? (
                <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
              ) : (
                <AnimatedMarkdown
                  content={content}
                  isLatest={isLatest}
                  onBrandLinkClick={onBrandLinkClick}
                />
              )}
            </div>
          )}
        </div>

        <span className="px-1 text-[10px] text-white/50 sm:text-xs">
          {formatTime(timestamp)}
        </span>
      </div>
    </div>
  );
}
