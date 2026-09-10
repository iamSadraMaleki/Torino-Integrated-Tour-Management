"use client";

import { useState, useEffect } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-gradient-to-r from-teal-800 to-cyan-900 shadow-2xl py-2"
          : "bg-gradient-to-r from-teal-600 to-cyan-700 py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-3xl animate-pulse">✈️</div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">تورینو</h1>
          </div>
          <button
            onClick={() => window.location.href = "/auth"}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-2 rounded-full font-bold transition-all duration-300 hover:scale-105"
          >
            🔑 لاگین / ثبت‌نام
          </button>
        </div>
      </div>
    </header>
  );
}