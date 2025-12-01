import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useEffect } from "react";
import { useSessionStore } from "@/commons/store/session";
import { HealthProvider } from "@/commons/context/health-context";
import { Layout } from "@/commons/components/layout";
import { ProtectedRoute } from "@/commons/components/protected-route";
import { HealthCheck } from "@/commons/components/health-check";
import LoginPage from "@/features/auth/login-page";
import DashboardPage from "@/features/dashboard/dashboard-page";
import CreateApplicationPage from "@/features/applications/create-application";
import ViewApplicationsPage from "@/features/applications/view-applications";
import BatchDetailsPage from "@/features/applications/batch-details-page";
import ApplicationDetailsPage from "@/features/applications/application-details-page";
import NotFoundPage from "@/features/error/not-found-page";

function AppLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function App() {
  const checkSession = useSessionStore((state) => state.checkSession);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <HealthProvider>
        <Routes>
          <Route element={<HealthCheck />}>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<NotFoundPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route
                  path="/applications"
                  element={<ViewApplicationsPage />}
                />
                <Route
                  path="/applications/create"
                  element={<CreateApplicationPage />}
                />
                <Route
                  path="/applications/:batchId"
                  element={<BatchDetailsPage />}
                />
                <Route
                  path="/applications/:batchId/:applicationId"
                  element={<ApplicationDetailsPage />}
                />
              </Route>
            </Route>
          </Route>
        </Routes>
      </HealthProvider>
    </Router>
  );
}

export default App;
