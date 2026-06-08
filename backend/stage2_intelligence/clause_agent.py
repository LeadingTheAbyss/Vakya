from pydantic import BaseModel, Field
from langchain_ollama import ChatOllama
import os
from utils.llm_helper import invoke_structured

OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen3:8b")

class ClauseInfo(BaseModel):
    category: str = Field(description="The category of the clause, e.g., Payment Terms, Liability, GST, Arbitration, Confidentiality, Termination, etc.")
    summary: str = Field(description="A brief 1-2 sentence summary of what this clause means.")
    key_obligations: list[str] = Field(description="List of key obligations mentioned in the clause.")

def analyze_clause(clause_text: str) -> dict:
    llm = ChatOllama(model=OLLAMA_MODEL, temperature=0.1, num_ctx=2048)
    try:
        messages = [
            ("system", "You are an expert legal assistant. Classify the clause into categories like Payment Terms, Liability, GST, Arbitration, Confidentiality, or Termination, and extract the required fields."),
            ("human", f"Clause:\n{clause_text}")
        ]
        result = invoke_structured(llm, ClauseInfo, messages)
        return result.model_dump()
    except Exception as e:
        print(f"Error in analyze_clause: {e}")
        return {"category": "Unknown", "summary": "Failed to analyze.", "key_obligations": []}
