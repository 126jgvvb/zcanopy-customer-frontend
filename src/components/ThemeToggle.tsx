"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    const prefersDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored ? stored === "dark" : prefersDark;
    setDark(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    if (next) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-strong)] text-[var(--zcanopy-card-brown)] transition-colors duration-200 hover:border-[var(--zcanopy-primary)] hover:text-[var(--zcanopy-primary)]"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
