"use client";

import { useState, useRef, useEffect } from "react";
import {
  HiOutlineMenu,
  HiOutlineBell,
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineLogout,
} from "react-icons/hi";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

interface HeaderProps {
  onMenuClick: () => void;
  isSidebarCollapsed: boolean;
}

export function Header({ onMenuClick, isSidebarCollapsed }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get initials from user name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = user?.name || "Guest";
  const displayRole = user?.role === "ADMIN" ? "Administrator" : "User";
  const initials = user?.name ? getInitials(user.name) : "G";
  const isAdmin = user?.role === "ADMIN";

  return (
    <header
      className={`
        fixed top-0 right-0 h-16 bg-gray-100 border-b border-gray-300 z-30
        transition-all duration-300 flex items-center justify-between px-4
        ${isSidebarCollapsed ? "left-16" : "left-64"}
      `}
    >
      {/* Left Side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-600 hover:bg-gray-200 rounded-lg"
        >
          <HiOutlineMenu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Learning Resources Inventory
          </h1>
          <p className="text-xs text-gray-500">
            Department of Education - Division of Ilocos Norte
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 text-gray-600 hover:bg-gray-200 rounded-lg">
          <HiOutlineBell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Admin Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">{initials}</span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900">{displayName}</p>
              <p className="text-xs text-gray-500">{displayRole}</p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-50 rounded-lg shadow-lg border border-gray-300 py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500">{displayRole}</p>
              </div>
              <Link
                href="/profile"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                onClick={() => setIsDropdownOpen(false)}
              >
                <HiOutlineUser className="w-4 h-4" />
                Profile
              </Link>
              {isAdmin && (
                <Link
                  href="/users"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <HiOutlineCog className="w-4 h-4" />
                  User Management
                </Link>
              )}
              <div className="border-t border-gray-200 my-1" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-200 w-full"
              >
                <HiOutlineLogout className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
