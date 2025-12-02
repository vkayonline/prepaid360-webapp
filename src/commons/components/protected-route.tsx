import { Navigate, Outlet } from "react-router-dom";
import { useSessionStore } from "@/commons/store/session";
import { CorporateSelectionDialog } from "@/features/auth/corporate-selection-dialog";

export function ProtectedRoute() {
  const { user, loading, selectedCorporate } = useSessionStore();

  if (loading) {
    // Update with ripple loading animation
    return <div>Loading...</div>;
  }

  if (!user && !loading) {
    return <Navigate to="/login" />;
  }

  // Block dashboard if multiple corporates exist and none is selected
  if (user?.corporates && user.corporates.length > 1 && !selectedCorporate) {
    return <CorporateSelectionDialog />;
  }

  return <Outlet />;
}
