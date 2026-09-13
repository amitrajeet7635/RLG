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
} from "lucide-react";

export default function SettingsPage() {
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
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-slate-400" />
          <span>System & Notification Settings</span>
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Configure notification alerts, AI models, and autonomous poller parameters.
        </p>
      </div>

      {/* Telegram Alerts Setup */}
      <div className="p-6 rounded-2xl bg-[#0b101b] border border-white/[0.06] space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                Telegram Instant Push Alerts
              </h2>
              <p className="text-xs text-slate-400">
                Receive real-time notifications with direct Reddit links the moment a lead is detected.
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
              settings?.telegramConfigured
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
            }`}
          >
            {settings?.telegramConfigured ? "Connected via .env" : "Not Configured"}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#070a10] border border-white/[0.06] space-y-2.5 text-xs text-slate-300">
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
              Add them to your <code className="text-amber-300">.env</code> file as{" "}
              <code className="text-slate-200">TELEGRAM_BOT_TOKEN</code> and{" "}
              <code className="text-slate-200">TELEGRAM_CHAT_ID</code>.
            </li>
          </ol>
        </div>

        {/* Test Alert Button */}
        <div className="pt-2 border-t border-white/[0.06] space-y-3">
          <span className="text-xs font-semibold text-slate-300 block">
            Test Your Telegram Alert
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Custom Bot Token (optional if in .env)"
              value={testToken}
              onChange={(e) => setTestToken(e.target.value)}
              className="bg-[#070a10] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Custom Chat ID (optional if in .env)"
              value={testChatId}
              onChange={(e) => setTestChatId(e.target.value)}
              className="bg-[#070a10] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleSendTestAlert}
            disabled={sendingTest}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl shadow-sm transition disabled:opacity-50 flex items-center gap-2"
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
      <div className="p-6 rounded-2xl bg-[#0b101b] border border-white/[0.06] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                Google Gemini AI Intelligence
              </h2>
              <p className="text-xs text-slate-400">
                Two-stage candidate pipeline for semantic qualification, requirement extraction, and tailored pitch writing.
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
              settings?.geminiConfigured
                ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            {settings?.geminiConfigured
              ? "Active (Gemini 2.5 Flash)"
              : "Rule-Based Heuristics (Zero API Fee)"}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#070a10] border border-white/[0.06] text-xs text-slate-400 leading-relaxed space-y-2">
          <p>
            • <strong className="text-slate-200">Rule-Based Pre-Filter:</strong> Eliminates noise and non-leads locally before invoking AI, keeping you safely under Google free-tier quotas.
          </p>
          <p>
            • <strong className="text-slate-200">Gemini 2.5 Flash:</strong> Automatically extracts technical requirements, timeline, budget details, and generates tailored outreach messages.
          </p>
        </div>
      </div>

      {/* Core Operational Thresholds */}
      <form
        onSubmit={handleSaveSettings}
        className="p-6 rounded-2xl bg-[#0b101b] border border-white/[0.06] space-y-4"
      >
        <span className="text-sm font-bold text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-slate-400" />
          <span>Scoring & Poller Thresholds</span>
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              className="w-full bg-[#070a10] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Default: 20s
            </span>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Min Lead Qualification Score
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={minOpportunityScore}
              onChange={(e) => setMinOpportunityScore(e.target.value)}
              className="w-full bg-[#070a10] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Score threshold to save to database (Default: 70)
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
              className="w-full bg-[#070a10] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Score threshold to dispatch Telegram alert (Default: 75)
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl shadow-sm transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Configuration"}
          </button>

          {saveMessage && (
            <span className="text-xs text-emerald-400 font-medium">
              {saveMessage}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
