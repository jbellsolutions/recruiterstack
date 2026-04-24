"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Rabbit Hole" },
  { href: "/ideas", label: "Problems & Solutions" },
  { href: "/plan", label: "Plan With AI" },
];

export function NavTabs() {
  const pathname = usePathname();

  return (
    <div className="border-b border-zinc-800 bg-zinc-950">
      <div className="max-w-6xl mx-auto px-6">
        <nav className="flex gap-1">
          {tabs.map((tab) => {
            const isActive =
              tab.href === "/"
                ? pathname === "/"
                : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-blue-500 text-white"
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
