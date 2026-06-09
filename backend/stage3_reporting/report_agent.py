from pydantic import BaseModel, Field
from langchain_ollama import ChatOllama
import os
import json
from utils.llm_helper import invoke_structured

OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen3:8b")

class ExecutiveSummary(BaseModel):
    executive_summary: str = Field(description="A simple human-readable overview of the contract.")
    overall_risk_assessment: str = Field(description="A summary of the major risks found across the contract.")
    key_recommendations: list[str] = Field(description="High-level strategic recommendations for the negotiation.")

def generate_report_summary(analyzed_clauses: list[dict]) -> dict:
    llm = ChatOllama(model=OLLAMA_MODEL, temperature=0.2, num_ctx=2048)
    
    
    simplified_analysis = []
    for ac in analyzed_clauses:
        clause_summary = ac.get('clause_info', {}).get('summary', '')
        risk_level = ac.get('risk_info', {}).get('risk_level', 'Unknown')
        unfair_terms = ac.get('risk_info', {}).get('unfair_one_sided_terms', [])
        compliance_issues = ac.get('compliance_info', {}).get('compliance_issues', '')
        
        
        if risk_level in ["High", "Medium", "Flagged"] or compliance_issues:
            simplified_analysis.append({
                "clause_id": ac.get("clause_id"),
                "summary": clause_summary,
                "risk_level": risk_level,
                "unfair_terms": unfair_terms,
                "compliance_issues": compliance_issues
            })
            
    
    if not simplified_analysis:
         simplified_analysis = "No high or medium risks found. The contract appears standard."
         
    try:
        messages = [
            ("system", "You are an expert Chief Legal Officer. Review the following risk analysis of a contract and generate an executive summary, overall risk assessment, and key recommendations."),
            ("human", f"Contract Risk Analysis:\n{json.dumps(simplified_analysis, indent=2)}")
        ]
        result = invoke_structured(llm, ExecutiveSummary, messages)
        return result.model_dump()
    except Exception as e:
        print(f"Error in generate_report_summary: {e}")
        return {
            "executive_summary": "Error generating summary.",
            "overall_risk_assessment": "Unknown",
            "key_recommendations": []
        }
