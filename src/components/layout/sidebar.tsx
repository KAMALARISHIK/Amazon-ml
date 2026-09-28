"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UploadCloud,
  Database,
  Layers,
  Cpu,
  Sparkles,
  FileCheck,
  ShieldCheck,
  LineChart,
  LogOut,
  Network,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { usePipeline } from "@/context/PipelineContext";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  stageNumber?: number;
}

const NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Dataset Upload",
    href: "/upload",
    icon: UploadCloud,
    stageNumber: 1,
  },
  {
    title: "Data Explorer",
    href: "/explorer",
    icon: Database,
    stageNumber: 2,
  },
  {
    title: "Blocking Analytics",
    href: "/blocking",
    icon: Layers,
    stageNumber: 3,
  },
  {
    title: "Entity Matching",
    href: "/matching",
    icon: Cpu,
    stageNumber: 4,
  },
  {
    title: "Match Explorer",
    href: "/matches",
    icon: Sparkles,
    stageNumber: 5,
  },
  {
    title: "Results",
    href: "/results",
    icon: FileCheck,
    stageNumber: 6,
  },
  {
    title: "Validation",
    href: "/validation",
    icon: ShieldCheck,
    badge: "F0.5 0.96",
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: LineChart,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { activeJob } = usePipeline();

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col border-r border-slate-200/90 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 h-screen sticky top-0 select-none">
      {/* Platform Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <Link href="/dashboard" className="flex items-center space-x-2.5 group">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-sm text-white font-bold group-hover:scale-105 transition-transform">
            <Network className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100 block">
              ResolveML
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide block uppercase">
              Entity Resolution
            </span>
          </div>
        </Link>
      </div>

      {/* Active Pipeline Status Pill */}
      <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100 dark:bg-slate-950/40 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                activeJob?.status === "running"
                  ? "bg-amber-500 animate-pulse"
                  : "bg-emerald-500"
              )}
            />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {activeJob?.status === "running" ? "Pipeline Active" : "Model Ready"}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">v3.4-hybrid</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2">
          <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
            Platform Workflow
          </span>
        </div>

        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group",
                isActive
                  ? "bg-indigo-50 text-indigo-700 font-semibold shadow-xs dark:bg-indigo-950/50 dark:text-indigo-300"
                  : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
              )}
            >
              <div className="flex items-center space-x-2.5">
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                  )}
                />
                <span>{item.title}</span>
              </div>

              <div className="flex items-center space-x-1.5">
                {item.stageNumber !== undefined && (
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 rounded px-1.5 py-0.5">
                    S{item.stageNumber}
                  </span>
                )}
                {item.badge && (
                  <Badge variant="indigo" className="text-[10px] py-0 px-1.5">
                    {item.badge}
                  </Badge>
                )}
                {isActive && <ChevronRight className="h-3.5 w-3.5 text-indigo-500" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-200 flex-shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                {user?.name || "Dr. Elena Vance"}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {user?.role || "ML Engineer"}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
