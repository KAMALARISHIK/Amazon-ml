"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileCheck,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Database,
  Layers,
  Copy,
  Check,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { MOCK_MATCHES } from "@/lib/mock-data";
import { formatNumber } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ResultsExportPage() {
  const [activeFile, setActiveFile] = useState<"matching_results" | "candidate_pairs">("matching_results");
  const [copied, setCopied] = useState(false);

  const { data: matchesResponse } = useQuery({
    queryKey: ["matchesResultsExport"],
    queryFn: () => api.getMatches({ page: 1, page_size: 100 }),
  });

  const matches = matchesResponse?.matches || MOCK_MATCHES;

  // Generate TSV content for matching_results.tsv
  const matchingResultsTsv = [
    "source1_id\tsource2_id\tsource3_id\tcluster_id\tconfidence_score",
    ...matches.map(
      (m) =>
        `${m.source1_id}\t${m.source2_id || ""}\t${m.source3_id || ""}\t${m.cluster_id}\t${m.confidence_score.toFixed(4)}`
    ),
  ].join("\n");

  // Generate TSV content for candidate_pairs.tsv
  const candidatePairsTsv = [
    "source1_id\tcandidate_id\tcandidate_source\tblocking_score\tdecision",
    ...matches.flatMap((m) => {
      const rows = [];
      if (m.source2_id) {
        rows.push(`${m.source1_id}\t${m.source2_id}\tsource2\t${m.confidence_score.toFixed(4)}\tMATCH`);
      }
      if (m.source3_id) {
        rows.push(`${m.source1_id}\t${m.source3_id}\tsource3\t${m.confidence_score.toFixed(4)}\tMATCH`);
      }
      return rows;
    }),
  ].join("\n");

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/tab-separated-values;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-subtle">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <FileCheck className="h-5 w-5 text-indigo-600" />
            <span>Output Results &amp; Submission Artifacts</span>
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl">
            Export final resolved entity clusters and candidate pair artifacts conforming strictly to competition and evaluation formats.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            onClick={() =>
              handleDownload(
                activeFile === "matching_results" ? "matching_results.tsv" : "candidate_pairs.tsv",
                activeFile === "matching_results" ? matchingResultsTsv : candidatePairsTsv
              )
            }
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs h-9 px-4 shadow-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Download {activeFile === "matching_results" ? "matching_results.tsv" : "candidate_pairs.tsv"}
          </Button>
        </div>
      </div>

      {/* 4 Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">
              Resolved Clusters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {formatNumber(matches.length)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Unique business identities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">
              3-Source Triplet Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
              {formatNumber(matches.filter((m) => m.source2_id && m.source3_id).length)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Matched across all 3 catalogs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">
              2-Source Pair Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {formatNumber(matches.filter((m) => (m.source2_id && !m.source3_id) || (!m.source2_id && m.source3_id)).length)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Bilateral entity linkages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">
              Singletons (No Cross-Match)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-slate-700 dark:text-slate-300">
              {formatNumber(matches.filter((m) => !m.source2_id && !m.source3_id).length)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Confirmed isolated entities</p>
          </CardContent>
        </Card>
      </div>

      {/* File Selector & TSV Table Preview */}
      <Card>
        <CardHeader className="pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Tabs value={activeFile} onValueChange={(val) => setActiveFile(val as any)}>
              <TabsList>
                <TabsTrigger value="matching_results">
                  matching_results.tsv ({matches.length} rows)
                </TabsTrigger>
                <TabsTrigger value="candidate_pairs">
                  candidate_pairs.tsv (pairs)
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleCopy(
                  activeFile === "matching_results" ? matchingResultsTsv : candidatePairsTsv
                )
              }
              className="text-xs h-8"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                  Copied TSV
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Copy Raw TSV
                </>
              )}
            </Button>
            <Button
              size="sm"
              onClick={() =>
                handleDownload(
                  activeFile === "matching_results" ? "matching_results.tsv" : "candidate_pairs.tsv",
                  activeFile === "matching_results" ? matchingResultsTsv : candidatePairsTsv
                )
              }
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8"
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Download TSV
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {activeFile === "matching_results" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left font-mono">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase text-[11px] border-y border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3 font-semibold">source1_id</th>
                    <th className="px-5 py-3 font-semibold">source2_id</th>
                    <th className="px-5 py-3 font-semibold">source3_id</th>
                    <th className="px-5 py-3 font-semibold">cluster_id</th>
                    <th className="px-5 py-3 font-semibold">confidence_score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {matches.map((m) => (
                    <tr key={m.source1_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="px-5 py-2.5 text-indigo-600 dark:text-indigo-400 font-semibold">
                        {m.source1_id}
                      </td>
                      <td className="px-5 py-2.5 text-slate-800 dark:text-slate-200">
                        {m.source2_id || <span className="text-slate-400 italic">null</span>}
                      </td>
                      <td className="px-5 py-2.5 text-slate-800 dark:text-slate-200">
                        {m.source3_id || <span className="text-slate-400 italic">null</span>}
                      </td>
                      <td className="px-5 py-2.5 text-slate-900 dark:text-slate-100 font-bold">
                        {m.cluster_id}
                      </td>
                      <td className="px-5 py-2.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                        {m.confidence_score.toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left font-mono">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase text-[11px] border-y border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3 font-semibold">source1_id</th>
                    <th className="px-5 py-3 font-semibold">candidate_id</th>
                    <th className="px-5 py-3 font-semibold">candidate_source</th>
                    <th className="px-5 py-3 font-semibold">blocking_score</th>
                    <th className="px-5 py-3 font-semibold">decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {matches.slice(0, 15).map((m) => (
                    <React.Fragment key={m.source1_id}>
                      {m.source2_id && (
                        <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                          <td className="px-5 py-2.5 text-indigo-600">{m.source1_id}</td>
                          <td className="px-5 py-2.5 text-slate-800 dark:text-slate-200">{m.source2_id}</td>
                          <td className="px-5 py-2.5 text-slate-500">source2</td>
                          <td className="px-5 py-2.5 text-emerald-600">{m.confidence_score.toFixed(4)}</td>
                          <td className="px-5 py-2.5">
                            <Badge variant="success" className="text-[10px]">
                              MATCH
                            </Badge>
                          </td>
                        </tr>
                      )}
                      {m.source3_id && (
                        <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                          <td className="px-5 py-2.5 text-indigo-600">{m.source1_id}</td>
                          <td className="px-5 py-2.5 text-slate-800 dark:text-slate-200">{m.source3_id}</td>
                          <td className="px-5 py-2.5 text-slate-500">source3</td>
                          <td className="px-5 py-2.5 text-emerald-600">{m.confidence_score.toFixed(4)}</td>
                          <td className="px-5 py-2.5">
                            <Badge variant="success" className="text-[10px]">
                              MATCH
                            </Badge>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
