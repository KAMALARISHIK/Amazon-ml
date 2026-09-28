import { NextResponse } from "next/server";
import { MatchingJob, MatchingJobConfig } from "@/types/api";

export async function POST(req: Request) {
  try {
    const config: MatchingJobConfig = await req.json().catch(() => ({
      classifier_type: "hybrid_ensemble",
      similarity_threshold: 0.78,
      active_features: {
        jaro_winkler_name: true,
        levenshtein_address: true,
        jaccard_token: true,
        country_exact_match: true,
        tax_id_match: true,
        embedding_cosine: true,
      },
      weight_name: 0.45,
      weight_address: 0.35,
      weight_tax: 0.20,
      transitive_closure: true,
    }));

    const jobId = `job_run_${Date.now().toString(36)}`;
    const newJob: MatchingJob = {
      job_id: jobId,
      config,
      status: "running",
      overall_progress: 15,
      current_step: "Feature Extraction & Token Hashing",
      steps: [
        { name: "Dataset Ingestion & Sanitization", status: "completed", progress: 100, elapsed_sec: 2.1 },
        { name: "Feature Extraction & Token Hashing", status: "in_progress", progress: 35, elapsed_sec: 4.8 },
        { name: "Pairwise Neural / Rule Scoring", status: "pending", progress: 0, elapsed_sec: 0 },
        { name: "Connected Components & Transitive Closure", status: "pending", progress: 0, elapsed_sec: 0 },
        { name: "Final Entity Resolution Cluster Assembly", status: "pending", progress: 0, elapsed_sec: 0 },
      ],
      started_at: new Date().toISOString(),
      logs: [
        `[${new Date().toISOString()}] Job initialized with classifier: ${config.classifier_type}`,
        `[${new Date().toISOString()}] Ingested 12,540 entities from source1, 14,820 from source2, 11,980 from source3`,
        `[${new Date().toISOString()}] Candidate pairs generated via Q-Gram Indexing: 421,800 pairs (99.98% search space reduction)`,
        `[${new Date().toISOString()}] Extracting Jaro-Winkler, Levenshtein, and Cosine Embedding vectors...`,
      ],
    };

    return NextResponse.json(newJob);
  } catch (error) {
    return NextResponse.json({ detail: "Failed to trigger matching job" }, { status: 500 });
  }
}
