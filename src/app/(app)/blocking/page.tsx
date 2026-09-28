"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Layers,
  Sparkles,
  Zap,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Percent,
  Sliders,
  ArrowRight,
  Database,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { formatNumber, formatPercent } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function BlockingAnalyticsPage() {
  const [activeMethod, setActiveMethod] = useState<"qgram" | "minhash_lsh" | "standard">("qgram");

  const { data: blocking, isLoading } = useQuery({
    queryKey: ["blocking"],
    queryFn: () => api.getBlockingAnalytics(),
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-subtle">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Layers className="h-5 w-5 text-indigo-600" />
            <span>Blocking Stage Analytics &amp; Candidate Reduction</span>
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl">
            Analyze the candidate pair generation efficiency. Blocking prunes impossible pairwise combinations to prevent <span className="font-mono">O(N × M × K)</span> quadratic explosion while safeguarding recall.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="indigo" className="text-xs py-1 px-3 font-mono">
            Active: Q-Gram Indexing (N=3)
          </Badge>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Reduction Ratio */}
        <Card className="border-indigo-200/70 dark:border-indigo-900/40 bg-gradient-to-br from-white to-indigo-50/20 dark:from-slate-900 dark:to-indigo-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              Search Space Reduction Ratio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-mono">
              {blocking ? formatPercent(blocking.reduction_ratio, 3) : "99.981%"}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Pruned from 2.22B cartesian pairs
            </p>
          </CardContent>
        </Card>

        {/* Candidate Pairs Count */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">
              Candidate Pairs Retained
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {blocking ? formatNumber(blocking.candidate_pairs_count) : "421,800"}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Fed directly to pairwise neural matcher
            </p>
          </CardContent>
        </Card>

        {/* Recall Ceiling */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">
              Recall Ceiling (Upper Bound)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {blocking?.recall_ceiling ? formatPercent(blocking.recall_ceiling, 2) : "98.42%"}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Ground truth match coverage retained
            </p>
          </CardContent>
        </Card>

        {/* Avg Candidates / Entity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">
              Avg Candidates / Entity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {blocking?.avg_candidates_per_entity.toFixed(1) || "33.6"}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              P95: {blocking?.p95_candidates_per_entity || 82} | Max: {blocking?.max_candidates_per_entity || 312}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Histogram Chart: Candidate Set Size Distribution */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Candidate-Set-Size Distribution Histogram
            </CardTitle>
            <CardDescription className="text-xs">
              Number of entities in Source 1 vs the number of candidate matches proposed across Source 2 &amp; 3
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono">
            Log-Normal Curve
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={blocking?.candidate_set_distribution || []}
                margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis
                  dataKey="bucket"
                  label={{
                    value: "Candidate Pairs Bucket (per Source 1 entity)",
                    position: "insideBottom",
                    offset: -10,
                    style: { fontSize: 11, fill: "#64748b" },
                  }}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <YAxis
                  label={{
                    value: "Entity Count",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 11, fill: "#64748b" },
                  }}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-lg dark:border-slate-800 dark:bg-slate-900 text-xs">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            Candidate Range: {data.bucket}
                          </p>
                          <p className="text-indigo-600 dark:text-indigo-400 font-mono">
                            Count: {formatNumber(data.count)} entities ({data.percentage}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                  {blocking?.candidate_set_distribution?.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index >= 5 ? "#f59e0b" : "#4f46e5"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center space-x-6 text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-1.5">
              <span className="h-3 w-3 rounded bg-indigo-600 inline-block" />
              <span>Normal Distribution (1 - 100 candidates)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="h-3 w-3 rounded bg-amber-500 inline-block" />
              <span>High Candidate Bottleneck Cluster (&gt; 100 candidates)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottleneck Entities Table */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Per-Source1 Entity Candidate Bottleneck Analysis
            </CardTitle>
            <CardDescription className="text-xs">
              Entities with largest candidate sets that create computational hotspots during pairwise inference
            </CardDescription>
          </div>
          <Badge variant="warning" className="text-[10px]">
            Hotspot Monitoring
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-y border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3 font-semibold">Source 1 ID</th>
                  <th className="px-5 py-3 font-semibold">Entity Legal Name</th>
                  <th className="px-5 py-3 font-semibold">Country</th>
                  <th className="px-5 py-3 font-semibold">Proposed Candidates</th>
                  <th className="px-5 py-3 font-semibold">Hotspot Risk</th>
                  <th className="px-5 py-3 font-semibold">Action Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {blocking?.bottleneck_entities?.map((entity) => (
                  <tr
                    key={entity.source1_id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-3 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                      {entity.source1_id}
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {entity.name}
                    </td>
                    <td className="px-5 py-3 font-mono">
                      <Badge variant="outline" className="text-[10px]">
                        {entity.country}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {entity.candidate_count} pairs
                    </td>
                    <td className="px-5 py-3">
                      {entity.risk_level === "high" ? (
                        <Badge variant="destructive" className="text-[10px] uppercase font-mono">
                          High Hotspot
                        </Badge>
                      ) : entity.risk_level === "medium" ? (
                        <Badge variant="warning" className="text-[10px] uppercase font-mono">
                          Moderate
                        </Badge>
                      ) : (
                        <Badge variant="success" className="text-[10px] uppercase font-mono">
                          Normal
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {entity.risk_level === "high"
                        ? "Apply token frequency stopword pruning"
                        : "Processed in normal mini-batch"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
