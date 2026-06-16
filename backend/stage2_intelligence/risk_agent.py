from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI
import os
from utils.llm_helper import invoke_structured

OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen3:8b")

class RiskInfo(BaseModel):
    risk_level: str = Field(description="The risk level: Low, Medium, or High")
    unfair_one_sided_terms: list[str] = Field(description="Specific unfair or one-sided terms identified in the clause")
    risk_explanation: str = Field(description="Explanation of why this clause carries the assigned risk level")

def assess_risk(clause_text: str, compliance_status: str) -> dict:
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0.1)
    try:
        messages = [
            ("system", "You are an expert legal risk analyst. Identify unfair or one-sided clauses, and assign a risk level (Low, Medium, High)."),
            ("human", f"Compliance Status: {compliance_status}\n\nClause:\n{clause_text}")
        ]
        result = invoke_structured(llm, RiskInfo, messages)
        return result.model_dump()
    except Exception as e:
        print(f"Error in assess_risk: {e}")
        return {"risk_level": "Unknown", "unfair_one_sided_terms": [], "risk_explanation": ""}
