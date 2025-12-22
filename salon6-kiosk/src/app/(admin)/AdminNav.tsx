"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Today" },
  { href: "/admin/requests", label: "Requests" },
  { href: "/admin/settings", label: "Settings" },
];

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/admin") {
    return pathname === "/admin" || pathname.startsWith("/admin/today");
  }
  return pathname === href || pathname.startsWith(href);
}

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-2 border-b border-zinc-200 bg-white/80 p-4 text-sm text-zinc-800 backdrop-blur">
      {links.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-lg px-3 py-2 font-medium transition ${
              active
                ? "bg-zinc-900 text-white shadow-sm"
                : "bg-white text-zinc-800 hover:bg-zinc-100"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
