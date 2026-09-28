from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, EmailStr, Field

# --- User & Auth Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: Optional[str] = "ML Engineer"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 86400
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: Optional[str] = None


# --- Dataset Schemas ---
class DatasetSummarySchema(BaseModel):
    source_id: str
    filename: str
    row_count: int
    columns: List[str]
    file_size_kb: int
    uploaded_at: str
    sample_rows: List[Dict[str, Any]] = []

class DatasetResponse(BaseModel):
    id: str
    name: str
    row_count_src1: int
    row_count_src2: int
    row_count_src3: int
    row_count_gt: int
    created_at: datetime
    datasets: Dict[str, DatasetSummarySchema]

    class Config:
        from_attributes = True

class RecordPreviewResponse(BaseModel):
    source: str
    records: List[Dict[str, Any]]
    total: int
    page: int
    page_size: int


# --- Pipeline & Matching Schemas ---
class PipelineRunConfig(BaseModel):
    dataset_id: Optional[str] = None
    tag: Optional[str] = "v3.4-hybrid-ensemble"
    classifier_type: str = "hybrid_ensemble" # hybrid_ensemble, bi_encoder_transformer, gradient_boosted_trees
    similarity_threshold: float = Field(0.78, ge=0.0, le=1.0)
    active_features: Dict[str, bool] = {
        "jaro_winkler_name": True,
        "levenshtein_address": True,
        "jaccard_token": True,
        "country_exact_match": True,
        "tax_id_match": True,
        "embedding_cosine": True,
    }
    weight_name: float = 0.45
    weight_address: float = 0.35
    weight_tax: float = 0.20
    transitive_closure: bool = True

class PipelineStepSchema(BaseModel):
    name: str
    status: str # pending, in_progress, completed, failed
    progress: int
    elapsed_sec: float

class PipelineRunResponse(BaseModel):
    id: str
    dataset_id: str
    tag: str
    status: str
    overall_progress: int
    current_step: str
    classifier_type: str
    similarity_threshold: float
    started_at: datetime
    completed_at: Optional[datetime] = None
    duration_seconds: float
    steps: List[PipelineStepSchema] = []
    logs: List[str] = []
    error: Optional[str] = None
    
    precision: Optional[float] = None
    recall: Optional[float] = None
    f05_score: Optional[float] = None
    resolved_entities_count: Optional[int] = None

    class Config:
        from_attributes = True


# --- Candidate & Match Inspection Schemas ---
class CandidatePairSchema(BaseModel):
    id: str
    source1_id: str
    candidate_id: str
    candidate_source: str
    score: float

    class Config:
        from_attributes = True

class CandidatesListResponse(BaseModel):
    candidates: List[CandidatePairSchema]
    total: int
    page: int
    page_size: int

class MatchedEntitySchema(BaseModel):
    source1_id: str
    source2_id: Optional[str] = None
    source3_id: Optional[str] = None
    cluster_id: str
    confidence_score: float
    name_similarity: float
    address_similarity: float
    country_match: bool
    source1_record: Dict[str, Any]
    source2_record: Optional[Dict[str, Any]] = None
    source3_record: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class MatchesSummarySchema(BaseModel):
    total_clusters: int
    triplets_count: int
    pairs_count: int
    singletons_count: int
    avg_confidence: float

class MatchesListResponse(BaseModel):
    matches: List[MatchedEntitySchema]
    total: int
    page: int
    page_size: int
    summary: MatchesSummarySchema


# --- Metrics & Validation Schemas ---
class RunMetricsResponse(BaseModel):
    run_id: str
    precision: float
    recall: float
    f05_score: float
    f1_score: float
    reduction_ratio: float
    singleton_accuracy: float
    total_clusters: int
    triplets_count: int
    pairs_count: int
    singletons_count: int
    country_performance: List[Dict[str, Any]] = []
    pr_curve_points: List[Dict[str, Any]] = []
    error_breakdown: Dict[str, Any] = {}

    class Config:
        from_attributes = True

class AnalyticsDataResponse(BaseModel):
    runs: List[Dict[str, Any]] = []
    pr_curve: List[Dict[str, Any]] = []
    reduction_ratio: float
    singleton_accuracy: float
    error_breakdown: Dict[str, Any] = {}
    country_performance: List[Dict[str, Any]] = []

class BlockingAnalyticsResponse(BaseModel):
    reduction_ratio: float
    recall_ceiling: float
    candidate_pairs_count: int
    max_cartesian_pairs: int
    candidate_distribution: List[Dict[str, Any]] = []
    hotspots: List[Dict[str, Any]] = []
    method: str = "TfidfBlocker (Q-Gram + NearestNeighbors)"

class ValidationIssueSchema(BaseModel):
    id: str
    severity: str # error, warning, info
    rule: str
    message: str
    entity_id: Optional[str] = None
    suggested_fix: Optional[str] = None

class ValidationReportResponse(BaseModel):
    passed: bool
    total_checks: int
    passed_checks: int
    failed_checks: int
    score_summary: Dict[str, float]
    schema_validation: Dict[str, bool]
    issues: List[ValidationIssueSchema] = []
    executed_at: str
    validator_version: str

