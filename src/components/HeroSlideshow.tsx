"use client";

import { useEffect, useState } from "react";

const IMAGES = [
  "/images/hero-care.jpg",
  "https://plus.unsplash.com/premium_photo-1663036976879-4baf18adfd5b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];

const INTERVAL = 5000;

export function HeroSlideshow({ alt }: { alt: string }) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const next = (current + 1) % IMAGES.length;
      setPrev(current);
      setCurrent(next);
      setFading(true);
      setTimeout(() => {
        setPrev(null);
        setFading(false);
      }, 900);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, [current]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {prev !== null && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`prev-${prev}`}
          src={IMAGES[prev]}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={`cur-${current}`}
        src={IMAGES[current]}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          opacity: fading ? 0 : 1,
          transition: fading ? "none" : "opacity 0.9s ease-in-out",
        }}
      />
    </div>
  );
}
