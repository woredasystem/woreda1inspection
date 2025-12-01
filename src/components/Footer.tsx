import Link from "next/link";
import { HiHome, HiEnvelope, HiPhone, HiAcademicCap, HiHeart, HiUserGroup, HiQrCode, HiDocumentText } from "react-icons/hi2";

interface FooterColumn {
  title: string;
  links: { label: string; href: string; icon: React.ComponentType<{ className?: string }> | null }[];
}

interface FooterProps {
  woredaName: string;
}

const columns: FooterColumn[] = [
  {
    title: "Official",
    links: [
      { label: "Home", href: "/", icon: HiHome },
      { label: "Request Access", href: "/request-access", icon: HiQrCode },
      { label: "Documents", href: "/documents", icon: HiDocumentText },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Education", href: "#", icon: HiAcademicCap },
      { label: "Health", href: "#", icon: HiHeart },
      { label: "Community", href: "#", icon: HiUserGroup },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "info@woreda.gov", href: "mailto:info@woreda.gov", icon: HiEnvelope },
      { label: "Call Center", href: "tel:+251111000000", icon: HiPhone },
    ],
  },
];

export function Footer({ woredaName }: FooterProps) {
  return (
    <footer className="mt-16 border-t border-slate-200/80 pt-8 text-slate-600">
      <div className="grid gap-8 md:grid-cols-3">
        <div className="text-slate-900">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
            {woredaName}
          </p>
          <p className="mt-2 max-w-sm text-sm">
            Sustaining transparent service delivery with a citizen-first
            mandate, respectful governance, and measured progress.
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
              {column.title}
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {column.links.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.label}>
                    <Link
                      className="flex items-center gap-2 text-slate-600 transition hover:text-slate-900"
                      href={link.href}
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-8 text-xs uppercase tracking-[0.35em] text-slate-400">
        © {new Date().getFullYear()} {woredaName} Administration
      </p>
    </footer>
  );
}


