import { GoogleGenAI } from "@google/genai";

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeStock(symbol: string, marketData: any): Promise<{
  analysis: string;
  confidence: number;
}> {
  try {
    const systemPrompt = `You are an expert financial analyst. Analyze the stock and provide a comprehensive analysis including technical indicators, fundamental metrics, and investment recommendation. Respond with JSON in this format: { "analysis": "detailed analysis text", "confidence": confidence_score_0_to_1 }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            analysis: { type: "string" },
            confidence: { type: "number" },
          },
          required: ["analysis", "confidence"],
        },
      },
      contents: `Analyze stock ${symbol} based on this market data: ${JSON.stringify(marketData)}`,
    });

    const result = JSON.parse(response.text || "{}");
    
    return {
      analysis: result.analysis || "Analysis unavailable",
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5))
    };
  } catch (error: any) {
    throw new Error(`Failed to analyze stock ${symbol}: ${error.message}`);
  }
}

export async function generatePortfolioOptimization(holdings: any[], riskTolerance: string): Promise<{
  currentAllocation: Record<string, number>;
  recommendedAllocation: Record<string, number>;
  expectedReturn: number;
  riskReduction: number;
  reasoning: string;
}> {
  try {
    const systemPrompt = `You are a portfolio optimization expert. Analyze the current portfolio holdings and provide optimization recommendations based on ${riskTolerance} risk tolerance. Calculate sector allocations and provide specific rebalancing suggestions. Respond with JSON in this format: { "currentAllocation": {}, "recommendedAllocation": {}, "expectedReturn": number, "riskReduction": number, "reasoning": "detailed explanation" }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            currentAllocation: { type: "object" },
            recommendedAllocation: { type: "object" },
            expectedReturn: { type: "number" },
            riskReduction: { type: "number" },
            reasoning: { type: "string" },
          },
          required: ["currentAllocation", "recommendedAllocation", "expectedReturn", "riskReduction", "reasoning"],
        },
      },
      contents: `Current Holdings: ${JSON.stringify(holdings)}`,
    });

    const result = JSON.parse(response.text || "{}");
    
    return {
      currentAllocation: result.currentAllocation || {},
      recommendedAllocation: result.recommendedAllocation || {},
      expectedReturn: result.expectedReturn || 0,
      riskReduction: result.riskReduction || 0,
      reasoning: result.reasoning || "Optimization analysis unavailable"
    };
  } catch (error: any) {
    throw new Error(`Failed to generate portfolio optimization: ${error.message}`);
  }
}

export async function generateMarketSignals(): Promise<Array<{
  sector: string;
  signal: 'BUY' | 'HOLD' | 'SELL';
  confidence: number;
  reasoning: string;
}>> {
  try {
    const systemPrompt = `You are a market analyst providing sector-based investment signals. Analyze current market conditions and provide sector-based investment signals. Consider technical indicators, market sentiment, and economic factors. Focus on major sectors like Technology, Healthcare, Finance, Energy, Consumer, Real Estate, etc. Respond with JSON in this format: { "signals": [{ "sector": "sector_name", "signal": "BUY|HOLD|SELL", "confidence": confidence_0_to_1, "reasoning": "explanation" }] }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            signals: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  sector: { type: "string" },
                  signal: { type: "string" },
                  confidence: { type: "number" },
                  reasoning: { type: "string" },
                },
                required: ["sector", "signal", "confidence", "reasoning"],
              },
            },
          },
          required: ["signals"],
        },
      },
      contents: "Provide current market sector analysis and investment signals",
    });

    const result = JSON.parse(response.text || '{"signals": []}');
    const signals = result.signals || [];
    
    return signals.map((signal: any) => ({
      sector: signal.sector || "Unknown",
      signal: ['BUY', 'HOLD', 'SELL'].includes(signal.signal) ? signal.signal : 'HOLD',
      confidence: Math.max(0, Math.min(1, signal.confidence || 0.5)),
      reasoning: signal.reasoning || "Analysis unavailable"
    }));
  } catch (error: any) {
    throw new Error(`Failed to generate market signals: ${error.message}`);
  }
}

export async function answerMarketQuestion(question: string, marketContext?: any): Promise<string> {
  try {
    const systemPrompt = "You are a knowledgeable financial advisor. Provide clear, actionable answers to market-related questions based on current market data and financial principles.";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: `${question}${marketContext ? `\n\nMarket Context: ${JSON.stringify(marketContext)}` : ''}`,
    });

    return response.text || "I'm unable to provide an answer at this time.";
  } catch (error: any) {
    throw new Error(`Failed to answer market question: ${error.message}`);
  }
}
