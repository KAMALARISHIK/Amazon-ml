"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Play, CheckCircle2, AlertCircle, RefreshCw, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePipeline } from "@/context/PipelineContext";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { activeJob, isTriggering, triggerMatchingJob } = usePipeline();

  const getPageTitle = (path: string) => {
    switch (path) {
      case "/dashboard":
        return { title: "Executive Overview", subtitle: "Cross-source Entity Resolution Performance & Active Pipeline State" };
      case "/upload":
        return { title: "Dataset Ingestion & Upload", subtitle: "Upload source1.tsv, source2.tsv, source3.tsv and Ground Truth benchmarks" };
      case "/explorer":
        return { title: "Cross-Source Data Explorer", subtitle: "Inspect raw multi-source business records, addresses, tax IDs, and country codes" };
      case "/blocking":
        return { title: "Blocking Stage Analytics", subtitle: "Candidate pair reduction ratio, candidate set size distribution & recall ceilings" };
      case "/matching":
        return { title: "Entity Matching Pipeline", subtitle: "Configure model hyperparameters, similarity thresholds, and trigger ML jobs" };
      case "/matches":
        return { title: "Match Explorer & Cluster Inspector", subtitle: "High-density resolution results with side-by-side record diff comparison" };
      case "/results":
        return { title: "Output Results & TSV Export", subtitle: "Download production-ready matching_results.tsv and candidate_pairs.tsv" };
      case "/validation":
        return { title: "Submission & Format Validation", subtitle: "Integrity checks, transitive closure validation, and ground truth benchmark scoring" };
      case "/analytics":
        return { title: "Model Metrics & Trend Analytics", subtitle: "Precision-Recall tradeoff curves, historical F0.5 progression, and error breakdown" };
      default:
        return { title: "Entity Resolution Platform", subtitle: "Advanced Business Entity Disambiguation" };
    }
  };

  const { title, subtitle } = getPageTitle(pathname);

  const handleQuickRun = async () => {
    if (pathname !== "/matching") {
      router.push("/matching");
    }
    await triggerMatchingJob();
  };

  return (
    <header className="h-16 px-8 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 sticky top-0 z-30 flex items-center justify-between">
      <div>
        <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
          <span>{title}</span>
        </h1>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center space-x-3">
        {/* Backend Endpoint Indicator */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 text-[11px] font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>FastAPI Engine: Active</span>
        </div>

        {/* Trigger Matching Button */}
        <Button
          size="sm"
          onClick={handleQuickRun}
          isLoading={isTriggering || activeJob?.status === "running"}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs font-medium text-xs h-8 px-3.5"
        >
          <Play className="h-3.5 w-3.5 mr-1.5 fill-current" />
          {activeJob?.status === "running" ? "Pipeline Running..." : "Run Match Job"}
        </Button>
      </div>
    </header>
  );
}
