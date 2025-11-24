import { useHealth } from "@/commons/context/health-context";
import ServiceDownPage from "@/features/error/service-down-page";
import { Skeleton } from "@/commons/components/ui/skeleton";
import { Outlet } from "react-router-dom";

export function HealthCheck() {
  const { status } = useHealth();

  if (status === "CHECKING") {
    // Shows a full-page loading skeleton during the initial check
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-16 w-1/3" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (status === "DOWN") {
    return <ServiceDownPage />;
  }

  // If status is "UP", render the actual application routes
  return <Outlet />;
}
