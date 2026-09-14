"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bell,
  BellRing,
  BellOff,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  X,
} from "lucide-react";
import { useNotification } from "./NotificationProvider";

export default function NotificationBell() {
  const {
    permission,
    soundEnabled,
    setSoundEnabled,
    requestPermission,
    sendTestNotification,
  } = useNotification();

  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open]);

  const isGranted = permission === "granted";
  const isDenied = permission === "denied";

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 hover:text-white transition flex items-center justify-center min-w-[36px] min-h-[36px]"
        title="Live Lead Alerts & Notifications"
      >
        {isGranted ? (
          <BellRing className="w-4 h-4 text-blue-400" />
        ) : (
          <Bell className="w-4 h-4 text-slate-400" />
        )}

        {/* Status Indicator Dot */}
        <span
          className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-[#070a10] ${
            isGranted
              ? "bg-emerald-400 animate-pulse"
              : isDenied
              ? "bg-rose-500"
              : "bg-amber-400"
          }`}
        />
      </button>

      {/* Notification Dropdown / Modal */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-88 rounded-2xl bg-[#0b101b] border border-white/[0.1] p-4 shadow-2xl z-50 space-y-3.5 animate-fadeIn text-slate-200">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Live Lead Alerts
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg hover:bg-white/[0.06] text-slate-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Status Details */}
          <div className="p-3 rounded-xl bg-[#070a10] border border-white/[0.06] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Device Push Alerts:</span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  isGranted
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : isDenied
                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}
              >
                {isGranted ? "Active" : isDenied ? "Blocked" : "Needs Permission"}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {isGranted
                ? "You will receive immediate system notifications whenever high-intent web gigs are detected."
                : isDenied
                ? "Notifications are blocked in your browser settings. Please enable notifications for this site."
                : "Grant notification permission to get instant alerts on your phone and desktop."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {!isGranted && (
              <button
                onClick={async () => {
                  await requestPermission();
                }}
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-sm shadow-blue-500/20"
              >
                Enable Push Notifications
              </button>
            )}

            <button
              onClick={sendTestNotification}
              className="w-full py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.06] text-xs font-medium transition flex items-center justify-center gap-2"
            >
              <Bell className="w-3.5 h-3.5 text-blue-400" />
              <span>Send Test Notification & Chime</span>
            </button>
          </div>

          {/* Sound Toggle Switch */}
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
            <div className="flex items-center gap-2">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-blue-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
              <span className="text-xs text-slate-300 font-medium">Radar Audio Chime</span>
            </div>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                soundEnabled ? "bg-blue-600" : "bg-slate-700"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                  soundEnabled ? "right-0.5" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
