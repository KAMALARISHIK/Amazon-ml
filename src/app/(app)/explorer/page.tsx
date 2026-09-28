"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import {
  Search,
  Filter,
  Eye,
  Database,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Globe,
  Building,
  Hash,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { BusinessEntityRecord, SourceId } from "@/types/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Drawer } from "@/components/ui/modal";

export default function DataExplorerPage() {
  const [selectedSource, setSelectedSource] = useState<SourceId>("source1");
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedRecord, setSelectedRecord] = useState<BusinessEntityRecord | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["sourceRecords", selectedSource, searchQuery],
    queryFn: () => api.getSourceRecords(selectedSource, searchQuery, 1, 100),
  });

  const records = useMemo(() => data?.records || [], [data?.records]);

  const columns = useMemo<ColumnDef<BusinessEntityRecord>[]>(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => (
          <button
            className="flex items-center space-x-1 font-semibold text-slate-700 dark:text-slate-200"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Record ID</span>
            <ArrowUpDown className="h-3 w-3 text-slate-400" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            {row.original.id}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <button
            className="flex items-center space-x-1 font-semibold text-slate-700 dark:text-slate-200"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Entity Legal Name</span>
            <ArrowUpDown className="h-3 w-3 text-slate-400" />
          </button>
        ),
        cell: ({ row }) => (
          <div className="font-medium text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Building className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate max-w-xs">{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: "address",
        header: "Street Address",
        cell: ({ row }) => (
          <span className="text-slate-600 dark:text-slate-400 truncate max-w-xs block">
            {row.original.address || "—"}
          </span>
        ),
      },
      {
        accessorKey: "city",
        header: "City / State",
        cell: ({ row }) => (
          <span className="text-slate-600 dark:text-slate-400">
            {row.original.city ? `${row.original.city}${row.original.state ? `, ${row.original.state}` : ""}` : "—"}
          </span>
        ),
      },
      {
        accessorKey: "country",
        header: "Country",
        cell: ({ row }) => (
          <Badge variant="outline" className="text-[10px] font-mono">
            {row.original.country}
          </Badge>
        ),
      },
      {
        accessorKey: "tax_id",
        header: "Tax / EIN / VAT ID",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
            {row.original.tax_id || "—"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Inspect",
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedRecord(row.original)}
            className="h-7 w-7 p-0 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: records,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-subtle">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Database className="h-5 w-5 text-indigo-600" />
            <span>Multi-Source Data Explorer</span>
          </h2>
          <p className="text-xs text-slate-500">
            Explore normalized records across all ingested catalog and partner feeds.
          </p>
        </div>

        {/* Source Switcher Tabs */}
        <div className="flex items-center space-x-2">
          <Tabs value={selectedSource} onValueChange={(val) => setSelectedSource(val as SourceId)}>
            <TabsList>
              <TabsTrigger value="source1">Source 1 (Primary)</TabsTrigger>
              <TabsTrigger value="source2">Source 2 (Feed)</TabsTrigger>
              <TabsTrigger value="source3">Source 3 (Registry)</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <Card>
        <CardHeader className="pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="w-full md:w-96">
            <Input
              placeholder="Search by legal name, address, tax ID, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex items-center space-x-3 text-xs text-slate-500">
            <span>
              Showing <strong>{records.length}</strong> matching records in{" "}
              <strong className="font-mono text-indigo-600">{selectedSource}.tsv</strong>
            </span>
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
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-5 py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="px-5 py-8 text-center text-slate-500">
                      No records found matching query &ldquo;{searchQuery}&rdquo;.
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

      {/* Row Detail Drawer */}
      <Drawer
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title="Entity Record Inspector"
        description={selectedRecord ? `Source ID: ${selectedRecord.id} from ${selectedRecord.source}.tsv` : ""}
      >
        {selectedRecord && (
          <div className="space-y-6 text-xs">
            {/* Entity Header Banner */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                  {selectedRecord.id}
                </span>
                <Badge variant="indigo" className="text-[10px] uppercase font-mono">
                  {selectedRecord.source}
                </Badge>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {selectedRecord.name}
              </h3>
              {selectedRecord.category && (
                <p className="text-slate-500 text-[11px]">{selectedRecord.category}</p>
              )}
            </div>

            {/* Field Metadata Grid */}
            <div className="space-y-3">
              <h4 className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                Normalized Attributes
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-[10px] text-slate-400 block mb-1">Country</span>
                  <div className="flex items-center space-x-1.5 font-semibold text-slate-800 dark:text-slate-200">
                    <Globe className="h-3.5 w-3.5 text-indigo-500" />
                    <span>{selectedRecord.country}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-[10px] text-slate-400 block mb-1">Tax / EIN ID</span>
                  <div className="flex items-center space-x-1.5 font-mono text-slate-800 dark:text-slate-200">
                    <Hash className="h-3.5 w-3.5 text-indigo-500" />
                    <span>{selectedRecord.tax_id || "Unspecified"}</span>
                  </div>
                </div>

                <div className="col-span-2 p-3 rounded-lg border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-[10px] text-slate-400 block mb-1">Address</span>
                  <div className="flex items-start space-x-1.5 text-slate-800 dark:text-slate-200">
                    <MapPin className="h-3.5 w-3.5 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div>{selectedRecord.address || "No street address recorded"}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        {selectedRecord.city} {selectedRecord.state} {selectedRecord.postal_code}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedRecord.website && (
                  <div className="col-span-2 p-3 rounded-lg border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-[10px] text-slate-400 block mb-1">Website Domain</span>
                    <a
                      href={`https://${selectedRecord.website.replace(/^https?:\/\//, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center space-x-1"
                    >
                      <span>{selectedRecord.website}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Generated Feature Tokens */}
            <div className="space-y-2">
              <h4 className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                Generated Q-Gram &amp; Blocking Tokens
              </h4>
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/80 font-mono text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                <div>
                  <span className="text-slate-400">Q-3 Grams:</span>{" "}
                  {selectedRecord.name.toLowerCase().slice(0, 15).split("").slice(0, 5).map((_, i) => (
                    <span key={i} className="inline-block bg-white dark:bg-slate-900 px-1 py-0.5 rounded mr-1 border text-[10px]">
                      {selectedRecord.name.toLowerCase().slice(i, i + 3)}
                    </span>
                  ))}
                </div>
                <div>
                  <span className="text-slate-400">Country Blocking Key:</span>{" "}
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    BLK_{selectedRecord.country}_{selectedRecord.name.slice(0, 3).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button size="sm" variant="secondary" onClick={() => setSelectedRecord(null)}>
                Close Drawer
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
