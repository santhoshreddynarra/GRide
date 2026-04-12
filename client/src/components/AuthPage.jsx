import React, { useState } from "react";
import axios from "axios";
import { Bike, Briefcase, ArrowLeft, User, Mail, Lock, CheckCircle, AlertCircle } from "lucide-react";

function roleLabel(role) {
  if (role === "client" || role === "provider") return "Service Provider";
  if (role === "worker" || role === "seeker") return "Job Seeker";
  return null;
}

function toDashboardRole(stored, apiUserRole) {
  if (stored === "client" || stored === "worker") return stored;
  if (stored === "provider" || apiUserRole === "provider") return "client";
  if (stored === "seeker" || apiUserRole === "seeker") return "worker";
  return "worker";
}

function toBackendRole(frontendRole) {
  if (frontendRole === "client") return "provider";
  if (frontendRole === "worker") return "seeker";
  return frontendRole;
}

function AuthPage({ role, onBack, onLoginSuccess, setView }) {
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState(role || "worker");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const persistAndFinish = (res, isLoginFlow) => {
    const token = res.data?.token;
    if (!token) {
      setError("Invalid response: no authentication token.");
      setLoading(false);
      return;
    }

    const raw = res.data.user || {};
    const userForApp = {
      ...raw,
      _id: raw._id ?? raw.id,
      role: raw.role,
    };

    const uiRole = toDashboardRole(
      selectedRole === "client" || selectedRole === "worker" ? selectedRole : null,
      userForApp.role
    );

    localStorage.setItem("gigride_user", JSON.stringify(userForApp));
    localStorage.setItem("gigride_token", token);
    localStorage.setItem("gigride_role", uiRole);

    const msg = isLoginFlow ? "Signed in successfully." : "Account created. Welcome to GigRide.";
    setSuccess(msg);
    setError("");

    window.setTimeout(() => {
      onLoginSuccess(userForApp, token);
      if (typeof setView === "function") {
        setView("dashboard");
      }
      setLoading(false);
    }, 380);
  };

  const handleLogin = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await axios.post("/api/login", {
        email,
        password,
      });

      console.log("LOGIN RESPONSE:", res.data);
      persistAndFinish(res, true);
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please check your details and try again.";
      setError(msg);
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError("");
    setSuccess("");
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("/api/register", {
        name,
        email,
        password,
        role: toBackendRole(selectedRole),
      });

      console.log("REGISTER RESPONSE:", res.data);
      persistAndFinish(res, false);
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please try again.";
      setError(msg);
      setLoading(false);
    }
  };

  const switchMode = (login) => {
    setIsLogin(login);
    setError("");
    setSuccess("");
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-yellow-400 to-yellow-500 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-black rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-black rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center mb-6">
            <Bike className="w-16 h-16 text-black mr-3" />
            <h1 className="text-5xl font-extrabold text-black tracking-tight">GigRide</h1>
          </div>
          <p className="text-2xl font-semibold text-black/80 mb-4">Your Gateway to Opportunities</p>
          <p className="text-lg text-black/70 max-w-md">
            Connect with thousands of job seekers and service providers. Post gigs, find work, and grow your business.
          </p>
          <div className="mt-12 flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-black">10K+</div>
              <div className="text-sm text-black/70">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-black">5K+</div>
              <div className="text-sm text-black/70">Jobs Posted</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-black">98%</div>
              <div className="text-sm text-black/70">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <Bike className="w-10 h-10 text-yellow-500 mr-2" />
            <h1 className="text-3xl font-extrabold text-black">GigRide</h1>
          </div>

          {/* Back Button */}
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-black transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-black mb-2">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-gray-600">
                {isLogin 
                  ? "Sign in to continue to your dashboard" 
                  : "Join GigRide and start connecting with opportunities"}
              </p>
            </div>

            {/* Toggle */}
            <div className="flex bg-black rounded-xl p-1 mb-8">
              <button
                onClick={() => switchMode(true)}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                  isLogin 
                    ? "bg-yellow-400 text-black shadow-lg" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => switchMode(false)}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                  !isLogin 
                    ? "bg-yellow-400 text-black shadow-lg" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Register
              </button>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-6 flex items-center bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-6 flex items-center bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
                <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-sm font-medium">{success}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={(e) => {
              e.preventDefault();
              if (loading) return;
              if (isLogin) handleLogin();
              else handleRegister();
            }} className="space-y-6">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300 outline-none"
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300 outline-none"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300 outline-none"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    I want to
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setSelectedRole("worker")}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        selectedRole === "worker"
                          ? "border-yellow-400 bg-yellow-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Briefcase className={`w-8 h-8 mx-auto mb-2 ${
                        selectedRole === "worker" ? "text-yellow-500" : "text-gray-400"
                      }`} />
                      <div className="text-sm font-semibold text-gray-800">Job Seeker</div>
                      <div className="text-xs text-gray-500 mt-1">Find work</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole("client")}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        selectedRole === "client"
                          ? "border-yellow-400 bg-yellow-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Bike className={`w-8 h-8 mx-auto mb-2 ${
                        selectedRole === "client" ? "text-yellow-500" : "text-gray-400"
                      }`} />
                      <div className="text-sm font-semibold text-gray-800">Service Provider</div>
                      <div className="text-xs text-gray-500 mt-1">Post gigs</div>
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  isLogin ? "Sign In" : "Create Account"
                )}
              </button>
            </form>

            {/* Toggle Link */}
            <div className="mt-6 text-center text-sm text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => switchMode(!isLogin)}
                className="text-yellow-600 hover:text-yellow-700 font-semibold transition-colors"
              >
                {isLogin ? "Register" : "Login"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
