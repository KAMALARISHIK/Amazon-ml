"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getExpandedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ExpandedState,
} from "@tanstack/react-table";
import {
  Sparkles,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Globe,
  Building,
  CheckCircle2,
  XCircle,
  Sliders,
  Maximize2,
  Layers,
  ArrowRight,
  Hash,
  MapPin,
  ChevronsLeft,
  ChevronLeft,
  ChevronsRight,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { MatchedEntity, BusinessEntityRecord } from "@/types/api";
import { formatNumber, formatPercent, getConfidenceBadgeColor } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

export default function MatchExplorerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("ALL");
  const [minConfidence, setMinConfidence] = useState(0.5);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [comparisonEntity, setComparisonEntity] = useState<MatchedEntity | null>(null);

  const { data: matchesResponse, isLoading } = useQuery({
    queryKey: ["matches", searchQuery, countryFilter, minConfidence],
    queryFn: () =>
      api.getMatches({
        query: searchQuery,
        country: countryFilter,
        min_confidence: minConfidence,
        max_confidence: 1.0,
        page: 1,
        page_size: 100,
      }),
  });

  const matches = useMemo(() => matchesResponse?.matches || [], [matchesResponse?.matches]);

  const columns = useMemo<ColumnDef<MatchedEntity>[]>(
    () => [
      {
        id: "expander",
        header: () => null,
        cell: ({ row }) => (
          <button
            onClick={() => row.toggleExpanded()}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            {row.getIsExpanded() ? (
              <ChevronDown className="h-4 w-4 text-indigo-600" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ),
      },
      {
        accessorKey: "cluster_id",
        header: "Cluster ID",
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
            {row.original.cluster_id}
          </span>
        ),
      },
      {
        id: "source1_name",
        header: "Source 1 Primary Entity",
        cell: ({ row }) => (
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
              <Building className="h-3.5 w-3.5 text-indigo-600 flex-shrink-0" />
              <span>{row.original.source1_record.name}</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              ID: {row.original.source1_id} ({row.original.source1_record.country})
            </div>
          </div>
        ),
      },
      {
        id: "matched_ids",
        header: "Matched Cross-Sources",
        cell: ({ row }) => (
          <div className="space-y-1 font-mono text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-slate-400 font-sans">Src 2:</span>
              {row.original.source2_id ? (
                <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60 text-[11px]">
                  {row.original.source2_id}
                </span>
              ) : (
                <span className="text-slate-400 text-[11px] italic">No match</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-slate-400 font-sans">Src 3:</span>
              {row.original.source3_id ? (
                <span className="text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/60 text-[11px]">
                  {row.original.source3_id}
                </span>
              ) : (
                <span className="text-slate-400 text-[11px] italic">No match</span>
              )}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "confidence_score",
        header: "Confidence Score",
        cell: ({ row }) => {
          const score = row.original.confidence_score;
          const badge = getConfidenceBadgeColor(score);
          return (
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                  {score.toFixed(3)}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
                >
                  {badge.label}
                </span>
              </div>
              <div className="w-24 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{ width: `${score * 100}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Compare",
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setComparisonEntity(row.original)}
            className="text-xs h-7 px-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:border-indigo-800 dark:hover:bg-indigo-950/40"
          >
            <Maximize2 className="h-3 w-3 mr-1" />
            Side-by-Side
          </Button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: matches,
    columns,
    state: {
      sorting,
      expanded,
    },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Summary Cards */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-subtle">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            <span>Match Explorer &amp; Entity Cluster Inspector</span>
          </h2>
          <p className="text-xs text-slate-500">
            Inspect resolved multi-source clusters, verify model confidence levels, and compare cross-source entity attributes side-by-side.
          </p>
        </div>

        {matchesResponse?.summary && (
          <div className="flex items-center space-x-3 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border font-mono">
              <span className="text-slate-400">Total Clusters:</span>{" "}
              <strong className="text-indigo-600 dark:text-indigo-400">
                {formatNumber(matchesResponse.summary.total_clusters)}
              </strong>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border font-mono">
              <span className="text-slate-400">Avg Confidence:</span>{" "}
              <strong className="text-emerald-600 dark:text-emerald-400">
                {(matchesResponse.summary.avg_confidence * 100).toFixed(1)}%
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Controls */}
      <Card>
        <CardHeader className="pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search Input */}
            <div className="w-full md:w-80">
              <Input
                placeholder="Search by entity name, ID, or cluster ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-4 w-4" />}
              />
            </div>

            {/* Country Dropdown */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-slate-500">Country:</span>
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-800 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="ALL">All Countries</option>
                <option value="US">United States (US)</option>
                <option value="DE">Germany (DE)</option>
                <option value="GB">United Kingdom (GB)</option>
                <option value="JP">Japan (JP)</option>
                <option value="SE">Sweden (SE)</option>
                <option value="CH">Switzerland (CH)</option>
              </select>
            </div>

            {/* Confidence Range Slider */}
            <div className="flex items-center space-x-3 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border text-xs">
              <span className="font-medium text-slate-600 dark:text-slate-300">Min Conf:</span>
              <input
                type="range"
                min="0.0"
                max="0.95"
                step="0.05"
                value={minConfidence}
                onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
                className="w-20 accent-indigo-600 cursor-pointer"
              />
              <span className="font-mono font-bold text-indigo-600">
                {minConfidence.toFixed(2)}
              </span>
            </div>
          </div>
        </CardHeader>

        {/* TanStack Table */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 font-semibold border-y border-slate-200 dark:border-slate-800">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-5 py-3 font-semibold">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <React.Fragment key={row.id}>
                      <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-5 py-3">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>

                      {/* Expandable Inline Row Diff */}
                      {row.getIsExpanded() && (
                        <tr className="bg-slate-50/90 dark:bg-slate-900/90 border-y border-indigo-100 dark:border-indigo-900/40">
                          <td colSpan={columns.length} className="p-4 px-8 space-y-3">
                            <div className="flex items-center justify-between text-xs font-semibold text-indigo-900 dark:text-indigo-300">
                              <span>Side-by-Side Cluster Attribute Comparison:</span>
                              <span className="font-mono text-[11px]">
                                Cluster: {row.original.cluster_id}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                              {/* Source 1 Box */}
                              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                                <div className="flex items-center justify-between font-sans">
                                  <span className="font-bold text-slate-800 dark:text-slate-200">
                                    Source 1 (Primary)
                                  </span>
                                  <Badge variant="indigo" className="text-[10px]">
                                    {row.original.source1_id}
                                  </Badge>
                                </div>
                                <div className="text-slate-900 dark:text-slate-100 font-bold">
                                  {row.original.source1_record.name}
                                </div>
                                <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                                  {row.original.source1_record.address || "—"}
                                </div>
                                <div className="text-slate-500 text-[11px]">
                                  {row.original.source1_record.city}, {row.original.source1_record.country}
                                </div>
                                <div className="text-[10px] text-slate-400 pt-1 border-t">
                                  Tax: {row.original.source1_record.tax_id || "None"}
                                </div>
                              </div>

                              {/* Source 2 Box */}
                              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                                <div className="flex items-center justify-between font-sans">
                                  <span className="font-bold text-slate-800 dark:text-slate-200">
                                    Source 2 (Feed)
                                  </span>
                                  {row.original.source2_id ? (
                                    <Badge variant="success" className="text-[10px]">
                                      {row.original.source2_id}
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-[10px]">
                                      None
                                    </Badge>
                                  )}
                                </div>
                                {row.original.source2_record ? (
                                  <>
                                    <div className="text-slate-900 dark:text-slate-100 font-bold">
                                      {row.original.source2_record.name}
                                    </div>
                                    <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                                      {row.original.source2_record.address || "—"}
                                    </div>
                                    <div className="text-slate-500 text-[11px]">
                                      {row.original.source2_record.city}, {row.original.source2_record.country}
                                    </div>
                                    <div className="text-[10px] text-slate-400 pt-1 border-t">
                                      Tax: {row.original.source2_record.tax_id || "None"}
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-slate-400 italic pt-2">No matching record in source2.tsv</div>
                                )}
                              </div>

                              {/* Source 3 Box */}
                              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                                <div className="flex items-center justify-between font-sans">
                                  <span className="font-bold text-slate-800 dark:text-slate-200">
                                    Source 3 (Registry)
                                  </span>
                                  {row.original.source3_id ? (
                                    <Badge variant="indigo" className="text-[10px]">
                                      {row.original.source3_id}
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-[10px]">
                                      None
                                    </Badge>
                                  )}
                                </div>
                                {row.original.source3_record ? (
                                  <>
                                    <div className="text-slate-900 dark:text-slate-100 font-bold">
                                      {row.original.source3_record.name}
                                    </div>
                                    <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                                      {row.original.source3_record.address || "—"}
                                    </div>
                                    <div className="text-slate-500 text-[11px]">
                                      {row.original.source3_record.city}, {row.original.source3_record.country}
                                    </div>
                                    <div className="text-[10px] text-slate-400 pt-1 border-t">
                                      Tax: {row.original.source3_record.tax_id || "None"}
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-slate-400 italic pt-2">No matching record in source3.tsv</div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="px-5 py-8 text-center text-slate-500">
                      No resolved matches found matching current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center space-x-2">
              <span>Page</span>
              <strong className="font-mono text-slate-800 dark:text-slate-200">
                {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
              </strong>
            </div>

            <div className="flex items-center space-x-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="h-8 w-8 p-0"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="h-8 w-8 p-0"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Side-by-Side Record Comparison Modal */}
      <Modal
        isOpen={!!comparisonEntity}
        onClose={() => setComparisonEntity(null)}
        title="Cross-Source Entity Visual Diff"
        description={comparisonEntity ? `Cluster ID: ${comparisonEntity.cluster_id} | Confidence: ${comparisonEntity.confidence_score.toFixed(3)}` : ""}
        maxWidth="4xl"
      >
        {comparisonEntity && (
          <div className="space-y-5 text-xs">
            <div className="grid grid-cols-3 gap-4">
              {/* Primary Source 1 */}
              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/20 dark:border-indigo-800 dark:bg-indigo-950/20 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-indigo-100 dark:border-indigo-900/50">
                  <span className="font-bold text-indigo-700 dark:text-indigo-300">
                    Source 1 (Primary)
                  </span>
                  <Badge variant="indigo" className="text-[10px]">
                    {comparisonEntity.source1_id}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Legal Name</span>
                    <p className="font-bold text-slate-900 dark:text-slate-100">
                      {comparisonEntity.source1_record.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Address</span>
                    <p className="text-slate-700 dark:text-slate-300">
                      {comparisonEntity.source1_record.address || "—"}
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      {comparisonEntity.source1_record.city}, {comparisonEntity.source1_record.state} {comparisonEntity.source1_record.postal_code}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Tax ID</span>
                    <p className="font-mono text-slate-700 dark:text-slate-300">
                      {comparisonEntity.source1_record.tax_id || "Unspecified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Source 2 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Source 2 (Feed)
                  </span>
                  {comparisonEntity.source2_id ? (
                    <Badge variant="success" className="text-[10px]">
                      {comparisonEntity.source2_id}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">None</Badge>
                  )}
                </div>
                {comparisonEntity.source2_record ? (
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Legal Name</span>
                      <p className="font-bold text-slate-900 dark:text-slate-100">
                        {comparisonEntity.source2_record.name}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Address</span>
                      <p className="text-slate-700 dark:text-slate-300">
                        {comparisonEntity.source2_record.address || "—"}
                      </p>
                      <p className="text-slate-500 text-[11px]">
                        {comparisonEntity.source2_record.city}, {comparisonEntity.source2_record.state} {comparisonEntity.source2_record.postal_code}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Tax ID</span>
                      <p className="font-mono text-slate-700 dark:text-slate-300">
                        {comparisonEntity.source2_record.tax_id || "Unspecified"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400 italic pt-6 text-center">
                    No matching entity found in Source 2
                  </div>
                )}
              </div>

              {/* Source 3 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Source 3 (Registry)
                  </span>
                  {comparisonEntity.source3_id ? (
                    <Badge variant="indigo" className="text-[10px]">
                      {comparisonEntity.source3_id}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">None</Badge>
                  )}
                </div>
                {comparisonEntity.source3_record ? (
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Legal Name</span>
                      <p className="font-bold text-slate-900 dark:text-slate-100">
                        {comparisonEntity.source3_record.name}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Address</span>
                      <p className="text-slate-700 dark:text-slate-300">
                        {comparisonEntity.source3_record.address || "—"}
                      </p>
                      <p className="text-slate-500 text-[11px]">
                        {comparisonEntity.source3_record.city}, {comparisonEntity.source3_record.country}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Tax ID</span>
                      <p className="font-mono text-slate-700 dark:text-slate-300">
                        {comparisonEntity.source3_record.tax_id || "Unspecified"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400 italic pt-6 text-center">
                    No matching entity found in Source 3
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button size="sm" variant="secondary" onClick={() => setComparisonEntity(null)}>
                Close Diff Inspector
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
