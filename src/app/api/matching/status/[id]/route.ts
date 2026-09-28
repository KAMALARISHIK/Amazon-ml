import { NextResponse } from "next/server";
import { MatchingJob } from "@/types/api";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const jobId = params.id;

  // Return completed state with final metrics
  const completedJob: MatchingJob = {
    job_id: jobId,
    config: {
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
    },
    status: "completed",
    overall_progress: 100,
    current_step: "Resolution Complete",
    steps: [
      { name: "Dataset Ingestion & Sanitization", status: "completed", progress: 100, elapsed_sec: 2.1 },
      { name: "Feature Extraction & Token Hashing", status: "completed", progress: 100, elapsed_sec: 7.4 },
      { name: "Pairwise Neural / Rule Scoring", status: "completed", progress: 100, elapsed_sec: 24.3 },
      { name: "Connected Components & Transitive Closure", status: "completed", progress: 100, elapsed_sec: 8.9 },
      { name: "Final Entity Resolution Cluster Assembly", status: "completed", progress: 100, elapsed_sec: 5.5 },
    ],
    started_at: new Date(Date.now() - 48200).toISOString(),
    completed_at: new Date().toISOString(),
    duration_seconds: 48.2,
    resolved_entities_count: 10450,
    precision: 0.968,
    recall: 0.942,
    f05_score: 0.9628,
    logs: [
      `[${new Date(Date.now() - 48000).toISOString()}] Job initialized with classifier: hybrid_ensemble`,
      `[${new Date(Date.now() - 45000).toISOString()}] Ingested 12,540 entities from source1, 14,820 from source2, 11,980 from source3`,
      `[${new Date(Date.now() - 38000).toISOString()}] Candidate pairs generated via Q-Gram Indexing: 421,800 pairs`,
      `[${new Date(Date.now() - 25000).toISOString()}] Feature vectors computed: Jaro-Winkler, Levenshtein, Jaccard, Cosine Embeddings`,
      `[${new Date(Date.now() - 15000).toISOString()}] Pairwise inference completed. 24,120 pairs above threshold 0.78`,
      `[${new Date(Date.now() - 8000).toISOString()}] Transitive closure graph partitioned into 10,450 cohesive entity clusters`,
      `[${new Date().toISOString()}] Output files generated: matching_results.tsv and candidate_pairs.tsv ready`,
    ],
  };

  return NextResponse.json(completedJob);
}
