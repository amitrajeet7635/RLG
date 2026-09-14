"use client";

import { useEffect, useState } from "react";
import {
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Target,
  Radio,
} from "lucide-react";

interface Subreddit {
  id: string;
  name: string;
  enabled: boolean;
  minScore: number;
  description: string | null;
  totalPosts: number;
  qualifiedLeads: number;
  lastPolledAt: string | null;
}

export default function SubredditsPage() {
  const [subreddits, setSubreddits] = useState<Subreddit[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [newSubName, setNewSubName] = useState("");
  const [newSubScore, setNewSubScore] = useState("70");
  const [newSubDesc, setNewSubDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchSubreddits = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/subreddits");
      const data = await res.json();
      setSubreddits(data.subreddits || []);
    } catch (err) {
      console.error("Failed to load subreddits:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubreddits();
  }, []);

  const handleToggle = async (sub: Subreddit) => {
    try {
      const res = await fetch("/api/subreddits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: sub.name, enabled: !sub.enabled }),
      });
      if (res.ok) {
        setSubreddits((prev) =>
          prev.map((s) => (s.id === sub.id ? { ...s, enabled: !s.enabled } : s))
        );
      }
    } catch (err) {
      console.error("Failed to toggle subreddit:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this subreddit from monitoring?"))
      return;
    try {
      const res = await fetch(`/api/subreddits?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSubreddits((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete subreddit:", err);
    }
  };

  const handleAddSubreddit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/subreddits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSubName.trim(),
          minScore: parseInt(newSubScore, 10),
          description: newSubDesc.trim(),
          enabled: true,
        }),
      });

      if (res.ok) {
        setNewSubName("");
        setNewSubDesc("");
        setNewSubScore("70");
        await fetchSubreddits();
      }
    } catch (err) {
      console.error("Failed to add subreddit:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
          <span>Monitored Communities</span>
        </h1>
        <p className="text-slate-400 text-xs mt-0.5 sm:mt-1">
          Configure subreddits to scan and customize qualification thresholds per community.
        </p>
      </div>

      {/* Add New Subreddit Form */}
      <form
        onSubmit={handleAddSubreddit}
        className="p-4 sm:p-6 rounded-2xl bg-[#0b101b] border border-white/[0.06] space-y-3.5 sm:space-y-4"
      >
        <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <Plus className="w-3.5 h-3.5 text-purple-400" />
          <span>Add Monitored Subreddit</span>
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Subreddit Name
            </label>
            <div className="flex items-center bg-[#070a10] border border-white/[0.08] rounded-xl px-3 py-2 text-xs focus-within:border-purple-500 min-h-[40px]">
              <span className="text-slate-500 mr-1 font-medium">r/</span>
              <input
                type="text"
                placeholder="e.g. forhire"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none w-full text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Minimum Qualification Score
            </label>
            <select
              value={newSubScore}
              onChange={(e) => setNewSubScore(e.target.value)}
              className="w-full bg-[#070a10] border border-white/[0.08] text-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-purple-500 min-h-[40px]"
            >
              <option value="60">60 - Lenient (Catch more leads)</option>
              <option value="70">70 - Balanced (Recommended)</option>
              <option value="80">80 - Strict (High quality only)</option>
              <option value="90">90 - Critical Leads Only</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Description / Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Client inquiries and web gigs"
              value={newSubDesc}
              onChange={(e) => setNewSubDesc(e.target.value)}
              className="w-full bg-[#070a10] border border-white/[0.08] text-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-purple-500 min-h-[40px]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs rounded-xl shadow-sm transition disabled:opacity-50 min-h-[40px]"
        >
          {submitting ? "Adding..." : "Add Subreddit"}
        </button>
      </form>

      {/* Subreddits List Table */}
      <div className="rounded-2xl bg-[#0b101b] border border-white/[0.06] overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-white/[0.06] flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Subreddits ({subreddits.length})
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            Loading subreddits...
          </div>
        ) : subreddits.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            No subreddits monitored yet. Add one above!
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {subreddits.map((sub) => (
              <div
                key={sub.id}
                className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-white/[0.02] transition"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <button
                    onClick={() => handleToggle(sub)}
                    className="mt-0.5 sm:mt-0 flex-shrink-0 p-1"
                    title={sub.enabled ? "Pause Scanning" : "Resume Scanning"}
                  >
                    {sub.enabled ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-slate-600" />
                    )}
                  </button>

                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="font-semibold text-sm text-slate-100">
                        r/{sub.name}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        Min Score: {sub.minScore}
                      </span>
                      {!sub.enabled && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-500">
                          Paused
                        </span>
                      )}
                    </div>
                    {sub.description && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {sub.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 text-xs text-slate-400 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.04] w-full sm:w-auto">
                  <div className="flex items-center gap-4">
                    <div className="text-left sm:text-right">
                      <span className="text-slate-200 font-semibold block text-xs">
                        {sub.qualifiedLeads}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase">
                        Leads
                      </span>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-slate-200 font-semibold block text-xs">
                        {sub.totalPosts}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase">
                        Scanned
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(sub.id)}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition min-w-[36px] min-h-[36px] flex items-center justify-center"
                    title="Remove Subreddit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
