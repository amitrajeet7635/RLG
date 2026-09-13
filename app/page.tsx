"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Radar,
  Search,
  RefreshCw,
  ExternalLink,
  DollarSign,
  Clock,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Send,
  Flame,
  Briefcase,
  Target,
  Activity,
  Layers,
  ArrowUpRight,
} from "lucide-react";

interface Lead {
  id: string;
  redditPostId: string;
  subreddit: string;
  author: string;
  title: string;
  body: string;
  url: string;
  createdAtUtc: string;
  commercialIntent: string;
  opportunityType: string;
  score: number;
  budget: string | null;
  currency: string;
  timeline: string | null;
  summary: string | null;
  requirements: string | null;
  technologies: string | null;
  outreachPitch: string | null;
  status: string;
  isAiAnalyzed: boolean;
}

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [pollStatusText, setPollStatusText] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [intentFilter, setIntentFilter] = useState("ALL");
  const [minScore, setMinScore] = useState("0");

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/leads?limit=100");
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (err) {
      console.error("Failed to load leads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handlePollNow = async () => {
    try {
      setPolling(true);
      setPollStatusText(null);
      const res = await fetch("/api/poll-now", { method: "POST" });
      const data = await res.json();
      setPollStatusText(data.message || "Poll completed successfully.");
      await fetchLeads();
      setTimeout(() => setPollStatusText(null), 4000);
    } catch (err) {
      setPollStatusText("Failed to scan Reddit.");
    } finally {
      setPolling(false);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Pipeline Counts
  const countAll = leads.length;
  const countNew = leads.filter((l) => l.status === "NEW").length;
  const countReviewed = leads.filter((l) => l.status === "REVIEWED").length;
  const countContacted = leads.filter((l) => l.status === "CONTACTED").length;
  const countConverted = leads.filter((l) => l.status === "CONVERTED").length;
  const countCritical = leads.filter((l) => l.score >= 90).length;
  const countPaid = leads.filter((l) => l.commercialIntent === "PAID").length;

  // Filtered Leads
  const filteredLeads = leads.filter((lead) => {
    if (activeTab !== "ALL" && lead.status !== activeTab) return false;
    if (intentFilter !== "ALL" && lead.commercialIntent !== intentFilter) return false;
    if (lead.score < parseInt(minScore, 10)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = lead.title.toLowerCase().includes(q);
      const matchSub = lead.subreddit.toLowerCase().includes(q);
      const matchAuthor = lead.author.toLowerCase().includes(q);
      const matchSummary = (lead.summary || "").toLowerCase().includes(q);
      if (!matchTitle && !matchSub && !matchAuthor && !matchSummary) return false;
    }
    return true;
  });

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-rose-500/10 text-rose-400 border-rose-500/25";
    if (score >= 80) return "bg-amber-500/10 text-amber-400 border-amber-500/25";
    return "bg-blue-500/10 text-blue-400 border-blue-500/25";
  };

  const getIntentBadge = (intent: string) => {
    switch (intent) {
      case "PAID":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "FREE":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "EQUITY":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "COLLABORATION":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      default:
        return "bg-slate-800/60 text-slate-400 border-slate-700/50";
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-8">
      {/* Header & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>Opportunity Pipeline</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white/[0.05] text-slate-400 border border-white/[0.08]">
              {leads.length} Leads Tracked
            </span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Real-time qualified web development gigs qualified by Gemini AI & instant lead radar.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePollNow}
            disabled={polling}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-500/20 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${polling ? "animate-spin" : ""}`} />
            <span>{polling ? "Scanning Reddit..." : "Poll Reddit Now"}</span>
          </button>
        </div>
      </div>

      {pollStatusText && (
        <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-800/40 text-blue-200 text-xs flex items-center gap-2.5 animate-fadeIn">
          <Activity className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span>{pollStatusText}</span>
        </div>
      )}

      {/* Sleek Minimal Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#0b101b] border border-white/[0.06] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Total Ingested
            </span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{countAll}</span>
            <span className="text-[11px] text-slate-500">leads</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b101b] border border-white/[0.06] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-400">
              Critical (90+)
            </span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-400">{countCritical}</span>
            <span className="text-[11px] text-slate-500">immediate action</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b101b] border border-white/[0.06] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
              Paid Opportunities
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">{countPaid}</span>
            <span className="text-[11px] text-slate-500">budget specified</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b101b] border border-white/[0.06] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
              Contacted / Converted
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-400">
              {countContacted + countConverted}
            </span>
            <span className="text-[11px] text-slate-500">in conversation</span>
          </div>
        </div>
      </div>

      {/* Advanced Pipeline Tabs */}
      <div className="border-b border-white/[0.06] flex items-center space-x-2 overflow-x-auto pb-1">
        {[
          { key: "ALL", label: "All Leads", count: countAll },
          { key: "NEW", label: "New Inbox", count: countNew },
          { key: "REVIEWED", label: "Reviewed", count: countReviewed },
          { key: "CONTACTED", label: "Contacted", count: countContacted },
          { key: "CONVERTED", label: "Converted", count: countConverted },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition flex items-center gap-2 flex-shrink-0 ${
              activeTab === tab.key
                ? "bg-white/[0.08] text-white border border-white/[0.1]"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                activeTab === tab.key
                  ? "bg-blue-500/20 text-blue-300 font-bold"
                  : "bg-slate-800/80 text-slate-400"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 rounded-2xl bg-[#0b101b] border border-white/[0.06] flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search keywords, tech, author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-1.5 bg-[#070a10] border border-white/[0.08] rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Intent Filter */}
          <select
            value={intentFilter}
            onChange={(e) => setIntentFilter(e.target.value)}
            className="bg-[#070a10] border border-white/[0.08] text-slate-300 text-xs px-3 py-1.5 rounded-xl focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Commercial Intent</option>
            <option value="PAID">Paid Budget Only</option>
            <option value="FREE">Free / Portfolio</option>
            <option value="EQUITY">Equity</option>
            <option value="COLLABORATION">Collaboration</option>
          </select>

          {/* Min Score */}
          <select
            value={minScore}
            onChange={(e) => setMinScore(e.target.value)}
            className="bg-[#070a10] border border-white/[0.08] text-slate-300 text-xs px-3 py-1.5 rounded-xl focus:outline-none focus:border-blue-500"
          >
            <option value="0">Score: Any</option>
            <option value="70">Score: 70+ (Qualified)</option>
            <option value="80">Score: 80+ (High Intent)</option>
            <option value="90">Score: 90+ (Critical)</option>
          </select>
        </div>
      </div>

      {/* Leads Feed List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-20 text-center text-slate-500 text-xs">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-500" />
            Loading real-time lead pipeline...
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-[#0b101b] border border-dashed border-white/[0.08] p-8">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <h3 className="text-sm font-semibold text-slate-300">
              No leads match your current filter
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Click &quot;Poll Reddit Now&quot; to fetch the latest opportunities or reset your filter tabs.
            </p>
          </div>
        ) : (
          filteredLeads.map((lead) => {
            const techList = lead.technologies
              ? (JSON.parse(lead.technologies) as string[])
              : [];

            return (
              <div
                key={lead.id}
                className="p-5 rounded-2xl bg-[#0b101b] hover:bg-[#0e1422] border border-white/[0.06] hover:border-white/[0.1] transition space-y-3.5"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Score Badge */}
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${getScoreColor(
                        lead.score
                      )} flex items-center gap-1.5`}
                    >
                      <Target className="w-3.5 h-3.5" />
                      <span>{lead.score}/100</span>
                    </span>

                    {/* Subreddit */}
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-lg bg-white/[0.04] text-slate-300 border border-white/[0.06]">
                      r/{lead.subreddit}
                    </span>

                    {/* Commercial Intent */}
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border ${getIntentBadge(
                        lead.commercialIntent
                      )}`}
                    >
                      {lead.commercialIntent}
                    </span>

                    {/* Opportunity Type */}
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      {lead.opportunityType.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTimeAgo(lead.createdAtUtc)}
                    </span>
                    <span>•</span>
                    <a
                      href={`https://www.reddit.com/user/${lead.author}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white transition"
                    >
                      u/{lead.author}
                    </a>
                  </div>
                </div>

                {/* Title & Summary */}
                <div>
                  <Link
                    href={`/leads/${lead.id}`}
                    className="text-base font-semibold text-slate-100 hover:text-blue-400 transition leading-snug block"
                  >
                    {lead.title}
                  </Link>
                  {lead.summary && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {lead.summary}
                    </p>
                  )}
                </div>

                {/* Details, Tech & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.04]">
                  <div className="flex flex-wrap items-center gap-2">
                    {lead.budget && (
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        Budget: {lead.budget}
                      </span>
                    )}

                    {techList.map((t) => (
                      <span
                        key={t}
                        className="text-[11px] text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.04]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* Status Dropdown */}
                    <select
                      value={lead.status}
                      onChange={(e) =>
                        handleStatusChange(lead.id, e.target.value)
                      }
                      className="text-xs bg-[#070a10] border border-white/[0.08] text-slate-300 px-2.5 py-1.5 rounded-xl focus:outline-none"
                    >
                      <option value="NEW">New</option>
                      <option value="REVIEWED">Reviewed</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="CONVERTED">Converted</option>
                      <option value="IGNORED">Ignored</option>
                    </select>

                    {/* Quick Direct Message */}
                    <a
                      href={`https://www.reddit.com/message/compose/?to=${encodeURIComponent(
                        lead.author
                      )}&subject=${encodeURIComponent(
                        "Re: " + lead.title.substring(0, 35)
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 transition"
                      title="Direct Message Author on Reddit"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </a>

                    {/* Open Exact Reddit Post */}
                    <a
                      href={lead.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.06] transition"
                      title="Open Exact Reddit Post"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {/* View Details */}
                    <Link
                      href={`/leads/${lead.id}`}
                      className="flex items-center gap-1 text-xs font-semibold text-white px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 transition shadow-sm shadow-blue-500/20"
                    >
                      <span>Review & Pitch</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
