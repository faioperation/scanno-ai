"use client";

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-0.5">
      <span className="typing-dot h-2 w-2 rounded-full bg-gray-400" />
      <span className="typing-dot h-2 w-2 rounded-full bg-gray-400 [animation-delay:0.2s]" />
      <span className="typing-dot h-2 w-2 rounded-full bg-gray-400 [animation-delay:0.4s]" />
    </div>
  );
}
