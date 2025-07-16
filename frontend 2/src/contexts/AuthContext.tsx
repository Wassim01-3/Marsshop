import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    userData: Omit<User, "id" | "createdAt" | "isAdmin"> & { password: string }
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (userData: Partial<User> & { password?: string }) => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  authLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // On mount, fetch user profile if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuthLoading(true);
      fetch("http://localhost:8000/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch user");
          return res.json();
        })
        .then((userData) => {
          setUser(userData);
          localStorage.setItem("mars-shop-user", JSON.stringify(userData));
          setAuthLoading(false);
        })
        .catch(() => {
          setUser(null);
          localStorage.removeItem("mars-shop-user");
          setAuthLoading(false);
        });
    } else {
      setUser(null);
      localStorage.removeItem("mars-shop-user");
      setAuthLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("http://localhost:8000/api/login_check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      const token = data.token;
      if (!token) return false;
      localStorage.setItem("token", token);
      // Fetch user profile
      const meRes = await fetch("http://localhost:8000/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!meRes.ok) return false;
      const userData = await meRes.json();
      setUser(userData);
      localStorage.setItem("mars-shop-user", JSON.stringify(userData));
      return true;
    } catch {
      localStorage.removeItem("token");
      setUser(null);
      return false;
    }
  };

  const register = async (
    userData: Omit<User, "id" | "createdAt" | "isAdmin"> & { password: string }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (res.ok) {
        return { success: true };
      } else {
        const data = await res.json();
        return { success: false, error: data.error || "Registration failed." };
      }
    } catch (e) {
      return { success: false, error: "Network error." };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("mars-shop-user");
    localStorage.removeItem("token");
  };

  const updateProfile = async (userData: Partial<User> & { password?: string }) => {
    if (!user) return { success: false, error: 'Not authenticated.' };
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8000/api/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        const data = await res.json();
        return { success: false, error: data.error || 'Failed to update profile.' };
      }
      const updatedUser = await res.json();
      setUser(updatedUser);
      localStorage.setItem('mars-shop-user', JSON.stringify(updatedUser));
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Network error.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin || false,
        authLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
