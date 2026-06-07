from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

from stage1_ingestion.upload_layer import save_upload_file
from stage1_ingestion.doc_intelligence import process_document
from stage1_ingestion.segmentation_engine import segment_contract
from graph import process_contract_intelligence
from stage3_reporting.final_output_layer import generate_docx_report

app = FastAPI(title="Contract Sentinel API")

# Configure CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev, allow all. Adjust in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ClausesPayload(BaseModel):
    clauses: List[Dict[str, Any]]

class ReportPayload(BaseModel):
    analyzed_clauses: List[Dict[str, Any]]
    executive_summary: Dict[str, Any]

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    try:
        # Save file
        file_path = save_upload_file(file)
        
        # Process document
        doc_info = process_document(file_path)
        
        # Segment into clauses
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
        # Save to a generic path or dynamic based on session
        output_path = "data/reports/final_report.docx"
        import os
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        generate_docx_report(
            payload.analyzed_clauses,
            payload.executive_summary,
            output_path
        )
        
        return {
            "status": "success",
            "report_path": output_path
        }
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
