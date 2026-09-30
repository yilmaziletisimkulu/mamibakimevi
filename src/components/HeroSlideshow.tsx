"use client";

import { useEffect, useState } from "react";

const IMAGES = [
  "/images/hero-care.jpg",
  "https://plus.unsplash.com/premium_photo-1663036976879-4baf18adfd5b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];

const INTERVAL = 6000;
const FADE_DURATION = 1500;

export function HeroSlideshow({ alt }: { alt: string }) {
  const [index, setIndex] = useState(0);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % IMAGES.length);
      setKey((k) => k + 1);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <style>{`
        @keyframes heroFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .hero-slide {
          animation: heroFadeIn ${FADE_DURATION}ms ease-in-out forwards;
        }
      `}</style>
      <div className="absolute inset-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={key}
          src={IMAGES[index]}
          alt={alt}
          className="hero-slide absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </>
  );
}
