"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Volume2,
  VolumeX,
  X,
  Target,
  Sparkles,
} from "lucide-react";

interface LeadNotification {
  id: string;
  title: string;
  subreddit: string;
  score: number;
  commercialIntent: string;
  url: string;
  timestamp: string;
}

interface NotificationContextType {
  permission: NotificationPermission;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  requestPermission: () => Promise<NotificationPermission>;
  sendTestNotification: () => void;
  activeBanner: LeadNotification | null;
  dismissBanner: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  permission: "default",
  soundEnabled: true,
  setSoundEnabled: () => {},
  requestPermission: async () => "default",
  sendTestNotification: () => {},
  activeBanner: null,
  dismissBanner: () => {},
});

export const useNotification = () => useContext(NotificationContext);

export default function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [activeBanner, setActiveBanner] = useState<LeadNotification | null>(null);
  const bannerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const knownLeadIdsRef = useRef<Set<string>>(new Set());
  const isInitializedRef = useRef(false);

  // Play synthetic pleasant radar notification chime (Web Audio API)
  const playRadarChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.12); // G5
      osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.25); // C6

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch (err) {
      console.warn("Audio chime note:", err);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load initial permission state
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }

    // Load sound preference from localStorage
    const savedSound = localStorage.getItem("oppradar_sound_enabled");
    if (savedSound !== null) {
      setSoundEnabledState(savedSound === "true");
    }

    // Load cached notified leads from storage
    try {
      const stored = localStorage.getItem("oppradar_notified_leads");
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        parsed.forEach((id) => knownLeadIdsRef.current.add(id));
      }
    } catch (e) {
      // Ignore storage read error
    }

    // Prime the poller with existing lead IDs so historical leads don't trigger alerts
    const primeExistingLeads = async () => {
      try {
        const res = await fetch("/api/leads?limit=25");
        const data = await res.json();
        if (data.leads && Array.isArray(data.leads)) {
          data.leads.forEach((l: any) => knownLeadIdsRef.current.add(l.id));
          saveKnownLeads();
        }
      } catch (err) {
        console.error("Initial lead sync failed:", err);
      } finally {
        isInitializedRef.current = true;
      }
    };

    primeExistingLeads();
  }, []);

  const saveKnownLeads = () => {
    try {
      const arr = Array.from(knownLeadIdsRef.current).slice(-200);
      localStorage.setItem("oppradar_notified_leads", JSON.stringify(arr));
    } catch (e) {
      // Ignore write error
    }
  };

  const setSoundEnabled = (val: boolean) => {
    setSoundEnabledState(val);
    localStorage.setItem("oppradar_sound_enabled", String(val));
  };

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!("Notification" in window)) {
      alert("This device browser does not support web notifications.");
      return "denied";
    }

    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      if (res === "granted") {
        sendTestNotification();
      }
      return res;
    } catch (err) {
      console.error("Permission request error:", err);
      return "denied";
    }
  };

  const triggerLeadNotification = (lead: LeadNotification) => {
    // 1. Play Audio Chime
    playRadarChime();

    // 2. Trigger In-App Animated Floating Banner
    if (bannerTimeoutRef.current) {
      clearTimeout(bannerTimeoutRef.current);
    }
    setActiveBanner(lead);
    bannerTimeoutRef.current = setTimeout(() => {
      setActiveBanner(null);
    }, 7000);

    // 3. Dispatch System Notification Tray Alert
    if (Notification.permission === "granted") {
      const title = `🔥 Lead Found: r/${lead.subreddit} (${lead.score}/100)`;
      const options: NotificationOptions = {
        body: lead.title,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        data: { url: `/leads/${lead.id}` },
        tag: `lead-${lead.id}`,
      };

      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready
          .then((reg) => {
            reg.showNotification(title, options);
          })
          .catch(() => {
            new Notification(title, options);
          });
      } else {
        new Notification(title, options);
      }
    }
  };

  const sendTestNotification = () => {
    const testLead: LeadNotification = {
      id: "test-alert",
      title: "Need modern Next.js 14 web application developer for high-converting landing page",
      subreddit: "forhire",
      score: 95,
      commercialIntent: "PAID",
      url: "/",
      timestamp: new Date().toISOString(),
    };
    triggerLeadNotification(testLead);
  };

  const dismissBanner = () => {
    if (bannerTimeoutRef.current) {
      clearTimeout(bannerTimeoutRef.current);
    }
    setActiveBanner(null);
  };

  // Periodic lead scanner for live notifications
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkNewLeads = async () => {
      if (!isInitializedRef.current) return;
      try {
        const res = await fetch("/api/leads?limit=5");
        const data = await res.json();
        if (!data.leads || !Array.isArray(data.leads)) return;

        for (const lead of data.leads) {
          if (!knownLeadIdsRef.current.has(lead.id)) {
            knownLeadIdsRef.current.add(lead.id);
            saveKnownLeads();

            // Trigger alert if lead meets score threshold
            if (lead.score >= 70) {
              triggerLeadNotification({
                id: lead.id,
                title: lead.title,
                subreddit: lead.subreddit,
                score: lead.score,
                commercialIntent: lead.commercialIntent,
                url: `/leads/${lead.id}`,
                timestamp: lead.createdAtUtc,
              });
              break; // Trigger for highest priority lead per poll cycle
            }
          }
        }
      } catch (err) {
        // Silently skip poll check
      }
    };

    const interval = setInterval(checkNewLeads, 20000);

    // Also check immediately when window regains visibility
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkNewLeads();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [soundEnabled]);

  return (
    <NotificationContext.Provider
      value={{
        permission,
        soundEnabled,
        setSoundEnabled,
        requestPermission,
        sendTestNotification,
        activeBanner,
        dismissBanner,
      }}
    >
      {children}

      {/* In-App Floating Notification Banner (Drops from top) */}
      {activeBanner && (
        <div className="fixed top-3 inset-x-3 sm:inset-x-auto sm:right-6 sm:w-96 z-50 animate-bounce-short">
          <div className="p-4 rounded-2xl bg-[#0b101b]/95 backdrop-blur-xl border border-blue-500/40 shadow-2xl shadow-blue-900/30 text-slate-100 relative overflow-hidden">
            {/* Ambient pulse accent */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-pulse" />

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                  <Sparkles className="w-4 h-4 animate-spin-slow" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                      Score: {activeBanner.score}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      r/{activeBanner.subreddit}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={dismissBanner}
                className="p-1 rounded-lg text-slate-400 hover:text-white bg-white/[0.04] transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs font-semibold text-slate-200 mt-2 line-clamp-2 leading-snug">
              {activeBanner.title}
            </p>

            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-[10px] text-emerald-400 font-medium">
                ● High-Intent Opportunity
              </span>

              <Link
                href={activeBanner.url}
                onClick={dismissBanner}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-sm shadow-blue-500/30 flex items-center gap-1"
              >
                <span>Review & Pitch</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}
