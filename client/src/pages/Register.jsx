import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, Building2, Mail, Lock, User, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import axios from "axios";

export default function Register() {
  const [role, setRole] = useState("seeker");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/api/register", { name, email, password, role });
      
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.role);

      setSuccess(true);
      
      setTimeout(() => {
        if (user.role === "provider") {
          navigate("/provider/dashboard");
        } else {
          navigate("/seeker/dashboard");
        }
      }, 2500);

    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed. Please try again.");
      setLoading(false);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <style>
        {`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-5px); }
            40%, 80% { transform: translateX(5px); }
          }
          .animate-shake {
            animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
          }
          .glow-effect:active {
            box-shadow: 0 0 15px rgba(0,0,0,0.3);
            transform: scale(0.98);
          }
        `}
      </style>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-gray-900" />
            <span className="text-xl font-bold">JobPortal</span>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Register Form */}
      <main className="pt-32 pb-20 px-6 flex-grow flex items-center justify-center">
        <div className="w-full max-w-md mx-auto">
          {success ? (
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-10 text-center flex flex-col items-center justify-center animate-pulse transition-all duration-1000">
              <CheckCircle className="w-20 h-20 text-green-500 mb-6" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome aboard, {name.split(' ')[0]}!</h1>
              <p className="text-gray-600 text-lg">Your account has been created.</p>
              <p className="text-gray-400 mt-4 text-sm font-medium">
                {role === "seeker" ? "Let’s find your first opportunity..." : "Start posting your first job..."}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 md:p-10 transition-all duration-300">
              {/* Heading */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create account</h1>
                <p className="text-gray-600">Join JobPortal and start your journey</p>
              </div>

              {/* Role Toggle */}
              <div className="bg-gray-100 rounded-2xl p-1.5 mb-8">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setRole("seeker")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                      role === "seeker"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    Job Seeker
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("provider")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                      role === "provider"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    Employer
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm flex items-center transition-all">
                    <span>{error}</span>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300"
                      required
                      disabled={loading}
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 mt-1 text-black rounded border-gray-300 focus:ring-black"
                    required
                    disabled={loading}
                  />
                  <span className="text-sm text-gray-600">
                    I agree to the{" "}
                    <a href="#" className="text-gray-900 hover:underline font-medium">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-gray-900 hover:underline font-medium">
                      Privacy Policy
                    </a>
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 glow-effect ${
                    shake ? "animate-shake bg-red-600 hover:bg-red-700" : ""
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Creating your account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              {/* Footer */}
              <p className="text-center text-sm text-gray-600 mt-8">
                Already have an account?{" "}
                <Link to="/login" className="text-gray-900 hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
