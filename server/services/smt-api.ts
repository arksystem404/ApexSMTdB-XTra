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
    const url = `${this.baseUrl}&f=getsharemarket`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Error fetching market data:', error);
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
      
      // Extract ticker data from SMT API response - using authentic structure from guide
      if (marketData && marketData.sharemarket) {
        return marketData.sharemarket.slice(0, 15).map((stock: any) => ({
          symbol: stock.sID || 'N/A', // sID is the stock symbol
          price: parseFloat(stock.lp) / 100 || 0, // lp = Last Price * 100
          changePercent: parseFloat(stock.lm) / 100 || 0 // lm = Last Movement * 100
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
      
      // Using authentic SMT API structure from guide
      if (marketData && marketData.sharemarket) {
        stocks = marketData.sharemarket.map((stock: any) => {
          const price = parseFloat(stock.lp) / 100 || 0; // lp = Last Price * 100
          const eps = parseFloat(stock.leps) / 100 || 0; // leps = Last EPS * 100
          const bookValue = parseFloat(stock.bv) / 100 || 0; // bv = Book Value
          const dividend = parseFloat(stock.ld) / 100 || 0; // ld = Last Dividends * 100
          
          return {
            symbol: stock.sID || 'N/A', // sID = Stock Symbol
            companyName: stock.n || 'Unknown Company', // n = Stock Name
            price: price,
            change: parseFloat(stock.lm) / 100 || 0, // lm = Last Movement * 100
            changePercent: ((parseFloat(stock.lm) / 100) / price) * 100 || 0,
            volume: parseInt(stock.v) || 0, // v = Volume
            marketCap: price * parseInt(stock.ts) || undefined, // ts = Total Shares Outstanding
            pe: eps > 0 ? price / eps : undefined, // P/E calculation
            pb: bookValue > 0 ? price / bookValue : undefined, // P/B calculation
            dividendYield: dividend > 0 ? (dividend / price) * 100 : undefined // Dividend yield %
          };
        });

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
      if (filters.sector) {
        stocks = stocks.filter((stock: StockData) => {
          const originalStock = marketData.sharemarket.find((s: any) => s.sID === stock.symbol);
          return originalStock?.iID && originalStock.iID.toLowerCase().includes(filters.sector!.toLowerCase());
        });
      }
      }

      return stocks;
    } catch (error: any) {
      console.error('Failed to search stocks:', error);
      return [];
    }
  }

  updateCredentials(accountId: string, sessionId: string) {
    this.accountId = accountId;
    this.sessionId = sessionId;
    this.baseUrl = `https://smt.aethernagames.com/unity.php?accountid=${this.accountId}&sess=${this.sessionId}`;
  }
}

export const smtApi = new SMTApiService();
