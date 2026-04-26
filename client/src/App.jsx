import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProviderDashboard from "./components/ProviderDashboard";
import SeekerDashboard from "./components/SeekerDashboard";
import ProfilePage from "./components/ProfilePage";
import PaymentPage from "./pages/PaymentPage";
import SeekerHistory from "./pages/SeekerHistory";
import SeekerReview from "./pages/SeekerReview";
import ProviderReview from "./pages/ProviderReview";
import ReviewsPage from "./pages/ReviewsPage";
import SplashScreen from "./components/SplashScreen";

// ─── helpers ──────────────────────────────────────────────────────────────────
const getToken = () =>
  localStorage.getItem("token") || localStorage.getItem("gigride_token");

const getRole = () =>
  localStorage.getItem("role") || localStorage.getItem("gigride_role");

const getUser = () => {
  try {
    return (
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(localStorage.getItem("gigride_user")) ||
      {}
    );
  } catch {
    return {};
  }
};

const roleDashboard = (role) =>
  role === "provider" ? "/provider/dashboard" : "/seeker/dashboard";

// ─────────────────────────────────────────────────────────────────────────────
// ProtectedRoute — redirects to /login when no token
// optionally enforces a specific role
// ─────────────────────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, requiredRole }) => {
  const token = getToken();
  const role  = getRole();

  if (!token || !role) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    // Wrong role → send them to their own dashboard
    return <Navigate to={roleDashboard(role)} replace />;
  }

  return children;
};

// ─────────────────────────────────────────────────────────────────────────────
// PublicRoute — redirects to dashboard when already logged in
// (prevents logged-in users from reaching /login or /register)
// ─────────────────────────────────────────────────────────────────────────────
const PublicRoute = ({ children }) => {
  const token = getToken();
  const role  = getRole();

  if (token && role) {
    return <Navigate to={roleDashboard(role)} replace />;
  }

  return children;
};

// ─────────────────────────────────────────────────────────────────────────────
// HomeRoute — logged-in users land on their dashboard, otherwise show Home
// ─────────────────────────────────────────────────────────────────────────────
const HomeRoute = () => {
  const token = getToken();
  const role  = getRole();
  if (token && role) return <Navigate to={roleDashboard(role)} replace />;
  return <Home />;
};

// ─────────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const user = getUser();

  return (
    <BrowserRouter>
      <Routes>
        {/* Home — smart redirect if logged in */}
        <Route path="/" element={<HomeRoute />} />

        {/* Splash screen */}
        <Route path="/splash" element={<SplashScreen />} />

        {/* Public-only pages (redirect away if already logged in) */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Provider dashboard */}
        <Route
          path="/provider/dashboard"
          element={
            <ProtectedRoute requiredRole="provider">
              <ProviderDashboard user={user} />
            </ProtectedRoute>
          }
        />
        {/* backward-compat alias */}
        <Route path="/provider-dashboard" element={<Navigate to="/provider/dashboard" replace />} />

        {/* Seeker dashboard */}
        <Route
          path="/seeker/dashboard"
          element={
            <ProtectedRoute requiredRole="seeker">
              <SeekerDashboard user={user} />
            </ProtectedRoute>
          }
        />
        {/* backward-compat alias */}
        <Route path="/seeker-dashboard" element={<Navigate to="/seeker/dashboard" replace />} />

        {/* Profile — accessible to any logged-in user */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Payment — provider only */}
        <Route
          path="/provider/payment/:jobId"
          element={
            <ProtectedRoute requiredRole="provider">
              <PaymentPage />
            </ProtectedRoute>
          }
        />

        {/* Seeker history */}
        <Route
          path="/seeker/history"
          element={
            <ProtectedRoute requiredRole="seeker">
              <SeekerHistory />
            </ProtectedRoute>
          }
        />

        {/* Seeker review */}
        <Route
          path="/seeker/review/:historyId"
          element={
            <ProtectedRoute requiredRole="seeker">
              <SeekerReview />
            </ProtectedRoute>
          }
        />

        {/* Provider review */}
        <Route
          path="/provider/review/:jobId"
          element={
            <ProtectedRoute requiredRole="provider">
              <ProviderReview />
            </ProtectedRoute>
          }
        />

        {/* Reviews received — any logged-in user */}
        <Route
          path="/reviews/me"
          element={
            <ProtectedRoute>
              <ReviewsPage />
            </ProtectedRoute>
          }
        />

        {/* Seeker reviews alias */}
        <Route path="/seeker/reviews" element={<Navigate to="/reviews/me" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}