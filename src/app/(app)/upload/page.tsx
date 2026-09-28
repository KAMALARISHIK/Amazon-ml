"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Database,
  Sparkles,
  ArrowRight,
  Eye,
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { SourceId, DatasetSummary } from "@/types/api";
import { formatNumber } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Modal } from "@/components/ui/modal";

interface FileSlot {
  sourceId: SourceId;
  title: string;
  expectedFilename: string;
  description: string;
  required: boolean;
}

const FILE_SLOTS: FileSlot[] = [
  {
    sourceId: "source1",
    title: "Source 1 Dataset (Primary Catalog)",
    expectedFilename: "source1.tsv",
    description: "Primary enterprise entity records containing name, address, tax_id, and country",
    required: true,
  },
  {
    sourceId: "source2",
    title: "Source 2 Dataset (Secondary Supplier Feed)",
    expectedFilename: "source2.tsv",
    description: "Secondary partner dataset with alternate company names, street variations, and state abbreviations",
    required: true,
  },
  {
    sourceId: "source3",
    title: "Source 3 Dataset (Tertiary Registry / Customs)",
    expectedFilename: "source3.tsv",
    description: "Uppercase registry records with noisy international addresses and country designations",
    required: true,
  },
  {
    sourceId: "ground_truth",
    title: "Ground Truth Dataset (Benchmark Validation)",
    expectedFilename: "ground_truth.tsv",
    description: "Labeled cluster ID mappings used for calculating Precision, Recall, and F_0.5 scores",
    required: false,
  },
];

export default function DatasetUploadPage() {
  const queryClient = useQueryClient();
  const [activePreviewSource, setActivePreviewSource] = useState<SourceId | null>(null);
  const [uploadingSlot, setUploadingSlot] = useState<SourceId | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const { data: datasets, isLoading } = useQuery({
    queryKey: ["datasets"],
    queryFn: () => api.getDatasetsSummary(),
  });

  const seedMutation = useMutation({
    mutationFn: () => api.seedDemoDatasets(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["datasets"] });
      queryClient.invalidateQueries({ queryKey: ["blocking"] });
    },
  });

  const handleFileUpload = async (sourceId: SourceId, file: File) => {
    setUploadingSlot(sourceId);
    setUploadProgress(20);

    const interval = setInterval(() => {
      setUploadProgress((prev) => (prev >= 90 ? 90 : prev + 25));
    }, 150);

    try {
      await api.uploadTsvDataset(sourceId, file);
      clearInterval(interval);
      setUploadProgress(100);
      setTimeout(() => {
        setUploadingSlot(null);
        setUploadProgress(0);
        queryClient.invalidateQueries({ queryKey: ["datasets"] });
      }, 400);
    } catch (err) {
      clearInterval(interval);
      setUploadingSlot(null);
      setUploadProgress(0);
      alert("Failed to upload file. Ensure it is a valid TSV document.");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, sourceId: SourceId) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(sourceId, e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const previewDataset = activePreviewSource && datasets ? datasets[activePreviewSource] : null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-subtle">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <UploadCloud className="h-5 w-5 text-indigo-600" />
            <span>Dataset Ingestion &amp; Schema Parser</span>
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl">
            Upload tab-separated values (.tsv) for each distinct entity source. Uploading <code>ground_truth.tsv</code> enables automated evaluation of Precision, Recall, and F_0.5 benchmarks.
          </p>
        </div>

        <Button
          onClick={() => seedMutation.mutate()}
          isLoading={seedMutation.isPending}
          variant="outline"
          className="border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 text-xs font-semibold"
        >
          <Sparkles className="h-3.5 w-3.5 mr-2 text-indigo-600" />
          Load Sample Benchmark Datasets
        </Button>
      </div>

      {/* Dataset Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {FILE_SLOTS.map((slot) => {
          const dataset = datasets?.[slot.sourceId];
          const isSlotUploading = uploadingSlot === slot.sourceId;

          return (
            <Card
              key={slot.sourceId}
              className="border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {slot.title}
                      </CardTitle>
                      {slot.required ? (
                        <Badge variant="indigo" className="text-[10px]">
                          Required
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          Optional
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs">
                      {slot.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Drag and Drop Zone */}
                <div
                  onDrop={(e) => handleDrop(e, slot.sourceId)}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer relative group"
                >
                  <input
                    type="file"
                    accept=".tsv,.txt,.csv"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileUpload(slot.sourceId, e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-indigo-600 group-hover:scale-110 transition-all">
                      <UploadCloud className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Click or drag &amp; drop <code>{slot.expectedFilename}</code>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Tab-separated values (.tsv), UTF-8 encoded
                      </p>
                    </div>
                  </div>
                </div>

                {/* Upload Progress */}
                {isSlotUploading && (
                  <div className="space-y-1.5 p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                    <div className="flex justify-between text-xs font-mono text-indigo-700 dark:text-indigo-300">
                      <span>Parsing &amp; Validating Schema...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                {/* Ingested File Details Card */}
                {dataset && !isSlotUploading && (
                  <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-semibold font-mono text-slate-900 dark:text-slate-100">
                          {dataset.filename}
                        </span>
                      </div>
                      <Badge variant="success" className="text-[10px] font-mono">
                        {formatNumber(dataset.row_count)} rows
                      </Badge>
                    </div>

                    {/* Detected Columns */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                        Detected Schema Columns ({dataset.columns.length})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {dataset.columns.map((col) => (
                          <span
                            key={col}
                            className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                          >
                            {col}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500">
                      <span>Size: {dataset.file_size_kb} KB</span>
                      <button
                        onClick={() => setActivePreviewSource(slot.sourceId)}
                        className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold inline-flex items-center space-x-1"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Preview Data</span>
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Navigation Footer */}
      <div className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-subtle">
        <div>
          <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Datasets ready for analysis?
          </h4>
          <p className="text-[11px] text-slate-500">
            Proceed to the Data Explorer to search and verify entity fields across all 3 feeds.
          </p>
        </div>
        <Button
          onClick={() => (window.location.href = "/explorer")}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
        >
          Open Data Explorer <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Dataset Sample Preview Modal */}
      <Modal
        isOpen={!!activePreviewSource}
        onClose={() => setActivePreviewSource(null)}
        title={previewDataset ? `Data Preview: ${previewDataset.filename}` : "Data Preview"}
        description={previewDataset ? `${formatNumber(previewDataset.row_count)} total records | ${previewDataset.columns.length} columns detected` : ""}
        maxWidth="4xl"
      >
        {previewDataset && (
          <div className="space-y-4">
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-mono text-[11px] uppercase">
                  <tr>
                    {previewDataset.columns.map((col) => (
                      <th key={col} className="px-4 py-2.5 font-semibold border-b border-slate-200 dark:border-slate-800">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                  {previewDataset.sample_rows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                      {previewDataset.columns.map((col) => (
                        <td key={col} className="px-4 py-2 font-mono text-slate-800 dark:text-slate-200 text-xs">
                          {(row as any)[col] || <span className="text-slate-400 italic">null</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end">
              <Button size="sm" variant="secondary" onClick={() => setActivePreviewSource(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
