"use client";

import { useState, useEffect } from "react";
import {
  HiOutlineViewGrid,
  HiOutlineCube,
  HiOutlineAcademicCap,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineUsers,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi";
import { SidebarLink } from "./SidebarLink";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navigationItems = [
  { href: "/dashboard", icon: HiOutlineViewGrid, label: "Dashboard" },
  { href: "/inventory", icon: HiOutlineCube, label: "Inventory" },
  { href: "/schools", icon: HiOutlineAcademicCap, label: "Schools" },
  { href: "/issue-items", icon: HiOutlineClipboardList, label: "Issue Items" },
  { href: "/history", icon: HiOutlineClock, label: "Completed" },
];

const adminItems = [
  { href: "/users", icon: HiOutlineUsers, label: "User Management" },
];

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setIsAdmin(user.role === "ADMIN");
      } catch {
        setIsAdmin(false);
      }
    }
  }, []);

  return (
    <aside
      className={`
        fixed left-0 top-0 h-full bg-gray-100 border-r border-gray-300 
        transition-all duration-300 z-40 flex flex-col
        ${isCollapsed ? "w-16" : "w-64"}
      `}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-300">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <span className="font-bold text-gray-900">DepEd LR</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => (
          <SidebarLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isCollapsed={isCollapsed}
          />
        ))}

        {/* Admin Section - Only visible for ADMIN users */}
        {isAdmin && (
          <>
            {!isCollapsed && (
              <div className="pt-4 pb-2">
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Admin
                </p>
              </div>
            )}
            {isCollapsed && <div className="pt-4" />}
            {adminItems.map((item) => (
              <SidebarLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isCollapsed={isCollapsed}
              />
            ))}
          </>
        )}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-gray-300">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <HiOutlineChevronRight className="w-5 h-5" />
          ) : (
            <>
              <HiOutlineChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
