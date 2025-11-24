import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom"
import { SessionProvider } from "@/commons/context/session-context"
import { HealthProvider } from "@/commons/context/health-context"
import { Layout } from "@/commons/components/layout"
import { ProtectedRoute } from "@/commons/components/protected-route"
import { HealthCheck } from "@/commons/components/health-check"
import LoginPage from "@/features/auth/login-page.tsx"
import DashboardPage from "@/features/dashboard/dashboard-page.tsx"
import CreateApplicationPage from "@/features/applications/create-application.tsx"
import ViewApplicationsPage from "@/features/applications/view-applications.tsx"
import BatchDetailsPage from "@/features/applications/batch-details-page.tsx"
import ApplicationDetailsPage from "@/features/applications/application-details-page.tsx"
import NotFoundPage from "@/features/error/not-found-page.tsx"

function AppLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <SessionProvider>
        <HealthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<HealthCheck />}>
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/applications" element={<ViewApplicationsPage />} />
                  <Route path="/applications/create" element={<CreateApplicationPage />} />
                  <Route path="/applications/:batchId" element={<BatchDetailsPage />} />
                  <Route path="/applications/:batchId/:applicationId" element={<ApplicationDetailsPage />} />
                </Route>
              </Route>
            </Route>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </HealthProvider>
      </SessionProvider>
    </Router>
  )
}

export default App
