import React from "react";
import PredictionForm from "../components/PredictionForm";
import ResultPanel from "../components/ResultPanel";
import Sidebar from "../components/Sidebar";
import Toasts from "../components/Toasts";
import BackendStatus from "../components/BackendStatus";
import { LogIn, Info, Activity } from "lucide-react";

function DiagnosisPage({
  alerts,
  availableSymptoms,
  backendStatus,
  error,
  guestMode,
  history,
  loading,
  mode,
  result,
  sidebarTab,
  symptomText,
  symptoms,
  textInput,
  user,
  onAddSymptom,
  onGoHome,
  onLogout,
  onModeChange,
  onRemoveSymptom,
  onSidebarTabChange,
  onSubmitSymptoms,
  onSubmitText,
  onSymptomTextChange,
  onTextInputChange,
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      
      {/* 🚀 Sidebar */}
      <Sidebar
        history={history}
        sidebarTab={sidebarTab}
        user={user}
        onLogout={onLogout}
        onSidebarTabChange={onSidebarTabChange}
      />

      {/* 🖥️ Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* 🔷 Header */}
        <header className="px-8 py-10 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            
            <div className="space-y-3">
              
              {/* Tag */}
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-[0.2em]">
                <Activity size={16} />
                Live Analysis System
              </div>

              {/* Title with gradient */}
              <h1 className="text-4xl font-black tracking-tight">
                <span className="text-slate-900">Symptom </span>
                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  Analysis
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-slate-700 text-base font-medium leading-relaxed">
                {guestMode
                  ? "Guest Mode: Results are temporary and not stored."
                  : "Welcome back. Your prediction history is synced securely."}
              </p>
            </div>

            {/* CTA */}
            {guestMode && (
              <button
                onClick={onGoHome}
                className="group flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-md"
              >
                <LogIn size={18} />
                Sign In to Save
              </button>
            )}

            <BackendStatus status={backendStatus} />
          </div>
        </header>

        {/* 🧩 Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              
              {/* 🔹 LEFT: Input */}
              <div className="xl:col-span-5 space-y-6">
                
                <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                  
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
                    <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                    Patient Input
                  </h2>

                  <PredictionForm
                    availableSymptoms={availableSymptoms}
                    loading={loading}
                    mode={mode}
                    symptomText={symptomText}
                    symptoms={symptoms}
                    textInput={textInput}
                    onAddSymptom={onAddSymptom}
                    onModeChange={onModeChange}
                    onRemoveSymptom={onRemoveSymptom}
                    onSubmitSymptoms={onSubmitSymptoms}
                    onSubmitText={onSubmitText}
                    onSymptomTextChange={onSymptomTextChange}
                    onTextInputChange={onTextInputChange}
                  />
                </div>

                {/* ⚠️ Guest warning */}
                {guestMode && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                    <Info className="text-amber-600 shrink-0" size={20} />
                    <p className="text-amber-800 text-sm font-medium leading-relaxed">
                      Predictions are not saved in Guest Mode. Sign up to store and track your health insights.
                    </p>
                  </div>
                )}
              </div>

              {/* 🔹 RIGHT: Results */}
              <div className="xl:col-span-7">
                
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col min-h-[600px]">
                  
                  {/* Status Bar */}
                  <div className="px-8 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    
                    <span className="text-slate-700 font-semibold uppercase text-xs tracking-wider">
                      Prediction Output
                    </span>

                    <div
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                        loading
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          loading
                            ? "bg-amber-500 animate-pulse"
                            : "bg-emerald-500"
                        }`}
                      ></div>

                      {loading ? "AI ANALYZING..." : "SYSTEM READY"}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 flex-1 bg-slate-50">
                    <ResultPanel
                      error={error}
                      loading={loading}
                      result={result}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>

        {/* 🔔 Toasts */}
        <Toasts alerts={alerts} />
      </div>
    </div>
  );
}

export default DiagnosisPage;
