import os
import sys
import uuid
import pandas as pd

# Add backend root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.database import SessionLocal, engine, Base
from src.models import PipelineRun, Dataset, User
from src.seed_data import init_seed_dataset
from src.pipeline import execute_pipeline_task

def run_test():
    print("=== Initializing Database and Seed Dataset ===")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        dataset = init_seed_dataset(db)
        dataset_id = str(dataset.id)
        user = db.query(User).filter(User.email == "ml-engineer@enterprise.ai").first()
        
        run_id = f"run_{uuid.uuid4().hex[:8]}"
        new_run = PipelineRun(
            id=run_id,
            dataset_id=dataset_id,
            user_id=user.id,
            tag="Automated Benchmark Validation Run",
            classifier_type="Hybrid Ensemble (Bi-Encoder + GBT)",
            similarity_threshold=0.75,
            status="pending",
            overall_progress=0
        )
        db.add(new_run)
        db.commit()
        print(f"Created PipelineRun: ID = {run_id}")
    finally:
        db.close()

    print("\n=== Executing End-to-End Matching Pipeline ===")
    config_params = {
        "similarity_threshold": 0.75,
        "blocking_method": "qgram_minhash",
        "top_k": 15,
        "min_sim": 0.20
    }
    
    execute_pipeline_task(run_id, dataset_id, config_params)
    
    # Inspect results
    db = SessionLocal()
    try:
        run = db.query(PipelineRun).filter(PipelineRun.id == run_id).first()
        print(f"\nPipeline Status: {run.status}")
        print(f"Overall Progress: {run.overall_progress}%")
        print(f"Current Step: {run.current_step}")
        print(f"Execution Duration: {run.duration_seconds}s")
        
        if run.metrics:
            m = run.metrics
            print("\n=== Benchmark Evaluation Metrics ===")
            print(f"Pairwise Precision   : {m.precision * 100:.2f}%")
            print(f"Pairwise Recall      : {m.recall * 100:.2f}%")
            print(f"F_0.5 Score          : {m.f05_score:.4f}")
            print(f"F_1.0 Score          : {m.f1_score:.4f}")
            print(f"Reduction Ratio      : {m.reduction_ratio * 100:.4f}%")
            print(f"Total Clusters       : {m.total_clusters}")
            print(f"Triplets Resolved    : {m.triplets_count}")
            print(f"Pairs Resolved       : {m.pairs_count}")
            print(f"Singletons           : {m.singletons_count}")
        
        print("\n=== Pipeline Execution Logs ===")
        for log in (run.logs or []):
            print(f"  {log}")
            
    finally:
        db.close()

if __name__ == "__main__":
    run_test()
