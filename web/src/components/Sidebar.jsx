import React from "react";
import { Clock, User as UserIcon, LogOut, Activity, Calendar, ShieldCheck } from "lucide-react";

function Sidebar({
  history,
  sidebarTab,
  user,
  onLogout,
  onSidebarTabChange,
}) {
  if (!user) return null;

  return (
    <aside className="w-80 min-h-screen bg-slate-950 text-white flex flex-col border-r border-slate-800 shadow-2xl z-20">
      
      {/* 👤 User Account Section */}
      <div className="p-8 bg-slate-900/50 border-b border-slate-800">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center font-black text-xl text-slate-900 shadow-lg shadow-emerald-500/20">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-lg truncate leading-none mb-1">{user.username}</h3>
            <p className="text-slate-400 text-xs truncate">{user.email}</p>
          </div>
        </div>
        
        <button 
          className="w-full py-3 px-4 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 border border-slate-700 hover:border-red-500/50 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all group"
          onClick={onLogout}
        >
          <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
          Logout System
        </button>
      </div>

      {/* 🔁 Navigation Tabs */}
      <div className="p-4 grid grid-cols-2 gap-2 bg-slate-900/30">
        <TabButton 
          active={sidebarTab === "history"} 
          onClick={() => onSidebarTabChange("history")}
          icon={<Clock size={18} />}
          label="History"
        />
        <TabButton 
          active={sidebarTab === "profile"} 
          onClick={() => onSidebarTabChange("profile")}
          icon={<UserIcon size={18} />}
          label="Profile"
        />
      </div>

      {/* 📦 Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {sidebarTab === "history" ? (
          <div className="space-y-6">
            <h4 className="px-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Recent Predictions</h4>
            
            {history.length === 0 ? (
              <div className="text-center py-10 px-4 bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-800">
                <Activity className="mx-auto text-slate-700 mb-2" size={32} />
                <p className="text-slate-500 font-bold text-sm">No records found</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {history.map((item) => (
                  <HistoryItem key={item.id} item={item} />
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <h4 className="px-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Account Details</h4>
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-5 space-y-4">
              <ProfileRow label="Role" value="Standard Patient" />
              <ProfileRow label="Total Checks" value={history.length} />
              <ProfileRow 
                label="2FA Security" 
                value={user.totp_enabled === "true" ? "Verified" : "Unsecured"} 
                isSecurity={true}
                active={user.totp_enabled === "true"}
              />
            </div>
          </div>
        )}
      </div>

      {/* 🛡️ Footer Branding */}
      <div className="p-6 border-t border-slate-800 bg-slate-950 text-center">
        <div className="flex items-center justify-center gap-2 text-emerald-500 font-black italic tracking-tighter text-xl">
          <Activity size={20} />
          HEALTH.AI
        </div>
      </div>
    </aside>
  );
}

/* --- Sub-Components for High Contrast --- */

const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
      active 
      ? "bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20" 
      : "bg-transparent text-slate-400 hover:text-white hover:bg-slate-800"
    }`}
  >
    {icon} {label}
  </button>
);

const HistoryItem = ({ item }) => {
  const resultName = item.result?.top3?.[0]?.[0] || "N/A";
  const confidence = item.result?.confidence != null ? (item.result.confidence * 100).toFixed(1) : "--";

  return (
    <li className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl transition-all cursor-pointer group">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1">
          <Calendar size={10} />
          {new Date(item.created_at).toLocaleDateString()}
        </span>
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${item.method === "symptoms" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"}`}>
          {item.method.toUpperCase()}
        </span>
      </div>
      
      <p className="text-white font-bold text-sm mb-1 group-hover:text-emerald-400 transition-colors">
        {resultName}
      </p>
      
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/50">
        <span className="text-slate-500 text-[10px] font-bold">Confidence</span>
        <span className="text-emerald-500 font-black text-xs">{confidence}%</span>
      </div>
    </li>
  );
};

const ProfileRow = ({ label, value, isSecurity, active }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{label}</span>
    <div className="flex items-center justify-between">
      <span className="text-white font-bold text-sm">{value}</span>
      {isSecurity && (
        <ShieldCheck size={16} className={active ? "text-emerald-500" : "text-slate-700"} />
      )}
    </div>
  </div>
);

export default Sidebar;