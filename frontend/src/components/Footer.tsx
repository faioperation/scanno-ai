"use client";

import { usePathname } from "next/navigation";
import { BRAND_CONFIG } from "@/lib/constants";

export default function Footer() {
  const pathname = usePathname();
  const isChatbot =
    pathname.startsWith("/chatbot") || pathname.startsWith("/inbox");

  if (isChatbot) return null;

  return (
    <footer className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 px-4 pb-3 pt-6 text-center safe-bottom">
      <p className="text-[10px] text-white/50 sm:text-xs md:text-sm">
        Powered by {BRAND_CONFIG.brandName} · Secure instant analysis
      </p>
    </footer>
  );
}
