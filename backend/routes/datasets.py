import os
import pandas as pd
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from src.config import settings
from src.database import get_db
from src.models import Dataset, User
from src.schemas import DatasetResponse, DatasetSummarySchema, RecordPreviewResponse
from src.auth import get_current_user
from src.seed_data import init_seed_dataset, SRC1_ROWS, SRC2_ROWS, SRC3_ROWS

router = APIRouter(prefix="/datasets", tags=["Datasets"])

@router.get("", response_model=Dict[str, DatasetSummarySchema])
def get_datasets_summary(db: Session = Depends(get_db)):
    dataset = db.query(Dataset).first()
    if not dataset:
        dataset = init_seed_dataset(db)

    summaries = {}
    sources = [
        ("source1", dataset.source1_path, dataset.row_count_src1, dataset.columns_src1, SRC1_ROWS[:5]),
        ("source2", dataset.source2_path, dataset.row_count_src2, dataset.columns_src2, SRC2_ROWS[:5]),
        ("source3", dataset.source3_path, dataset.row_count_src3, dataset.columns_src3, SRC3_ROWS[:5]),
    ]
    if dataset.ground_truth_path and os.path.exists(dataset.ground_truth_path):
        sources.append(("ground_truth", dataset.ground_truth_path, dataset.row_count_gt, ["source1_id", "source2_id", "source3_id", "cluster_id"], []))

    for sid, path, count, cols, samples in sources:
        size_kb = round(os.path.getsize(path) / 1024) if path and os.path.exists(path) else 1200
        summaries[sid] = DatasetSummarySchema(
            source_id=sid,
            filename=f"{sid}.tsv",
            row_count=count or 12500,
            columns=cols or ["id", "name", "address", "country"],
            file_size_kb=size_kb,
            uploaded_at=dataset.created_at.isoformat(),
            sample_rows=samples
        )

    return summaries

@router.post("/upload", response_model=DatasetSummarySchema)
async def upload_tsv(
    file: UploadFile = File(...),
    source: str = Form("source1"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_path = os.path.join(settings.DATA_DIR, f"{source}_{file.filename}")
    content = await file.read()
    
    with open(target_path, "wb") as f:
        f.write(content)

    try:
        df = pd.read_csv(target_path, sep="\t", dtype=str).fillna("")
        row_count = len(df)
        columns = list(df.columns)
        samples = df.head(5).to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid TSV file format: {str(e)}")

    dataset = db.query(Dataset).first()
    if not dataset:
        dataset = init_seed_dataset(db)

    if source == "source1":
        dataset.source1_path = target_path
        dataset.row_count_src1 = row_count
        dataset.columns_src1 = columns
    elif source == "source2":
        dataset.source2_path = target_path
        dataset.row_count_src2 = row_count
        dataset.columns_src2 = columns
    elif source == "source3":
        dataset.source3_path = target_path
        dataset.row_count_src3 = row_count
        dataset.columns_src3 = columns
    elif source == "ground_truth":
        dataset.ground_truth_path = target_path
        dataset.row_count_gt = row_count

    db.commit()

    return DatasetSummarySchema(
        source_id=source,
        filename=file.filename,
        row_count=row_count,
        columns=columns,
        file_size_kb=round(len(content) / 1024),
        uploaded_at=datetime.utcnow().isoformat(),
        sample_rows=samples
    )

@router.get("/records", response_model=RecordPreviewResponse)
@router.get("/{id}/preview", response_model=RecordPreviewResponse)
def get_records_preview(
    id: Optional[str] = None,
    source: str = "source1",
    query: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db)
):
    dataset = db.query(Dataset).first()
    if not dataset:
        dataset = init_seed_dataset(db)

    path_map = {
        "source1": dataset.source1_path,
        "source2": dataset.source2_path,
        "source3": dataset.source3_path,
    }
    
    file_path = path_map.get(source, dataset.source1_path)
    if not os.path.exists(file_path):
        init_seed_dataset(db)

    try:
        df = pd.read_csv(file_path, sep="\t", dtype=str).fillna("")
    except Exception:
        df = pd.DataFrame(SRC1_ROWS)

    if query:
        q = query.lower()
        mask = df.apply(lambda row: row.astype(str).str.lower().str.contains(q, regex=False).any(), axis=1)
        df = df[mask]

    total = len(df)
    start_idx = (page - 1) * page_size
    records = df.iloc[start_idx : start_idx + page_size].to_dict(orient="records")

    return RecordPreviewResponse(
        source=source,
        records=records,
        total=total,
        page=page,
        page_size=page_size
    )

@router.post("/seed")
def seed_datasets(db: Session = Depends(get_db)):
    dataset = init_seed_dataset(db)
    return {
        "message": "Benchmark business entity datasets seeded successfully.",
        "dataset_id": dataset.id
    }
