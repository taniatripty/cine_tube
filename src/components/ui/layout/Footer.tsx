import { Clapperboard, Play } from "lucide-react";
import Link from "next/link";

import {
  FaFacebook,
  FaInstagramSquare,
  FaTwitterSquare,
  FaYoutubeSquare,
} from "react-icons/fa";

const browseLinks = [
  { label: "Home", href: "/" },
  { label: "Movies", href: "/movies" },
  { label: "TV Shows", href: "/tv-shows" },
  { label: "New Releases", href: "/new-releases" },
];

const supportLinks = [
  { label: "My List", href: "/my-list" },
  { label: "Watchlist", href: "/watchlist" },
  { label: "Help Center", href: "/help" },
  { label: "Contact", href: "/contact" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Cookie Settings", href: "/cookies" },
  { label: "Advertise", href: "/advertise" },
];

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com", icon: FaFacebook },
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: FaInstagramSquare,
  },
  { label: "YouTube", href: "https://youtube.com", icon: FaYoutubeSquare },
  { label: "X", href: "https://x.com", icon: FaTwitterSquare },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-slate-950 text-slate-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="space-y-5">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold tracking-tight text-white"
              aria-label="CineTube home"
            >
              <Clapperboard
                className="size-6 text-red-500"
                aria-hidden="true"
              />
              <span>
                Cine<span className="text-red-500">Tube</span>
              </span>
            </Link>

            <p className="max-w-sm text-sm leading-6 text-slate-400">
              Discover new favorites, revisit cult classics, and stream the
              stories you love, all in one cinematic destination built for
              night-owl binge sessions.
            </p>

            <div className="flex items-center gap-3">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition-colors hover:border-red-500/60 hover:bg-red-500/10 hover:text-red-400"
                >
                  <Icon className="size-4" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
              Browse
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              {browseLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
              Support
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
              Legal
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Play className="size-4 text-red-500" aria-hidden="true" />
            <span>© 2026 CineTube. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/privacy" className="transition hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-white">
              Terms
            </Link>
            <Link href="/cookies" className="transition hover:text-white">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
