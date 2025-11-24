import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "@/commons/context/session-context";

export function ProtectedRoute() {
  const { user, loading } = useSession();

  if (loading) {
    // Update with ripple loading animation
    return <div>Loading...</div>;
  }  if (!user && !loading) {
    return <Navigate to="/login" />;
  }


  if (!user) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
}
