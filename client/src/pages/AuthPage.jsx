import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Bike,
  Briefcase,
  ArrowLeft,
  User,
  Mail,
  Lock,
  CheckCircle,
  AlertCircle,
  X,
  FileText,
  Building2,
  Chrome,
} from "lucide-react";

function AuthPage({ role, onBack, onLoginSuccess, setView }) {
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState(
    role === "client" ? "provider" : "seeker"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Role-specific fields
  const [resume, setResume] = useState(null);
  const [skills, setSkills] = useState("");
  const [preferredJobType, setPreferredJobType] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactDetails, setContactDetails] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const getRoleColor = () => {
    return selectedRole === "seeker" ? "blue" : "green";
  };

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

    localStorage.setItem("gigride_user", JSON.stringify(userForApp));
    localStorage.setItem("gigride_token", token);
    localStorage.setItem("gigride_role", raw.role);

    setSuccess(isLoginFlow ? "Signed in successfully." : "Account created.");
    setError("");

    setTimeout(() => {
      onLoginSuccess(userForApp, token);
      setView && setView("dashboard");
      setLoading(false);
    }, 300);
  };

  const handleLogin = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      persistAndFinish(res, true);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
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

    // Role-specific validation
    if (selectedRole === "seeker") {
      if (!skills.trim()) {
        setError("Please enter your skills.");
        return;
      }
      if (!preferredJobType) {
        setError("Please select your preferred job type.");
        return;
      }
    } else {
      if (!companyName.trim()) {
        setError("Please enter your company name.");
        return;
      }
      if (!contactDetails.trim()) {
        setError("Please enter your contact details.");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/auth/register", {
        name,
        email,
        password,
        role: selectedRole,
        // Role-specific fields
        ...(selectedRole === "seeker" && {
          skills,
          preferredJobType,
        }),
        ...(selectedRole === "provider" && {
          companyName,
          contactDetails,
        }),
      });
      persistAndFinish(res, false);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      setLoading(false);
    }
  };

  const switchMode = (login) => {
    setIsLogin(login);
    setError("");
    setSuccess("");
  };

  const roleColor = getRoleColor();
  const colorClasses = {
    blue: {
      bg: "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600",
      text: "text-blue-400",
      border: "border-blue-400",
      bgLight: "bg-blue-400/10",
      bgLighter: "bg-blue-400/20",
      shadow: "hover:shadow-blue-500/25",
    },
    green: {
      bg: "bg-gradient-to-br from-green-400 via-green-500 to-green-600",
      text: "text-green-400",
      border: "border-green-400",
      bgLight: "bg-green-400/10",
      bgLighter: "bg-green-400/20",
      shadow: "hover:shadow-green-500/25",
    },
  };
  const colors = colorClasses[roleColor];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
      {/* LEFT SIDE - Branding */}
      <div className={`hidden lg:flex lg:w-1/2 ${colors.bg} items-center justify-center p-12 relative overflow-hidden`}>
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-96 h-96 bg-black rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-black rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="relative z-10 text-center max-w-lg animate-fade-in-up">
          <div className="flex justify-center items-center mb-8">
            <div className="bg-black/20 p-4 rounded-2xl backdrop-blur-sm">
              {selectedRole === "seeker" ? (
                <Briefcase className="w-16 h-16 text-black" />
              ) : (
                <Building2 className="w-16 h-16 text-black" />
              )}
            </div>
          </div>
          <h1 className="text-6xl font-extrabold text-black mb-4 tracking-tight">
            JobPortal
          </h1>
          <p className="text-2xl font-semibold text-black/90 mb-6">
            {selectedRole === "seeker" ? "Find Your Dream Job" : "Hire the Best Talent"}
          </p>
          <p className="text-lg text-black/80 leading-relaxed">
            {selectedRole === "seeker"
              ? "Discover thousands of opportunities from top companies. Your next career move is just a click away."
              : "Connect with skilled professionals ready to join your team. Post jobs and find the perfect match."}
          </p>
          
          <div className="mt-12 grid grid-cols-3 gap-6">
            <div className="bg-black/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-3xl font-bold text-black">10K+</div>
              <div className="text-sm text-black/70 mt-1">
                {selectedRole === "seeker" ? "Active Jobs" : "Companies"}
              </div>
            </div>
            <div className="bg-black/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-3xl font-bold text-black">5K+</div>
              <div className="text-sm text-black/70 mt-1">
                {selectedRole === "seeker" ? "Companies" : "Candidates"}
              </div>
            </div>
            <div className="bg-black/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-3xl font-bold text-black">98%</div>
              <div className="text-sm text-black/70 mt-1">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-6 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center">
            {selectedRole === "seeker" ? (
              <Briefcase className="w-8 h-8 text-blue-400 mr-2" />
            ) : (
              <Building2 className="w-8 h-8 text-green-400 mr-2" />
            )}
            <h1 className="text-2xl font-bold text-white">JobPortal</h1>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-6 left-6 flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        {/* Glassmorphism Card */}
        <div
          className={`w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 lg:p-10 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Heading */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-gray-400 text-sm">
              {isLogin
                ? "Sign in to continue to your dashboard"
                : `Join as ${selectedRole === "seeker" ? "Job Seeker" : "Job Provider"}`}
            </p>
          </div>

          {/* Modern Pill Toggle */}
          <div className="relative bg-black/30 rounded-2xl p-1 mb-8">
            <div
              className={`absolute top-1 bottom-1 w-1/2 ${colors.bg} rounded-xl transition-all duration-300 ease-out ${
                isLogin ? "left-1" : "left-[calc(50%-4px)]"
              }`}
            ></div>
            <div className="relative flex">
              <button
                onClick={() => switchMode(true)}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                  isLogin ? "text-black" : "text-gray-400 hover:text-white"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => switchMode(false)}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                  !isLogin ? "text-black" : "text-gray-400 hover:text-white"
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {/* Error/Success Toast */}
          {error && (
            <div className="mb-6 flex items-center bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-2xl p-4 text-red-400 animate-slide-in">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
              <button
                onClick={() => setError("")}
                className="ml-auto hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-center bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-4 text-green-400 animate-slide-in">
              <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="text-sm font-medium">{success}</span>
              <button
                onClick={() => setSuccess("")}
                className="ml-auto hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Social Login */}
          {isLogin && (
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-transparent text-gray-500">Or continue with</span>
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <button className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl py-3 transition-all duration-300 transform hover:scale-105">
                  <Chrome className="w-5 h-5" />
                  <span className="text-white font-medium">Google</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl py-3 transition-all duration-300 transform hover:scale-105">
                  <Building2 className="w-5 h-5" />
                  <span className="text-white font-medium">LinkedIn</span>
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              isLogin ? handleLogin() : handleRegister();
            }}
            className="space-y-5"
          >
            {!isLogin && (
              <div className="relative group">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-gray-500 outline-none transition-all duration-300"
                  autoComplete="name"
                />
              </div>
            )}

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-gray-500 outline-none transition-all duration-300"
                autoComplete="email"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-gray-500 outline-none transition-all duration-300"
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
            </div>

            {!isLogin && (
              <>
                {/* Role Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedRole("seeker")}
                    className={`relative p-5 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      selectedRole === "seeker"
                        ? `${colors.border} ${colors.bgLight}`
                        : "border-white/10 bg-white/5 hover:border-blue-400/50"
                    }`}
                  >
                    <Briefcase
                      className={`w-8 h-8 mx-auto mb-3 ${
                        selectedRole === "seeker" ? colors.text : "text-gray-400"
                      }`}
                    />
                    <div className="text-sm font-semibold text-white text-center">
                      Job Seeker
                    </div>
                    <div className="text-xs text-gray-400 mt-1 text-center">
                      Find work
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole("provider")}
                    className={`relative p-5 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      selectedRole === "provider"
                        ? `${colors.border} ${colors.bgLight}`
                        : "border-white/10 bg-white/5 hover:border-green-400/50"
                    }`}
                  >
                    <Building2
                      className={`w-8 h-8 mx-auto mb-3 ${
                        selectedRole === "provider" ? colors.text : "text-gray-400"
                      }`}
                    />
                    <div className="text-sm font-semibold text-white text-center">
                      Job Provider
                    </div>
                    <div className="text-xs text-gray-400 mt-1 text-center">
                      Post jobs
                    </div>
                  </button>
                </div>

                {/* Role-specific fields */}
                {selectedRole === "seeker" ? (
                  <>
                    <div className="relative group">
                      <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                      <input
                        type="file"
                        onChange={(e) => setResume(e.target.files[0])}
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-gray-500 outline-none transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-400/20 file:text-blue-400"
                        accept=".pdf,.doc,.docx"
                      />
                    </div>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                      <input
                        type="text"
                        placeholder="Skills (e.g., JavaScript, React, Node.js)"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-gray-500 outline-none transition-all duration-300"
                      />
                    </div>
                    <div className="relative group">
                      <select
                        value={preferredJobType}
                        onChange={(e) => setPreferredJobType(e.target.value)}
                        className="w-full pl-4 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white outline-none transition-all duration-300 appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-gray-800">Preferred Job Type</option>
                        <option value="full-time" className="bg-gray-800">Full-time</option>
                        <option value="part-time" className="bg-gray-800">Part-time</option>
                        <option value="contract" className="bg-gray-800">Contract</option>
                        <option value="internship" className="bg-gray-800">Internship</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative group">
                      <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-400 transition-colors" />
                      <input
                        type="text"
                        placeholder="Company Name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 text-white placeholder-gray-500 outline-none transition-all duration-300"
                      />
                    </div>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-400 transition-colors" />
                      <input
                        type="text"
                        placeholder="Contact Details (Phone/Email)"
                        value={contactDetails}
                        onChange={(e) => setContactDetails(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 text-white placeholder-gray-500 outline-none transition-all duration-300"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${colors.bg} hover:opacity-90 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl ${colors.shadow} transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
          <p className="text-center text-sm text-gray-400 mt-8">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => switchMode(!isLogin)}
              className={`${colors.text} hover:opacity-80 font-semibold transition-colors`}
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .delay-700 {
          animation-delay: 0.7s;
        }
      `}</style>
    </div>
  );
}

export default AuthPage;