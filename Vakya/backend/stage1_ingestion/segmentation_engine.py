import spacy
import re
import logging

logger = logging.getLogger(__name__)

# Load spacy model. 
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    logger.warning("Spacy model 'en_core_web_sm' not found. Will use regex fallback exclusively or fail.")
    nlp = None

def segment_contract(text: str) -> list[dict]:
    """
    Segments a full contract text into a list of clauses.
    This uses a heuristic approach looking for common clause patterns.
    """
    # A basic regex looking for numbered clauses or articles
    # We use (?:^|\s) instead of ^ to handle poor PDF extraction where newlines are lost
    clause_pattern = re.compile(r"(?:^|\s)(?:\d{1,2}\.|\d{1,2}\.\d{1,2}|Article\s+[IVXLCDM]+|Section\s+\d+)\s+[A-Z]", re.MULTILINE | re.IGNORECASE)
    
    matches = list(clause_pattern.finditer(text))
    
    if not matches:
        # Fallback: segment by paragraphs if no clear clause markers are found
        return segment_by_paragraphs(text)
        
    clauses = []
    for i in range(len(matches)):
        start_idx = matches[i].start()
        end_idx = matches[i+1].start() if i + 1 < len(matches) else len(text)
        
        clause_text = text[start_idx:end_idx].strip()
        if clause_text:
            clauses.append({
                "clause_id": i + 1,
                "text": clause_text,
                "type": "extracted_clause"
            })
            
    return clauses

def segment_by_paragraphs(text: str) -> list[dict]:
    """Fallback segmenter that splits by double newlines."""
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    
    clauses = []
    for i, p in enumerate(paragraphs):
        clauses.append({
            "clause_id": i + 1,
            "text": p,
            "type": "paragraph"
        })
    return clauses
