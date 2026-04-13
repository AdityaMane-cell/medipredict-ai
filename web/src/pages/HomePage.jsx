import React from "react";
import { Activity, Brain, Shield, ArrowRight, Lock } from "lucide-react";
import BackendStatus from "../components/BackendStatus";

const HomePage = ({ backendStatus, onContinueAsGuest, onAuth }) => {
  return (
    // Added a subtle grid pattern to the background to fill the "empty" space
    <div className="min-h-screen w-full bg-white relative overflow-hidden flex items-center justify-center p-6 lg:p-12">
      {/* Background Decorations */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-emerald-100 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-blue-50 rounded-full blur-3xl"></div>
      </div>
      
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>

      <main className="relative z-10 w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
        
        {/* Left Column: Hero (Takes up 7/12 columns) */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-10">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold mb-8 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Secure Health Intelligence
            </div>
            
            <h1 className="text-6xl xl:text-8xl font-black text-slate-900 leading-[1] tracking-tight">
              Smarter Health <br />
              <span className="text-emerald-500">Insights.</span>
            </h1>
            
            <p className="mt-8 text-xl xl:text-2xl text-slate-500 leading-relaxed max-w-2xl">
              Understand your symptoms instantly. Our AI analyzes your descriptions in plain language to provide clear, actionable insights.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <button 
              onClick={onContinueAsGuest}
              className="px-10 py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-lg flex items-center gap-3 transition-all shadow-2xl shadow-emerald-200 hover:-translate-y-1 active:scale-95"
            >
              Get Started Free <ArrowRight size={22} />
            </button>
            
            <button 
              onClick={onAuth}
              className="px-10 py-5 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all hover:border-emerald-200 hover:bg-emerald-50/30"
            >
              <Lock size={20} /> Sign In
            </button>
          </div>
          <BackendStatus status={backendStatus} />
        </div>

        {/* Right Column: Features (Takes up 5/12 columns) */}
        <div className="lg:col-span-5 space-y-5">
          <FeatureCard 
            icon={<Activity className="text-emerald-600" size={30} />}
            title="Symptom Analysis"
            desc="Predict conditions based on patterns and clinical data."
          />
          <FeatureCard 
            icon={<Brain className="text-emerald-600" size={30} />}
            title="Plain Language AI"
            desc="No medical jargon needed. Just talk like you normally do."
          />
          <FeatureCard 
            icon={<Shield className="text-emerald-600" size={30} />}
            title="100% Private"
            desc="Your data is encrypted and never shared with third parties."
          />
        </div>

      </main>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="group p-8 bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-slate-200/50 shadow-sm hover:shadow-2xl hover:shadow-emerald-100/50 hover:border-emerald-200 transition-all duration-500 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
    <div className="p-4 bg-emerald-50 rounded-2xl group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-500 shadow-sm">
      {icon}
    </div>
    <div className="space-y-2">
      <h3 className="text-xl font-bold text-slate-800">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default HomePage;
