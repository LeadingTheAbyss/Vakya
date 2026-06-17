# Project Knowledge Base: Vakya (Contract Sentinel API)

## 1. Project Overview

* **Project Name:** Vakya (Contract Sentinel API)
* **One-line description:** An expert AI legal assistant tailored for Indian MSMEs to analyze contracts for risks, check compliance, and provide negotiation points.
* **Problem being solved:** Manual review of legal contracts is time-consuming and expensive. MSMEs often lack dedicated legal teams to identify unfair clauses, compliance issues, and hidden risks.
* **Target users:** Indian MSMEs, business owners, and legal professionals.
* **Key features:** 
  - Multi-format document ingestion (PDF, DOCX, Scanned Images via OCR).
  - Automated clause segmentation.
  - Multi-agent intelligence (Risk Assessment, Compliance Checking, Negotiation Suggestions).
  - Exportable DOCX reporting.
  - Conversational chat interface to query specific contract details.
* **Project goals:** To streamline contract analysis, mitigate legal risks, and empower MSMEs with accessible legal intelligence.

---

## 2. System Architecture

* **High-level architecture diagram:**
  - **Frontend (React/Vite)** -> Communicates via REST API.
  - **Backend (FastAPI)** -> Handles uploads, user sessions, and triggers AI pipelines.
  - **AI Pipeline (LangGraph)** -> Batches clauses and runs them through specialized Ollama AI agents.
  - **Database (PostgreSQL via Neon)** -> Stores user profiles, processed contracts, and extracted clauses.
* **Data flow:**
  1. User authenticates via Google OAuth and uploads a document.
  2. Backend extracts text (using PyMuPDF/python-docx/PaddleOCR).
  3. Text is segmented into clauses using spaCy and Regex.
  4. LangGraph orchestrates concurrent analysis of clauses (Risk, Compliance, Negotiation).
  5. Results are saved in Postgres as JSONB.
  6. Frontend retrieves results and allows the user to download a generated DOCX report or chat with the contract.
* **User request lifecycle:** Handled asynchronously. The UI polls or waits for the `api/upload` and `api/analyze` endpoints to finish processing.
* **Component interactions:** Fast API acts as the orchestrator connecting the React UI, the Neon Database (via `psycopg2` threaded connection pools), and the local AI models.

**Questions:**

* **What happens when a user sends a query?** The `ChatOllama` model receives the user's question along with the top 15 most relevant/risky clauses injected into the context prompt, plus the recent chat history.
* **Which services are involved?** React/Vite (Frontend), FastAPI (Backend), PostgreSQL (Neon DB), Ollama (Local AI Model Host).
* **How does data move through the system?** Via JSON over REST APIs, passed internally as Python dictionaries into LangGraph state, and serialized as `JSONB` into PostgreSQL.

---

## 3. Technology Stack

### Frontend

* **Framework:** React 19 + Vite
* **UI libraries:** `lucide-react` (icons), `gsap` (animations)
* **State management:** React Hooks / Native Context
* **Authentication:** Google OAuth (`@react-oauth/google`), `jwt-decode`
* **Styling:** Custom CSS
* **Deployment:** Vercel (configured via `vercel.json`)

### Backend

* **Framework:** FastAPI (running on Uvicorn)
* **API architecture:** REST APIs with CORS middleware
* **Authentication:** Session-based / tokenized user upserts (`/api/auth/upsert`)
* **Validation:** Pydantic models
* **Logging:** Standard Python logging + dedicated `llm_error.log`
* **Deployment:** Local Docker/Uvicorn, cloud containerization ready.

### Database

* **Database type:** PostgreSQL (Neon Serverless)
* **Schema overview:** 
  - `users`: User profiles, preferences, alert settings.
  - `contracts`: Contract metadata, risk scores, `clauses_json` (JSONB), `summary_json` (JSONB).
* **Relationships:** `contracts` table references `users(id)` via Foreign Key with `ON DELETE CASCADE`.
* **Indexing strategy:** Indexed on `contracts(user_id, analyzed_at DESC)` for fast retrieval of user dashboards.

### AI / ML Layer

* **Models used:** `qwen3:8b` (default, running on Ollama)
* **Embeddings:** `sentence-transformers` (prepared for usage)
* **Prompting strategy:** Structured Output prompting (Pydantic models mapping to LLM JSON outputs).
* **Agent framework:** LangGraph (`StateGraph`)
* **Evaluation methods:** TBD

### Vector Database

* **Provider:** ChromaDB (Included in dependencies, planned for semantic retrieval).
* **Chunking strategy:** Clause-based segmentation using Regex heuristics (e.g., matching "Article IV", "Section 1") with a fallback to paragraph splitting, powered by `spacy` (`en_core_web_sm`).
* **Retrieval strategy:** For chat, it currently injects the top clauses directly based on analysis order. Semantic search via ChromaDB is likely planned.
* **Metadata filtering:** N/A natively, relying on Postgres JSONB currently.

### Infrastructure

* **Cloud provider:** Vercel (Frontend), Neon (Database), Backend (TBD, local Ollama execution).
* **Containers:** Supported, but currently running in local envs.
* **CI/CD:** GitHub Actions (`.github` folder present).
* **Monitoring:** TBD
* **Secrets management:** Local `.env` variables (`DATABASE_URL`, `OLLAMA_MODEL`).

---

## 4. Feature Breakdown

### Contract Intelligence Analysis
* **Purpose:** To autonomously read legal agreements and flag critical issues.
* **User workflow:** User uploads a PDF/DOCX -> Views a dashboard of clauses -> Sees high-risk items highlighted -> Downloads a DOCX executive summary.
* **Technical implementation:** PDF ingested via `fitz` -> Segmented by `segment_contract` -> Executed in LangGraph via `process_contract_intelligence` -> Results parsed and displayed.
* **Challenges faced:** Accurately segmenting messy, unstructured PDFs, and maintaining stable structured JSON outputs from local LLMs.
* **Future improvements:** Expanding to semantic vector search for massive contracts to bypass context limits.

---

## 5. AI Pipeline

### Query Processing
* **Input handling:** Multi-modal support (Scanned PDFs, Digital PDFs, Images, Word Docs).
* **Preprocessing:** OCR via `PaddleOCR` for images/scanned PDFs, `langdetect` to identify document language.
* **Query rewriting:** Standardized system prompts defining "Vakya" as an expert legal assistant for Indian MSMEs.

### Retrieval
* **Document search:** Clauses are stored in Postgres JSONB arrays.
* **Ranking:** Sorted/Filtered by risk level (`critical`, `warning`).

### Reasoning
* **Agent workflow:** LangGraph batches clauses (`BATCH_SIZE=1`). Each clause runs sequentially through:
  1. Clause Analysis Agent
  2. Compliance Agent
  3. Risk Assessment Agent
  4. Negotiation Agent (Conditionally, if Risk is High/Medium)
* **Tool usage:** Standard LLM structured generation (Pydantic `invoke_structured`).

### Response Generation
* **Context assembly:** The Chat agent takes up to the first 15 clauses, extracts the `text`, `risk`, and `issue`, and mounts them into the system prompt.
* **Output formatting:** Clean markdown responses via Chat, or DOCX generation via `python-docx` for final reports.

---

## 6. Agent Architecture

* **Agent types:** 
  1. Clause Analyst
  2. Risk Assessor
  3. Compliance Checker
  4. Negotiation Strategist
* **Responsibilities:** Breaking down the overwhelming task of contract review into specific, manageable extraction goals.
* **Multi-agent communication:** Handled seamlessly by passing the `ContractState` dict through LangGraph nodes.
* **Decision making process:** Conditional edges in LangGraph to continue iterating until all clauses are processed.

**Questions:**

* **Why agents?** Segregating prompts (e.g., Risk vs. Compliance) vastly improves LLM accuracy and reasoning, rather than asking a single LLM call to do 4 distinct complex legal tasks.
* **Why not a single prompt?** A single prompt analyzing a 50-page contract would exceed context windows and cause the LLM to hallucinate or skip critical details.
* **How are tools selected?** Pydantic schemas enforce what data each agent must return.

---

## 7. Knowledge Base

* **Data sources:** User uploaded contracts.
* **Document ingestion:** `doc_intelligence.py` uses `fitz` (PyMuPDF) and `docx`.
* **Chunking strategy:** Smart clause pattern matching via Regex and `spacy`.
* **Metadata schema:** Tracked in Postgres (Risk Level, Unfair Terms, Suggested Wording).
* **Update workflow:** Real-time processing upon user upload.

---

## 8. APIs and Integrations

### Database (Neon Postgres)
* **Purpose:** Persistent storage of user data and contract analytics.
* **Input:** Raw JSON dicts of clause analytics, user profiles.
* **Output:** Fast dashboard retrieval.
* **Failure handling:** Psycopg2 ThreadedConnectionPool auto-reconnects and rolls back failed transactions.

### Google OAuth
* **Purpose:** Secure, passwordless user authentication.

---

## 9. Security

* **Authentication:** JWT via Google OAuth.
* **Authorization:** Backend verifies `user_id` on contract retrieval queries.
* **Data protection:** Passwords are not stored. Neon Postgres provides encryption at rest.
* **Prompt injection protection:** TBD
* **Hallucination mitigation:** Multi-agent verification and forcing structured Pydantic outputs.
* **Abuse prevention:** TBD

---

## 10. Performance

* **Response latency:** Dependent on local Ollama GPU inference speed. LangGraph utilizes `concurrent.futures.ThreadPoolExecutor` to process clauses in parallel (configurable via `BATCH_SIZE`).
* **Retrieval latency:** Sub-millisecond via Postgres indexing.
* **Caching strategy:** TBD
* **Optimization techniques:** Splitting documents into clauses allows streaming or batched inference rather than massive, slow, context-heavy single queries.

---

## 11. Challenges Faced

**Technical challenges:**
* **AI:** Forcing local models (`qwen3:8b`) to consistently output valid JSON for complex nested schemas (Risk, Compliance, Negotiation).
* **Backend:** Handling long-running LLM inferences without timing out HTTP requests.
* **Frontend:** Creating smooth, intuitive UI elements (via `gsap`) to display complex legal data without overwhelming MSME users.

---

## 12. Design Decisions

**Decision:** Using LangGraph over simple LangChain Chains.
* **Problem:** Contracts are too large to fit in a single prompt effectively without missing small details.
* **Decision:** Segment into clauses and process via a state machine.
* **Alternatives considered:** Map-reduce chains, RAG.
* **Tradeoffs:** Slower overall processing time, but significantly higher accuracy per clause.
* **Reasoning:** In legal tech, accuracy and catching a single "High Risk" clause is infinitely more important than processing speed.

---

## 13. Testing

* **Unit testing:** Basic endpoints and DB logic tested via `test_db.py` and `test_api.js`.
* **Integration testing:** TBD
* **AI evaluation:** TBD

---

## 14. Deployment

* **Build process:** `tsc -b && vite build` for frontend.
* **Deployment workflow:** Vercel auto-deploys for frontend.
* **Production architecture:** TBD (Likely separated GPU instance for AI backend, Vercel for UI).

---

## 15. Future Roadmap

* **Short term:** Improve OCR robustness and clause chunking accuracy.
* **Medium term:** Implement ChromaDB for semantic retrieval in the chat agent over massive contracts.
* **Long term:** Add subscription tiers (Stripe integration) and specialized AI models for different regions.

---

## 16. Metrics

* **Users:** Tracked in Postgres (`users` table).
* **Requests:** Tracked via `user_stats` query (contracts analyzed, clauses flagged).
* **Accuracy/Latency:** TBD

---

## 17. Blog Material

### Technical Highlights
* Building a local, private multi-agent legal intelligence pipeline without relying on OpenAI APIs.
* How we achieved accurate legal clause extraction using spaCy and Regex heuristics.

### Interesting Engineering Decisions
* Why we chose LangGraph for iterative batched processing over traditional RAG.

### Biggest Challenges
* Wrangling local open-source LLMs to output perfectly typed JSON schemas for our frontend dashboards.
