"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";

// ── Icon components ──────────────────────────────────────────────────────────
const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

// ── Inline Tooltip ───────────────────────────────────────────────────────────
interface TooltipProps {
  children: React.ReactNode;
  label: string;
}

function Tooltip({ children, label }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className="absolute top-full left-12/14 -translate-x-1/2 mb-2 px-2 py-1 rounded-md text-xs text-white bg-slate-800 border border-slate-700 whitespace-nowrap pointer-events-none z-50"
          style={{ animation: "fadeIn 0.12s ease" }}
        >
          {label}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </div>
      )}
    </div>
  );
}

// ── Types ────────────────────────────────────────────────────────────────────
interface Social {
  name: string;
  icon: React.ReactNode;
  href: string;
  hoverClass: string;
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function GameFooter() {
  const socials: Social[] = [
    {
      name: "Discord",
      icon: <MessageCircle className="h-5 w-5" />,
      href: "#",
      hoverClass: "hover:text-indigo-400",
    },
    {
      name: "Twitter",
      icon: <XIcon className="h-5 w-5" />,
      href: "#",
      hoverClass: "hover:text-sky-400",
    },
    {
      name: "GitHub",
      icon: <GithubIcon className="h-5 w-5" />,
      href: "#",
      hoverClass: "hover:text-white",
    },
    {
      name: "YouTube",
      icon: <YoutubeIcon className="h-5 w-5" />,
      href: "#",
      hoverClass: "hover:text-red-500",
    },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(4px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
          {socials.map((social) => (
            <Tooltip key={social.name} label={social.name}>
              <a
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className={`
                  w-10 h-10 rounded-xl flex items-center justify-center
                  text-slate-400 transition-all duration-300
                  ${social.hoverClass} hover:bg-white/10
                `}
              >
                {social.icon}
              </a>
            </Tooltip>
          ))}

          <div className="h-6 w-px bg-white/10 mx-1" />

          <div className="px-2 text-[10px] uppercase tracking-widest text-slate-500 font-bold hidden sm:block">
            Socials
          </div>
        </div>
      </footer>
    </>
  );
}