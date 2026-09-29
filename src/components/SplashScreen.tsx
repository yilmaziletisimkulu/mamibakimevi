"use client";

import { useEffect, useState } from "react";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/constants";

const KEY = "mami-splash-seen";

export function SplashScreen({ locale }: { locale: Locale }) {
  const t = getMessages(locale);
  const [phase, setPhase] = useState<"show" | "out" | "gone">("show");

  useEffect(() => {
    try {
      if (sessionStorage.getItem(KEY)) {
        setPhase("gone");
        return;
      }
    } catch {
      /* ignore */
    }

    const fade = window.setTimeout(() => setPhase("out"), 3850);
    const hide = window.setTimeout(() => {
      setPhase("gone");
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {
        /* ignore */
      }
    }, 4500);

    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(hide);
    };
  }, []);

  if (phase === "gone") return null;

  const dismiss = () => {
    setPhase("out");
    window.setTimeout(() => {
      setPhase("gone");
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {
        /* ignore */
      }
    }, 650);
  };

  return (
    <div
      className={`splash-root ${phase === "out" ? "splash-root-out" : ""}`}
      role="dialog"
      aria-label={t.brand}
      onClick={dismiss}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/hero-care.jpg" alt="" className="splash-bg" />
      <div className="splash-veil" />
      <div className="splash-content">
        <p className="splash-brand">{t.brand}</p>
        <span className="splash-line" />
        <h1 className="splash-slogan">{t.splash.slogan}</h1>
        <p className="splash-hint">{t.tagline}</p>
        <button type="button" className="splash-skip" onClick={dismiss}>
          {t.splash.skip}
        </button>
      </div>
    </div>
  );
}
