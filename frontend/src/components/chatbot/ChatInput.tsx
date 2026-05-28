"use client";

import { useRef, useState, useEffect, FormEvent, ChangeEvent } from "react";
import { Icon } from "@iconify/react";
import { ACCEPTED_IMAGE_EXTENSIONS, ACCEPTED_IMAGE_TYPES } from "@/lib/constants";

interface PendingImage {
  file: File;
  previewUrl: string;
  name: string;
}

interface ChatInputProps {
  onSend: (message: string, image?: File) => Promise<void>;
  disabled?: boolean;
  uploadProgress?: number | null;
}

export default function ChatInput({
  onSend,
  disabled = false,
  uploadProgress = null,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowAttachMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "0px";
    const newHeight = Math.min(ta.scrollHeight, 120);
    ta.style.height = `${newHeight}px`;
    ta.style.overflowY = ta.scrollHeight > 120 ? "auto" : "hidden";
  }, [message]);

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !ACCEPTED_IMAGE_TYPES.includes(
        file.type as (typeof ACCEPTED_IMAGE_TYPES)[number]
      )
    ) {
      alert("Please upload JPG, PNG, or WEBP images only.");
      return;
    }

    if (pendingImage) URL.revokeObjectURL(pendingImage.previewUrl);

    setPendingImage({
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
    });
    setShowAttachMenu(false);
    e.target.value = "";
  };

  const removeImage = () => {
    if (pendingImage) URL.revokeObjectURL(pendingImage.previewUrl);
    setPendingImage(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed && !pendingImage) return;
    if (disabled) return;

    const imageToSend = pendingImage?.file;
    const msg =
      trimmed ||
      "Please analyze this car image for damage and provide a full inspection report.";

    setMessage("");
    if (pendingImage) {
      URL.revokeObjectURL(pendingImage.previewUrl);
      setPendingImage(null);
    }

    await onSend(msg, imageToSend);
  };

  return (
    <div className="w-full space-y-3">
      {pendingImage && (
        <div className="flex items-start gap-3 rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
          <div className="relative shrink-0 overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pendingImage.previewUrl}
              alt="Preview"
              className="h-20 w-20 object-cover sm:h-24 sm:w-24"
            />
            {uploadProgress !== null && uploadProgress < 100 && (
              <div className="absolute inset-0 flex items-end bg-black/40">
                <div
                  className="h-1 bg-emerald-400 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {pendingImage.name}
            </p>
            <p className="text-xs text-white/60">Ready to analyze</p>
          </div>
          <button
            type="button"
            onClick={removeImage}
            className="shrink-0 rounded-full bg-red-500/80 p-1.5 text-white hover:bg-red-600"
            aria-label="Remove image"
          >
            <Icon icon="mdi:close" className="text-sm" />
          </button>
        </div>
      )}

      {uploadProgress !== null && uploadProgress < 100 && !pendingImage && (
        <div className="rounded-lg bg-white/10 px-4 py-2">
          <div className="mb-1 flex justify-between text-xs text-white/70">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 rounded-2xl border-2 border-emerald-600/80 bg-black/30 px-3 py-2 backdrop-blur-sm sm:gap-3 sm:px-4 sm:py-3"
      >
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            disabled={disabled}
            className="rounded-lg p-2 text-emerald-400 transition-colors hover:bg-white/10 disabled:opacity-50"
            aria-label="Attach image"
          >
            <Icon icon="mdi:image-plus" className="text-xl sm:text-2xl" />
          </button>

          {showAttachMenu && (
            <div className="absolute bottom-full left-0 mb-2 w-48 rounded-xl bg-white p-3 shadow-xl">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Icon icon="mdi:camera" className="text-xl text-blue-500" />
                Upload car photo
              </button>
              <p className="mt-1 px-3 text-[10px] text-gray-400">
                JPG, PNG, WEBP
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_EXTENSIONS}
            className="hidden"
            onChange={handleImageSelect}
          />
        </div>

        <textarea
          ref={textareaRef}
          data-testid="chat-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          disabled={disabled}
          rows={1}
          placeholder="Ask about cars, maintenance, or upload damage photos..."
          className="max-h-[120px] min-h-[24px] flex-1 resize-none bg-transparent text-sm text-white placeholder:text-white/50 outline-none sm:text-base"
        />

        <button
          type="submit"
          data-testid="chat-send"
          disabled={disabled || (!message.trim() && !pendingImage)}
          className="shrink-0 rounded-xl bg-emerald-700 p-2.5 text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40 sm:p-3"
          aria-label="Send message"
        >
          {disabled ? (
            <Icon icon="mdi:loading" className="animate-spin text-xl" />
          ) : (
            <Icon icon="mdi:send" className="text-xl" />
          )}
        </button>
      </form>
    </div>
  );
}
