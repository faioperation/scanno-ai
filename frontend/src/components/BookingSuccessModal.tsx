"use client";

import { useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";

interface BookingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingSuccessModal({
  isOpen,
  onClose,
}: BookingSuccessModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-success-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div
        data-testid="booking-success-modal"
        className="relative w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-2xl animate-scale-in"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close"
        >
          <Icon icon="mdi:close" className="text-xl" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Icon
              icon="mdi:check-circle"
              className="text-4xl text-emerald-600"
            />
          </div>

          <h2
            id="booking-success-title"
            className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl"
          >
            Booking Completed Successfully!
          </h2>

          <p className="mb-6 text-sm text-gray-600 sm:text-base">
            Our team will contact you shortly.
          </p>

          <button
            onClick={onClose}
            className="w-full rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-800"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
