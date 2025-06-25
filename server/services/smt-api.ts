import axios from 'axios';
import type { StockData, MarketTickerData } from '@shared/schema';

export class SMTApiService {
  private baseUrl: string;
  private accountId: string;
  private sessionId: string;

  constructor(accountId: string = '9158', sessionId: string = '782546733') {
    this.accountId = accountId;
    this.sessionId = sessionId;
    this.baseUrl = `https://smt.aethernagames.com/unity.php?accountid=${this.accountId}&sess=${this.sessionId}`;
  }

  async getMarketData(): Promise<any> {
    try {
      const response = await axios.get(this.baseUrl);
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to fetch market data: ${error.message}`);
    }
  }

  async getStockDetail(symbol: string): Promise<any> {
    const url = `${this.baseUrl}&f=getsharedetail&s=${symbol}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Generate mock price history with buy/sell signals for demonstration
      const priceHistory = this.generateMockPriceHistory(data.sharedetail);
      
      return {
        ...data,
        pricehistory: priceHistory
      };
    } catch (error) {
      console.error(`Error fetching stock detail for ${symbol}:`, error);
      throw error;
    }
  }

  private generateMockPriceHistory(stockDetail: any): Array<any> {
    if (!stockDetail) return [];
    
    const currentPrice = parseFloat(stockDetail.lp) / 100;
    const history = [];
    const days = 30;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate realistic price movements
      const volatility = 0.02; // 2% daily volatility
      const drift = -0.001; // Slight downward drift
      const random = (Math.random() - 0.5) * 2;
      const change = drift + volatility * random;
      
      const price = currentPrice * (1 + change * (i / days));
      const volume = Math.floor(Math.random() * 1000000) + 100000;
      
      // Add occasional buy/sell signals
      let signal = undefined;
      if (Math.random() < 0.1) { // 10% chance of signal
        signal = Math.random() < 0.6 ? 'B' : 'S'; // 60% buy, 40% sell
      }
      
      history.push({
        date: date.toISOString().split('T')[0],
        price: parseFloat(price.toFixed(2)),
        volume,
        signal
      });
    }
    
    return history;
  }

  async getTickerData(): Promise<MarketTickerData[]> {
    try {
      const marketData = await this.getMarketData();
      
      // Extract ticker data from SMT API response - using authentic structure
      if (marketData && marketData.shareMarketData) {
        return marketData.shareMarketData.slice(0, 15).map((stock: any) => ({
          symbol: stock.sName || stock.symbol || 'N/A',
          price: parseFloat(stock.sPrice) / 100 || 0, // SMT API returns price * 100
          changePercent: parseFloat(stock.sChangePercent) || parseFloat(stock.sChange) || 0
        }));
      }
      
      return [];
    } catch (error: any) {
      console.error('Failed to fetch ticker data:', error);
      return [];
    }
  }

  async searchStocks(filters: {
    minPrice?: number;
    maxPrice?: number;
    minVolume?: number;
    maxVolume?: number;
    minPE?: number;
    maxPE?: number;
    minPB?: number;
    maxPB?: number;
    minDividendYield?: number;
    maxDividendYield?: number;
  }): Promise<StockData[]> {
    try {
      const marketData = await this.getMarketData();
      
      if (!marketData || !marketData.shareMarketData) {
        return [];
      }

      let stocks = marketData.shareMarketData.map((stock: any) => ({
        symbol: stock.sName || stock.symbol || 'N/A',
        companyName: stock.sCompanyName || stock.companyName || stock.sName || 'N/A',
        price: parseFloat(stock.sPrice) / 100 || 0, // SMT API returns price * 100
        change: parseFloat(stock.sChange) / 100 || 0,
        changePercent: parseFloat(stock.sChangePercent) || parseFloat(stock.sChange) || 0,
        volume: parseInt(stock.sVolume) || 0,
        marketCap: parseFloat(stock.sMarketCap) || undefined,
        pe: parseFloat(stock.sPE) / 100 || undefined,
        pb: parseFloat(stock.sPB) / 100 || undefined,
        dividendYield: parseFloat(stock.sDividendYield) / 100 || undefined,
      }));

      // Apply filters
      if (filters.minPrice !== undefined) {
        stocks = stocks.filter((stock: StockData) => stock.price >= filters.minPrice!);
      }
      if (filters.maxPrice !== undefined) {
        stocks = stocks.filter((stock: StockData) => stock.price <= filters.maxPrice!);
      }
      if (filters.minVolume !== undefined) {
        stocks = stocks.filter((stock: StockData) => stock.volume >= filters.minVolume!);
      }
      if (filters.maxVolume !== undefined) {
        stocks = stocks.filter((stock: StockData) => stock.volume <= filters.maxVolume!);
      }
      if (filters.minPE !== undefined) {
        stocks = stocks.filter((stock: StockData) => stock.pe && stock.pe >= filters.minPE!);
      }
      if (filters.maxPE !== undefined) {
        stocks = stocks.filter((stock: StockData) => stock.pe && stock.pe <= filters.maxPE!);
      }
      if (filters.minPB !== undefined) {
        stocks = stocks.filter((stock: StockData) => stock.pb && stock.pb >= filters.minPB!);
      }
      if (filters.maxPB !== undefined) {
        stocks = stocks.filter((stock: StockData) => stock.pb && stock.pb <= filters.maxPB!);
      }
      if (filters.minDividendYield !== undefined) {
        stocks = stocks.filter((stock: StockData) => stock.dividendYield && stock.dividendYield >= filters.minDividendYield!);
      }
      if (filters.maxDividendYield !== undefined) {
        stocks = stocks.filter((stock: StockData) => stock.dividendYield && stock.dividendYield <= filters.maxDividendYield!);
      }

      return stocks;
    } catch (error: any) {
      throw new Error(`Failed to search stocks: ${error.message}`);
    }
  }

  updateCredentials(accountId: string, sessionId: string) {
    this.accountId = accountId;
    this.sessionId = sessionId;
    this.baseUrl = `https://smt.aethernagames.com/unity.php?accountid=${this.accountId}&sess=${this.sessionId}`;
  }
}

export const smtApi = new SMTApiService();
