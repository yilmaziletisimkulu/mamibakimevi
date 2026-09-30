"use client";

import { useEffect, useState } from "react";

const IMAGES = [
  "/images/hero-care.jpg",
  "https://plus.unsplash.com/premium_photo-1663036976879-4baf18adfd5b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];

const INTERVAL = 6000;   // resimler arası bekleme (ms)
const FADE_DURATION = 1500; // geçiş süresi (ms)

export function HeroSlideshow({ alt }: { alt: string }) {
  const [current, setCurrent] = useState(0);
  const [next, setNext] = useState<number | null>(null);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIdx = (current + 1) % IMAGES.length;
      setNext(nextIdx);
      setFading(true);

      setTimeout(() => {
        setCurrent(nextIdx);
        setNext(null);
        setFading(false);
      }, FADE_DURATION);
    }, INTERVAL);

    return () => clearInterval(timer);
  }, [current]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Alttaki mevcut resim */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={IMAGES[current]}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Üstteki yeni resim — fade in */}
      {next !== null && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={IMAGES[next]}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            opacity: fading ? 1 : 0,
            transition: `opacity ${FADE_DURATION}ms ease-in-out`,
          }}
        />
      )}
    </div>
  );
}
