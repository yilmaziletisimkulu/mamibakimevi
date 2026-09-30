"use client";

import { useEffect, useState } from "react";

const IMAGES = [
  "/images/hero-care.jpg",
  "https://plus.unsplash.com/premium_photo-1663036976879-4baf18adfd5b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];

const INTERVAL = 6000;
const FADE_DURATION = 1500;

export function HeroSlideshow({ alt }: { alt: string }) {
  const [current, setCurrent] = useState(0);
  const [nextIdx, setNextIdx] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const n = (current + 1) % IMAGES.length;

      // 1. yeni resmi opacity:0 ile DOM'a ekle
      setNextIdx(n);
      setVisible(false);

      // 2. bir tick bekle, sonra opacity:1'e geç (transition tetiklenir)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true);
        });
      });

      // 3. geçiş bitince current'ı güncelle, next'i kaldır
      setTimeout(() => {
        setCurrent(n);
        setNextIdx(null);
        setVisible(false);
      }, FADE_DURATION + 50);
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
      {nextIdx !== null && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={IMAGES[nextIdx]}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            opacity: visible ? 1 : 0,
            transition: `opacity ${FADE_DURATION}ms ease-in-out`,
          }}
        />
      )}
    </div>
  );
}
