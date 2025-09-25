import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { apiFetch, setAccessToken } from "@/lib/apiClient";

interface AuthContextType {
  user: any | null;
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
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt to restore token from sessionStorage
    const token = sessionStorage.getItem("pp_token");
    if (token) {
      setAccessToken(token);
      apiFetch('/me/').then((me) => {
        setUser(me);
        setSession({ access: token });
        setLoading(false);
      }).catch(() => {
        setAccessToken(null);
        sessionStorage.removeItem("pp_token");
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const signOut = async () => {
    setAccessToken(null);
    sessionStorage.removeItem("pp_token");
    setUser(null);
    setSession(null);
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