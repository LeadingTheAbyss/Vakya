from pydantic import BaseModel, Field
from langchain_ollama import ChatOllama
import os
from utils.llm_helper import invoke_structured

OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:1b")

class ComplianceInfo(BaseModel):
    status: str = Field(description="Compliance status: Pass, Fail, or Flagged")
    missing_mandatory_clauses: list[str] = Field(description="List of mandatory legal or tax elements missing from the clause")
    compliance_issues: str = Field(description="Explanation of Indian legal & tax compliance issues, if any")

def check_compliance(clause_text: str, category: str) -> dict:
    llm = ChatOllama(model=OLLAMA_MODEL, temperature=0.1)
    try:
        messages = [
            ("system", "You are an expert in Indian Legal & Tax compliance. Evaluate the clause for compliance with Indian law (e.g. GST, Companies Act) and identify any missing mandatory elements."),
            ("human", f"Category: {category}\n\nClause:\n{clause_text}")
        ]
        result = invoke_structured(llm, ComplianceInfo, messages)
        return result.model_dump()
    except Exception as e:
        print(f"Error in check_compliance: {e}")
        return {"status": "Unknown", "missing_mandatory_clauses": [], "compliance_issues": "Error during compliance check"}
