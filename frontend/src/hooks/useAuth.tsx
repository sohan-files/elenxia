import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { apiFetch, setAccessToken } from "@/lib/apiClient";

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  sms_enabled: boolean;
}

interface AuthContextType {
  user: User | null;
  session: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Attempt to restore token from sessionStorage
        const token = sessionStorage.getItem("pp_token");
        if (token) {
          setAccessToken(token);
          
          try {
            const userData = await apiFetch('/me/');
            setUser(userData);
            setSession({ access: token });
          } catch (error) {
            // Token is invalid, clear it
            console.error('Token validation failed:', error);
            setAccessToken(null);
            sessionStorage.removeItem("pp_token");
            setUser(null);
            setSession(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAccessToken(null);
        sessionStorage.removeItem("pp_token");
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signOut = async () => {
    try {
      setAccessToken(null);
      sessionStorage.removeItem("pp_token");
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};