"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  CheckCircle,
  Clock,
  DollarSign,
  Send,
  MessageSquare,
  FileText,
  Target,
  Cpu,
  User,
  Zap,
} from "lucide-react";

export default function LeadDetailPage() {
  const params = useParams();
  const leadId = params.id as string;

  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  useEffect(() => {
    async function loadLead() {
      try {
        setLoading(true);
        const res = await fetch(`/api/leads/${leadId}`);
        const data = await res.json();
        if (data.lead) {
          setLead(data.lead);
          setNotes(data.lead.notes || "");
        }
      } catch (err) {
        console.error("Failed to load lead details:", err);
      } finally {
        setLoading(false);
      }
    }
    if (leadId) loadLead();
  }, [leadId]);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.lead) {
        setLead(data.lead);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleSaveNotes = async () => {
    try {
      setSavingNotes(true);
      await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save notes:", err);
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 text-xs">
        Loading opportunity intelligence...
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="py-20 text-center space-y-3">
        <h2 className="text-base font-bold text-slate-200">Opportunity Not Found</h2>
        <Link
          href="/"
          className="text-xs text-blue-400 hover:underline flex items-center justify-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Pipeline
        </Link>
      </div>
    );
  }

  const requirementsList = lead.requirements
    ? (JSON.parse(lead.requirements) as string[])
    : [];
  const techList = lead.technologies
    ? (JSON.parse(lead.technologies) as string[])
    : [];

  const casualCommentPitch = `Hey u/${lead.author}, saw your post about needing ${
    lead.opportunityType ? lead.opportunityType.replace(/_/g, " ") : "a website"
  }. I specialize in modern web development (${
    techList.length > 0 ? techList.join(", ") : "React/Next.js/Shopify"
  }) and have built similar client projects. Sent you a DM with relevant work and quick thoughts!`;

  const valueFirstPitch = `Hi u/${lead.author}! Regarding your project for "${lead.title.substring(
    0,
    50
  )}...", here are 3 quick architectural tips: 1) ensure responsive mobile layout, 2) optimize page load speed for better SEO, and 3) use a clean headless CMS or modern framework. I would love to build this out for you within your timeline. Feel free to DM or reply if interested!`;

  return (
    <div className="space-y-4 sm:space-y-8 max-w-5xl mx-auto">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Pipeline</span>
        </Link>

        {/* Lead Status Pipeline Badges (Horizontal scroll on mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {["NEW", "REVIEWED", "CONTACTED", "CONVERTED", "IGNORED"].map(
            (st) => (
              <button
                key={st}
                onClick={() => handleStatusUpdate(st)}
                className={`text-[10px] sm:text-[11px] px-2.5 sm:px-3 py-1.5 rounded-xl font-medium transition flex-shrink-0 min-h-[32px] ${
                  lead.status === st
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                    : "bg-[#0b101b] border border-white/[0.06] text-slate-400 hover:text-slate-200"
                }`}
              >
                {st}
              </button>
            )
          )}
        </div>
      </div>

      {/* Main Header Card */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#0b101b] border border-white/[0.06] space-y-3.5 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/25 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              Score: {lead.score}/100
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-white/[0.04] text-slate-300 border border-white/[0.06]">
              r/{lead.subreddit}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {lead.commercialIntent}
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/20">
              {lead.opportunityType.replace(/_/g, " ")}
            </span>
          </div>

          {/* Action Links */}
          <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
            <a
              href={`https://www.reddit.com/message/compose/?to=${encodeURIComponent(
                lead.author
              )}&subject=${encodeURIComponent("Re: " + lead.title.substring(0, 35))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-xs font-semibold text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 px-3 py-2.5 sm:py-2 rounded-xl transition min-h-[38px]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>DM Author</span>
            </a>

            <a
              href={lead.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-3 py-2.5 sm:py-2 rounded-xl shadow-sm shadow-blue-500/20 transition min-h-[38px]"
            >
              <span>Reddit Post</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <h1 className="text-base sm:text-xl font-bold text-white tracking-tight leading-snug">
          {lead.title}
        </h1>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-400 pt-2.5 border-t border-white/[0.06]">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span>Author:</span>
            <a
              href={`https://www.reddit.com/user/${lead.author}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-200 hover:text-blue-400 font-medium transition"
            >
              u/{lead.author}
            </a>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Posted:</span>
            <span className="text-slate-200 font-medium">
              {new Date(lead.createdAtUtc).toLocaleDateString()}
            </span>
          </div>
          {lead.budget && (
            <>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Budget:</span>
                <span className="text-emerald-400 font-semibold">{lead.budget}</span>
              </div>
            </>
          )}
          {lead.timeline && (
            <>
              <span className="text-slate-600">•</span>
              <div>
                <span>Timeline:</span>{" "}
                <span className="text-amber-400 font-semibold">{lead.timeline}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left: Intelligence Breakdown & Post Body */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* AI Intelligence Card */}
          <div className="p-4 sm:p-6 rounded-2xl bg-[#0b101b] border border-blue-500/20 space-y-3.5 sm:space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span>AI Lead Intelligence Analysis</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {lead.summary || "High-intent web development freelance opportunity detected."}
            </p>

            {requirementsList.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Extracted Requirements
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {requirementsList.map((req, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[#070a10] border border-white/[0.06] text-xs text-slate-300 flex items-center gap-2"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                      <span className="leading-snug">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {techList.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Detected Technologies
                </span>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {techList.map((t) => (
                    <span
                      key={t}
                      className="text-xs font-medium px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Original Reddit Post Body */}
          <div className="p-4 sm:p-6 rounded-2xl bg-[#0b101b] border border-white/[0.06] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Original Reddit Post Body</span>
            </div>
            <div className="p-3.5 sm:p-4 rounded-xl bg-[#070a10] border border-white/[0.06] text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans max-h-80 sm:max-h-96 overflow-y-auto">
              {lead.body || "(No selftext body provided in this post)"}
            </div>
          </div>
        </div>

        {/* Right: Outreach Assistant & Notes */}
        <div className="space-y-4 sm:space-y-6">
          {/* Outreach Pitches */}
          <div className="p-4 sm:p-6 rounded-2xl bg-[#0b101b] border border-white/[0.06] space-y-3.5 sm:space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <MessageSquare className="w-4 h-4" />
              <span>Suggested Outreach Pitches</span>
            </div>
            <p className="text-[11px] text-slate-400">
              One-click copy and manually send via Reddit DM or comment.
            </p>

            {/* Pitch 1: Tailored DM */}
            <div className="p-3.5 rounded-xl bg-[#070a10] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-400">
                  Tailored Direct Message
                </span>
                <button
                  onClick={() =>
                    handleCopy(lead.outreachPitch || casualCommentPitch, "dm")
                  }
                  className="p-1.5 px-2.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 transition flex items-center gap-1 text-xs min-h-[32px]"
                >
                  {copiedType === "dm" ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 text-[11px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span className="text-[11px]">Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lead.outreachPitch || casualCommentPitch}
              </p>
            </div>

            {/* Pitch 2: Quick Comment */}
            <div className="p-3.5 rounded-xl bg-[#070a10] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-400">
                  Concise Public Comment
                </span>
                <button
                  onClick={() => handleCopy(casualCommentPitch, "comment")}
                  className="p-1.5 px-2.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 transition flex items-center gap-1 text-xs min-h-[32px]"
                >
                  {copiedType === "comment" ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 text-[11px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span className="text-[11px]">Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {casualCommentPitch}
              </p>
            </div>

            {/* Pitch 3: Value-First */}
            <div className="p-3.5 rounded-xl bg-[#070a10] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400">
                  Value-First Advisory Pitch
                </span>
                <button
                  onClick={() => handleCopy(valueFirstPitch, "value")}
                  className="p-1.5 px-2.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 transition flex items-center gap-1 text-xs min-h-[32px]"
                >
                  {copiedType === "value" ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 text-[11px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span className="text-[11px]">Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {valueFirstPitch}
              </p>
            </div>
          </div>

          {/* Lead Notes */}
          <div className="p-4 sm:p-6 rounded-2xl bg-[#0b101b] border border-white/[0.06] space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Internal Deal Notes
            </span>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record client communication status, quotation amount, or follow-up notes..."
              className="w-full p-3 bg-[#070a10] border border-white/[0.08] rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition resize-none"
            />
            <button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="w-full py-2.5 bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 font-medium text-xs rounded-xl border border-white/[0.06] transition flex items-center justify-center gap-2 min-h-[40px]"
            >
              {notesSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Notes Saved</span>
                </>
              ) : (
                <span>Save Notes</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
