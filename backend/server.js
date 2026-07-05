import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Swapped out OpenAI for the Google GenAI wrapper
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { TavilySearchAPIRetriever } from '@langchain/community/retrievers/tavily_search_api';
import { z } from 'zod';

dotenv.config();

const app = express();
app.use(express.json());

// Resilient CORS Middleware to prevent any frontend connection blocks
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  
  // Handle preflight OPTIONS requests gracefully
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Single, clean declaration of the Gemini model using the correct 'model' key framework
const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-1.5-flash", // Fast, highly accurate, and free-tier optimized
  temperature: 0,            // Crucial for objective, structured data analysis
});

const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    company: z.string(),
    decision: z.enum(['INVEST', 'PASS']),
    summary: z.string(),
    strengths: z.array(z.string()),
    risks: z.array(z.string()),
  })
);

function extractSearchText(searchResults = []) {
  if (!Array.isArray(searchResults)) return '';

  return searchResults
    .map((document) => `${document?.metadata?.title || ''} ${document?.metadata?.source || ''} ${document?.pageContent || ''}`.toLowerCase())
    .join(' ');
}

function isLikelyInvalidCompanyName(companyName, searchResults, liveResearchContext) {
  const keywords = companyName.trim().toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2);

  if (!Array.isArray(searchResults) || searchResults.length === 0) return true;
  if (keywords.length === 0) return false;

  const searchText = `${extractSearchText(searchResults)} ${String(liveResearchContext || '').toLowerCase()}`;
  return !keywords.some((keyword) => searchText.includes(keyword));
}

function isGenericInvestmentOutput(analysis, companyName, searchData) {
  const bannedPhrases = [
    'recent live coverage includes growth-oriented terms',
    'the live search set references earnings or revenue items',
    'includes cautionary language such as miss',
    'the available headlines are not enough for a conviction call',
    'recent news flow includes signs of momentum',
    'search results reference revenue',
    'live search coverage provides current context',
    'deeper financial review is still recommended',
    'headline-level context rather than a full financial model',
    'potential turnaround or niche upside',
    'room for deeper due diligence',
    'strong brand or market position',
    'large addressable market',
    'potential for recurring revenue and scale',
    'macro sensitivity can affect valuation',
    'execution risk remains in fast-moving markets',
    'competitive pressure may compress margins',
  ];

  const companyTokens = companyName.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2);
  const combinedText = `${String(analysis?.summary || '').toLowerCase()} ${(analysis?.strengths || []).join(' ').toLowerCase()} ${(analysis?.risks || []).join(' ').toLowerCase()}`;
  const searchText = JSON.stringify(searchData).toLowerCase();

  const hasBannedPhrase = bannedPhrases.some((phrase) => combinedText.includes(phrase));
  const missingCompanyTokens = companyTokens.length > 0 && !companyTokens.some((token) => combinedText.includes(token) || searchText.includes(token));

  return hasBannedPhrase || missingCompanyTokens;
}

function buildContextualFallbackAnalysis(companyName, researchContext = '') {
  const normalizedName = companyName.trim();
  const context = researchContext.toLowerCase();
  const headlineLines = researchContext
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^\d+\./.test(line))
    .slice(0, 3);

  if (!context || context.includes('no usable results') || context.includes('no live research context')) {
    return {
      company: normalizedName,
      decision: 'PASS',
      summary: `No reliable live research context was available for ${normalizedName}, so the default view is PASS.`,
      strengths: [
        `${normalizedName} is the requested company and can be reviewed once reliable search data is available.`,
        'Live search could not confirm a valid public-company result.',
        'Additional diligence is required before any investment decision.',
      ],
      risks: [
        'No usable live evidence was found in the search data.',
        'A company name mismatch can produce an unreliable investment thesis.',
        'The model should not infer a buy case without supporting facts.',
      ],
    };
  }

  const positiveSignals = ['record', 'growth', 'beat', 'raise guidance', 'strong', 'profit', 'all-time highs', 'expansion', 'margin', 'revenue'];
  const negativeSignals = ['miss', 'cut guidance', 'decline', 'lawsuit', 'antitrust', 'weak', 'slump', 'layoff', 'warning', 'risk'];

  const positiveScore = positiveSignals.reduce((score, signal) => score + (context.includes(signal) ? 1 : 0), 0);
  const negativeScore = negativeSignals.reduce((score, signal) => score + (context.includes(signal) ? 1 : 0), 0);
  const decision = positiveScore >= 3 && negativeScore === 0 ? 'INVEST' : 'PASS';

  const strengths = [];
  const risks = [];

  const headlineStrengths = headlineLines.map((line) => `Latest coverage on ${normalizedName} highlights ${line.replace(/^\d+\.\s*/, '')}.`);
  const headlineRisks = headlineLines.map((line) => `The headline ${line.replace(/^\d+\.\s*/, '')} needs verification against filings and guidance before treating it as durable.`);

  if (positiveScore > 0) {
    strengths.push(`Recent live coverage for ${normalizedName} includes terms such as ${positiveSignals.filter((signal) => context.includes(signal)).slice(0, 2).join(' and ')}.`);
  }
  if (context.includes('revenue') || context.includes('earnings')) {
    strengths.push(`The live search set explicitly references earnings or revenue items for ${normalizedName}.`);
  }
  if (context.includes('growth') || context.includes('expansion')) {
    strengths.push(`The current headlines point to expansion or growth themes tied to ${normalizedName}.`);
  }

  if (negativeScore > 0) {
    risks.push(`Recent coverage on ${normalizedName} includes cautionary language such as ${negativeSignals.filter((signal) => context.includes(signal)).slice(0, 2).join(' and ')}.`);
  }
  if (context.includes('risk') || context.includes('warning') || context.includes('lawsuit') || context.includes('antitrust')) {
    risks.push(`The live search context flags execution, legal, or policy risk language that should be checked against ${normalizedName}'s filings.`);
  }
  if (context.includes('decline') || context.includes('miss') || context.includes('cut guidance')) {
    risks.push(`The headlines suggest possible downside pressure on ${normalizedName}'s performance or guidance.`);
  }

  while (strengths.length < 3) {
    strengths.push(headlineStrengths[strengths.length] || `The live search context for ${normalizedName} is limited, but it still points to company-specific coverage rather than a generic mention.`);
  }

  while (risks.length < 3) {
    risks.push(headlineRisks[risks.length] || `The available headlines for ${normalizedName} are not enough for a full conviction call, so confirm them with earnings releases and filings.`);
  }

  return {
    company: normalizedName,
    decision,
    summary:
      headlineLines.length > 0
        ? `Live search context for ${normalizedName} includes recent coverage such as ${headlineLines.join(' and ')}. Based on that context, the current view is ${decision}.`
        : `Live search context for ${normalizedName} is limited, so this fallback uses recent news signals plus a conservative ${decision} bias.`,
    strengths: strengths.slice(0, 3),
    risks: risks.slice(0, 3),
  };
}

app.post('/api/research', async (req, res) => {
  const { companyName } = req.body;

  if (!companyName || !companyName.trim()) {
    return res.status(400).json({ error: 'Company name is required' });
  }

  let liveResearchContext = '';

  try {
    if (!process.env.TAVILY_API_KEY) {
      return res.json(buildContextualFallbackAnalysis(companyName));
    }

    const searchTool = new TavilySearchAPIRetriever({
      k: 5,
      searchDepth: 'advanced',
      includeRawContent: false,
      apiKey: process.env.TAVILY_API_KEY,
    });

    const searchQuery = `${companyName.trim()} latest earnings guidance revenue stock performance market news`;
    const searchResults = await searchTool.invoke(searchQuery);

    liveResearchContext = Array.isArray(searchResults)
      ? searchResults
          .slice(0, 5)
          .map((document, index) => {
            const title = document?.metadata?.title || `Source ${index + 1}`;
            const url = document?.metadata?.source ? `\nURL: ${document.metadata.source}` : '';
            const content = document?.pageContent || 'No excerpt available.';
            return `${index + 1}. ${title}\n${content}${url}`;
          })
          .join('\n\n')
      : JSON.stringify(searchResults, null, 2);

    if (isLikelyInvalidCompanyName(companyName, searchResults, liveResearchContext)) {
      return res.status(404).json({
        error: `I couldn't find reliable live results for "${companyName.trim()}". Please check the spelling or try a listed public company.`,
      });
    }

    const searchData = Array.isArray(searchResults)
      ? searchResults.slice(0, 5).map((document, index) => ({
          rank: index + 1,
          title: document?.metadata?.title || `Source ${index + 1}`,
          source: document?.metadata?.source || '',
          content: document?.pageContent || 'No excerpt available.',
        }))
      : [{ rank: 1, title: 'Search Payload', source: '', content: String(searchResults) }];

    const systemInstruction = `You are a critical, data-driven institutional equity analyst examining live web data.

[LIVE WEB SEARCH DATA]:
${JSON.stringify(searchData)}

CRITICAL GENERATION RULES:
1. You MUST base your analysis strictly on the specific numbers, facts, and corporate events present in the [LIVE WEB SEARCH DATA] above.
2. Under STRENGTHS and RISKS, you are strictly FORBIDDEN from using generic phrases like:
   - "Recent live coverage includes growth-oriented terms"
   - "The live search set references earnings or revenue items"
   - "Includes cautionary language such as miss"
   - "The available headlines are not enough for a conviction call"
3. Every single bullet point under strengths and risks MUST name a real, concrete fact unique to ${companyName} found in the search text (e.g., mention specific delivery beats, exact margin percentages, capex updates, or regulatory approvals).
4. If you decide to PASS, you must still list 3 real operational strengths of ${companyName} from the text, but explain in the summary why the specific risks outweigh them.

You MUST respond with a valid, clean JSON object matching this structure exactly (do not wrap it in markdown codeblocks like \`\`\`json):
{
  "company": "${companyName}",
  "decision": "INVEST" or "PASS",
  "summary": "A 2-3 sentence rigorous financial explanation using unique details from the fresh search results.",
  "strengths": ["Fact-driven strength 1", "Fact-driven strength 2", "Fact-driven strength 3"],
  "risks": ["Fact-driven risk 1", "Fact-driven risk 2", "Fact-driven risk 3"]
}`;

    // Formatted to use Gemini's standard structural array interface
    const llmResponse = await model.invoke([
      { role: 'user', content: systemInstruction }
    ]);
    
    const rawText = typeof llmResponse.content === 'string' ? llmResponse.content : String(llmResponse.content);
    const structuredData = await parser.parse(rawText);

    if (isGenericInvestmentOutput(structuredData, companyName, searchData)) {
      throw new Error('Generic investment output detected');
    }

    return res.json(structuredData);
  } catch (error) {
    console.error('Error processing investment research:', error);
    return res.json(buildContextualFallbackAnalysis(companyName, liveResearchContext));
  }
});

const PORT = Number(process.env.PORT || 5000);

// Explicitly binding to 0.0.0.0 ensures internal port mapping issues on Windows are completely bypassed
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on port ${PORT}`);
});