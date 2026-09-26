"use client";

import { useState } from "react";

function formatPhone(raw: string): string {
  // Sadece rakamları al
  const digits = raw.replace(/\D/g, "");
  // Başta 0 yoksa ekle
  const normalized = digits.startsWith("0") ? digits : digits ? "0" + digits : "";
  // 0 555 555 55 55 formatı
  const d = normalized.slice(0, 11);
  if (d.length <= 1) return d;
  if (d.length <= 4) return `${d.slice(0, 1)} ${d.slice(1)}`;
  if (d.length <= 7) return `${d.slice(0, 1)} ${d.slice(1, 4)} ${d.slice(4)}`;
  if (d.length <= 9) return `${d.slice(0, 1)} ${d.slice(1, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  return `${d.slice(0, 1)} ${d.slice(1, 4)} ${d.slice(4, 7)} ${d.slice(7, 9)} ${d.slice(9, 11)}`;
}

export function PhoneInput({
  name,
  required,
  placeholder,
  defaultValue,
}: {
  name: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue ? formatPhone(defaultValue) : "");

  return (
    <input
      className="input"
      name={name}
      type="tel"
      required={required}
      placeholder={placeholder || "0 555 555 55 55"}
      value={value}
      onChange={(e) => setValue(formatPhone(e.target.value))}
      inputMode="numeric"
    />
  );
}
