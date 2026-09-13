import type { Metadata, Viewport } from "next";
import "./globals.css";
import Link from "next/link";
import {
  Radar,
  LayoutDashboard,
  Layers,
  Settings,
  Download,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Opportunity Intelligence — Real-Time Lead Radar",
  description:
    "Autonomous real-time opportunity intelligence and instant lead alert platform for freelance developers.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "OppBot",
  },
};

export const viewport: Viewport = {
  themeColor: "#070a10",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
      </head>
      <body className="bg-[#070a10] text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        <div className="min-h-screen flex flex-col">
          {/* Top Navigation Bar */}
          <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#070a10]/85 border-b border-white/[0.06]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              {/* Brand */}
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/10">
                  <Radar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base tracking-tight text-white">
                      Opportunity Radar
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      v2.0
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Autonomous Feed Active</span>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="flex items-center space-x-1 sm:space-x-3">
                <Link
                  href="/"
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] transition flex items-center space-x-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-blue-400" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/subreddits"
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] transition flex items-center space-x-2"
                >
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>Subreddits</span>
                </Link>
                <Link
                  href="/settings"
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] transition flex items-center space-x-2"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Settings</span>
                </Link>

                {/* PWA Install Button Script */}
                <button
                  id="pwa-install-btn"
                  className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition"
                  title="Install Progressive Web App"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>Install App</span>
                </button>
              </nav>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>

          {/* Minimal Footer */}
          <footer className="border-t border-white/[0.06] py-6 text-center text-xs text-slate-500">
            Real-Time Lead Intelligence Engine • Human-In-The-Loop Outreach
          </footer>
        </div>

        {/* Register Service Worker for PWA */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(console.error);
                });
              }

              let deferredPrompt;
              const installBtn = document.getElementById('pwa-install-btn');
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                if (installBtn) {
                  installBtn.style.display = 'flex';
                  installBtn.addEventListener('click', () => {
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then(() => {
                      deferredPrompt = null;
                      installBtn.style.display = 'none';
                    });
                  });
                }
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
