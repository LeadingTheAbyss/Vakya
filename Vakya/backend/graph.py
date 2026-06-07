from typing import TypedDict, List, Annotated
import operator
from langgraph.graph import StateGraph, START, END

from stage2_intelligence.clause_agent import analyze_clause
from stage2_intelligence.risk_agent import assess_risk
from stage2_intelligence.compliance_agent import check_compliance
from stage2_intelligence.negotiation_agent import suggest_negotiation

class ClauseAnalysis(TypedDict):
    clause_id: int
    text: str
    type: str
    clause_info: dict
    risk_info: dict
    compliance_info: dict
    negotiation_info: dict

class ContractState(TypedDict):
    clauses: List[dict]
    current_index: int
    analyzed_clauses: Annotated[List[ClauseAnalysis], operator.add]

def clause_node(state: ContractState):
    idx = state["current_index"]
    clause = state["clauses"][idx]
    
    # Run agents sequentially passing context
    c_info = analyze_clause(clause["text"])
    comp_info = check_compliance(clause["text"], c_info.get("category", "Unknown"))
    r_info = assess_risk(clause["text"], comp_info.get("status", "Unknown"))
    
    # Conditional negotiation based on risk and unfair terms
    neg_info = {}
    if r_info.get("risk_level") in ["High", "Medium", "Flagged"] or len(r_info.get("unfair_one_sided_terms", [])) > 0:
        neg_info = suggest_negotiation(clause["text"], r_info.get("risk_level", "Unknown"), r_info.get("unfair_one_sided_terms", []))
    else:
        neg_info = {"improved_wording": "No change needed", "counter_terms": []}
        
    analysis = {
        "clause_id": clause.get("clause_id", idx),
        "text": clause["text"],
        "type": clause.get("type", "unknown"),
        "clause_info": c_info,
        "risk_info": r_info,
        "compliance_info": comp_info,
        "negotiation_info": neg_info
    }
    
    return {"analyzed_clauses": [analysis]}

def index_increment_node(state: ContractState):
    return {"current_index": state["current_index"] + 1}

def should_continue(state: ContractState):
    if state["current_index"] < len(state["clauses"]):
        return "clause_node"
    return END

# Build Graph
builder = StateGraph(ContractState)

builder.add_node("clause_node", clause_node)
builder.add_node("increment_node", index_increment_node)

builder.add_conditional_edges(START, should_continue, ["clause_node", END])
builder.add_edge("clause_node", "increment_node")
builder.add_conditional_edges("increment_node", should_continue, ["clause_node", END])

graph = builder.compile()

def process_contract_intelligence(clauses: List[dict]) -> dict:
    """Main entrypoint to run the intelligence graph over a list of clauses."""
    if not clauses:
        return {"analyzed_clauses": []}
        
    initial_state = {
        "clauses": clauses,
        "current_index": 0,
        "analyzed_clauses": []
    }
    
    final_state = graph.invoke(initial_state)
    return {"analyzed_clauses": final_state.get("analyzed_clauses", [])}
