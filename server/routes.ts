import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { smtApi } from "./services/smt-api";
import { analyzeStock, generatePortfolioOptimization, generateMarketSignals, answerMarketQuestion } from "./services/gemini";
import { insertWatchlistItemSchema, insertPortfolioHoldingSchema, insertUserSettingsSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Market data routes
  app.get("/api/market/data", async (req, res) => {
    try {
      const data = await smtApi.getMarketData();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/market/ticker", async (req, res) => {
    try {
      const tickerData = await smtApi.getTickerData();
      res.json(tickerData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/market/stock/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const data = await smtApi.getStockDetail(symbol);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Stock screener route
  app.post("/api/stocks/screen", async (req, res) => {
    try {
      const filters = req.body;
      const stocks = await smtApi.searchStocks(filters);
      res.json(stocks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Stock detail routes
  app.get('/api/stocks/detail/:symbol', async (req, res) => {
    try {
      const { symbol } = req.params;
      const data = await smtApi.getStockDetail(symbol);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch stock details' });
    }
  });

  // AI stock analysis route
  app.post('/api/ai/stock-analysis', async (req, res) => {
    try {
      const { symbol, stockData, orderSummary, priceHistory } = req.body;
      const analysis = await analyzeStock(symbol, { 
        sharedetail: stockData, 
        ordersummary: orderSummary, 
        pricehistory: priceHistory 
      });
      res.json({ analysis: analysis.analysis });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate AI analysis' });
    }
  });

  // Watchlist routes
  app.get("/api/watchlist/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const items = await storage.getWatchlistItems(userId);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/watchlist", async (req, res) => {
    try {
      const validatedData = insertWatchlistItemSchema.parse(req.body);
      const item = await storage.addWatchlistItem(validatedData);
      res.json(item);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/watchlist/:id/:userId", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = parseInt(req.params.userId);
      const success = await storage.removeWatchlistItem(id, userId);
      res.json({ success });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Portfolio routes
  app.get("/api/portfolio/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const holdings = await storage.getPortfolioHoldings(userId);
      res.json(holdings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/portfolio", async (req, res) => {
    try {
      const validatedData = insertPortfolioHoldingSchema.parse(req.body);
      const holding = await storage.upsertPortfolioHolding(validatedData);
      res.json(holding);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI Analysis routes
  app.post("/api/ai/analyze-stock", async (req, res) => {
    try {
      const { symbol, userId } = req.body;
      const stockData = await smtApi.getStockDetail(symbol);
      const analysis = await analyzeStock(symbol, stockData);
      
      // Store the analysis
      await storage.createAiAnalysis({
        userId,
        symbol,
        analysisType: 'stock_analysis',
        analysis: analysis.analysis,
        confidence: analysis.confidence.toString()
      });

      res.json(analysis);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/portfolio-optimization", async (req, res) => {
    try {
      const { userId, riskTolerance } = req.body;
      const holdings = await storage.getPortfolioHoldings(userId);
      const optimization = await generatePortfolioOptimization(holdings, riskTolerance || 'moderate');
      
      // Store the optimization analysis
      await storage.createAiAnalysis({
        userId,
        analysisType: 'portfolio_optimization',
        analysis: JSON.stringify(optimization),
        confidence: '0.85'
      });

      res.json(optimization);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/ai/market-signals", async (req, res) => {
    try {
      const signals = await generateMarketSignals();
      
      // Store signals in database
      for (const signal of signals) {
        await storage.upsertMarketSignal({
          sector: signal.sector,
          signal: signal.signal,
          confidence: signal.confidence.toString(),
          reasoning: signal.reasoning
        });
      }

      res.json(signals);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/market-question", async (req, res) => {
    try {
      const { question, userId } = req.body;
      const answer = await answerMarketQuestion(question);
      
      // Store the Q&A
      await storage.createAiAnalysis({
        userId,
        analysisType: 'market_qa',
        analysis: `Q: ${question}\nA: ${answer}`,
        confidence: '0.80'
      });

      res.json({ answer });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI Stock Picker route
  app.post("/api/ai/stock-picker", async (req, res) => {
    try {
      const { userId } = req.body;
      const marketData = await smtApi.getMarketData();
      const analysis = await answerMarketQuestion(
        "Based on current market conditions, recommend 3-5 stocks with high potential. Include reasoning for each pick.",
        marketData
      );
      
      // Store the analysis
      await storage.createAiAnalysis({
        userId,
        analysisType: 'stock_picker',
        analysis,
        confidence: '0.85'
      });

      res.json({ analysis });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // User settings routes
  app.get("/api/settings/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const settings = await storage.getUserSettings(userId);
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const validatedData = insertUserSettingsSchema.parse(req.body);
      const settings = await storage.upsertUserSettings(validatedData);
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Trading journal routes (available but disabled by default)
  app.get("/api/trading-journal/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const settings = await storage.getUserSettings(userId);
      
      if (!settings?.tradingJournalEnabled) {
        return res.status(403).json({ error: "Trading journal is disabled" });
      }

      const entries = await storage.getTradingJournalEntries(userId);
      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // SMT API configuration
  app.post("/api/smt/config", async (req, res) => {
    try {
      const { accountId, sessionId } = req.body;
      smtApi.updateCredentials(accountId, sessionId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
