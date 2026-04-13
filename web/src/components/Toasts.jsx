import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";

function Toasts({ alerts }) {
  return (
    <aside className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {alerts.map((alert) => (
        // Using timestamp + message for a unique key
        <ToastItem key={`${alert.timestamp}-${alert.message}`} alert={alert} />
      ))}
    </aside>
  );
}

const ToastItem = ({ alert }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 1. Start the fade-out animation slightly before the toast should be removed
    // Assuming a 5-second total life, we start fading at 4.5s
    const fadeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 4500); 

    return () => clearTimeout(fadeTimer);
  }, []);

  const config = {
    success: {
      bg: "bg-emerald-600",
      border: "border-emerald-700",
      icon: <CheckCircle2 size={20} className="text-emerald-100" />,
      label: "Success",
    },
    error: {
      bg: "bg-red-600",
      border: "border-red-700",
      icon: <XCircle size={20} className="text-red-100" />,
      label: "Error",
    },
    warning: {
      bg: "bg-amber-500",
      border: "border-amber-600",
      icon: <AlertCircle size={20} className="text-amber-100" />,
      label: "Warning",
    },
    info: {
      bg: "bg-slate-900",
      border: "border-black",
      icon: <Info size={20} className="text-slate-300" />,
      label: "Notification",
    },
  };

  const style = config[alert.type] || config.info;

  return (
    <div
      className={`
        pointer-events-auto flex items-center gap-4 min-w-[320px] max-w-md 
        ${style.bg} ${style.border} border-2 p-4 rounded-2xl shadow-2xl 
        transition-all duration-500 ease-in-out
        ${isVisible 
          ? "opacity-100 translate-x-0 scale-100" 
          : "opacity-0 translate-x-10 scale-95 pointer-events-none"
        }
        animate-in slide-in-from-right-10
      `}
    >
      {/* Icon Circle */}
      <div className="flex-shrink-0 p-2 bg-white/10 rounded-xl">
        {style.icon}
      </div>

      {/* Text Content */}
      <div className="flex-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-0.5">
          {style.label}
        </p>
        <p className="text-sm font-bold text-white leading-tight">
          {alert.message}
        </p>
      </div>

      {/* Animated Progress Bar (Visual indicator of time remaining) */}
      <div className="absolute bottom-0 left-0 h-1 bg-black/20 w-full overflow-hidden rounded-b-2xl">
        <div 
          className="h-full bg-white/40"
          style={{ 
            animation: 'toast-shrink 5s linear forwards' 
          }} 
        />
      </div>
    </div>
  );
};

export default Toasts;