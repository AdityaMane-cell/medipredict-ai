import React from "react";
import { ArrowLeft, Lock, Mail, User, Loader2, CheckCircle2 } from "lucide-react";
import BackendStatus from "../components/BackendStatus";

function AuthPage({
  authMode, backendStatus, email, error, loading, password, username,
  onBack, onChangeAuthMode, onEmailChange, onLogin, onPasswordChange, onSignup, onUsernameChange,
}) {
  const isLogin = authMode === "login";

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* Left Side: Branding/Info (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-emerald-500 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400 rounded-full -mr-32 -mt-32 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600 rounded-full -ml-48 -mb-48 opacity-30"></div>
        
        <button onClick={onBack} className="relative z-10 flex items-center gap-2 text-emerald-50 font-semibold hover:text-white transition-colors">
          <ArrowLeft size={20} /> Back to Home
        </button>

        <div className="relative z-10 text-white max-w-md">
          <h2 className="text-5xl font-bold leading-tight mb-6">
            Join thousands of users prioritizing their health.
          </h2>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-emerald-50">
              <CheckCircle2 size={24} /> Personalized health history tracking
            </li>
            <li className="flex items-center gap-3 text-emerald-50">
              <CheckCircle2 size={24} /> Detailed symptom breakdowns
            </li>
            <li className="flex items-center gap-3 text-emerald-50">
              <CheckCircle2 size={24} /> Priority AI analysis access
            </li>
          </ul>
        </div>
        
        <p className="relative z-10 text-emerald-200 text-sm">2026 Health AI Platform. All rights reserved.</p>
      </div>

      {/* Right Side: The Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              {isLogin ? "Welcome Back" : "Start Your Journey"}
            </h1>
            <p className="text-slate-500 mt-3 text-lg">
              {isLogin ? "Please enter your details to sign in." : "Create a free account to get started."}
            </p>
          </div>

          <BackendStatus status={backendStatus} />

          <div className="flex p-1.5 bg-slate-100 rounded-2xl">
            <button
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${isLogin ? "bg-white text-emerald-600 shadow-md" : "text-slate-500"}`}
              onClick={() => onChangeAuthMode("login")}
            > Login </button>
            <button
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${!isLogin ? "bg-white text-emerald-600 shadow-md" : "text-slate-500"}`}
              onClick={() => onChangeAuthMode("signup")}
            > Sign Up </button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); isLogin ? onLogin() : onSignup(); }} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  type="text" placeholder="Enter username" value={username} onChange={(e) => onUsernameChange(e.target.value)} required
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    type="email" placeholder="email@example.com" value={email} onChange={(e) => onEmailChange(e.target.value)} required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  type="password" placeholder="At least 6 characters" value={password} onChange={(e) => onPasswordChange(e.target.value)} required
                />
              </div>
            </div>

            {error && <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-bold border border-red-100">{error}</div>}

            <button
              className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 disabled:opacity-70 transition-all"
              type="submit" disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : (isLogin ? "Sign In" : "Create Account")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
