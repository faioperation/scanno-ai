"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import LandingPage from "./LandingPage";
import BookingSuccessModal from "./BookingSuccessModal";
import ContactBar from "./ContactBar";
import { BRAND_CONFIG } from "@/lib/constants";

export default function LoadingPage() {
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div
        style={{
          backgroundImage: "url('/assets/background.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="flex min-h-dvh w-full items-center justify-center bg-black/60"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-40 animate-pulse sm:h-20 sm:w-52">
            <Image
              className="h-full w-full object-contain"
              src="/assets/LOGO_SCANNOAI.png"
              width={300}
              height={300}
              alt={`${BRAND_CONFIG.brandName} logo`}
              priority
            />
          </div>
          <div className="flex gap-1">
            <span className="typing-dot h-2 w-2 rounded-full bg-emerald-400" />
            <span className="typing-dot h-2 w-2 rounded-full bg-emerald-400 [animation-delay:0.2s]" />
            <span className="typing-dot h-2 w-2 rounded-full bg-emerald-400 [animation-delay:0.4s]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <LandingPage />
      <ContactBar onLinkClick={() => setShowBookingModal(true)} />
      <BookingSuccessModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />
    </>
  );
}
