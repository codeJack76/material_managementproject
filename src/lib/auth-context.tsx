"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: string;
  username: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  resetInactivityTimer: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

// Key for storing last activity timestamp
const LAST_ACTIVITY_KEY = "lastActivity";
const USER_KEY = "user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check if session is expired
  const isSessionExpired = useCallback(() => {
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (!lastActivity) return true;
    
    const timeSinceActivity = Date.now() - parseInt(lastActivity, 10);
    return timeSinceActivity > SESSION_TIMEOUT;
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    setUser(null);
    router.push("/");
  }, [router]);

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    if (user) {
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    }
  }, [user]);

  // Login function
  const login = useCallback((userData: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    setUser(userData);
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = localStorage.getItem(USER_KEY);
        
        if (storedUser) {
          // Check if session is expired
          if (isSessionExpired()) {
            logout();
            return;
          }
          
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(LAST_ACTIVITY_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [isSessionExpired, logout]);

  // Set up activity listeners for session timeout
  useEffect(() => {
    if (!user) return;

    // Events that indicate user activity
    const activityEvents = ["mousedown", "keydown", "scroll", "touchstart"];

    const handleActivity = () => {
      resetInactivityTimer();
    };

    // Add event listeners
    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Check for session expiry periodically
    const checkInterval = setInterval(() => {
      if (isSessionExpired()) {
        logout();
        alert("Your session has expired due to inactivity. Please log in again.");
      }
    }, 60000); // Check every minute

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(checkInterval);
    };
  }, [user, resetInactivityTimer, isSessionExpired, logout]);

  // Protect dashboard routes
  useEffect(() => {
    if (isLoading) return;

    const protectedPaths = [
      "/dashboard",
      "/inventory",
      "/schools",
      "/issue-items",
      "/history",
      "/users",
      "/profile",
    ];

    const isProtectedRoute = protectedPaths.some(
      (path) => pathname === path || pathname.startsWith(path + "/")
    );

    if (isProtectedRoute && !user) {
      router.push("/");
    }
  }, [user, isLoading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, resetInactivityTimer }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
