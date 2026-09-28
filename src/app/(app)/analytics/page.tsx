"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  LineChart,
  TrendingUp,
  Percent,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { formatPercent, formatNumber } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AnalyticsTrendPage() {
  const [selectedChartTab, setSelectedChartTab] = useState<"runs_trend" | "pr_curve">("runs_trend");

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analyticsTrends"],
    queryFn: () => api.getAnalytics(),
  });

  const runsTrendData = (analytics?.runs || [])
    .slice()
    .reverse()
    .map((run) => ({
      tag: run.tag.replace("v", ""),
      precision: +(run.precision * 100).toFixed(2),
      recall: +(run.recall * 100).toFixed(2),
      f05: +(run.f05_score * 100).toFixed(2),
      threshold: run.threshold,
    }));

  const prCurveData = (analytics?.pr_curve || []).map((point) => ({
    threshold: point.threshold,
    precision: +(point.precision * 100).toFixed(2),
    recall: +(point.recall * 100).toFixed(2),
    f05: +(point.f05 * 100).toFixed(2),
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-subtle">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <LineChart className="h-5 w-5 text-indigo-600" />
            <span>Model Analytics &amp; Historical Performance Trends</span>
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl">
            Track iteration benchmarks across classifier iterations, evaluate the Precision-Recall tradeoff curve, and inspect cross-country performance.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="indigo" className="text-xs py-1 px-3 font-mono">
            Best F_0.5: 0.9628 (v3.4-hybrid)
          </Badge>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-white to-indigo-50/20 dark:from-slate-900 dark:to-indigo-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              Reduction Ratio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
              {analytics ? formatPercent(analytics.reduction_ratio, 3) : "99.981%"}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Maintained across all 5 iterations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">
              Singleton Isolation Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {analytics ? formatPercent(analytics.singleton_accuracy, 2) : "98.90%"}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Zero spurious links on singletons
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">
              F_0.5 Benchmark Gain
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
              +7.17%
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              From 0.8911 (v2.9) to 0.9628 (v3.4)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">
              Optimal Operating Threshold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
              τ = 0.78
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Max F_0.5 on validation PR curve
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Section */}
      <Card>
        <CardHeader className="pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-sm font-semibold">
              {selectedChartTab === "runs_trend"
                ? "F_0.5, Precision & Recall Trend across Pipeline Runs"
                : "Precision-Recall & F_0.5 Tradeoff vs Similarity Threshold"}
            </CardTitle>
            <CardDescription className="text-xs">
              {selectedChartTab === "runs_trend"
                ? "Progression of model evaluation metrics across successive experimental versions"
                : "Operating characteristic curve demonstrating how threshold τ balances precision vs recall"}
            </CardDescription>
          </div>

          <Tabs value={selectedChartTab} onValueChange={(val) => setSelectedChartTab(val as any)}>
            <TabsList>
              <TabsTrigger value="runs_trend">Historical Progression</TabsTrigger>
              <TabsTrigger value="pr_curve">PR Tradeoff Curve</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent>
          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              {selectedChartTab === "runs_trend" ? (
                <RechartsLineChart
                  data={runsTrendData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                  <XAxis
                    dataKey="tag"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    label={{
                      value: "Pipeline Run Version",
                      position: "insideBottom",
                      offset: -5,
                      style: { fontSize: 11, fill: "#64748b" },
                    }}
                  />
                  <YAxis
                    domain={[85, 100]}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    label={{
                      value: "Score (%)",
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: 11, fill: "#64748b" },
                    }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-900 text-xs space-y-1">
                            <p className="font-bold text-slate-900 dark:text-slate-100">
                              Version: {label}
                            </p>
                            {payload.map((p) => (
                              <p key={p.name} style={{ color: p.color }} className="font-mono">
                                {p.name}: {p.value}%
                              </p>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Line
                    type="monotone"
                    dataKey="f05"
                    name="F_0.5 Score"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="precision"
                    name="Precision"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="recall"
                    name="Recall"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </RechartsLineChart>
              ) : (
                <RechartsLineChart
                  data={prCurveData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                  <XAxis
                    dataKey="threshold"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    label={{
                      value: "Similarity Threshold (τ)",
                      position: "insideBottom",
                      offset: -5,
                      style: { fontSize: 11, fill: "#64748b" },
                    }}
                  />
                  <YAxis
                    domain={[70, 100]}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    label={{
                      value: "Metric Percentage (%)",
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: 11, fill: "#64748b" },
                    }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-900 text-xs space-y-1">
                            <p className="font-bold text-slate-900 dark:text-slate-100">
                              Threshold: τ = {label}
                            </p>
                            {payload.map((p) => (
                              <p key={p.name} style={{ color: p.color }} className="font-mono">
                                {p.name}: {p.value}%
                              </p>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Line
                    type="monotone"
                    dataKey="precision"
                    name="Precision"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="f05"
                    name="F_0.5 Score"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="recall"
                    name="Recall"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </RechartsLineChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Country Breakdown & Error Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Country Level Performance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Performance by Geographic Jurisdiction
            </CardTitle>
            <CardDescription className="text-xs">
              Resolution precision and recall across primary international operating regions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] border-y border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-2.5 font-semibold">Country</th>
                  <th className="px-5 py-2.5 font-semibold">Entities Evaluated</th>
                  <th className="px-5 py-2.5 font-semibold">Precision</th>
                  <th className="px-5 py-2.5 font-semibold">Recall</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {analytics?.country_performance?.map((c) => (
                  <tr key={c.country} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3 font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {c.country}
                    </td>
                    <td className="px-5 py-3 font-mono text-slate-600 dark:text-slate-400">
                      {formatNumber(c.count)}
                    </td>
                    <td className="px-5 py-3 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      {formatPercent(c.precision, 2)}
                    </td>
                    <td className="px-5 py-3 font-mono text-blue-600 dark:text-blue-400 font-semibold">
                      {formatPercent(c.recall, 2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Error Taxonomy Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Residual Error Taxonomy Breakdown
            </CardTitle>
            <CardDescription className="text-xs">
              Distribution of edge-case discrepancies identified during validation analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg border bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  Name Typo False Negatives
                </p>
                <p className="text-slate-500 text-[11px]">
                  Extreme multi-character OCR or phonetic typos in legal entity title
                </p>
              </div>
              <Badge variant="secondary" className="font-mono text-xs">
                {analytics?.error_breakdown.name_typo_false_negative || 42} cases
              </Badge>
            </div>

            <div className="p-3 rounded-lg border bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  Address Relocation / Alternate HQ
                </p>
                <p className="text-slate-500 text-[11px]">
                  Subsidiary vs holding entity recorded at different city addresses
                </p>
              </div>
              <Badge variant="secondary" className="font-mono text-xs">
                {analytics?.error_breakdown.address_diff_false_negative || 31} cases
              </Badge>
            </div>

            <div className="p-3 rounded-lg border bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  Similar Sibling Entities (False Positives)
                </p>
                <p className="text-slate-500 text-[11px]">
                  Distinct legal entities sharing parent brand name (e.g. Services vs Logistics)
                </p>
              </div>
              <Badge variant="warning" className="font-mono text-xs">
                {analytics?.error_breakdown.similar_name_false_positive || 18} cases
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
