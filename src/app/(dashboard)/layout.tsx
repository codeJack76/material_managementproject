"use client";

import { useState } from "react";
import { Sidebar } from "@/app/components/ui/Sidebar";
import { Header } from "@/app/components/ui/Header";
import { useAuth } from "@/lib/auth-context";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, isLoading } = useAuth();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-200 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If not authenticated, the AuthProvider will redirect to landing page
  // This is a fallback to prevent flash of content
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-200 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />

      {/* Header */}
      <Header onMenuClick={toggleSidebar} isSidebarCollapsed={isCollapsed} />

      {/* Main Content */}
      <main
        className={`
          pt-16 min-h-screen transition-all duration-300
          ${isCollapsed ? "pl-16" : "pl-64"}
        `}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
