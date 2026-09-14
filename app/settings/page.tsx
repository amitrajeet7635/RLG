"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Send,
  Cpu,
  Clock,
  Flame,
  CheckCircle2,
  AlertCircle,
  Key,
  Sliders,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Sparkles,
} from "lucide-react";
import { useNotification } from "../components/NotificationProvider";

export default function SettingsPage() {
  const {
    permission,
    soundEnabled,
    setSoundEnabled,
    requestPermission,
    sendTestNotification,
  } = useNotification();

  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [pollInterval, setPollInterval] = useState("20");
  const [minOpportunityScore, setMinOpportunityScore] = useState("70");
  const [minNotificationScore, setMinNotificationScore] = useState("75");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Test Alert Form
  const [testToken, setTestToken] = useState("");
  const [testChatId, setTestChatId] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [testStatus, setTestStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings");
      const data = await res.json();
      setSettings(data);
      if (data.pollInterval) setPollInterval(data.pollInterval);
      if (data.minOpportunityScore)
        setMinOpportunityScore(data.minOpportunityScore);
      if (data.minNotificationScore)
        setMinNotificationScore(data.minNotificationScore);
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveMessage(null);
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pollInterval,
          minOpportunityScore,
          minNotificationScore,
        }),
      });
      if (res.ok) {
        setSaveMessage("Settings updated successfully!");
        setTimeout(() => setSaveMessage(null), 3000);
      }
    } catch (err) {
      setSaveMessage("Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestAlert = async () => {
    try {
      setSendingTest(true);
      setTestStatus(null);
      const res = await fetch("/api/test-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: testToken.trim() || undefined,
          chatId: testChatId.trim() || undefined,
        }),
      });
      const data = await res.json();
      setTestStatus({
        success: data.success,
        message:
          data.message ||
          data.error ||
          "Check your Telegram credentials and try again.",
      });
    } catch (err: any) {
      setTestStatus({
        success: false,
        message: err.message || "Failed to trigger test alert.",
      });
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
          <span>System & Notification Settings</span>
        </h1>
        <p className="text-slate-400 text-xs mt-0.5 sm:mt-1">
          Configure notification alerts, AI models, and autonomous poller parameters.
        </p>
      </div>

      {/* In-App & PWA Push Notifications */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#0b101b] border border-blue-500/20 space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-400 flex-shrink-0">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>In-App & Mobile PWA Notifications</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Real-Time
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Audible radar chime and interactive floating banners whenever high-scoring gigs appear.
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border self-start sm:self-auto ${
              permission === "granted"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : permission === "denied"
                ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
            }`}
          >
            {permission === "granted"
              ? "Push Active"
              : permission === "denied"
              ? "Blocked in Browser"
              : "Permission Required"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/[0.04]">
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {permission !== "granted" && (
              <button
                type="button"
                onClick={requestPermission}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl shadow-sm transition min-h-[40px]"
              >
                Enable Device Push
              </button>
            )}

            <button
              type="button"
              onClick={sendTestNotification}
              className="flex-1 px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.06] text-xs font-medium rounded-xl transition flex items-center justify-center gap-2 min-h-[40px]"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Test Alert & Chime</span>
            </button>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#070a10] border border-white/[0.06]">
            <div className="flex items-center gap-2">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-blue-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
              <div>
                <span className="text-xs font-medium text-slate-200 block">Radar Audio Chime</span>
                <span className="text-[10px] text-slate-500">Play tone on qualified lead</span>
              </div>
            </div>

            <button
              type="button"
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
      </div>

      {/* Telegram Alerts Setup */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#0b101b] border border-white/[0.06] space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 flex-shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                Telegram Instant Push Alerts
              </h2>
              <p className="text-xs text-slate-400">
                Receive real-time notifications the moment a lead is detected.
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border self-start sm:self-auto ${
              settings?.telegramConfigured
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
            }`}
          >
            {settings?.telegramConfigured ? "Connected via .env" : "Not Configured"}
          </span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-[#070a10] border border-white/[0.06] space-y-2 text-xs text-slate-300">
          <p className="font-semibold text-slate-200">How to setup Telegram in 60 seconds:</p>
          <ol className="list-decimal list-inside space-y-1 text-slate-400">
            <li>
              Search <strong className="text-slate-200">@BotFather</strong> on Telegram, send{" "}
              <code className="bg-white/[0.06] px-1 py-0.5 rounded text-blue-300">/newbot</code> to get your{" "}
              <strong className="text-slate-200">Bot Token</strong>.
            </li>
            <li>
              Search <strong className="text-slate-200">@userinfobot</strong> on Telegram and hit Start to copy your{" "}
              <strong className="text-slate-200">Chat ID</strong>.
            </li>
            <li>
              Add them to your <code className="text-amber-300">.env</code> file or host environment variables.
            </li>
          </ol>
        </div>

        {/* Test Alert Button */}
        <div className="pt-2 border-t border-white/[0.06] space-y-3">
          <span className="text-xs font-semibold text-slate-300 block">
            Test Your Telegram Alert
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              type="text"
              placeholder="Custom Bot Token (optional if in .env)"
              value={testToken}
              onChange={(e) => setTestToken(e.target.value)}
              className="bg-[#070a10] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 min-h-[40px]"
            />
            <input
              type="text"
              placeholder="Custom Chat ID (optional if in .env)"
              value={testChatId}
              onChange={(e) => setTestChatId(e.target.value)}
              className="bg-[#070a10] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 min-h-[40px]"
            />
          </div>

          <button
            onClick={handleSendTestAlert}
            disabled={sendingTest}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2 min-h-[40px]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{sendingTest ? "Sending..." : "Send Test Telegram Alert"}</span>
          </button>

          {testStatus && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                testStatus.success
                  ? "bg-emerald-950/30 text-emerald-300 border-emerald-800/60"
                  : "bg-rose-950/30 text-rose-300 border-rose-800/60"
              }`}
            >
              {testStatus.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              )}
              <span>{testStatus.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Google Gemini AI Mode */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#0b101b] border border-white/[0.06] space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 flex-shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                Google Gemini AI Intelligence
              </h2>
              <p className="text-xs text-slate-400">
                Semantic qualification, requirement extraction, and pitch writing.
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border self-start sm:self-auto ${
              settings?.geminiConfigured
                ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            {settings?.geminiConfigured
              ? "Active (Gemini Flash)"
              : "Rule-Based (Zero API Fee)"}
          </span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-[#070a10] border border-white/[0.06] text-xs text-slate-400 leading-relaxed space-y-1.5">
          <p>
            • <strong className="text-slate-200">Pre-Filter:</strong> Eliminates noise locally before calling AI, keeping usage safely within free tier limits.
          </p>
          <p>
            • <strong className="text-slate-200">Gemini Flash:</strong> Extracts technical requirements, timeline, budget, and drafts customized outreach pitches.
          </p>
        </div>
      </div>

      {/* Core Operational Thresholds */}
      <form
        onSubmit={handleSaveSettings}
        className="p-4 sm:p-6 rounded-2xl bg-[#0b101b] border border-white/[0.06] space-y-3.5 sm:space-y-4"
      >
        <span className="text-sm font-bold text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-slate-400" />
          <span>Scoring & Poller Thresholds</span>
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Poller Interval (Seconds)
            </label>
            <input
              type="number"
              min="10"
              max="300"
              value={pollInterval}
              onChange={(e) => setPollInterval(e.target.value)}
              className="w-full bg-[#070a10] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 min-h-[40px]"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Default: 20s
            </span>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Min Qualification Score
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={minOpportunityScore}
              onChange={(e) => setMinOpportunityScore(e.target.value)}
              className="w-full bg-[#070a10] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 min-h-[40px]"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Save threshold (Default: 70)
            </span>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Min Notification Score
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={minNotificationScore}
              onChange={(e) => setMinNotificationScore(e.target.value)}
              className="w-full bg-[#070a10] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 min-h-[40px]"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Alert threshold (Default: 75)
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-white/[0.04]">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl shadow-sm transition disabled:opacity-50 min-h-[40px]"
          >
            {saving ? "Saving..." : "Save Configuration"}
          </button>

          {saveMessage && (
            <span className="text-xs text-emerald-400 font-medium text-center sm:text-left">
              {saveMessage}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
