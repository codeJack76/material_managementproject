"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconType } from "react-icons";

interface SidebarLinkProps {
  href: string;
  icon: IconType;
  label: string;
  isCollapsed: boolean;
}

export function SidebarLink({
  href,
  icon: Icon,
  label,
  isCollapsed,
}: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
        ${
          isActive
            ? "bg-blue-600 text-white shadow-md"
            : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
        }
        ${isCollapsed ? "justify-center" : ""}
      `}
      title={isCollapsed ? label : undefined}
    >
      <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : ""}`} />
      {!isCollapsed && (
        <span className="font-medium text-sm whitespace-nowrap">{label}</span>
      )}
    </Link>
  );
}
