"use client";

import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { BRAND_CONFIG } from "@/lib/constants";
import SocialLinks from "./SocialLinks";

export default function LandingPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 pb-28 pt-16 sm:px-6 sm:pb-32 sm:pt-20 md:px-8 lg:px-12">
        <div className="w-full text-center">
          <div className="anim-slide-up mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-900/30 px-4 py-1.5 text-xs font-medium text-emerald-300 sm:text-sm">
            <Icon icon="mdi:robot-happy" className="text-base" />
            AI-Powered Car Inspection
          </div>

          <h1
            data-testid="landing-title"
            className="anim-slide-up anim-delay-1 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl"
          >
            {BRAND_CONFIG.brandName}
          </h1>

          <p className="anim-slide-up anim-delay-2 mx-auto mt-5 max-w-2xl text-base font-medium leading-relaxed text-white/90 sm:mt-6 sm:text-lg md:text-xl">
            Your professional car expert, inspection assistant, and damage
            analysis specialist — available 24/7.
          </p>

          <p className="anim-slide-up anim-delay-2 mx-auto mt-3 max-w-xl text-sm text-white/70 sm:text-base">
            Ask about any car model, get maintenance advice, or upload damage
            photos for instant AI vision analysis with repair estimates.
          </p>
        </div>

        <div className="anim-slide-up anim-delay-3 mt-10 flex w-full max-w-md flex-col gap-3 sm:mt-12 sm:flex-row sm:justify-center">
          <Link
            href="/chatbot"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-900/40 transition-all hover:bg-emerald-600 hover:shadow-emerald-800/50 sm:px-10"
          >
            <Icon icon="mdi:chat-processing" className="text-xl" />
            Start AI Chat
          </Link>
          <Link
            href="/chatbot"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 sm:px-10"
          >
            <Icon icon="mdi:camera" className="text-xl" />
            Upload Damage Photo
          </Link>
        </div>

        <div className="anim-slide-up anim-delay-3 mt-14 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
          {[
            {
              icon: "mdi:car-info",
              title: "Car Expert",
              desc: "Model specs, common issues & maintenance",
            },
            {
              icon: "mdi:car-wrench",
              title: "Damage Analysis",
              desc: "AI vision detects dents, scratches & more",
            },
            {
              icon: "mdi:cash-multiple",
              title: "Repair Estimates",
              desc: "Cost ranges & repair recommendations",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              <Icon
                icon={feature.icon}
                className="mx-auto mb-3 text-3xl text-emerald-400"
              />
              <h3 className="mb-1 text-sm font-bold text-white sm:text-base">
                {feature.title}
              </h3>
              <p className="text-xs text-white/60 sm:text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>

        <div className="anim-slide-up anim-delay-3 mt-10">
          <SocialLinks />
        </div>
      </section>
    </main>
  );
}
