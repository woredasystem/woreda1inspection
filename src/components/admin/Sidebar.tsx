"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiHome, HiQrCode, HiDocumentArrowUp, HiDocumentText, HiLockClosed } from "react-icons/hi2";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: HiHome },
  { href: "/admin/upload", label: "Upload Documents", icon: HiDocumentArrowUp },
  { href: "/admin/documents", label: "View Documents", icon: HiDocumentText },
  { href: "/admin/qr-generator", label: "QR Generator", icon: HiQrCode },
  { href: "/admin/requests", label: "QR Requests", icon: HiQrCode },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-white/10 bg-slate-900/90">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800">
          <HiLockClosed className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
            Admin Portal
          </p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800/50 hover:text-white"
        >
          <HiHome className="h-5 w-5" />
          Public Site
        </Link>
      </div>
    </aside>
  );
}

