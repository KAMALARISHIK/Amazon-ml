export type SourceId = "source1" | "source2" | "source3" | "ground_truth";

export interface BusinessEntityRecord {
  id: string;
  source: SourceId;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country: string;
  tax_id?: string;
  website?: string;
  phone?: string;
  category?: string;
  normalized_name?: string;
  created_at?: string;
}

export interface DatasetSummary {
  source_id: SourceId;
  filename: string;
  row_count: number;
  columns: string[];
  file_size_kb: number;
  uploaded_at: string;
  sample_rows: BusinessEntityRecord[];
}

export interface UploadResponse {
  message: string;
  datasets: Record<SourceId, DatasetSummary>;
  total_records: number;
}

export interface BlockingDistributionBucket {
  bucket: string;
  range_min: number;
  range_max: number;
  count: number;
  percentage: number;
}

export interface BottleneckEntity {
  source1_id: string;
  name: string;
  country: string;
  candidate_count: number;
  risk_level: "low" | "medium" | "high";
}

export interface BlockingAnalyticsResponse {
  method: "standard" | "qgram" | "minhash_lsh" | "learned_biencoder";
  window_size: number;
  ngram_size: number;
  total_cartesian_pairs: number;
  candidate_pairs_count: number;
  reduction_ratio: number;
  recall_ceiling: number | null; // e.g. 0.984 if ground truth is present
  candidate_set_distribution: BlockingDistributionBucket[];
  bottleneck_entities: BottleneckEntity[];
  avg_candidates_per_entity: number;
  p95_candidates_per_entity: number;
  max_candidates_per_entity: number;
}

export interface MatchingJobConfig {
  classifier_type: "gradient_boosted_trees" | "bi_encoder_transformer" | "hybrid_ensemble";
  similarity_threshold: number; // 0.0 to 1.0
  active_features: {
    jaro_winkler_name: boolean;
    levenshtein_address: boolean;
    jaccard_token: boolean;
    country_exact_match: boolean;
    tax_id_match: boolean;
    embedding_cosine: boolean;
  };
  weight_name: number;
  weight_address: number;
  weight_tax: number;
  transitive_closure: boolean;
}

export type PipelineJobStatus = "idle" | "pending" | "running" | "completed" | "failed";

export interface PipelineStep {
  name: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  progress: number;
  elapsed_sec: number;
}

export interface MatchingJob {
  job_id: string;
  config: MatchingJobConfig;
  status: PipelineJobStatus;
  overall_progress: number; // 0 to 100
  current_step: string;
  steps: PipelineStep[];
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  logs: string[];
  resolved_entities_count?: number;
  precision?: number;
  recall?: number;
  f05_score?: number;
}

export interface MatchedEntity {
  source1_id: string;
  source2_id?: string | null;
  source3_id?: string | null;
  cluster_id: string;
  confidence_score: number;
  name_similarity: number;
  address_similarity: number;
  country_match: boolean;
  source1_record: BusinessEntityRecord;
  source2_record?: BusinessEntityRecord | null;
  source3_record?: BusinessEntityRecord | null;
}

export interface MatchFilterParams {
  query?: string;
  country?: string;
  min_confidence?: number;
  max_confidence?: number;
  has_source2?: boolean;
  has_source3?: boolean;
  page?: number;
  page_size?: number;
}

export interface MatchesResponse {
  matches: MatchedEntity[];
  total: number;
  page: number;
  page_size: number;
  summary: {
    total_clusters: number;
    triplets_count: number; // matched in all 3 sources
    pairs_count: number; // matched in 2 sources
    singletons_count: number;
    avg_confidence: number;
  };
}

export interface ValidationIssue {
  id: string;
  severity: "error" | "warning" | "info";
  rule: string;
  message: string;
  row_number?: number;
  entity_id?: string;
  suggested_fix?: string;
}

export interface ValidationReport {
  passed: boolean;
  score_summary: {
    precision: number;
    recall: number;
    f05_score: number;
    f1_score: number;
    reduction_ratio: number;
    singleton_accuracy: number;
  };
  total_checks: number;
  passed_checks: number;
  failed_checks: number;
  issues: ValidationIssue[];
  schema_validation: {
    matching_results_valid: boolean;
    candidate_pairs_valid: boolean;
    no_duplicate_mappings: boolean;
    all_source1_present: boolean;
    valid_id_formatting: boolean;
  };
  executed_at: string;
  validator_version: string;
}

export interface PipelineRun {
  run_id: string;
  tag: string;
  classifier: string;
  threshold: number;
  created_at: string;
  duration_seconds: number;
  status: "success" | "failed" | "running";
  candidate_count: number;
  reduction_ratio: number;
  precision: number;
  recall: number;
  f05_score: number;
  singleton_accuracy: number;
}

export interface PRCurvePoint {
  threshold: number;
  precision: number;
  recall: number;
  f05: number;
}

export interface AnalyticsData {
  runs: PipelineRun[];
  pr_curve: PRCurvePoint[];
  reduction_ratio: number;
  singleton_accuracy: number;
  error_breakdown: {
    name_typo_false_negative: number;
    address_diff_false_negative: number;
    similar_name_false_positive: number;
    transitive_conflict: number;
  };
  country_performance: {
    country: string;
    precision: number;
    recall: number;
    count: number;
  }[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "ML Engineer" | "Data Scientist" | "Admin" | "Viewer";
  avatar_url?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
  user: User;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password?: string;
  role?: string;
}
