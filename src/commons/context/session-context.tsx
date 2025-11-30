import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { getMe } from "@/commons/api";

interface User {
  "user-id": number;
  "full-name": string;
  email: string;
  roles: string[];
  permissions: string[];
}

interface SessionContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  hasPermission: (permission: string) => boolean;
  loading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const userData = await getMe();
        setUser(userData);
      } catch (error) {
        // This is expected if the user is not logged in
        console.log("No active session found.");
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const hasPermission = (permission: string) => {
    return user?.permissions?.some(p => p.code === permission) ?? false;
};

  return (
    <SessionContext.Provider value={{ user, setUser, hasPermission, loading }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
