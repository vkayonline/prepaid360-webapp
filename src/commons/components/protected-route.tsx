import { Navigate, Outlet } from "react-router-dom";
import { useSessionStore } from "@/commons/store/session";

export function ProtectedRoute() {
  const { user, loading } = useSessionStore();

  if (loading) {
    // Update with ripple loading animation
    return <div>Loading...</div>;
  }

  if (!user && !loading) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
}
