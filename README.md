# Personal AI Investment Research Agent (ApexQ)

Live Production Link: [https://apexq.onrender.com/](https://apexq.onrender.com/)

ApexQ is a smart, independent web-research tool designed to analyze companies objectively.  It automatically connects live internet search engines with an advanced Artificial Intelligence (AI) model to evaluate businesses without the usual "cheerleading" or confirmation bias found in standard AI tools.

---

## Overview — What It Does

This application does the heavy lifting for investors by gathering real-world web data and providing a balanced risk assessment of any company.

*   **Live Web Research:** It uses the Tavily Search API to instantly find real-time financial news, recent earnings reports, and market updates across the internet.  
*   **Unbiased AI Evaluation:** It processes raw web data through the Google Gemini AI model.  The system is explicitly trained to be skeptical, ensuring the AI looks critically at a company's weaknesses instead of just repeating positive hype.  
*   **Clean Financial Dashboard:** It displays a neat summary showing a clear recommendation ("INVEST" or "PASS"), along with organized lists of the company's real operational strengths and structural risks.  

---

## How to Run It — Setup & Run Steps

### Step 1: Set Up the Environment Variables
Create a file named `.env` inside the `backend/` directory of the project and add API keys:

```env
PORT=5000
TAVILY_API_KEY=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
GEMINI_API_KEY=AQ.Ab8RN6KxwlOpQzVyf-wxQV3E5zFI13aPJtq-fjS3K6Ga119cFw
```
### Step 2: Launch the Backend Server
Open terminal and run the following commands:


Bash
```
cd backend
#### Install dependencies (using legacy-peer-deps to prevent package version conflicts)
npm install @langchain/google-genai --legacy-peer-deps
npm install
node server.js
```
Terminal will display: Backend running on port 5000

### Step 3: Launch the Frontend Interface
Open a second terminal window and run:

Bash
```
cd frontend
npm install
npm run dev
```
Click the local localhost link generated in terminal window to open dashboard directly in the browser.

## How It Works — Architecture Flow
User Search: You type a company name into the React frontend dashboard.  The app packages this input and securely sends it over to the Node.js backend server.

Live Scraping: The backend asks the Tavily Search API to instantly crawl the web for the most recent financial indices, guidance disclosures, and stock performance updates.

Strict AI Prompting: The raw search results are cleaned up, packaged with strict analytical rules, and passed directly into the Gemini AI model parameters.

Objective Thinking: The AI model runs at a locked temperature: 0 setting.  This stops the engine from creating fake data (hallucinations) or generating overly enthusiastic market hype.

Data Structuring: The backend uses a validation schema (Zod) to read the AI's response text and map it cleanly into structured arrays so the frontend can display your columns and pill alerts flawlessly.

## Key Decisions & Technical Trade-offs
1. Using Google Gemini (1.5 Flash)
Why: Google's Gemini infrastructure features an incredibly generous developer sandbox tier, making it highly cost-efficient and seamless to scale without pre-paid token constraints.

Trade-off: Customized initialization variables to map cleanly within LangChain's updated Google structural schemas.

2. Eliminating AI "Positivity Bias" via Temperature Control
Why: Standard LLM defaults favor enthusiastic compliance, leading them to recommend investing in deeply distressed entities if a single upbeat keyword appears.

Trade-off: I hard-locked temperature: 0 to eliminate creative inferences and refactored prompt rules to treat a PASS decision as the default baseline unless health indicators are explicitly validated.

3. Smart Handling of Bad Inputs
Why: Users can type fictional business entities or random strings.  Instead of letting the model hallucinate background information, we need to save processing power.

Trade-off: Created a programmatic regex-backed guardrail function (isLikelyInvalidCompanyName) that cross-references inputs to drop bad queries prior to invoking the API layers.

## Example Analysis Scenarios
Case 1: High-Growth Target (Result: INVEST)
Input: SanDisk (or Micron)

AI Summary: Highlights the global shortage of enterprise storage components and the explosive demand for hardware driven by new AI data infrastructure clusters.

Strengths: Massive growth in sales volume and powerful pricing control over competitors.

Risks: Sudden shifts in tech industry manufacturing cycles and raw component supply shortages.

Case 2: Restructuring Target (Result: PASS)
Input: Altice USA

AI Summary: Automatically triggers a safety warning after detecting active corporate debt negotiations and heavy financial restructuring.

Strengths: Large, well-established regional internet and broadband network with a stable customer base.

Risks: High risk of legal action from creditors and unmanageable corporate debt pressures.

## What I Would Improve With More Time
1. Deep Financial Document Reading (RAG): Connect a vector database (like Pinecone or ChromaDB) to let the AI instantly read through multi-year, official 10-K and 10-Q SEC corporate filing documents alongside current news.

2. Advanced Numerical Scoring: Expand the validation settings to pull exact mathematical data points—like Price-to-Earnings (P/E) ratios and Free Cash Flow numbers—to give companies a calculated quantitative score.