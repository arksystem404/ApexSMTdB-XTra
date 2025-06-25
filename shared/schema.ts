import { pgTable, text, serial, integer, boolean, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firebaseUid: text("firebase_uid"),
  smtAccountId: text("smt_account_id"),
  smtSessionId: text("smt_session_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const watchlistItems = pgTable("watchlist_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  symbol: text("symbol").notNull(),
  companyName: text("company_name").notNull(),
  addedAt: timestamp("added_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const portfolioHoldings = pgTable("portfolio_holdings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  symbol: text("symbol").notNull(),
  quantity: decimal("quantity", { precision: 15, scale: 4 }).notNull(),
  averagePrice: decimal("average_price", { precision: 15, scale: 4 }).notNull(),
  sector: text("sector"),
  allocation: decimal("allocation", { precision: 5, scale: 2 }),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiAnalysis = pgTable("ai_analysis", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  symbol: text("symbol"),
  analysisType: text("analysis_type").notNull(), // 'stock_analysis', 'portfolio_optimization', 'market_signals'
  analysis: text("analysis").notNull(),
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const marketSignals = pgTable("market_signals", {
  id: serial("id").primaryKey(),
  sector: text("sector").notNull(),
  signal: text("signal").notNull(), // 'BUY', 'HOLD', 'SELL'
  confidence: decimal("confidence", { precision: 3, scale: 2 }).notNull(),
  reasoning: text("reasoning"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tradingJournalEntries = pgTable("trading_journal_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  symbol: text("symbol").notNull(),
  action: text("action").notNull(), // 'BUY', 'SELL'
  quantity: decimal("quantity", { precision: 15, scale: 4 }).notNull(),
  price: decimal("price", { precision: 15, scale: 4 }).notNull(),
  notes: text("notes"),
  executedAt: timestamp("executed_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  theme: text("theme").default("light"),
  tradingJournalEnabled: boolean("trading_journal_enabled").default(false),
  riskTolerance: text("risk_tolerance").default("moderate"), // 'conservative', 'moderate', 'aggressive'
  preferences: jsonb("preferences"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertWatchlistItemSchema = createInsertSchema(watchlistItems).omit({
  id: true,
  addedAt: true,
});

export const insertPortfolioHoldingSchema = createInsertSchema(portfolioHoldings).omit({
  id: true,
  updatedAt: true,
});

export const insertAiAnalysisSchema = createInsertSchema(aiAnalysis).omit({
  id: true,
  createdAt: true,
});

export const insertMarketSignalSchema = createInsertSchema(marketSignals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTradingJournalEntrySchema = createInsertSchema(tradingJournalEntries).omit({
  id: true,
  createdAt: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWatchlistItem = z.infer<typeof insertWatchlistItemSchema>;
export type WatchlistItem = typeof watchlistItems.$inferSelect;

export type InsertPortfolioHolding = z.infer<typeof insertPortfolioHoldingSchema>;
export type PortfolioHolding = typeof portfolioHoldings.$inferSelect;

export type InsertAiAnalysis = z.infer<typeof insertAiAnalysisSchema>;
export type AiAnalysis = typeof aiAnalysis.$inferSelect;

export type InsertMarketSignal = z.infer<typeof insertMarketSignalSchema>;
export type MarketSignal = typeof marketSignals.$inferSelect;

export type InsertTradingJournalEntry = z.infer<typeof insertTradingJournalEntrySchema>;
export type TradingJournalEntry = typeof tradingJournalEntries.$inferSelect;

export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;

// API response types
export type StockData = {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  pe?: number;
  pb?: number;
  dividendYield?: number;
};

export type MarketTickerData = {
  symbol: string;
  price: number;
  changePercent: number;
};

export type PortfolioOptimization = {
  currentAllocation: Record<string, number>;
  recommendedAllocation: Record<string, number>;
  expectedReturn: number;
  riskReduction: number;
  reasoning: string;
};
