"use client";

import { Icon } from "@iconify/react";
import { BRAND_CONFIG } from "@/lib/constants";

interface ContactBarProps {
  onLinkClick: () => void;
}

export default function ContactBar({ onLinkClick }: ContactBarProps) {
  const links = [
    {
      label: "Website",
      href: BRAND_CONFIG.website,
      icon: "mdi:web",
    },
    {
      label: "Call",
      href: `tel:${BRAND_CONFIG.phone}`,
      icon: "mdi:phone",
    },
    {
      label: "Book",
      href: BRAND_CONFIG.bookingUrl,
      icon: "mdi:calendar-check",
    },
  ];

  return (
    <div className="fixed bottom-16 left-1/2 z-30 flex -translate-x-1/2 gap-2 px-4 sm:bottom-20 sm:gap-3">
      {links.map((link) => (
        <a
          key={link.label}
          data-testid={`contact-${link.label.toLowerCase()}`}
          href={link.href}
          onClick={(e) => {
            e.preventDefault();
            onLinkClick();
          }}
          className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-emerald-900/60 sm:px-4 sm:py-2 sm:text-sm"
        >
          <Icon icon={link.icon} className="text-base" />
          {link.label}
        </a>
      ))}
    </div>
  );
}
