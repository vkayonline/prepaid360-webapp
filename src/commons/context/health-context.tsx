"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

type HealthStatus = "CHECKING" | "UP" | "DOWN";

interface HealthContextType {
  status: HealthStatus;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export function HealthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<HealthStatus>("CHECKING");

  useEffect(() => {
    const checkHealth = async () => {
      try {
        // We assume a simple GET request is enough for a health check.
        // This doesn't need our special apiClient as it's a GET and has no payload.
        const response = await fetch("http://localhost:8080/api/actuator/health");
        if (response.ok) {
          const data = await response.json();
          // Spring Actuator returns {"status":"UP"}
          if (data.status === "UP") {
            setStatus("UP");
          } else {
            setStatus("DOWN");
          }
        } else {
          setStatus("DOWN");
        }
      } catch (error) {
        console.error("Health check failed:", error);
        setStatus("DOWN");
      }
    };

    checkHealth(); // Initial check
    const interval = setInterval(checkHealth, 60000); // Check every 60 seconds

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
