"use client";
import Link from "next/link";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getMessages, tPath } from "@/lib/i18n";
import type { Locale } from "@/lib/constants";

export function Header({ locale }: { locale: Locale }) {
  const t = getMessages(locale);
  const [open, setOpen] = useState(false);

  const links = [
    [t.nav.home, tPath(locale, "/")],
    [t.nav.caregivers, tPath(locale, "/caregivers")],
    [t.nav.jobs, tPath(locale, "/jobs")],
    [t.nav.about, tPath(locale, "/about")],
  ] as const;

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        {/* Logo */}
        <Link href={tPath(locale, "/")} className="flex items-baseline gap-2" onClick={() => setOpen(false)}>
          <span className="font-serif text-2xl font-semibold text-teal-dark">{t.brand}</span>
          <span className="hidden text-xs text-muted sm:inline">{t.tagline}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 text-sm font-medium md:flex">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="hover:text-teal">
              {label}
            </Link>
          ))}
        </nav>

        {/* Sağ alan */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} />
          <Link className="btn-primary hidden px-4 py-1.5 text-sm md:inline-flex" href={tPath(locale, "/apply")}>
            {t.nav.apply}
          </Link>
          {/* Hamburger */}
          <button
            className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-lg md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menü"
          >
            <span className={`block h-0.5 w-5 bg-teal-dark transition-all ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-5 bg-teal-dark transition-all ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 bg-teal-dark transition-all ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobil menü */}
      {open && (
        <nav className="border-t border-ink/10 bg-cream px-4 pb-4 md:hidden">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="block py-3 text-sm font-medium text-teal-dark border-b border-ink/5 last:border-0"
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link
            className="btn-primary mt-4 block w-full text-center text-sm"
            href={tPath(locale, "/apply")}
            onClick={() => setOpen(false)}
          >
            {t.nav.apply}
          </Link>
        </nav>
      )}
    </header>
  );
}

export function Footer({ locale }: { locale: Locale }) {
  const t = getMessages(locale);
  return (
    <footer className="mt-auto border-t border-ink/10 bg-teal-dark text-cream">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="font-serif text-2xl">{t.brand}</p>
        <p className="mt-2 max-w-2xl text-sm text-cream/80">{t.footer.disclaimer}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-cream/60">
          <Link href={`/${locale}/kvkk`} className="hover:text-cream/90">{t.footer.kvkk}</Link>
          <Link href={`/${locale}/terms`} className="hover:text-cream/90">{t.footer.terms}</Link>
        </div>
        <p className="mt-4 text-xs text-cream/60">
          © {new Date().getFullYear()} {t.brand}. {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
