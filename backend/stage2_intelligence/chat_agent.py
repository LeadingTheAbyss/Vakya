from langchain_google_genai import ChatGoogleGenerativeAI
import os, json

OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen3:8b")


def chat_about_contract(
    user_message: str,
    clauses: list[dict],
    history: list[dict],
) -> str:
    """
    Answer a user question about the analyzed contract using the LLM.
    `clauses` – the analyzed clause dicts (may have text, risk_info, compliance_info, etc.)
    `history`  – list of {role, content} prior messages in this chat session
    """
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0.3)

    
    clause_context_parts = []
    for i, c in enumerate(clauses[:15], 1):          
        title = c.get("title") or c.get("type") or f"Clause {i}"
        text  = c.get("text") or c.get("original") or ""
        risk  = ""
        if c.get("risk_info"):
            risk = c["risk_info"].get("risk_level", "")
        elif c.get("risk"):
            risk = c["risk"]
        issue = ""
        if c.get("issue"):
            iss = c["issue"]
            issue = iss.get("en", "") if isinstance(iss, dict) else str(iss)
        clause_context_parts.append(
            f"[{i}] {title} | Risk: {risk or 'N/A'}\nText: {text[:300]}\nIssue: {issue[:200]}"
        )

    clause_context = "\n---\n".join(clause_context_parts)

    system_prompt = f"""You are Vakya, an expert AI legal assistant for Indian MSMEs.
The user has just analyzed a contract. Here are the key clauses extracted:

{clause_context}

Your job is to:
- Answer questions about the specific clauses, risks, and legal implications.
- Explain concepts in plain, simple language the user can understand.
- Reference specific clauses by number when relevant.
- When asked about Indian law (GST, MSME Act, Arbitration, jurisdiction etc.) give accurate, practical guidance.
- Be concise – 2-4 short paragraphs max unless the user asks for detail.
- If you don't know something, say so clearly rather than guessing.
- Respond in the same language the user wrote in (Hindi or English).
"""

    messages: list = [("system", system_prompt)]
    for h in history[-8:]:   
        messages.append((h["role"], h["content"]))
    messages.append(("human", user_message))

    try:
        response = llm.invoke(messages)
        return response.content.strip()
    except Exception as e:
        print(f"Chat error: {e}")
        return "Sorry, I couldn't process your question right now. Please try again."
