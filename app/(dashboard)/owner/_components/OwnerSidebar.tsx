"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface OwnerNavItem {
  name: string;
  href: string;
  icon: string;
  exact?: boolean;
  matchPrefixes?: string[];
}

const ownerNavItems: OwnerNavItem[] = [
  {
    name: "Dashboard",
    href: "/owner",
    icon: "📊",
    exact: true,
  },
  {
    name: "Business Settings",
    href: "/owner/business/edit",
    matchPrefixes: ["/owner/business"],
    icon: "🏢",
  },
  {
    name: "Services",
    href: "/owner/services",
    matchPrefixes: ["/owner/services"],
    icon: "💇‍♂️",
  },
  {
    name: "Availability Schedule",
    href: "/owner/availability",
    matchPrefixes: ["/owner/availability"],
    icon: "📅",
  },
  {
    name: "Customer Bookings",
    href: "/owner/bookings",
    matchPrefixes: ["/owner/bookings"],
    icon: "🎟️",
  },
];

export function OwnerSidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isItemActive = (item: OwnerNavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    if (item.matchPrefixes) {
      return item.matchPrefixes.some((prefix) => pathname.startsWith(prefix));
    }
    return pathname.startsWith(item.href);
  };

  const activeItem = ownerNavItems.find(isItemActive) || ownerNavItems[0];

  return (
    <>
      {/* Mobile Top Sub-Header Bar (Mobile Only) */}
      <div className="md:hidden sticky top-16 z-40 w-full bg-[#161b22]/95 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-lg">{activeItem.icon}</span>
          <span className="font-heading font-extrabold text-sm text-slate-100">
            {activeItem.name}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="rounded-full bg-white/5 border border-white/10 p-2 text-slate-200 hover:bg-white/10 transition-colors flex items-center gap-1 text-xs font-bold"
          aria-label="Toggle Owner Navigation Menu"
        >
          <svg
            className="h-5 w-5 text-brand-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
          <span>{mobileMenuOpen ? "Close" : "Owner Menu"}</span>
        </button>
      </div>

      {/* Mobile Drawer Menu (Mobile Only) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[112px] z-40 bg-[#051424]/95 backdrop-blur-2xl border-b border-white/10 p-4 space-y-2 shadow-2xl animate-fade-in">
          <div className="px-2 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-brand-400 border-b border-white/10">
            Owner Studio Menu
          </div>
          <nav className="space-y-1 pt-1">
            {ownerNavItems.map((item) => {
              const active = isItemActive(item);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? "bg-brand-500/20 text-brand-300 border-l-4 border-brand-400 shadow-sm"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-[#161b22]/90 backdrop-blur-xl border-r border-white/10 p-5 space-y-6 min-h-[calc(100vh-4rem)]">
        {/* Sidebar Header */}
        <div className="space-y-1 pb-4 border-b border-white/10">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-400 block">
            Owner Portal
          </span>
          <h2 className="font-heading text-lg font-extrabold text-slate-100">
            Management Studio
          </h2>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 font-sans">
          {ownerNavItems.map((item) => {
            const active = isItemActive(item);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs transition-all duration-200 ${
                  active
                    ? "bg-brand-500/20 text-brand-300 border-l-4 border-brand-400 font-extrabold shadow-sm"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/5 font-semibold"
                }`}
              >
                <span className="text-lg transition-transform group-hover:scale-110">
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Info Tile */}
        <div className="rounded-2xl border border-white/10 bg-[#273647]/50 p-4 space-y-2">
          <span className="text-[11px] font-bold text-slate-300 block">
            💡 Quick Tip
          </span>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Keep your availability schedule and services up to date to receive maximum client bookings.
          </p>
        </div>
      </aside>
    </>
  );
}
