import { 
  users, watchlistItems, portfolioHoldings, aiAnalysis, marketSignals, 
  tradingJournalEntries, userSettings,
  type User, type InsertUser, type WatchlistItem, type InsertWatchlistItem,
  type PortfolioHolding, type InsertPortfolioHolding, type AiAnalysis, type InsertAiAnalysis,
  type MarketSignal, type InsertMarketSignal, type TradingJournalEntry, type InsertTradingJournalEntry,
  type UserSettings, type InsertUserSettings
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;

  // Watchlist operations
  getWatchlistItems(userId: number): Promise<WatchlistItem[]>;
  addWatchlistItem(item: InsertWatchlistItem): Promise<WatchlistItem>;
  removeWatchlistItem(id: number, userId: number): Promise<boolean>;
  toggleWatchlistItem(id: number, userId: number, isActive: boolean): Promise<WatchlistItem>;

  // Portfolio operations
  getPortfolioHoldings(userId: number): Promise<PortfolioHolding[]>;
  upsertPortfolioHolding(holding: InsertPortfolioHolding): Promise<PortfolioHolding>;
  deletePortfolioHolding(id: number, userId: number): Promise<boolean>;

  // AI Analysis operations
  getAiAnalysis(userId: number, analysisType?: string): Promise<AiAnalysis[]>;
  createAiAnalysis(analysis: InsertAiAnalysis): Promise<AiAnalysis>;
  getLatestAiAnalysis(userId: number, analysisType: string, symbol?: string): Promise<AiAnalysis | undefined>;

  // Market signals operations
  getMarketSignals(): Promise<MarketSignal[]>;
  upsertMarketSignal(signal: InsertMarketSignal): Promise<MarketSignal>;

  // Trading journal operations
  getTradingJournalEntries(userId: number): Promise<TradingJournalEntry[]>;
  createTradingJournalEntry(entry: InsertTradingJournalEntry): Promise<TradingJournalEntry>;

  // User settings operations
  getUserSettings(userId: number): Promise<UserSettings | undefined>;
  upsertUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private watchlistItems: Map<number, WatchlistItem>;
  private portfolioHoldings: Map<number, PortfolioHolding>;
  private aiAnalysis: Map<number, AiAnalysis>;
  private marketSignals: Map<number, MarketSignal>;
  private tradingJournalEntries: Map<number, TradingJournalEntry>;
  private userSettings: Map<number, UserSettings>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.watchlistItems = new Map();
    this.portfolioHoldings = new Map();
    this.aiAnalysis = new Map();
    this.marketSignals = new Map();
    this.tradingJournalEntries = new Map();
    this.userSettings = new Map();
    this.currentId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.firebaseUid === firebaseUid);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      firebaseUid: insertUser.firebaseUid || null,
      smtAccountId: insertUser.smtAccountId || null,
      smtSessionId: insertUser.smtSessionId || null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { ...user, ...updateData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Watchlist operations
  async getWatchlistItems(userId: number): Promise<WatchlistItem[]> {
    return Array.from(this.watchlistItems.values()).filter(item => item.userId === userId && item.isActive);
  }

  async addWatchlistItem(item: InsertWatchlistItem): Promise<WatchlistItem> {
    const id = this.currentId++;
    const watchlistItem: WatchlistItem = {
      ...item,
      id,
      addedAt: new Date(),
      isActive: true
    };
    this.watchlistItems.set(id, watchlistItem);
    return watchlistItem;
  }

  async removeWatchlistItem(id: number, userId: number): Promise<boolean> {
    const item = this.watchlistItems.get(id);
    if (!item || item.userId !== userId) return false;
    
    return this.watchlistItems.delete(id);
  }

  async toggleWatchlistItem(id: number, userId: number, isActive: boolean): Promise<WatchlistItem> {
    const item = this.watchlistItems.get(id);
    if (!item || item.userId !== userId) throw new Error('Watchlist item not found');
    
    const updatedItem = { ...item, isActive };
    this.watchlistItems.set(id, updatedItem);
    return updatedItem;
  }

  // Portfolio operations
  async getPortfolioHoldings(userId: number): Promise<PortfolioHolding[]> {
    return Array.from(this.portfolioHoldings.values()).filter(holding => holding.userId === userId);
  }

  async upsertPortfolioHolding(holding: InsertPortfolioHolding): Promise<PortfolioHolding> {
    const existing = Array.from(this.portfolioHoldings.values()).find(
      h => h.userId === holding.userId && h.symbol === holding.symbol
    );

    if (existing) {
      const updated = { ...existing, ...holding, updatedAt: new Date() };
      this.portfolioHoldings.set(existing.id, updated);
      return updated;
    }

    const id = this.currentId++;
    const newHolding: PortfolioHolding = {
      ...holding,
      id,
      updatedAt: new Date(),
      sector: holding.sector || null,
      allocation: holding.allocation || null
    };
    this.portfolioHoldings.set(id, newHolding);
    return newHolding;
  }

  async deletePortfolioHolding(id: number, userId: number): Promise<boolean> {
    const holding = this.portfolioHoldings.get(id);
    if (!holding || holding.userId !== userId) return false;
    
    return this.portfolioHoldings.delete(id);
  }

  // AI Analysis operations
  async getAiAnalysis(userId: number, analysisType?: string): Promise<AiAnalysis[]> {
    return Array.from(this.aiAnalysis.values()).filter(analysis => 
      analysis.userId === userId && (!analysisType || analysis.analysisType === analysisType)
    );
  }

  async createAiAnalysis(analysis: InsertAiAnalysis): Promise<AiAnalysis> {
    const id = this.currentId++;
    const aiAnalysisItem: AiAnalysis = {
      ...analysis,
      id,
      createdAt: new Date(),
      symbol: analysis.symbol || null,
      confidence: analysis.confidence || null
    };
    this.aiAnalysis.set(id, aiAnalysisItem);
    return aiAnalysisItem;
  }

  async getLatestAiAnalysis(userId: number, analysisType: string, symbol?: string): Promise<AiAnalysis | undefined> {
    const analyses = Array.from(this.aiAnalysis.values())
      .filter(analysis => 
        analysis.userId === userId && 
        analysis.analysisType === analysisType &&
        (!symbol || analysis.symbol === symbol)
      )
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    
    return analyses[0];
  }

  // Market signals operations
  async getMarketSignals(): Promise<MarketSignal[]> {
    return Array.from(this.marketSignals.values()).sort((a, b) => 
      (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0)
    );
  }

  async upsertMarketSignal(signal: InsertMarketSignal): Promise<MarketSignal> {
    const existing = Array.from(this.marketSignals.values()).find(s => s.sector === signal.sector);
    
    if (existing) {
      const updated = { ...existing, ...signal, updatedAt: new Date() };
      this.marketSignals.set(existing.id, updated);
      return updated;
    }

    const id = this.currentId++;
    const newSignal: MarketSignal = {
      ...signal,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      reasoning: signal.reasoning || null
    };
    this.marketSignals.set(id, newSignal);
    return newSignal;
  }

  // Trading journal operations
  async getTradingJournalEntries(userId: number): Promise<TradingJournalEntry[]> {
    return Array.from(this.tradingJournalEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => b.executedAt.getTime() - a.executedAt.getTime());
  }

  async createTradingJournalEntry(entry: InsertTradingJournalEntry): Promise<TradingJournalEntry> {
    const id = this.currentId++;
    const journalEntry: TradingJournalEntry = {
      ...entry,
      id,
      createdAt: new Date(),
      notes: entry.notes || null
    };
    this.tradingJournalEntries.set(id, journalEntry);
    return journalEntry;
  }

  // User settings operations
  async getUserSettings(userId: number): Promise<UserSettings | undefined> {
    return Array.from(this.userSettings.values()).find(settings => settings.userId === userId);
  }

  async upsertUserSettings(settings: InsertUserSettings): Promise<UserSettings> {
    const existing = Array.from(this.userSettings.values()).find(s => s.userId === settings.userId);
    
    if (existing) {
      const updated = { ...existing, ...settings, updatedAt: new Date() };
      this.userSettings.set(existing.id, updated);
      return updated;
    }

    const id = this.currentId++;
    const newSettings: UserSettings = {
      ...settings,
      id,
      updatedAt: new Date(),
      theme: settings.theme || null,
      tradingJournalEnabled: settings.tradingJournalEnabled || null,
      riskTolerance: settings.riskTolerance || null,
      preferences: settings.preferences || null
    };
    this.userSettings.set(id, newSettings);
    return newSettings;
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return user;
  }

  async getWatchlistItems(userId: number): Promise<WatchlistItem[]> {
    return await db.select().from(watchlistItems).where(eq(watchlistItems.userId, userId));
  }

  async addWatchlistItem(item: InsertWatchlistItem): Promise<WatchlistItem> {
    const [watchlistItem] = await db.insert(watchlistItems).values(item).returning();
    return watchlistItem;
  }

  async removeWatchlistItem(id: number, userId: number): Promise<boolean> {
    const result = await db.delete(watchlistItems).where(and(eq(watchlistItems.id, id), eq(watchlistItems.userId, userId)));
    return result.rowCount > 0;
  }

  async toggleWatchlistItem(id: number, userId: number, isActive: boolean): Promise<WatchlistItem> {
    const [item] = await db.update(watchlistItems)
      .set({ isActive })
      .where(and(eq(watchlistItems.id, id), eq(watchlistItems.userId, userId)))
      .returning();
    return item;
  }

  async getPortfolioHoldings(userId: number): Promise<PortfolioHolding[]> {
    return await db.select().from(portfolioHoldings).where(eq(portfolioHoldings.userId, userId));
  }

  async upsertPortfolioHolding(holding: InsertPortfolioHolding): Promise<PortfolioHolding> {
    const existingHolding = await db.select().from(portfolioHoldings)
      .where(and(eq(portfolioHoldings.userId, holding.userId), eq(portfolioHoldings.symbol, holding.symbol)))
      .limit(1);

    if (existingHolding.length > 0) {
      const [updated] = await db.update(portfolioHoldings)
        .set(holding)
        .where(eq(portfolioHoldings.id, existingHolding[0].id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(portfolioHoldings).values(holding).returning();
      return created;
    }
  }

  async deletePortfolioHolding(id: number, userId: number): Promise<boolean> {
    const result = await db.delete(portfolioHoldings).where(and(eq(portfolioHoldings.id, id), eq(portfolioHoldings.userId, userId)));
    return result.rowCount > 0;
  }

  async getAiAnalysis(userId: number, analysisType?: string): Promise<AiAnalysis[]> {
    let query = db.select().from(aiAnalysis).where(eq(aiAnalysis.userId, userId));
    if (analysisType) {
      query = query.where(eq(aiAnalysis.analysisType, analysisType));
    }
    return await query.orderBy(desc(aiAnalysis.createdAt));
  }

  async createAiAnalysis(analysis: InsertAiAnalysis): Promise<AiAnalysis> {
    const [created] = await db.insert(aiAnalysis).values(analysis).returning();
    return created;
  }

  async getLatestAiAnalysis(userId: number, analysisType: string, symbol?: string): Promise<AiAnalysis | undefined> {
    let query = db.select().from(aiAnalysis)
      .where(and(eq(aiAnalysis.userId, userId), eq(aiAnalysis.analysisType, analysisType)));
    
    if (symbol) {
      query = query.where(eq(aiAnalysis.symbol, symbol));
    }
    
    const [latest] = await query.orderBy(desc(aiAnalysis.createdAt)).limit(1);
    return latest || undefined;
  }

  async getMarketSignals(): Promise<MarketSignal[]> {
    return await db.select().from(marketSignals).orderBy(desc(marketSignals.createdAt));
  }

  async upsertMarketSignal(signal: InsertMarketSignal): Promise<MarketSignal> {
    const existingSignal = await db.select().from(marketSignals)
      .where(eq(marketSignals.symbol, signal.symbol))
      .limit(1);

    if (existingSignal.length > 0) {
      const [updated] = await db.update(marketSignals)
        .set(signal)
        .where(eq(marketSignals.id, existingSignal[0].id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(marketSignals).values(signal).returning();
      return created;
    }
  }

  async getTradingJournalEntries(userId: number): Promise<TradingJournalEntry[]> {
    return await db.select().from(tradingJournalEntries).where(eq(tradingJournalEntries.userId, userId)).orderBy(desc(tradingJournalEntries.createdAt));
  }

  async createTradingJournalEntry(entry: InsertTradingJournalEntry): Promise<TradingJournalEntry> {
    const [created] = await db.insert(tradingJournalEntries).values(entry).returning();
    return created;
  }

  async getUserSettings(userId: number): Promise<UserSettings | undefined> {
    const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
    return settings || undefined;
  }

  async upsertUserSettings(settings: InsertUserSettings): Promise<UserSettings> {
    const existingSettings = await db.select().from(userSettings)
      .where(eq(userSettings.userId, settings.userId))
      .limit(1);

    if (existingSettings.length > 0) {
      const [updated] = await db.update(userSettings)
        .set(settings)
        .where(eq(userSettings.id, existingSettings[0].id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(userSettings).values(settings).returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
