import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 🔄 Auto-load session on mount
  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session) {
        setToken(data.session.access_token);
      }
    };
    getSession();
  }, []);

  const register = async (email: string, password: string) => {
    setError(null);
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
    } else if (data?.session) {
      setToken(data.session.access_token);
    } else {
      setError("Registration successful. Please check your email to confirm your account.");
    }
  };

  const login = async (email: string, password: string) => {
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    } else {
      setToken(data?.session?.access_token || null);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setToken(null);
  };

  const getProtected = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      setError(error.message);
      return null;
    }

    return {
      message: `Welcome, ${data.user?.email || "User"}!`,
    };
  };

  return { register, login, logout, getProtected, token, error };
}
