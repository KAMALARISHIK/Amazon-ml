import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from src.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(50), default="ML Engineer")
    created_at = Column(DateTime, default=datetime.utcnow)

    datasets = relationship("Dataset", back_populates="user")
    runs = relationship("PipelineRun", back_populates="user")


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), default="Benchmark Entity Dataset")
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    
    source1_path = Column(String(512), nullable=False)
    source2_path = Column(String(512), nullable=True)
    source3_path = Column(String(512), nullable=True)
    ground_truth_path = Column(String(512), nullable=True)

    row_count_src1 = Column(Integer, default=0)
    row_count_src2 = Column(Integer, default=0)
    row_count_src3 = Column(Integer, default=0)
    row_count_gt = Column(Integer, default=0)
    
    columns_src1 = Column(JSON, default=list)
    columns_src2 = Column(JSON, default=list)
    columns_src3 = Column(JSON, default=list)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="datasets")
    runs = relationship("PipelineRun", back_populates="dataset")


class PipelineRun(Base):
    __tablename__ = "pipeline_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    dataset_id = Column(String(36), ForeignKey("datasets.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    tag = Column(String(100), default="v1.0-run")

    status = Column(String(50), default="pending") # pending, running, completed, failed
    overall_progress = Column(Integer, default=0) # 0 to 100
    current_step = Column(String(255), default="Initialized")
    
    # Hyperparameters
    classifier_type = Column(String(100), default="hybrid_ensemble")
    similarity_threshold = Column(Float, default=0.78)
    params = Column(JSON, default=dict)
    
    logs = Column(JSON, default=list)
    steps = Column(JSON, default=list)

    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Float, default=0.0)
    error = Column(Text, nullable=True)

    user = relationship("User", back_populates="runs")
    dataset = relationship("Dataset", back_populates="runs")
    candidates = relationship("Candidate", back_populates="run", cascade="all, delete-orphan")
    matches = relationship("Match", back_populates="run", cascade="all, delete-orphan")
    metrics = relationship("RunMetrics", back_populates="run", uselist=False, cascade="all, delete-orphan")


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    run_id = Column(String(36), ForeignKey("pipeline_runs.id"), nullable=False, index=True)
    source1_id = Column(String(100), nullable=False, index=True)
    candidate_id = Column(String(100), nullable=False)
    candidate_source = Column(String(50), nullable=False) # source2, source3
    score = Column(Float, default=0.0)

    run = relationship("PipelineRun", back_populates="candidates")


class Match(Base):
    __tablename__ = "matches"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    run_id = Column(String(36), ForeignKey("pipeline_runs.id"), nullable=False, index=True)
    
    source1_id = Column(String(100), nullable=False, index=True)
    source2_id = Column(String(100), nullable=True)
    source3_id = Column(String(100), nullable=True)
    cluster_id = Column(String(100), nullable=False, index=True)
    
    confidence_score = Column(Float, default=0.0)
    name_similarity = Column(Float, default=0.0)
    address_similarity = Column(Float, default=0.0)
    country_match = Column(Boolean, default=True)

    # Cached serialized records for fast side-by-side inspection
    source1_record = Column(JSON, default=dict)
    source2_record = Column(JSON, nullable=True)
    source3_record = Column(JSON, nullable=True)

    run = relationship("PipelineRun", back_populates="matches")


class RunMetrics(Base):
    __tablename__ = "run_metrics"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    run_id = Column(String(36), ForeignKey("pipeline_runs.id"), nullable=False, unique=True, index=True)
    
    precision = Column(Float, default=0.0)
    recall = Column(Float, default=0.0)
    f05_score = Column(Float, default=0.0)
    f1_score = Column(Float, default=0.0)
    reduction_ratio = Column(Float, default=0.0)
    singleton_accuracy = Column(Float, default=0.0)
    
    total_clusters = Column(Integer, default=0)
    triplets_count = Column(Integer, default=0)
    pairs_count = Column(Integer, default=0)
    singletons_count = Column(Integer, default=0)
    
    country_performance = Column(JSON, default=list)
    pr_curve_points = Column(JSON, default=list)
    error_breakdown = Column(JSON, default=dict)

    run = relationship("PipelineRun", back_populates="metrics")
