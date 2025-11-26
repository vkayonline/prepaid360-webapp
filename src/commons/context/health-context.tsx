"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { checkHealth } from "@/commons/api"; // ✅ adjust path if needed

type HealthStatus = "CHECKING" | "UP" | "DOWN";

interface HealthContextType {
  status: HealthStatus;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export function HealthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<HealthStatus>("CHECKING");

  useEffect(() => {
    const checkHealthStatus = async () => {
      try {
        const response = await checkHealth(); // ✅ Uses BaseClient now

        if (response?.data?.status === "UP") {
          setStatus("UP");
        } else {
          setStatus("DOWN");
        }
      } catch (error) {
        console.error("Health check failed:", error);
        setStatus("DOWN");
      }
    };

    checkHealthStatus(); // ✅ Initial check
    const interval = setInterval(checkHealthStatus, 60000); // ✅ Every 60s

    return () => clearInterval(interval);
  }, []);

  return (
    <HealthContext.Provider value={{ status }}>
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  const context = useContext(HealthContext);
  if (context === undefined) {
    throw new Error("useHealth must be used within a HealthProvider");
  }
  return context;
}
