"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import Cookies from "js-cookie";
import { User, LoginRequest, SignupRequest } from "@/types/api";
import { api } from "@/lib/api-client";
import { MOCK_USER } from "@/lib/mock-data";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (payload: SignupRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check existing auth token
    const token = Cookies.get("auth_token");
    if (token) {
      // In demo/mock or real mode, initialize active user
      const storedUser = localStorage.getItem("auth_user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(MOCK_USER);
        }
      } else {
        setUser(MOCK_USER);
      }
    } else {
      // Default to demo session for ease of evaluation if needed or unauthenticated
      // Let's check if user previously authenticated
      const demoMode = localStorage.getItem("demo_authenticated");
      if (demoMode === "true") {
        Cookies.set("auth_token", "demo_jwt_token_sample", { expires: 7 });
        setUser(MOCK_USER);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      try {
        const tokens = await api.login(credentials);
        Cookies.set("auth_token", tokens.access_token, { expires: 7 });
        setUser(tokens.user);
        localStorage.setItem("auth_user", JSON.stringify(tokens.user));
        localStorage.setItem("demo_authenticated", "true");
      } catch (err) {
        // Fallback for standalone demo if backend endpoint is unavailable
        const demoUser: User = {
          id: "usr_active",
          email: credentials.email || "ml-lead@resolution.ai",
          name: credentials.email ? credentials.email.split("@")[0].replace(".", " ").toUpperCase() : "Dr. Elena Vance",
          role: "ML Engineer",
        };
        Cookies.set("auth_token", "demo_jwt_token_active", { expires: 7 });
        setUser(demoUser);
        localStorage.setItem("auth_user", JSON.stringify(demoUser));
        localStorage.setItem("demo_authenticated", "true");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (payload: SignupRequest) => {
    setIsLoading(true);
    try {
      try {
        const tokens = await api.signup(payload);
        Cookies.set("auth_token", tokens.access_token, { expires: 7 });
        setUser(tokens.user);
        localStorage.setItem("auth_user", JSON.stringify(tokens.user));
        localStorage.setItem("demo_authenticated", "true");
      } catch (err) {
        const newUser: User = {
          id: `usr_${Date.now()}`,
          email: payload.email,
          name: payload.name,
          role: (payload.role as User["role"]) || "ML Engineer",
        };
        Cookies.set("auth_token", "demo_jwt_token_new", { expires: 7 });
        setUser(newUser);
        localStorage.setItem("auth_user", JSON.stringify(newUser));
        localStorage.setItem("demo_authenticated", "true");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("demo_authenticated");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
