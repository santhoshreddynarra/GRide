import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProviderDashboard from "./components/ProviderDashboard";
import SeekerDashboard from "./components/SeekerDashboard";
import ProfilePage from "./components/ProfilePage";
import PaymentPage from "./pages/PaymentPage";

// Simple protected route wrapper
const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem("token") || localStorage.getItem("gigride_token");
  const role = localStorage.getItem("role") || localStorage.getItem("gigride_role");
  
  if (!token || !role) {
    return (
       <div className="min-h-screen flex items-center justify-center bg-gray-50">
         <div className="bg-white p-8 rounded-3xl shadow-xl text-center border border-gray-100 max-w-sm w-full mx-4">
            <h2 className="text-2xl font-black text-gray-900 mb-2">Session Expired</h2>
            <p className="text-gray-600 mb-6 font-medium">Please sign in to continue.</p>
            <a href="/login" className="px-6 py-3 bg-black text-white rounded-xl font-black inline-block w-full transition-transform active:scale-95 shadow-md hover:shadow-lg">Sign In Again</a>
         </div>
       </div>
    );
  }
  if (requiredRole && role !== requiredRole) return <Navigate to="/" replace />;
  
  return children;
};

export default function App() {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || localStorage.getItem("gigride_user") || "null") || {};
    } catch { return {}; }
  })();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
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
      </Routes>
    </BrowserRouter>
  );
}