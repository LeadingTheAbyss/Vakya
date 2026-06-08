from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

from stage1_ingestion.upload_layer import save_upload_file
from stage1_ingestion.doc_intelligence import process_document
from stage1_ingestion.segmentation_engine import segment_contract
from graph import process_contract_intelligence
from stage3_reporting.final_output_layer import generate_docx_report
from stage2_intelligence.chat_agent import chat_about_contract
import db
import os

app = FastAPI(title="Contract Sentinel API")

@app.get("/api/config")
def get_config():
    return {
        "status": "ok",
        "ollama_model": os.getenv("OLLAMA_MODEL", "qwen3:8b")
    }

# ── CORS ────────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from contextlib import asynccontextmanager

# ── DB init on startup ───────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    yield

app.router.lifespan_context = lifespan

# ── Pydantic models ──────────────────────────────────────────────────────────────
class ClausesPayload(BaseModel):
    clauses: List[Dict[str, Any]]
    user_id: Optional[str] = None
    filename: Optional[str] = None

class ReportPayload(BaseModel):
    analyzed_clauses: List[Dict[str, Any]]
    executive_summary: Dict[str, Any]

class UpsertUserPayload(BaseModel):
    id: str
    email: str
    name: str
    photo: Optional[str] = None
    plan: str = "free"

class UpdateProfilePayload(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email_alerts: Optional[bool] = None
    weekly_digest: Optional[bool] = None
    risk_alerts: Optional[bool] = None

class SaveContractPayload(BaseModel):
    user_id: str
    filename: str
    risk_score: int
    risk_level: str
    clauses: List[Dict[str, Any]]
    summary: Dict[str, Any]
    status: str = "review"

class ChatMessage(BaseModel):
    role: str  # "human" or "assistant"
    content: str

class ChatPayload(BaseModel):
    message: str
    clauses: List[Dict[str, Any]] = []
    history: List[ChatMessage] = []


# ── Auth / User routes ───────────────────────────────────────────────────────────

@app.post("/api/auth/upsert")
def auth_upsert(payload: UpsertUserPayload):
    """Called after every login to create or refresh the user row in Postgres."""
    try:
        user = db.upsert_user(
            user_id=payload.id,
            email=payload.email,
            name=payload.name,
            photo=payload.photo,
            plan=payload.plan,
        )
        # Convert datetimes to ISO strings for JSON serialisation
        for key in ("created_at", "updated_at"):
            if user.get(key):
                user[key] = user[key].isoformat()
        return {"status": "ok", "user": user}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/profile/{user_id}")
def get_profile(user_id: str):
    user = db.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for key in ("created_at", "updated_at"):
        if user.get(key):
            user[key] = user[key].isoformat()
    stats = db.get_user_stats(user_id)
    return {"status": "ok", "user": user, "stats": stats}


@app.put("/api/profile/{user_id}")
def update_profile(user_id: str, payload: UpdateProfilePayload):
    user = db.update_user_profile(
        user_id=user_id,
        name=payload.name,
        phone=payload.phone,
        email_alerts=payload.email_alerts,
        weekly_digest=payload.weekly_digest,
        risk_alerts=payload.risk_alerts,
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for key in ("created_at", "updated_at"):
        if user.get(key):
            user[key] = user[key].isoformat()
    return {"status": "ok", "user": user}


# ── Contract routes ───────────────────────────────────────────────────────────────

@app.get("/api/contracts/{user_id}")
def list_contracts(user_id: str):
    try:
        contracts = db.get_contracts_for_user(user_id)
        for c in contracts:
            if c.get("analyzed_at"):
                c["analyzed_at"] = c["analyzed_at"].isoformat()
            c["id"] = str(c["id"])
        return {"status": "ok", "contracts": contracts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/contracts/detail/{contract_id}")
def get_contract(contract_id: str):
    contract = db.get_contract_by_id(contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    for key in ("analyzed_at",):
        if contract.get(key):
            contract[key] = contract[key].isoformat()
    contract["id"] = str(contract["id"])
    return {"status": "ok", "contract": contract}


@app.post("/api/contracts/save")
def save_contract(payload: SaveContractPayload):
    try:
        contract_id = db.save_contract(
            user_id=payload.user_id,
            filename=payload.filename,
            risk_score=payload.risk_score,
            risk_level=payload.risk_level,
            clauses=payload.clauses,
            summary=payload.summary,
            status=payload.status,
        )
        return {"status": "ok", "contract_id": contract_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Existing pipeline routes ──────────────────────────────────────────────────────

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    try:
        file_path = save_upload_file(file)
        doc_info = process_document(file_path)
        clauses = segment_contract(doc_info["raw_text"])
        return {
            "status": "success",
            "document_info": doc_info,
            "clauses": clauses
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze")
async def analyze_document(payload: ClausesPayload):
    try:
        if not payload.clauses:
            raise HTTPException(status_code=400, detail="No clauses provided for analysis")
        result = process_contract_intelligence(payload.clauses)
        return {
            "status": "success",
            "analyzed_clauses": result.get("analyzed_clauses", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/report")
async def generate_report(payload: ReportPayload):
    try:
        output_path = "data/reports/final_report.docx"
        import os
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        generate_docx_report(
            payload.analyzed_clauses,
            payload.executive_summary,
            output_path
        )
        return {"status": "success", "report_path": output_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/report/download")
async def download_report(path: str = "data/reports/final_report.docx"):
    import os
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Report not found")
    return FileResponse(
        path=path,
        filename=os.path.basename(path),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )


@app.post("/api/chat")
async def chat_with_contract(payload: ChatPayload):
    try:
        history = [{"role": m.role, "content": m.content} for m in payload.history]
        reply = chat_about_contract(
            user_message=payload.message,
            clauses=payload.clauses,
            history=history,
        )
        return {"status": "ok", "reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
