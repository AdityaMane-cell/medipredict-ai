import React from "react";
import { Activity, AlertTriangle, Info, CheckCircle2 } from "lucide-react";

function ResultPanel({ error, loading, result }) {
  const top3List = result?.top3 ?? [];
  const confidencePercent = result?.confidence != null ? (result.confidence * 100).toFixed(1) : 0;

  return (
    <section className="w-full h-full bg-white flex flex-col">
      {/* 🟢 Header with Badge */}
      <div className="flex items-center justify-between mb-8 border-b-4 border-slate-100 pb-4">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Activity className="text-emerald-500" size={24} />
          Prediction Output
        </h2>
        {loading && (
          <div className="flex items-center gap-2 px-4 py-1 bg-amber-100 text-amber-700 rounded-full font-black text-xs animate-pulse">
            AI ANALYZING...
          </div>
        )}
      </div>

      {/* 🛑 Error State */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 font-bold flex items-center gap-3 mb-6">
          <AlertTriangle size={20} />
          {error}
        </div>
      )}

      {/* ⚪ Empty State */}
      {!result && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-10 border-4 border-dashed border-slate-100 rounded-[2rem]">
          <div className="p-4 bg-slate-50 rounded-full mb-4">
            <Info className="text-slate-300" size={40} />
          </div>
          <p className="text-slate-500 font-bold text-lg">No analysis yet.</p>
          <p className="text-slate-400 text-sm">Select symptoms and hit predict to see results.</p>
        </div>
      )}

      {result && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* 🔍 Extracted Symptoms Chips */}
          {"extracted_symptoms" in result && (
            <div className="space-y-3">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Extracted Symptoms</span>
              <div className="flex flex-wrap gap-2">
                {result.extracted_symptoms.map((symptom, idx) => (
                  <span key={idx} className="px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-sm">
                    {symptom.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 🏆 Top Prediction Card (High Contrast) */}
          <div className="bg-emerald-50 border-4 border-emerald-500 rounded-[2rem] p-8 relative overflow-hidden shadow-xl shadow-emerald-100">
            <div className="relative z-10">
              <h3 className="text-emerald-700 font-black uppercase tracking-[0.2em] text-xs mb-2">Top Prediction</h3>
              <p className="text-5xl font-black text-emerald-950 mb-6 leading-none">
                {top3List[0]?.[0] ?? "N/A"}
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-emerald-700 font-black text-sm uppercase">Confidence Level</span>
                  <span className="text-2xl font-black text-emerald-900 leading-none">{confidencePercent}%</span>
                </div>
                <div className="w-full bg-emerald-200 h-4 rounded-full border-2 border-emerald-300 shadow-inner">
                  <div 
                    className="bg-emerald-600 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(confidencePercent, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 📊 Comparison Table (Top 3) */}
          <div className="space-y-4">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Statistical Ranking</span>
            <div className="grid gap-3">
              {top3List.map(([disease, confidence], idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white border-2 border-slate-100 rounded-2xl hover:border-emerald-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center bg-slate-900 text-white text-[10px] font-black rounded-md">{idx + 1}</span>
                    <span className="font-bold text-slate-800">{disease}</span>
                  </div>
                  <span className="font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg text-sm">{(confidence * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* 📝 Description & Precautions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.description && (
              <div className="p-6 bg-slate-50 rounded-[1.5rem] border-2 border-slate-100">
                <h4 className="font-black text-slate-900 mb-3 flex items-center gap-2">
                  <Info size={18} className="text-emerald-600" />
                  Description
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  {result.description}
                </p>
              </div>
            )}

            {result.precautions?.length > 0 && (
              <div className="p-6 bg-slate-900 rounded-[1.5rem] text-white shadow-xl shadow-slate-200">
                <h4 className="font-black text-white mb-3 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  Recommended Precautions
                </h4>
                <ul className="space-y-2">
                  {result.precautions.map((line, idx) => (
                    <li key={idx} className="text-xs font-bold text-slate-300 flex items-start gap-2">
                      <span className="text-emerald-500">•</span> {line}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ⚠️ Alerts */}
          {(result.alert || result.note) && (
            <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl text-amber-900 text-sm font-bold italic">
              {result.alert || result.note}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default ResultPanel;