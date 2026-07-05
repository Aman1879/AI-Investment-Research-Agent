# Personal AI Investment Research Agent

🚀 **Live Production Link:** [https://your-app-name.onrender.com](https://your-app-name.onrender.com)
A lightweight, autonomous web-research engine that bridges live internet scrapers with structured LLM analytical reasoning to evaluate corporate entities without default positivity or confirmation bias.


## Overview — What It Does
This application automatically parses public markets data to help investors de-risk their analytical research pipeline. 
* **Autonomous Web Retrieval:** Integrates a Tavily Search API retriever to instantly extract real-time financial reporting, recent earnings data, and macroeconomic news directly from the live web.
* **Objective Filtering Framework:** Processes raw text through a customized Google Gemini logic layer configured to enforce critical skepticism, completely mitigating standard LLM "cheerleading" habits.
* **Balanced Analysis Interface:** Outputs data-driven indicators containing structured executive summaries alongside balanced competitive matrices outlining operational advantages and structural vulnerabilities.


## How to Run It — Setup & Run Steps

### Prerequisite Environment Variables
Create a file named `.env` inside `backend/` directory:
```env
PORT=5000
TAVILY_API_KEY=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
GEMINI_API_KEY=AQ.Ab8RN6KxwlOpQzVyf-wxQV3E5zFI13aPJtq-fjS3K6Ga119cFw


1. Backend Service Launch
Bash
cd backend
# Note: Use legacy-peer-deps to bypass minor upstream LangChain/Zod schema framework type checks
npm install @langchain/google-genai --legacy-peer-deps
npm install
node server.js
The terminal will display: Backend running on port 5000

2. Frontend User Interface Launch
Bash
cd ../frontend
npm install
npm run dev
Open local browser to access the application dashboard interface.


### How It Works — Approach & Architecture
Client Dispatches Payload: The React interface posts the sanitized companyName input value over to the local Node.js Express server (http://127.0.0.1:5000/api/research).

Context Enrichment Engine: The backend invokes TavilySearchAPIRetriever to execute advanced live search scrapers over corporate indices ("latest earnings guidance revenue stock performance").

Structured Prompt Constraints: Raw search fragments are transformed into stringified payloads and contextualized via strict validation instructions inside our systemInstruction parameters.

Deterministic Inference Layer: The structured object drops into ChatGoogleGenerativeAI mapping over gemini-1.5-flash at a deterministic temperature: 0.

Validation & Mapping Schema: The LLM's raw text feedback gets run through a Zod-backed StructuredOutputParser to ensure data matching arrays are structured precisely for the frontend hooks.

⚖️ Key Decisions & Trade-offs
1. Swapping ChatOpenAI to ChatGoogleGenerativeAI (Gemini 1.5 Flash)
Why: OpenAI platforms require pre-paid account credit structures which create unnecessary friction for isolated technical evaluation tracks. Google's Gemini infrastructure features an incredibly generous developer sandbox tier, making it cost-efficient.

Trade-off: LangChain parameters vary between cloud vendors (model vs modelName). I modified initialization variables to map cleanly within LangChain's updated Google structural schemas.

2. Eradicating Default Positivity Bias via Strict Temperature Control
Why: Standard LLMs defaults favor enthusiastic compliance, leading them to recommend investing in deeply distressed entities if a single upbeat keyword appears.

Trade-off: I hard-locked temperature: 0 to eliminate creative hallucinations. I refactored prompt rules to treat a PASS decision as the default baseline unless financial health indicators are explicitly validated in the search content.

3. Graceful Fallbacks for Invalid Inputs
Why: Users can type fictional business entities. Instead of letting the model hallucinate data, I created a programmatic regex-backed guardrail function (isLikelyInvalidCompanyName) that cross-references text lists to drop bad queries prior to invoking the model layer.

🧪 Example Runs
Case 1: High-Growth Target (INVEST)
Input: SanDisk (or Micron)

Decision: INVEST

Summary Sample: Captures the extreme global shortage of enterprise NAND flash memory storage architectures and the explosive market demand for AI data infrastructure clusters.

Strengths: 600%+ upward volume trajectory, massive supplier pricing leverage.

Risks: Industry cyclicality shifts, raw component log bottlenecks.

Case 2: Restructuring Target (PASS)
Input: Altice USA

Decision: PASS

Summary Sample: Triggers automated safety blocks based on active out-of-court liability management exercises and severe balance sheet restructuring constraints.

Strengths: Robust regional fixed broadband footprint, large historical residential user base.

Risks: Aggressive near-term creditor litigation, unmanageable macro debt leverage.

🚀 What I Would Improve with More Time
Vector Database RAG Chains: Integrate historical company financial filings (10-K, 10-Q SEC reports) using a vector store (e.g., Pinecone or ChromaDB) to blend deep multi-year fundamentals with live news sentiment.

Expanded Schema Validation: Introduce additional analytical metrics into the Zod schema array layer, including P/E ratios, free cash flow figures, and relative industry multiples to provide deeper quantitative scoring.