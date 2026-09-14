"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Radar,
  LayoutDashboard,
  Layers,
  Settings,
  Download,
  X,
  Share,
  PlusSquare,
  CheckCircle2,
} from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed PWA)
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // Listen for Android / Chrome PWA install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // If on iOS and not yet installed in standalone mode, enable install action
    if (isAppleDevice && !isStandaloneMode) {
      setIsInstallable(true);
    }

    // App installed listener
    window.addEventListener("appinstalled", () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsStandalone(true);
      setInstalledSuccess(true);
      setTimeout(() => setInstalledSuccess(false), 5000);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else {
      setShowIOSModal(true);
    }
  };

  const navLinks = [
    {
      href: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: pathname === "/",
    },
    {
      href: "/subreddits",
      label: "Subreddits",
      icon: Layers,
      active: pathname.startsWith("/subreddits"),
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      active: pathname.startsWith("/settings"),
    },
  ];

  return (
    <>
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#070a10]/85 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/10 flex-shrink-0">
              <Radar className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-semibold text-sm sm:text-base tracking-tight text-white">
                  Opportunity Radar
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  v2.0
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-[10px] sm:text-[11px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="truncate">Autonomous Stream Active</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden sm:flex items-center space-x-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition flex items-center space-x-2 ${
                    item.active
                      ? "bg-white/[0.08] text-white border border-white/[0.1] shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.active ? "text-blue-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Desktop Install App Button */}
            {!isStandalone && isInstallable && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-200 hover:text-white px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 transition shadow-sm shadow-blue-500/10"
                title="Install Progressive Web App"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Install App</span>
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 sm:hidden bg-[#070a10]/95 backdrop-blur-2xl border-t border-white/[0.08] pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 px-3">
        <div className="grid grid-cols-4 items-center justify-around">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition ${
                  item.active ? "text-blue-400 font-semibold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className={`p-1 rounded-lg ${item.active ? "bg-blue-500/15" : ""}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              </Link>
            );
          })}

          {/* Mobile Install App Button */}
          <button
            onClick={handleInstallClick}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition ${
              isStandalone
                ? "text-emerald-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className={`p-1 rounded-lg ${isStandalone ? "bg-emerald-500/15" : "bg-white/[0.04]"}`}>
              {isStandalone ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Download className="w-5 h-5 text-blue-400" />
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">
              {isStandalone ? "Installed" : "Install"}
            </span>
          </button>
        </div>
      </div>

      {/* iOS / Mobile Add to Home Screen Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-[#0b101b] border border-white/[0.1] p-5 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/[0.06] text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                <Download className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Install Mobile App</h3>
                <p className="text-xs text-slate-400">Add to your phone home screen</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              {isIOS ? (
                <>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                    <span className="font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">1</span>
                    <span>Tap the Safari <strong>Share</strong> icon in the toolbar <Share className="w-3.5 h-3.5 inline text-blue-400 mx-1" /></span>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                    <span className="font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">2</span>
                    <span>Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline text-blue-400 mx-1" /></span>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                    <span className="font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">3</span>
                    <span>Tap <strong>Add</strong> in the top right to install instantly.</span>
                  </div>
                </>
              ) : (
                <p className="text-slate-400 leading-relaxed">
                  Open your browser menu (⋮) and tap <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home Screen&quot;</strong> to use Opportunity Radar as a standalone native app.
                </p>
              )}
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {installedSuccess && (
        <div className="fixed top-4 right-4 z-50 p-3 rounded-2xl bg-emerald-950 border border-emerald-600/40 text-emerald-200 text-xs flex items-center gap-2 shadow-xl animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>App installed to your home screen!</span>
        </div>
      )}
    </>
  );
}
