"use client";

import { Icon } from "@iconify/react";
import { SOCIAL_LINKS } from "@/lib/constants";

const platforms = [
  { name: "Facebook", href: SOCIAL_LINKS.facebook, icon: "bi:facebook" },
  { name: "Instagram", href: SOCIAL_LINKS.instagram, icon: "mdi:instagram" },
  { name: "WhatsApp", href: SOCIAL_LINKS.whatsapp, icon: "mdi:whatsapp" },
];

export default function SocialLinks() {
  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4">
      <p className="text-sm font-semibold text-white/80 sm:text-base">
        Follow Us
      </p>
      <div className="flex items-center gap-3 sm:gap-4">
        {platforms.map((platform) => (
          <a
            key={platform.name}
            href={platform.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={platform.name}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition-all hover:border-emerald-400/50 hover:bg-emerald-900/40 hover:text-emerald-300 sm:h-11 sm:w-11"
          >
            <Icon icon={platform.icon} className="text-lg sm:text-xl" />
          </a>
        ))}
      </div>
    </div>
  );
}
