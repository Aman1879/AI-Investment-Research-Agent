# Personal AI Investment Research Agent (ApexQ)

🚀 **Live Production Link:** [https://apexq.onrender.com/](https://apexq.onrender.com/)

ApexQ is a smart, independent web-research tool designed to analyze companies objectively. It automatically connects live internet search engines with an advanced Artificial Intelligence (AI) model to evaluate businesses without the usual "cheerleading" or confirmation bias found in standard AI tools.

---

## 🧐 Overview — What It Does

This application does the heavy lifting for investors by gathering real-world web data and providing a balanced risk assessment of any company.

*   **Live Web Research:** It uses the Tavily Search API to instantly find real-time financial news, recent earnings reports, and market updates across the internet.
*   **Unbiased AI Evaluation:** It processes raw web data through the Google Gemini AI model. The system is explicitly trained to be skeptical, ensuring the AI looks critically at a company's weaknesses instead of just repeating positive hype.
*   **Clean Financial Dashboard:** It displays a neat summary showing a clear recommendation ("INVEST" or "PASS"), along with organized lists of the company's real operational strengths and structural risks.

---

## 🚀 How to Run It — Setup & Run Steps

### 🛠️ Step 1: Set Up the Environment Variables
Create a file named `.env` inside the `backend/` directory of the project and add your API keys:

```env
PORT=5000
TAVILY_API_KEY=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
GEMINI_API_KEY=AQ.Ab8RN6KxwlOpQzVyf-wxQV3E5zFI13aPJtq-fjS3K6Ga119cFw
🖥️ Step 2: Launch the Backend Server
Open your terminal and run the following commands:

Bash
cd backend
# Install dependencies (using legacy-peer-deps to prevent package version conflicts)
npm install @langchain/google-genai --legacy-peer-deps
npm install
node server.js
Your terminal will display: Backend running on port 5000

🎨 Step 3: Launch the Frontend Interface
Open a second terminal window and run:

Bash
cd frontend
npm install
npm run dev
Click the local link generated in the terminal to open your interactive dashboard in the browser.

🏗️ How It Works — Architecture Flow
User Search: You type a company name into the React frontend dashboard. The app sends this data to the Node.js backend server.

Live Scraping: The backend asks the Tavily Search API to scan the internet for the most recent financial and stock information related to that company.

Strict AI Prompting: The raw search results are packaged with strict analytical rules and sent directly to the Gemini AI model.

Objective Thinking: The AI model runs at a strict temperature: 0 setting. This stops the AI from "hallucinating" (making up fake data) or being overly optimistic.

Data Structuring: The backend uses a validation tool (Zod) to read the AI's response and format it cleanly into text, lists, and tables so the frontend can display it beautifully.

⚖️ Key Decisions & Technical Trade-offs
1. Using Google Gemini (1.5 Flash) Instead of OpenAI
Why: OpenAI requires pre-paid credits to use their API, which adds friction for testing. Google's Gemini platform offers a generous free tier for developers, making it cost-effective and easy to launch.

Trade-off: LangChain properties are written slightly differently for Google models than OpenAI models, requiring custom code configurations to handle the data fields correctly.

2. Eliminating AI "Positivity Bias" via Temperature Control
Why: Standard AI models are programmed to be friendly and helpful. Left alone, they will enthusiastically recommend investing in failing companies just because they found a few happy words in a news article.

Trade-off: We locked the AI's creativity setting (temperature) to zero. The system is coded to default to a PASS decision unless solid, undeniable financial health metrics are found in the live search data.

3. Smart Handling of Bad Inputs
Why: If a user types a fake company name, a normal AI might accidentally make up a fake story about it.

Trade-off: We built a quick programmatic check (a regex guardrail) that blocks gibberish or fake company entries before the application even wastes an API call.

🧪 Example Analysis Scenarios
🟢 Case 1: High-Growth Target (Result: INVEST)
Input: SanDisk (or Micron)

AI Summary: Highlights the global shortage of enterprise storage components and the explosive demand for hardware driven by new AI data centers.

Strengths: Massive growth in sales volume and powerful pricing control over competitors.

Risks: Sudden shifts in tech industry manufacturing cycles and raw component supply shortages.

🔴 Case 2: Restructuring Target (Result: PASS)
Input: Altice USA

AI Summary: Automatically triggers a safety warning after detecting active corporate debt negotiations and heavy financial restructuring.

Strengths: Large, well-established regional internet and broadband network with a stable customer base.

Risks: High risk of legal action from creditors and unmanageable corporate debt pressures.

🔮 What I Would Improve With More Time
Deep Financial Document Reading (RAG): Connect a vector database (like Pinecone or ChromaDB) to let the AI instantly read through multi-year, official 10-K and 10-Q SEC corporate filing documents alongside current news.

Advanced Numerical Scoring: Expand the validation settings to pull exact mathematical data points—like Price-to-Earnings (P/E) ratios and Free Cash Flow numbers—to give companies a calculated quantitative score.