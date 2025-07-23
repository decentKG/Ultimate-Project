import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'applicant' | 'company';
  companyName?: string;
  industry?: string;
  profileComplete?: boolean;
  industryPreferences?: string[];
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  logout: () => {},
  isLoading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session?.user) {
          const userMetadata = session.user.user_metadata;
          const userEmail = session.user.email!;
          
          const name = userMetadata.firstName 
            ? `${userMetadata.firstName} ${userMetadata.lastName}` 
            : userEmail.split('@')[0];

          setUser({
            id: session.user.id,
            email: userEmail,
            name: name,
            role: userMetadata.userType || 'applicant',
            companyName: userMetadata.companyName,
            industry: userMetadata.industry,
            industryPreferences: userMetadata.industryPreferences,
            profileComplete: false, // You can update this logic later
          });
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    isAuthenticated: !!user,
    user,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
}