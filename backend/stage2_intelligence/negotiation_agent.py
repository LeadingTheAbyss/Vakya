from pydantic import BaseModel, Field
from langchain_ollama import ChatOllama
import os
from utils.llm_helper import invoke_structured

OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "deepseek-r1:14b")

class NegotiationInfo(BaseModel):
    improved_wording: str = Field(description="Suggested improved legal wording to replace the clause. State 'No change needed' if acceptable.")
    counter_terms: list[str] = Field(description="List of negotiation points or counter-terms to present to the other party.")

def suggest_negotiation(clause_text: str, risk_level: str, unfair_terms: list[str]) -> dict:
    llm = ChatOllama(model=OLLAMA_MODEL, temperature=0.2)
    try:
        unfair_str = ", ".join(unfair_terms) if unfair_terms else "None"
        messages = [
            ("system", "You are an expert contract negotiator. Suggest improved legal wording and generate counter-terms to mitigate the identified risks and unfair terms."),
            ("human", f"Risk Level: {risk_level}\nUnfair/One-Sided Terms: {unfair_str}\n\nClause:\n{clause_text}")
        ]
        result = invoke_structured(llm, NegotiationInfo, messages)
        return result.model_dump()
    except Exception as e:
        print(f"Error in suggest_negotiation: {e}")
        return {"improved_wording": "Error generating redline.", "counter_terms": []}
