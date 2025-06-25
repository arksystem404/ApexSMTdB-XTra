import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot } from 'recharts';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';


// Theme Definitions
const themes = {
  light: {
    bg: 'bg-gray-100', text: 'text-gray-800', cardBg: 'bg-white', cardShadow: 'shadow-xl',
    headerText: 'text-gray-800', subHeaderText: 'text-gray-700',
    sectionBgBlue: 'bg-blue-50', sectionTextBlue: 'text-blue-800',
    sectionBgPurple: 'bg-purple-50', sectionTextPurple: 'text-purple-800',
    sectionBgIndigo: 'bg-indigo-50', sectionTextIndigo: 'text-indigo-800',
    sectionBgGreen: 'bg-green-50', sectionTextGreen: 'text-green-800',
    sectionBgOrange: 'bg-orange-50', sectionTextOrange: 'text-orange-800',
    sectionBgTeal: 'bg-teal-50', sectionTextTeal: 'text-teal-800',
    sectionBgYellow: 'bg-yellow-50', sectionTextYellow: 'text-yellow-800',
    sectionBgGray: 'bg-gray-50', sectionTextGray: 'text-gray-800',
    subCardBg: 'bg-white',
    tableHeadBg: 'bg-green-100', tableRowHover: 'hover:bg-green-50',
    inputBorder: 'border-gray-300', inputBg: 'bg-white', inputText: 'text-gray-700', placeholderText: 'placeholder-gray-400',
    buttonPrimary: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-400',
    buttonSecondary: 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-400',
  },
  dark: {
    bg: 'bg-gray-900', text: 'text-gray-100', cardBg: 'bg-gray-800', cardShadow: 'shadow-lg',
    headerText: 'text-gray-100', subHeaderText: 'text-gray-300',
    sectionBgBlue: 'bg-blue-900', sectionTextBlue: 'text-blue-200',
    sectionBgPurple: 'bg-purple-900', sectionTextPurple: 'text-purple-200',
    sectionBgIndigo: 'bg-indigo-900', sectionTextIndigo: 'text-indigo-200',
    sectionBgGreen: 'bg-green-900', sectionTextGreen: 'text-green-200',
    sectionBgOrange: 'bg-orange-900', sectionTextOrange: 'text-orange-200',
    sectionBgTeal: 'bg-teal-900', sectionTextTeal: 'text-teal-200',
    sectionBgYellow: 'bg-yellow-900', sectionTextYellow: 'text-yellow-200',
    sectionBgGray: 'bg-gray-700', sectionTextGray: 'text-gray-200',
    subCardBg: 'bg-gray-700',
    tableHeadBg: 'bg-gray-700', tableRowHover: 'hover:bg-gray-700',
    inputBorder: 'border-gray-600', inputBg: 'bg-gray-700', inputText: 'text-gray-200', placeholderText: 'placeholder-gray-400',
    buttonPrimary: 'bg-blue-700 hover:bg-blue-800 focus:ring-blue-600',
    buttonSecondary: 'bg-gray-700 hover:bg-gray-800 focus:ring-gray-600',
  },
  wallstreet: {
    bg: 'bg-gradient-to-br from-gray-900 to-black', // Deeper gradient
    text: 'text-gray-100',
    cardBg: 'bg-gray-800 bg-opacity-75 backdrop-blur-sm border border-yellow-800', // Subtle border
    cardShadow: 'shadow-2xl shadow-yellow-900/40', // Golden shadow
    headerText: 'text-yellow-400 font-serif tracking-wide', // Serif font, wider tracking
    subHeaderText: 'text-gray-400',
    sectionBgBlue: 'bg-blue-950 bg-opacity-60 border-l-4 border-blue-700', sectionTextBlue: 'text-blue-300',
    sectionBgPurple: 'bg-purple-950 bg-opacity-60 border-l-4 border-purple-700', sectionTextPurple: 'text-purple-300',
    sectionBgIndigo: 'bg-indigo-950 bg-opacity-60 border-l-4 border-indigo-700', sectionTextIndigo: 'text-indigo-300',
    sectionBgGreen: 'bg-green-950 bg-opacity-60 border-l-4 border-green-700', sectionTextGreen: 'text-green-300',
    sectionBgOrange: 'bg-orange-950 bg-opacity-60 border-l-4 border-orange-700', sectionTextOrange: 'text-orange-300',
    sectionBgTeal: 'bg-teal-950 bg-opacity-60 border-l-4 border-teal-700', sectionTextTeal: 'text-teal-300',
    sectionBgYellow: 'bg-yellow-950 bg-opacity-60 border-l-4 border-yellow-700', sectionTextYellow: 'text-yellow-300',
    sectionBgGray: 'bg-gray-950 bg-opacity-60 border-l-4 border-gray-700', sectionTextGray: 'text-gray-300',
    subCardBg: 'bg-gray-800 bg-opacity-70',
    tableHeadBg: 'bg-gray-900 bg-opacity-80 text-yellow-500',
    tableRowHover: 'hover:bg-gray-700 hover:bg-opacity-80',
    inputBorder: 'border-gray-700',
    inputBg: 'bg-gray-900 bg-opacity-70',
    inputText: 'text-gray-100',
    placeholderText: 'placeholder-gray-500',
    buttonPrimary: 'bg-yellow-700 hover:bg-yellow-800 focus:ring-yellow-600 shadow-lg shadow-yellow-700/30',
    buttonSecondary: 'bg-gray-700 hover:bg-gray-800 focus:ring-gray-600',
  },
  techInvestor: {
    bg: 'bg-gradient-to-br from-blue-700 to-indigo-900',
    text: 'text-blue-100',
    cardBg: 'bg-white bg-opacity-10 backdrop-blur-md border border-blue-400',
    cardShadow: 'shadow-xl shadow-blue-500/30',
    headerText: 'text-cyan-300 font-sans tracking-tight',
    subHeaderText: 'text-blue-200',
    sectionBgBlue: 'bg-blue-800 bg-opacity-40 border-l-4 border-cyan-500', sectionTextBlue: 'text-cyan-200',
    sectionBgPurple: 'bg-purple-800 bg-opacity-40 border-l-4 border-fuchsia-500', sectionTextPurple: 'text-fuchsia-200',
    sectionBgIndigo: 'bg-indigo-800 bg-opacity-40 border-l-4 border-sky-500', sectionTextIndigo: 'text-sky-200',
    sectionBgGreen: 'bg-green-800 bg-opacity-40 border-l-4 border-emerald-500', sectionTextGreen: 'text-emerald-200',
    sectionBgOrange: 'bg-orange-800 bg-opacity-40 border-l-4 border-orange-500', sectionTextOrange: 'text-orange-200',
    sectionBgTeal: 'bg-teal-800 bg-opacity-40 border-l-4 border-teal-500', sectionTextTeal: 'text-teal-200',
    sectionBgYellow: 'bg-yellow-800 bg-opacity-40 border-l-4 border-amber-500', sectionTextYellow: 'text-amber-200',
    sectionBgGray: 'bg-gray-800 bg-opacity-40 border-l-4 border-gray-500', sectionTextGray: 'text-gray-200',
    subCardBg: 'bg-blue-900 bg-opacity-20',
    tableHeadBg: 'bg-blue-900 bg-opacity-30 text-blue-100',
    tableRowHover: 'hover:bg-blue-800 hover:bg-opacity-30',
    inputBorder: 'border-blue-500',
    inputBg: 'bg-blue-900 bg-opacity-20',
    inputText: 'text-blue-100',
    placeholderText: 'placeholder-blue-300',
    buttonPrimary: 'bg-cyan-500 hover:bg-cyan-600 focus:ring-cyan-400 shadow-md shadow-cyan-500/30',
    buttonSecondary: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500',
  },
  hedgeFund: {
    bg: 'bg-gray-950', // Almost black
    text: 'text-gray-50',
    cardBg: 'bg-neutral-900 border border-emerald-700', // Dark with a sharp green border
    cardShadow: 'shadow-lg shadow-emerald-900/50',
    headerText: 'text-emerald-400 font-mono tracking-tighter', // Monospace font, tight tracking
    subHeaderText: 'text-neutral-400',
    sectionBgBlue: 'bg-blue-900 bg-opacity-30 border-l-4 border-blue-500', sectionTextBlue: 'text-blue-200',
    sectionBgPurple: 'bg-purple-900 bg-opacity-30 border-l-4 border-purple-500', sectionTextPurple: 'text-purple-200',
    sectionBgIndigo: 'bg-indigo-900 bg-opacity-30 border-l-4 border-indigo-500', sectionTextIndigo: 'text-indigo-200',
    sectionBgGreen: 'bg-emerald-900 bg-opacity-30 border-l-4 border-emerald-500', sectionTextGreen: 'text-emerald-200',
    sectionBgOrange: 'bg-orange-900 bg-opacity-30 border-l-4 border-orange-500', sectionTextOrange: 'text-orange-200',
    sectionBgTeal: 'bg-teal-900 bg-opacity-30 border-l-4 border-teal-500', sectionTextTeal: 'text-teal-200',
    sectionBgYellow: 'bg-amber-900 bg-opacity-30 border-l-4 border-amber-500', sectionTextYellow: 'text-amber-200',
    sectionBgGray: 'bg-gray-800 bg-opacity-30 border-l-4 border-gray-500', sectionTextGray: 'text-gray-200',
    subCardBg: 'bg-neutral-800',
    tableHeadBg: 'bg-neutral-700 text-emerald-300',
    tableRowHover: 'hover:bg-neutral-700',
    inputBorder: 'border-emerald-700',
    inputBg: 'bg-neutral-800',
    inputText: 'text-gray-100',
    placeholderText: 'placeholder-neutral-500',
    buttonPrimary: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 shadow-lg shadow-emerald-600/30',
    buttonSecondary: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500',
  }
};


// Custom Tooltip Component for better styling
const TooltipComponent = ({ message, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative flex items-center justify-center group"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <div className="absolute z-10 bottom-full mb-2 p-2 text-xs text-white bg-blue-600 rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          {/* Tooltip arrow */}
          <div className="absolute left-1/2 -translate-x-1/2 w-0 h-0 border-t-[6px] border-l-[6px] border-r-[6px] border-t-blue-600 border-l-transparent border-r-transparent top-full"></div>
          {message}
        </div>
      )}
    </div>
  );
};

// Custom Dot for Buy/Sell Signals
const SignalDot = (props) => {
  const { cx, cy, stroke, payload } = props;
  const isBuy = payload.signal === 'B';

  if (payload.signal) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={8} fill={isBuy ? '#22c55e' : '#ef4444'} stroke={stroke} />
        <text x={cx} y={cy} dy={5} textAnchor="middle" fill="#fff" fontSize={12} fontWeight="bold">
          {payload.signal}
        </text>
      </g>
    );
  }
  return null;
};


// Main App component
const App = () => {
  // State for dynamic API parameters, loaded from localStorage or default
  const [currentAccountId, setCurrentAccountId] = useState(localStorage.getItem('currentAccountId') || '9158');
  const [currentSessionId, setCurrentSessionId] = useState(localStorage.getItem('currentSessionId') || '782546733');

  // Base URL for the API, now dynamic
  const BASE_API_URL = `https://smt.aethernagames.com/unity.php?accountid=${currentAccountId}&sess=${currentSessionId}`;

  // States to store different parts of the data fetched from API
  const [shareMarketData, setShareMarketData] = useState([]);
  const [newsSummaryData, setNewsSummaryData] = useState([]);
  const [selectedStockSymbol, setSelectedStockSymbol] = useState(null);
  const [shareDetailData, setShareDetailData] = useState(null);

  // States for loading and error management
  const [loadingMarket, setLoadingMarket] = useState(true); // Keep true for initial full load
  const [loadingShareDetail, setLoadingShareDetail] = useState(false); // Only for specific share detail fetch
  const [errorMarket, setErrorMarket] = useState(null);
  const [errorShareDetail, setErrorShareDetail] = useState(null);

  // States for stock screener filters
  const [filters, setFilters] = useState({
    minPrice: '', maxPrice: '',
    minVolume: '', maxVolume: '',
    minPE: '', maxPE: '',
    minPB: '', maxPB: '',
    minDividendYield: '', maxDividendYield: '',
  });

  // States for sorting
  const [sortColumn, setSortColumn] = useState('sID');
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'

  // State for LLM-generated analysis (individual stock analysis)
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [loadingAiAnalysis, setLoadingAiAnalysis] = useState(false);
  const [errorAiAnalysis, setErrorAiAnalysis] = useState(null);

  // States for AI Stock Picker feature
  const [aiPickedStocks, setAiPickedStocks] = useState('');
  const [loadingAiPickedStocks, setLoadingAiPickedStocks] = useState(false);
  const [errorAiPickedStocks, setErrorAiPickedStocks] = useState(null);

  // States for Recommended Portfolio feature
  const [aiRecommendedPortfolio, setAiRecommendedPortfolio] = useState('');
  const [loadingAiRecommendedPortfolio, setLoadingAiRecommendedPortfolio] = useState(false);
  const [errorAiRecommendedPortfolio, setErrorAiRecommendedPortfolio] = useState(null);

  // States for Market Q&A feature
  const [marketQuestion, setMarketQuestion] = useState('');
  const [aiMarketAnswer, setAiMarketAnswer] = useState('');
  const [loadingAiMarketAnswer, setLoadingAiMarketAnswer] = useState(false);
  const [errorAiMarketAnswer, setErrorAiMarketAnswer] = useState(null);

  // State for AI Hot Stocks
  const [aiHotStocks, setAiHotStocks] = useState('');
  const [loadingAiHotStocks, setLoadingAiHotStocks] = useState(false);
  const [errorAiHotStocks, setErrorAiHotStocks] = useState(null);

  // State for AI Industry Trends
  const [aiIndustryTrends, setAiIndustryTrends] = useState('');
  const [loadingAiIndustryTrends, setLoadingAiIndustryTrends] = useState(false);
  const [errorAiIndustryTrends, setErrorAiIndustryTrends] = useState(null);

  // State for AI Market Anomalies & Deals
  const [aiMarketAnomalies, setAiMarketAnomalies] = useState('');
  const [loadingAiMarketAnomalies, setLoadingAiMarketAnomalies] = useState(false);
  const [errorAiMarketAnomalies, setErrorAiMarketAnomalies] = useState(null);

  // State for theming
  const [currentTheme, setCurrentTheme] = useState('light'); // 'light', 'dark', 'wallstreet', 'techInvestor', 'hedgeFund'

  // State for User Strategy
  const [userStrategy, setUserStrategy] = useState('');

  // States for Trading Desk
  const [tradeSymbol, setTradeSymbol] = useState('');
  const [tradeQuantity, setTradeQuantity] = useState('');
  const [tradeType, setTradeType] = useState('buy'); // 'buy' or 'sell'
  const [tradeMessage, setTradeMessage] = useState('');
  const [loadingTrade, setLoadingTrade] = useState(false);

  // New state for user's available cash and portfolio value
  const [userProfile, setUserProfile] = useState({
    cash: null,
    portfolioValue: null,
    username: 'Guest' // Default username
  });
  const [loadingUserProfile, setLoadingUserProfile] = useState(false);
  const [errorUserProfile, setErrorUserProfile] = useState(null);

  // States for AI Investment Fund - now for multiple suggestions
  const [aiTradeSuggestions, setAiTradeSuggestions] = useState([]); // Array of {symbol, quantity, type, rationale}
  const [loadingAiTradeSuggestion, setLoadingAiTradeSuggestion] = useState(false);
  const [errorAiTradeSuggestion, setErrorAiTradeSuggestion] = useState(null);

  // State for user's portfolio holdings
  const [userPortfolio, setUserPortfolio] = useState([]);

  // States for Account Management
  const [accountProfiles, setAccountProfiles] = useState(() => {
    const savedProfiles = localStorage.getItem('accountProfiles');
    if (savedProfiles) {
      return JSON.parse(savedProfiles);
    }
    // Initialize with a default profile, now named for 'Polykratus'
    // The accountId and sessionId '9158', '782546733' are assumed to be the default game account.
    return [{ name: 'Polykratus (Default Game Account)', accountId: '9158', sessionId: '782546733' }];
  });
  const [showAccountManagementModal, setShowAccountManagementModal] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountIdInput, setNewAccountIdInput] = useState('');
  const [newSessionIdInput, setNewSessionIdInput] = useState('');

  // State for AI-generated welcome message
  const [welcomeMessage, setWelcomeMessage] = useState('Welcome, aspiring Tycoon!');
  const [loadingWelcomeMessage, setLoadingWelcomeMessage] = useState(false);
  const [errorWelcomeMessage, setErrorWelcomeMessage] = useState(null);

  // Firestore States
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false); // To track auth readiness
  const [portfolioHistory, setPortfolioHistory] = useState([]); // For P&L chart
  const [loadingPortfolioHistory, setLoadingPortfolioHistory] = useState(false);
  const [errorPortfolioHistory, setErrorPortfolioHistory] = useState(null);

  // Market Sentiment States
  const [marketSentiment, setMarketSentiment] = useState('Neutral');
  const [loadingMarketSentiment, setLoadingMarketSentiment] = useState(false);
  const [errorMarketSentiment, setErrorMarketSentiment] = useState(null);

  // Auto-refresh interval
  const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds

  // Consolidated loading and error checks - Defined here to ensure it's always in scope
  const initialLoadComplete = !loadingMarket; // Only market data is essential for initial load
  const overallError = errorMarket || errorShareDetail || errorAiAnalysis || errorAiPickedStocks || errorAiRecommendedPortfolio || errorAiMarketAnswer || errorAiHotStocks || errorAiIndustryTrends || errorAiMarketAnomalies || errorUserProfile || errorAiTradeSuggestion || errorWelcomeMessage || errorPortfolioHistory || errorMarketSentiment;

  // Get current theme classes
  const themeClasses = themes[currentTheme];


  // --- Helper function to format currency values with two decimal places (assuming API returns value * 100) ---
  const formatCurrency = (value) => {
    if (value === undefined || value === null || isNaN(value)) {
      return 'N/A';
    }
    // Divide by 100 to adjust for implied scaling, then format to 2 decimal places
    return (value / 100).toFixed(2).toLocaleString('en-US'); // Explicitly use 'en-US' for consistent comma separation
  };

  // --- Helper function to format large numbers with commas, no fixed decimals (e.g., Book Value, Market Capital, Shares Outstanding) ---
  const formatLargeNumber = (value) => {
    if (value === undefined || value === null || isNaN(value)) {
      return 'N/A';
    }
    // Directly apply toLocaleString for large whole numbers, no division or fixed decimals
    return value.toLocaleString('en-US'); // Explicitly use 'en-US' for consistent comma separation
  };

  // --- Helper function to calculate Simple Moving Average (SMA) ---
  const calculateSMA = (data, period, dataKey) => {
    if (!data || data.length < period) return [];
    return data.map((item, index, array) => {
      if (index >= period - 1) {
        const sum = array.slice(index - period + 1, index + 1).reduce((acc, d) => acc + d[dataKey], 0);
        return { ...item, [`sma${period}`]: sum / period };
      }
      return { ...item, [`sma${period}`]: null }; // Set to null if not enough data for period
    });
  };

  // --- Helper function to calculate Standard Deviation ---
  const calculateStdDev = (data, period, dataKey, smaKey) => {
    if (!data || data.length < period) return [];
    return data.map((item, index, array) => {
      if (index >= period - 1) {
        const slice = array.slice(index - period + 1, index + 1);
        const mean = item[smaKey]; // Use the SMA for the mean
        const sumOfSquares = slice.reduce((acc, d) => acc + Math.pow(d[dataKey] - mean, 2), 0);
        return { ...item, [`stdDev${period}`]: Math.sqrt(sumOfSquares / period) };
      }
      return { ...item, [`stdDev${period}`]: null };
    });
  };

  // --- Helper function to calculate Bollinger Bands ---
  const calculateBollingerBands = (data, period, dataKey) => {
      const dataWithSMA = calculateSMA(data, period, dataKey);
      const dataWithStdDev = calculateStdDev(dataWithSMA, period, dataKey, `sma${period}`);

      return dataWithStdDev.map(item => {
          if (item[`sma${period}`] !== null && item[`stdDev${period}`] !== null) {
              const upperBand = item[`sma${period}`] + (item[`stdDev${period}`] * 2);
              const lowerBand = item[`sma${period}`] - (item[`stdDev${period}`] * 2);
              return { ...item, upperBand, lowerBand };
          }
          return { ...item, upperBand: null, lowerBand: null };
      });
  };

  // --- Helper function to calculate RSI (Relative Strength Index) ---
  const calculateRSI = (data, period = 14, dataKey = 'price') => {
      if (!data || data.length < period) return [];

      let gainAvg = 0;
      let lossAvg = 0;
      const rsiData = [];

      // Initial average gain/loss calculation for the first 'period' entries
      for (let i = 1; i <= period; i++) {
          const change = data[i][dataKey] - data[i - 1][dataKey];
          if (change > 0) {
              gainAvg += change;
          } else {
              lossAvg += Math.abs(change);
          }
      }
      gainAvg /= period;
      lossAvg /= period;

      for (let i = period; i < data.length; i++) {
          const currentItem = data[i];
          const prevItem = data[i - 1];
          const change = currentItem[dataKey] - prevItem[dataKey];

          let currentGain = 0;
          let currentLoss = 0;
          if (change > 0) {
              currentGain = change;
          } else {
              currentLoss = Math.abs(change);
          }

          if (i === period) {
              // Use initial averages
          } else {
              // Smoothed averages
              gainAvg = ((gainAvg * (period - 1)) + currentGain) / period;
              lossAvg = ((lossAvg * (period - 1)) + currentLoss) / period;
          }

          const rs = lossAvg === 0 ? (gainAvg > 0 ? 100 : 0) : gainAvg / lossAvg; // Avoid division by zero
          const rsi = 100 - (100 / (1 + rs));

          rsiData.push({ ...currentItem, rsi: isNaN(rsi) ? null : rsi });
      }

      // Fill nulls for the initial period to match array length for charting
      const leadingNulls = Array(period).fill(null).map((_, index) => ({ ...data[index], rsi: null }));
      return [...leadingNulls, ...rsiData];
  };

  // --- Helper function to generate Buy/Sell Signals based on SMA Crossover ---
  const generateSignals = (data) => {
    return data.map((item, index, array) => {
      let signal = null;
      if (index > 0 && item.sma5 !== null && item.sma20 !== null) {
        // Buy signal: SMA5 crosses above SMA20
        if (array[index - 1].sma5 <= array[index - 1].sma20 && item.sma5 > item.sma20) {
          signal = 'B';
        }
        // Sell signal: SMA5 crosses below SMA20
        else if (array[index - 1].sma5 >= array[index - 1].sma20 && item.sma5 < item.sma20) {
          signal = 'S';
        }
      }
      return { ...item, signal };
    });
  };

  // --- Data preparation for charts with SMAs, Bollinger Bands, and Signals ---
  const prepareChartData = useCallback((historyArray) => {
    if (!historyArray || historyArray.length === 0) return [];
    // Reverse the array to ensure chronological order (oldest to newest) for chart plotting
    const chronologicalHistory = historyArray.slice().reverse();
    const baseData = chronologicalHistory.map((price, idx) => ({ index: idx + 1, price: price / 100 }));

    const dataWithSMA5 = calculateSMA(baseData, 5, 'price');
    const dataWithSMA20 = calculateSMA(dataWithSMA5, 20, 'price'); // Calculate SMA20 on data that already has SMA5

    const dataWithBollingerBands = calculateBollingerBands(dataWithSMA20, 20, 'price');

    const finalDataWithSignals = generateSignals(dataWithBollingerBands);

    const finalDataWithRSI = calculateRSI(finalDataWithSignals, 14, 'price'); // RSI is usually 14 periods

    return finalDataWithRSI; // Return data with RSI, which also contains SMAs and BBs
  }, []); // No dependencies, can be memoized


  // --- Firebase Initialization and Auth Management ---
  useEffect(() => {
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};

    try {
        const app = initializeApp(firebaseConfig);
        const firestoreDb = getFirestore(app);
        const firebaseAuth = getAuth(app);
        setDb(firestoreDb);
        setAuth(firebaseAuth);

        const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                if (typeof __initial_auth_token === 'undefined') {
                    try {
                        const anonymousUser = await signInAnonymously(firebaseAuth);
                        setUserId(anonymousUser.user.uid);
                    } catch (anonError) {
                        console.error("Anonymous sign-in failed:", anonError);
                        setUserId(crypto.randomUUID()); // Fallback to random ID
                    }
                } else {
                    try {
                        const customUser = await signInWithCustomToken(firebaseAuth, __initial_auth_token);
                        setUserId(customUser.user.uid);
                    } catch (tokenError) {
                        console.error("Custom token sign-in failed:", tokenError);
                        setUserId(crypto.randomUUID()); // Fallback to random ID
                    }
                }
            }
            setIsAuthReady(true); // Auth process is complete
        });

        return () => unsubscribe(); // Cleanup auth listener
    } catch (initError) {
        console.error("Firebase initialization failed:", initError);
        setIsAuthReady(true); // Mark as ready even on error
        setUserId(crypto.randomUUID()); // Fallback to random ID
    }
  }, []);

  // --- Save Portfolio Snapshot to Firestore ---
  const savePortfolioSnapshot = async (currentPortfolioValue, currentCash) => {
    if (!db || !userId) {
        console.warn("Firestore or userId not ready, cannot save snapshot.");
        return;
    }
    // Only save if there's valid data
    if (currentPortfolioValue === null || isNaN(currentPortfolioValue) || currentCash === null || isNaN(currentCash)) {
        console.warn("Invalid portfolio data, not saving snapshot.");
        return;
    }

    try {
        const portfolioHistoryRef = collection(db, `artifacts/${__app_id}/users/${userId}/portfolioHistory`);
        await setDoc(doc(portfolioHistoryRef), {
            timestamp: Date.now(),
            portfolioValue: currentPortfolioValue,
            cash: currentCash,
        });
        // console.log("Portfolio snapshot saved.");
    } catch (error) {
        console.error("Error saving portfolio snapshot:", error);
    }
  };

  // --- Fetch Portfolio History from Firestore (for P&L Chart) ---
  useEffect(() => {
    if (!db || !userId || !isAuthReady) {
        setLoadingPortfolioHistory(true); // Still loading until auth is ready
        return;
    }

    setLoadingPortfolioHistory(true);
    setErrorPortfolioHistory(null);

    const portfolioHistoryRef = collection(db, `artifacts/${__app_id}/users/${userId}/portfolioHistory`);
    // Order by timestamp and limit to recent entries for charting
    const q = query(portfolioHistoryRef, orderBy("timestamp", "desc"), limit(30)); // Last 30 snapshots

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const history = [];
        snapshot.forEach((doc) => {
            history.push(doc.data());
        });
        // Reverse to get chronological order for chart
        setPortfolioHistory(history.reverse());
        setLoadingPortfolioHistory(false);
    }, (error) => {
        console.error("Error fetching portfolio history:", error);
        setErrorPortfolioHistory(error.message);
        setLoadingPortfolioHistory(false);
    });

    return () => unsubscribe(); // Cleanup snapshot listener
  }, [db, userId, isAuthReady]); // Re-run when db, userId, or auth status changes


  // --- Fetch initial market data on component mount and for live refresh ---
  const fetchInitialData = async () => {
    setLoadingMarket(true);
    setErrorMarket(null);

    try {
      // Fetch market data
      const marketResponse = await fetch(`${BASE_API_URL}&f=getsharemarket`);
      if (!marketResponse.ok) throw new Error(`HTTP error! Status: ${marketResponse.status} for market data`);
      const marketData = await marketResponse.json();
      setShareMarketData(Array.isArray(marketData.sharemarket) ? marketData.sharemarket : []);
      setNewsSummaryData(Array.isArray(marketData.newssummary) ? marketData.newssummary : []);

      // Only set initial selected stock if not already selected
      if (!selectedStockSymbol && marketData.sharemarket && marketData.sharemarket.length > 0) {
        setSelectedStockSymbol(marketData.sharemarket[0].sID);
        setTradeSymbol(marketData.sharemarket[0].sID); // Set default for trading desk
      }

    } catch (err) {
      setErrorMarket(err.message);
      console.error("Failed to fetch initial data:", err);
    } finally {
      setLoadingMarket(false);
    }
  };

  // --- Fetch user profile and balance ---
  const fetchUserProfile = async () => {
    setLoadingUserProfile(true);
    setErrorUserProfile(null);
    try {
      // Using 'getprofiledetail' as requested
      const response = await fetch(`${BASE_API_URL}&f=getprofiledetail`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}. Body: ${errorText || 'No response body.'}`);
      }

      const text = await response.text(); // Read as text first

      let profileData = {};
      if (text) {
        try {
          profileData = JSON.parse(text); // Attempt to parse
        } catch (jsonError) {
          console.warn("User profile API returned non-JSON or malformed JSON. Using placeholder data.", jsonError);
          profileData = { profile: { c: 100000000, s: 150000000, dn: 'Tycoon' } }; // Fallback to placeholder if JSON parsing fails
        }
      } else {
        console.warn("User profile API returned an empty response. Using placeholder data.");
        profileData = { profile: { c: 100000000, s: 150000000, dn: 'Tycoon' } }; // Fallback to placeholder if response is empty
      }

      // Accessing values from the 'profile' nested object for getprofiledetail
      const currentCash = profileData.profile?.c || 100000000;
      const currentPortfolioValue = profileData.profile?.s || 150000000;

      setUserProfile({
        cash: currentCash,
        portfolioValue: currentPortfolioValue,
        username: profileData.profile?.dn || 'Tycoon'
      });

      // Save snapshot to Firestore
      savePortfolioSnapshot(currentPortfolioValue, currentCash);

    } catch (err) {
      setErrorUserProfile(err.message);
      console.error("Failed to fetch user profile:", err);
      // Always set some default/placeholder values if any error occurs during fetch or parse
      setUserProfile({ cash: 100000000, portfolioValue: 150000000, username: 'Tycoon' });
    } finally {
      setLoadingUserProfile(false);
    }
  };

  // --- Generate Welcome Message with LLM ---
  const generateWelcomeMessage = async (username, cash, portfolioValue, theme) => {
    setLoadingWelcomeMessage(true);
    setErrorWelcomeMessage(null);
    setWelcomeMessage('Generating a personalized welcome...');

    let prompt = '';
    if (theme === 'wallstreet') {
        prompt = `You are an astute financial strategist greeting a high-value client in a stock market simulation. Greet the player named '${username}', acknowledging their significant capital ($${formatCurrency(cash)}) and portfolio worth ($${formatCurrency(portfolioValue)}). Keep the message professional, concise (10-15 words), and emphasize the gravitas of their financial journey in a Wall Street context.`;
    } else if (theme === 'techInvestor') {
        prompt = `You are a visionary tech investment guru. Greet the player named '${username}', highlighting their digital wealth ($${formatCurrency(cash)}) and innovative portfolio ($${formatCurrency(portfolioValue)}). Be concise (10-15 words), focusing on future growth and technological edge.`;
    } else if (theme === 'hedgeFund') {
        prompt = `You are an elite quantitative analyst addressing a fund partner. Greet the player named '${username}', stating their formidable liquidity ($${formatCurrency(cash)}) and strategic asset base ($${formatCurrency(portfolioValue)}). Be direct, concise (10-15 words), and emphasize precision and performance.`;
    } else {
        prompt = `You are an encouraging mentor in a stock market simulation game. Greet the player named '${username}', acknowledging their current cash balance ($${formatCurrency(cash)}) and portfolio value ($${formatCurrency(portfolioValue)}). Keep the message very concise, around 10-15 words, focusing on welcoming them to their journey.`;
    }


    try {
        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });
        const payload = { contents: chatHistory };
        const apiKey = ""; // Canvas will automatically provide the API key
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text(); // Try to read response text even if not ok
            throw new Error(`HTTP error! Status: ${response.status}. Body: ${errorText || 'No response body.'}`);
        }

        const responseText = await response.text(); // Read as text first
        let result;
        try {
            result = JSON.parse(responseText); // Attempt to parse as JSON
        } catch (jsonError) {
            console.error('JSON parsing error for welcome message:', jsonError, 'Raw response:', responseText);
            throw new Error(`Failed to parse AI response: ${jsonError.message}. Raw: ${responseText.substring(0, 100)}...`);
        }

        if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            setWelcomeMessage(text);
        } else {
            setErrorWelcomeMessage('Failed to generate welcome message: No valid content from LLM.');
            console.error('LLM response structure unexpected for welcome message:', result);
            setWelcomeMessage(`Welcome, ${username}! Your journey as a Stock Market Tycoon begins now.`); // Fallback
        }
    } catch (err) {
        setErrorWelcomeMessage(`Failed to generate welcome message: ${err.message}.`);
        console.error('Error calling Gemini API for welcome message:', err);
        setWelcomeMessage(`Welcome, ${username}! Your journey as a Stock Market Tycoon begins now.`); // Fallback
    } finally {
        setLoadingWelcomeMessage(false);
    }
  };


  // Effect to load account profiles from localStorage on mount
  useEffect(() => {
    const savedProfiles = localStorage.getItem('accountProfiles');
    if (savedProfiles) {
      setAccountProfiles(JSON.parse(savedProfiles));
    } else {
      setAccountProfiles([{ name: 'Polykratus (Default Game Account)', accountId: '9158', sessionId: '782546733' }]);
    }
    setCurrentAccountId(localStorage.getItem('currentAccountId') || '9158');
    setCurrentSessionId(localStorage.getItem('currentSessionId') || '782546733');
    setCurrentTheme(localStorage.getItem('currentTheme') || 'light'); // Load theme
  }, []);

  // Effect to save account profiles to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('accountProfiles', JSON.stringify(accountProfiles));
  }, [accountProfiles]);

  // Effect to save current active account and theme to localStorage whenever it changes
  // And trigger data fetches for the new active account
  useEffect(() => {
    localStorage.setItem('currentAccountId', currentAccountId);
    localStorage.setItem('currentSessionId', currentSessionId);
    localStorage.setItem('currentTheme', currentTheme);
    if (currentAccountId && currentSessionId) {
        fetchInitialData();
        fetchUserProfile();
        setUserPortfolio([]); // Clear portfolio on account switch, it'll update on first trade
    }
  }, [currentAccountId, currentSessionId, currentTheme]); // Add currentAccountId, currentSessionId, currentTheme as dependencies


  // Effect to trigger welcome message generation when user profile loads/changes OR theme changes
  useEffect(() => {
    if (userProfile.username && userProfile.cash !== null && userProfile.portfolioValue !== null) {
      generateWelcomeMessage(userProfile.username, userProfile.cash, userProfile.portfolioValue, currentTheme);
    }
  }, [userProfile.username, userProfile.cash, userProfile.portfolioValue, currentTheme]); // Dependencies for welcome message


  // --- Auto-refresh interval setup ---
  useEffect(() => {
    const interval = setInterval(() => {
      fetchInitialData();
      fetchUserProfile();
      if (selectedStockSymbol) {
        // Only refresh detail for the currently selected stock if it's open
        fetchShareDetail();
      }
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval); // Clear interval on component unmount
  }, [selectedStockSymbol, currentAccountId, currentSessionId]); // Re-create interval if selected stock or account changes

  // --- Account Management Functions ---
  const addAccountProfile = () => {
    if (!newAccountName || !newAccountIdInput || !newSessionIdInput) {
      alert('Please fill in all fields for the new account profile.');
      return;
    }
    const newProfile = {
      name: newAccountName,
      accountId: newAccountIdInput,
      sessionId: newSessionIdInput
    };
    setAccountProfiles(prevProfiles => [...prevProfiles, newProfile]);
    setNewAccountName('');
    setNewAccountIdInput('');
    setNewSessionIdInput('');
    alert(`Account '${newAccountName}' added! You can now switch to it.`);
  };

  const switchAccount = (accountId, sessionId) => {
    setCurrentAccountId(accountId);
    setCurrentSessionId(sessionId);
    setShowAccountManagementModal(false); // Close modal after switching
    alert(`Switched to account with ID: ${accountId}`);
  };

  const deleteAccountProfile = (profileToDelete) => {
    if (accountProfiles.length === 1) {
      alert('You cannot delete the last account profile. Please add another one first.');
      return;
    }
    const isCurrentlyActive = profileToDelete.accountId === currentAccountId && profileToDelete.sessionId === currentSessionId;
    
    if (isCurrentlyActive) {
      alert('You cannot delete the currently active account. Please switch to another account first.');
      return;
    }

    setAccountProfiles(prevProfiles =>
      prevProfiles.filter(profile => !(profile.accountId === profileToDelete.accountId && profile.sessionId === profileToDelete.sessionId))
    );
    alert(`Account '${profileToDelete.name}' deleted.`);
  };


  // --- Fetch share detail data when selectedStockSymbol changes ---
  const fetchShareDetail = async () => {
    if (!selectedStockSymbol) {
      setShareDetailData(null);
      setAiAnalysis(''); // Clear previous analysis
      return;
    }

    setLoadingShareDetail(true);
    setErrorShareDetail(null);
    setAiAnalysis('');
    try {
      const response = await fetch(`${BASE_API_URL}&f=getsharedetail&s=${selectedStockSymbol}`);

      if (!response) {
          throw new Error("Failed to get a response object from the API.");
      }

      if (!response.ok) {
          let errorText = `HTTP error! Status: ${response.status}`;
          try {
              const text = await response.text();
              errorText += `, Body: ${text}`;
          } catch (bodyReadError) {
              errorText += ` (Failed to read response body: ${bodyReadError.message})`;
          }
          throw new Error(errorText);
      }
      
      const detailData = await response.json();
      setShareDetailData(detailData);
    } catch (err) {
      setErrorShareDetail(err.message);
      console.error(`Failed to fetch detail for ${selectedStockSymbol}:`, err);
    } finally {
      setLoadingShareDetail(false);
    }
  };

  // Call fetchShareDetail whenever selectedStockSymbol, account changes or when the component mounts
  useEffect(() => {
    fetchShareDetail();
  }, [selectedStockSymbol, currentAccountId, currentSessionId]);


  // --- LLM Integration: Get AI Stock Analysis (for selected stock) ---
  const getAiStockAnalysis = async () => {
    if (!shareDetailData || !shareDetailData.sharedetail) {
      setErrorAiAnalysis('No stock details available for AI analysis.');
      return;
    }

    setLoadingAiAnalysis(true);
    setErrorAiAnalysis(null);
    setAiAnalysis('');

    const stock = shareDetailData.sharedetail;
    const price = stock.lp / 100;
    const eps = stock.leps / 100;
    const bv = stock.bv;
    const ts = stock.ts; // Shares Outstanding
    const mostRecentDividends = stock.ld / 100;

    const peRatio = (eps !== 0) ? (price / eps).toFixed(2) : 'N/A';
    const pbRatio = (ts !== 0 && bv !== undefined) ? ((price) / (bv / ts)).toFixed(2) : 'N/A';
    const marketCapital = (price !== undefined && ts !== undefined) ? (price * ts) : 'N/A';
    const dividendYield = (price !== 0) ? ((mostRecentDividends / price) * 100).toFixed(2) : 'N/A';

    let newsArticles = '';
    if (shareDetailData.sharenews && shareDetailData.sharenews.length > 0) {
        newsArticles = shareDetailData.sharenews.map(news => `- ${news.h?.replace('%SID%', stock.sID || '').replace('%INAME%', stock.iID || '')}: ${news.d?.replace('%SID%', stock.sID || '').replace('%INAME%', stock.iID || '')}`).join('\n');
    } else {
        newsArticles = 'No recent specific news available for this stock.';
    }

    const orderSummaryInfo = shareDetailData.ordersummary ?
      `Order Book Summary:
- bq (Total Bid Quantity): Total shares buyers want to buy: ${shareDetailData.ordersummary.bq?.toLocaleString()}
- bn (Total Buyers): Number of unique buyers: ${shareDetailData.ordersummary.bn?.toLocaleString()}
- sq (Total Sell Quantity): Total shares sellers want to sell: ${Math.abs(shareDetailData.ordersummary.sq)?.toLocaleString()}
- sn (Total Sellers): Number of unique sellers: ${shareDetailData.ordersummary.sn?.toLocaleString()}\n` :
      'Order book data not available.';

    const prompt = `You are Ray Dalio, known for your systematic and principles-based approach to understanding markets and economies. Analyze the following *game data* for stock ${stock.n} (${stock.sID}). Focus on the underlying economic forces and cyclical patterns that might be influencing this stock. Provide a concise summary of the stock's current financial health, considering its position within the broader market system. Highlight any key positive or negative impacts from the news, and how order book dynamics might reflect market participants' behaviors. Finally, offer a **speculation** on its potential future movement (e.g., 'likely to rise short-term due to recent news and high bid quantity', 'may face headwinds', 'appears stable'), framing it within your principles. Keep the analysis to a maximum of 300 words. Focus on actionable insights for an investor within the game's context, reflecting your emphasis on understanding the "economic machine".
    
    Glossary of Terms:
    - lp: Last Price
    - lm: Last Movement (price change from previous close)
    - v: Volume (number of shares traded)
    - leps: Last Earnings Per Share
    - bv: Book Value (net asset value of a company per share)
    - ts: Total Shares Outstanding (total number of shares issued by the company)
    - ld: Last Dividends per Share (most recent dividend paid)
    - P/E Ratio: Price-to-Earnings Ratio (stock price / EPS)
    - P/B Ratio: Price-to-Book Ratio (stock price / book value per share)
    - Market Capital: Total value of a company's outstanding shares
    - bq: Total Bid Quantity (sum of shares buyers want to buy at current price levels)
    - bn: Total Buyers (number of unique buyers participating in the order book)
    - sq: Total Sell Quantity (sum of shares sellers want to sell at current price levels)
    - sn: Total Sellers (number of unique sellers participating in the order book)

    Current User Financials:
    - Available Cash: $${formatCurrency(userProfile.cash)}
    - Portfolio Value: $${formatCurrency(userProfile.portfolioValue)}
    ${userStrategy ? `User's Investment Strategy: "${userStrategy}"\n` : ''}
    
    Financial Data for ${stock.n} (${stock.sID}):
    - Last Price (lp): $${formatCurrency(stock.lp)}
    - Last EPS (leps): $${formatCurrency(stock.leps)}
    - Book Value (bv): $${formatLargeNumber(stock.bv)}
    - Shares Outstanding (ts): ${formatLargeNumber(stock.ts)}
    - P/E Ratio: ${peRatio}
    - P/B Ratio: ${pbRatio}
    - Market Capital: $${formatLargeNumber(marketCapital)}
    - Most Recent Dividends per Share (ld): $${formatCurrency(stock.ld)}
    - Dividend Yield: ${dividendYield}%
    - Volume (v): ${stock.v?.toLocaleString()}
    - Change ($) (lm): ${(stock.lm / 100).toFixed(2).toLocaleString('en-US')}
    - % Change: ${((stock.lm / stock.lp) * 100).toFixed(2)}%

    ${orderSummaryInfo}

    Recent News:
    ${newsArticles}
    `;

    try {
        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });
        const payload = { contents: chatHistory };
        const apiKey = ""; // Canvas will automatically provide the API key
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            setAiAnalysis(text);
        } else {
            setErrorAiAnalysis('AI analysis failed: No response from LLM.');
            console.error('LLM response structure unexpected:', result);
        }
    } catch (err) {
        setErrorAiAnalysis(`AI analysis failed: ${err.message}. Please try again.`);
        console.error('Error calling Gemini API for stock analysis:', err);
    } finally {
        setLoadingAiAnalysis(false);
    }
  };

  // --- LLM Integration: AI Stock Picker ---
  const getAiStockRecommendations = async () => {
    setLoadingAiPickedStocks(true);
    setErrorAiPickedStocks(null);
    setAiPickedStocks('');

    if (!shareMarketData || shareMarketData.length === 0) {
      setErrorAiPickedStocks('No market data to analyze for stock recommendations.');
      setLoadingAiPickedStocks(false);
      return;
    }

    // Prepare a condensed view of current market data for the LLM
    const marketOverview = shareMarketData.map(stock => { // Pass ALL market data
      const price = stock.lp / 100;
      const eps = stock.leps / 100;
      const bv = stock.bv;
      const ts = stock.ts;
      const mostRecentDividends = stock.ld / 100;

      const peRatio = (eps !== 0) ? (price / eps).toFixed(2) : 'N/A';
      const pbRatio = (ts !== 0 && bv !== undefined) ? ((price) / (bv / ts)).toFixed(2) : 'N/A';
      const dividendYield = (price !== 0) ? ((mostRecentDividends / price) * 100).toFixed(2) : 'N/A';

      // Include all relevant basic data for each stock
      return `${stock.n} (${stock.sID}): Price $${formatCurrency(stock.lp)}, Vol ${stock.v?.toLocaleString()}, Change $${(stock.lm / 100).toFixed(2)}, %Change ${((stock.lm / stock.lp) * 100).toFixed(2)}%, EPS ${formatCurrency(stock.leps)}, BV ${formatLargeNumber(stock.bv)}, Shares ${formatLargeNumber(stock.ts)}, Div ${formatCurrency(stock.ld)}, P/E ${peRatio}, P/B ${pbRatio}, Div. Yield ${dividendYield}%, Industry: ${stock.iID}`;
    }).join('\n');

    // Add general market news context
    let marketNewsContext = '';
    if (newsSummaryData && newsSummaryData.length > 0) {
      marketNewsContext = '\n\nRecent Global News Summary:\n' + newsSummaryData.map(news => `- ${news.h}: ${news.d}`).join('\n');
    }

    const prompt = `You are Cathie Wood, an investor known for identifying disruptive innovation and long-term growth trends. Based *only* on the following comprehensive *game data* for the live stock market and global news, and considering the user's current financial situation:
    - Available Cash: $${formatCurrency(userProfile.cash)}
    - Portfolio Value: $${formatCurrency(userProfile.portfolioValue)}
    ${userStrategy ? `User's Investment Strategy: "${userStrategy}"\n` : ''}
    
    Glossary of Terms:
    - lp: Last Price, lm: Last Movement (price change from previous close), v: Volume, leps: Last Earnings Per Share, bv: Book Value, ts: Total Shares Outstanding, ld: Last Dividends per Share, P/E Ratio: Price-to-Earnings Ratio, P/B Ratio: Price-to-Book Ratio, Industry: Industry ID

    Recommend 2-3 stocks that could be good long-term investments, focusing on companies that represent a significant innovative shift or have disruptive potential within the game's market. For each recommendation, briefly explain *why* it's a good choice based on its metrics and any relevant news within the game's context. Offer an optimistic and forward-looking perspective.
    
    Current Market Data:
    ${marketOverview}
    ${marketNewsContext}
    
    Please provide your answer concisely.`;

    try {
        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });
        const payload = { contents: chatHistory };
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            setAiPickedStocks(text);
        } else {
            setErrorAiPickedStocks('AI stock picker failed: No response from LLM.');
            console.error('LLM response structure unexpected:', result);
        }
    } catch (err) {
        setErrorAiPickedStocks(`AI stock picker failed: ${err.message}. Please try again.`);
        console.error('Error calling Gemini API for stock picking:', err);
    } finally {
        setLoadingAiPickedStocks(false);
    }
  };

  // --- LLM Integration: Recommended Portfolio ---
  const getAiRecommendedPortfolio = async () => {
    setLoadingAiRecommendedPortfolio(true);
    setErrorAiRecommendedPortfolio(null);
    setAiRecommendedPortfolio('');

    if (!shareMarketData || shareMarketData.length === 0) {
      setErrorAiRecommendedPortfolio('No market data to analyze for portfolio recommendations.');
      setLoadingAiRecommendedPortfolio(false);
      return;
    }

    // Prepare a more comprehensive view of current market data for the LLM
    const marketDataForPortfolio = shareMarketData.map(stock => {
      const price = stock.lp / 100;
      const eps = stock.leps / 100;
      const bv = stock.bv;
      const ts = stock.ts;
      const mostRecentDividends = stock.ld / 100;

      const peRatio = (eps !== 0) ? (price / eps).toFixed(2) : 'N/A';
      const pbRatio = (ts !== 0 && bv !== undefined) ? ((price) / (bv / ts)).toFixed(2) : 'N/A';
      const marketCapital = (price !== undefined && ts !== undefined) ? (price * ts) : 'N/A';
      const dividendYield = (price !== 0) ? ((mostRecentDividends / price) * 100).toFixed(2) : 'N/A';

      return {
        symbol: stock.sID,
        name: stock.n,
        price: price,
        volume: stock.v,
        eps: eps,
        bv: bv,
        sharesOutstanding: ts,
        peRatio: peRatio,
        pbRatio: pbRatio,
        marketCapital: marketCapital,
        mostRecentDividends: mostRecentDividends,
        dividendYield: dividendYield,
        change: stock.lm / 100,
        industry: stock.iID // Assuming iID is industry ID
      };
    });

    // Add general market news context
    let marketNewsContext = '';
    if (newsSummaryData && newsSummaryData.length > 0) {
      marketNewsContext = '\n\nRecent Global News Summary:\n' + newsSummaryData.map(news => `- ${news.h}: ${news.d}`).join('\n');
    }

    const prompt = `You are Benjamin Graham, the father of value investing. Given the following live *game data* for the stock market, and considering the user's current financial situation:
    - Available Cash: $${formatCurrency(userProfile.cash)}
    - Portfolio Value: $${formatCurrency(userProfile.portfolioValue)}
    ${userStrategy ? `User's Investment Strategy: "${userStrategy}"\n` : ''}
    
    Glossary of Terms:
    - lp: Last Price, v: Volume, leps: Last Earnings Per Share, bv: Book Value, ts: Total Shares Outstanding, ld: Last Dividends per Share, P/E Ratio: Price-to-Earnings Ratio, P/B Ratio: Price-to-Book Ratio, Market Capital: Total value of a company's outstanding shares

    Please recommend a balanced investment portfolio of 3-5 stocks that exhibit a "margin of safety" and represent solid intrinsic value within this game's market. For each recommended stock, state its symbol, name, and a concise reason for its inclusion, including a hypothetical allocation percentage (e.g., "AAPL (Apple): 25% - Strong brand, consistent growth"). Emphasize fundamental analysis and a patient, disciplined approach. Crucially, explain your overall portfolio strategy (e.g., "Growth-oriented with diversification across industries," "Value-focused with a strong dividend component," "Balanced for moderate risk") *based on the game's market dynamics*. Incorporate any relevant insights from the overall market data, including volumes and news.

    Available Stocks Data (JSON array):
    ${JSON.stringify(marketDataForPortfolio, null, 2)}
    ${marketNewsContext}
    
    Please provide your response in a clear, structured format.`;

    try {
        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });
        const payload = { contents: chatHistory };
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            setAiRecommendedPortfolio(text);
        } else {
            setErrorAiRecommendedPortfolio('AI portfolio recommendation failed: No response from LLM.');
            console.error('LLM response structure unexpected:', result);
        }
    } catch (err) {
        setErrorAiRecommendedPortfolio(`AI portfolio recommendation failed: ${err.message}. Please try again.`);
        console.error('Error calling Gemini API for portfolio recommendation:', err);
    } finally {
        setLoadingAiRecommendedPortfolio(false);
    }
  };

  // --- LLM Integration: Market Q&A ---
  const handleMarketQuestion = async () => {
    if (!marketQuestion.trim()) {
      setErrorAiMarketAnswer('Please enter a question to ask the AI.');
      return;
    }

    setLoadingAiMarketAnswer(true);
    setErrorAiMarketAnswer(null);
    setAiMarketAnswer('');

    if (!shareMarketData || shareMarketData.length === 0) {
        setErrorAiMarketAnswer('No market data available to answer questions. Please wait for data to load.');
        setLoadingAiMarketAnswer(false);
        return;
    }

    // Prepare a detailed string representation of market data for the LLM
    // This will be more helpful for answering specific questions about stats
    const detailedMarketData = shareMarketData.map(stock => {
        const price = stock.lp / 100;
        const change = stock.lm / 100;
        const volume = stock.v;
        const eps = stock.leps / 100;
        const bv = stock.bv;
        const ts = stock.ts; // Shares Outstanding
        const mostRecentDividends = stock.ld / 100;

        const peRatio = (eps !== 0) ? (price / eps).toFixed(2) : 'N/A';
        const pbRatio = (ts !== 0 && bv !== undefined) ? ((price) / (bv / ts)).toFixed(2) : 'N/A';
        const marketCapital = (price !== undefined && ts !== undefined) ? (price * ts) : 'N/A';
        const dividendYield = (price !== 0) ? ((mostRecentDividends / price) * 100).toFixed(2) : 'N/A';

        return `Stock: ${stock.n} (Symbol: ${stock.sID}), Price (lp): ${price.toFixed(2)}, Change ($) (lm): ${change.toFixed(2)}, Percent Change: ${((change / price) * 100).toFixed(2)}%, Volume (v): ${volume}, EPS (leps): ${eps.toFixed(2)}, Book Value (bv): ${bv}, Shares Outstanding (ts): ${ts}, P/E Ratio: ${peRatio}, P/B Ratio: ${pbRatio}, Market Capital: ${marketCapital}, Most Recent Dividends (ld): ${mostRecentDividends.toFixed(2)}, Dividend Yield: ${dividendYield}%`;
    }).join('\n');

    // Include detailed order book information if a stock is selected
    let detailedOrderBook = '';
    if (selectedStockSymbol && shareDetailData && shareDetailData.ordersummary) {
        const os = shareDetailData.ordersummary;
        detailedOrderBook = `\n\nOrder Book Details for selected stock (${selectedStockSymbol}):
- Total Bid Quantity (bq): ${os.bq?.toLocaleString()}
- Total Buyers (bn): ${os.bn?.toLocaleString()}
- Total Sell Quantity (sq): ${Math.abs(os.sq)?.toLocaleString()}
- Total Sellers (sn): ${os.sn?.toLocaleString()}
Detailed Orders (first 5):
${shareDetailData.orders?.slice(0,5).map(order => `- Type: ${order.q > 0 ? 'Buy' : 'Sell'}, Qty: ${Math.abs(order.q)?.toLocaleString()}, Price: $${formatCurrency(order.p)}`).join('\n') || 'N/A'}
`;
    }

    // Provide some context for the LLM from news summary
    let marketNewsContext = '';
    if (newsSummaryData && newsSummaryData.length > 0) {
      marketNewsContext = '\n\nRecent Global News Summary:\n' + newsSummaryData.map(news => `- ${news.h}: ${news.d}`).join('\n');
    }

    const prompt = `You are Peter Lynch, an investor known for his common-sense approach and "invest in what you know" philosophy. Your task is to answer the user's question about the *game stock market* based *only* on the provided live *game data*. Use clear, simple language and avoid overly academic jargon. If the information needed to answer the question is not present in the provided data, state that you cannot answer it with the current information, and perhaps suggest where one might find such information in the "real world" context. Be concise and informative. When referring to specific stocks, use their full name and symbol.
    
    Glossary of Terms:
    - lp: Last Price, lm: Last Movement (price change from previous close), v: Volume, leps: Last Earnings Per Share, bv: Book Value, ts: Total Shares Outstanding, ld: Last Dividends per Share, P/E Ratio: Price-to-Earnings Ratio, P/B Ratio: Price-to-Book Ratio, Market Capital: Total value of a company's outstanding shares
    - bq: Total Bid Quantity, bn: Total Buyers, sq: Total Sell Quantity, sn: Total Sellers (from Order Book)

    Current User Financials:
    - Available Cash: $${formatCurrency(userProfile.cash)}
    - Portfolio Value: $${formatCurrency(userProfile.portfolioValue)}
    ${userStrategy ? `User's Investment Strategy: "${userStrategy}".` : ''}

    Here is the current live *game market data* for all available stocks:
    ${detailedMarketData}
    ${detailedOrderBook}
    ${marketNewsContext}
    
    User's Question: ${marketQuestion}
    
    Please provide your answer strictly using the provided data.`;

    try {
        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });
        const payload = { contents: chatHistory };
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            setAiMarketAnswer(text);
        } else {
            setErrorAiMarketAnswer('AI market Q&A failed: No response from LLM.');
            console.error('LLM response structure unexpected:', result);
        }
    } catch (err) {
        setErrorAiMarketAnswer(`AI market Q&A failed: ${err.message}. Please try again.`);
        console.error('Error calling Gemini API for market Q&A:', err);
    } finally {
        setLoadingAiMarketAnswer(false);
    }
  };

  // --- LLM Integration: Get AI Hot Stocks ---
  const getAiHotStocks = async () => {
    setLoadingAiHotStocks(true);
    setErrorAiHotStocks(null);
    setAiHotStocks('');

    if (!shareMarketData || shareMarketData.length === 0) {
      setErrorAiHotStocks('No market data to analyze for hot stocks.');
      setLoadingAiHotStocks(false);
      return;
    }

    const sortedByChange = [...shareMarketData].sort((a, b) => (b.lm / 100) - (a.lm / 100)); // Sort by change in dollars
    const topGainers = sortedByChange.slice(0, 3);
    const topLosers = sortedByChange.slice(-3).reverse(); // Get bottom 3 and reverse for descending order of loss

    let hotStocksData = '';
    if (topGainers.length > 0) {
        hotStocksData += 'Top 3 Gainers:\n';
        topGainers.forEach(stock => {
            hotStocksData += `- ${stock.n} (${stock.sID}): Price (lp) $${formatCurrency(stock.lp)}, Change ($) (lm) $${(stock.lm / 100).toFixed(2)}, %Change ${((stock.lm / stock.lp) * 100).toFixed(2)}%, Volume (v): ${stock.v?.toLocaleString()}, EPS: ${formatCurrency(stock.leps)}, BV: ${formatLargeNumber(stock.bv)}, Shares: ${formatLargeNumber(stock.ts)}, Div: ${formatCurrency(stock.ld)}\n`;
        });
    }
    if (topLosers.length > 0) {
        hotStocksData += '\nTop 3 Losers:\n';
        topLosers.forEach(stock => {
            hotStocksData += `- ${stock.n} (${stock.sID}): Price (lp) $${formatCurrency(stock.lp)}, Change ($) (lm) $${(stock.lm / 100).toFixed(2)}, %Change ${((stock.lm / stock.lp) * 100).toFixed(2)}%, Volume (v): ${stock.v?.toLocaleString()}, EPS: ${formatCurrency(stock.leps)}, BV: ${formatLargeNumber(stock.bv)}, Shares: ${formatLargeNumber(stock.ts)}, Div: ${formatCurrency(stock.ld)}\n`;
        });
    }

    // Add general market news context
    let marketNewsContext = '';
    if (newsSummaryData && newsSummaryData.length > 0) {
      marketNewsContext = '\n\nRecent Global News Summary:\n' + newsSummaryData.map(news => `- ${news.h}: ${news.d}`).join('\n');
    }

    const prompt = `You are Jesse Livermore, a legendary stock operator known for observing market movements and anticipating trends. Based *only* on the following *game data* for hot stocks (top gainers and losers) and global news, and considering the user's current financial situation:
    - Available Cash: $${formatCurrency(userProfile.cash)}
    - Portfolio Value: $${formatCurrency(userProfile.portfolioValue)}
    ${userStrategy ? `User's Investment Strategy: "${userStrategy}"\n` : ''}
    
    Glossary of Terms:
    - lp: Last Price, lm: Last Movement (price change from previous close), v: Volume, leps: Last Earnings Per Share, bv: Book Value, ts: Total Shares Outstanding, ld: Last Dividends per Share

    Analyze the "hot stocks" data to identify significant price and volume movements. Describe the momentum (upward or downward) and any patterns you observe that suggest market sentiment or speculative activity. Correlate with global news if it appears relevant. Offer a speculative outlook on these movers.

    Hot Stocks Game Data:
    ${hotStocksData}
    ${marketNewsContext}

    Keep the analysis to a maximum of 250 words and focus on insights relevant to the game's market, delivered in a direct, observational style.`;

    try {
        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });
        const payload = { contents: chatHistory };
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            setAiHotStocks(text);
        } else {
            setErrorAiHotStocks('AI hot stocks analysis failed: No response from LLM.');
            console.error('LLM response structure unexpected:', result);
        }
    } catch (err) {
        setErrorAiHotStocks(`AI hot stocks analysis failed: ${err.message}. Please try again.`);
        console.error('Error calling Gemini API for hot stocks:', err);
    } finally {
        setLoadingAiHotStocks(false);
    }
  };

  // --- LLM Integration: Get AI Industry Trends ---
  const getAiIndustryTrends = async () => {
    setLoadingAiIndustryTrends(true);
    setErrorAiIndustryTrends(null);
    setAiIndustryTrends('');

    if (!shareMarketData || shareMarketData.length === 0) {
      setErrorAiIndustryTrends('No market data to analyze for industry trends.');
      setLoadingAiIndustryTrends(false);
      return;
    }

    const industryData = {};
    shareMarketData.forEach(stock => {
        const industry = stock.iID || 'Unknown';
        if (!industryData[industry]) {
            industryData[industry] = { totalChange: 0, totalVolume: 0, stockCount: 0, stocks: [] };
        }
        industryData[industry].totalChange += stock.lm / 100;
        industryData[industry].totalVolume += stock.v;
        industryData[industry].stockCount++;
        industryData[industry].stocks.push({
            symbol: stock.sID,
            name: stock.n,
            price: stock.lp / 100,
            change: stock.lm / 100,
            volume: stock.v,
        });
    });

    let industrySummary = '';
    for (const industry in industryData) {
        const avgChange = (industryData[industry].totalChange / industryData[industry].stockCount).toFixed(2);
        const totalVolume = industryData[industry].totalVolume.toLocaleString();
        const topStocksInIndustry = industryData[industry].stocks
            .sort((a,b) => Math.abs(b.change) - Math.abs(a.change))
            .slice(0, 3)
            .map(s => `${s.name} (${s.symbol}): Price $${s.price.toFixed(2)}, Change $${s.change.toFixed(2)}`).join('; ');

        industrySummary += `- Industry: ${industry}, Avg Change: ${avgChange}, Total Volume: ${totalVolume}, Stocks: ${industryData[industry].stockCount}. Top Movers: ${topStocksInIndustry}\n`;
    }

    // Add general market news context
    let marketNewsContext = '';
    if (newsSummaryData && newsSummaryData.length > 0) {
      marketNewsContext = '\n\nRecent Global News Summary:\n' + newsSummaryData.map(news => `- ${news.h}: ${news.d}`).join('\n');
    }

    const prompt = `You are Mary Meeker, known for your insightful internet and technology trends reports. Based *only* on the following aggregated *game data* for industry performance and global news, and considering the user's current financial situation:
    - Available Cash: $${formatCurrency(userProfile.cash)}
    - Portfolio Value: $${formatCurrency(userProfile.portfolioValue)}
    ${userStrategy ? `User's Investment Strategy: "${userStrategy}"\n` : ''}
    
    Glossary of Terms:
    - lm: Last Movement (price change from previous close), v: Volume (number of shares traded)

    Identify and summarize any noticeable trends across industries. Comment on industries showing significant gains, losses, or high activity, and correlate with news if applicable, emphasizing how these trends might shape the future of the game's market. Provide a visionary and analytical perspective.

    Industry Performance Game Data:
    ${industrySummary}
    ${marketNewsContext}

    Keep the analysis to a maximum of 300 words and focus on insights relevant to the game's market.`;

    try {
        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });
        const payload = { contents: chatHistory };
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            setAiIndustryTrends(text);
        } else {
            setErrorAiIndustryTrends('AI industry trends analysis failed: No response from LLM.');
            console.error('LLM response structure unexpected:', result);
        }
    } catch (err) {
        setErrorAiIndustryTrends(`AI industry trends analysis failed: ${err.message}. Please try again.`);
        console.error('Error calling Gemini API for industry trends:', err);
    } finally {
        setLoadingAiIndustryTrends(false);
    }
  };

  // --- LLM Integration: Get AI Market Anomalies & Deals ---
  const getAiMarketAnomalies = async () => {
    setLoadingAiMarketAnomalies(true);
    setErrorAiMarketAnomalies(null);
    setAiMarketAnomalies('');

    if (!shareMarketData || shareMarketData.length === 0) {
      setErrorAiMarketAnomalies('No market data to analyze for anomalies.');
      setLoadingAiMarketAnomalies(false);
      return;
    }

    let potentialDeals = [];
    
    shareMarketData.forEach(stock => {
        // Ensure properties are valid numbers before calculations and toFixed
        const rawPrice = typeof stock.lp === 'number' ? stock.lp : 0;
        const price = rawPrice / 100;

        const bv = typeof stock.bv === 'number' ? stock.bv : 0;
        const ts = typeof stock.ts === 'number' ? stock.ts : 0;

        const rawChange = typeof stock.lm === 'number' ? stock.lm : 0;
        const change = rawChange / 100;

        const volume = typeof stock.v === 'number' ? stock.v : 0;

        const rawMostRecentDividends = typeof stock.ld === 'number' ? stock.ld : 0;
        const mostRecentDividends = rawMostRecentDividends / 100;
        
        const percent_change = price && change !== undefined && price !== 0 ? (change / price) * 100 : 0;

        const peRatio = (stock.leps !== 0) ? (price / stock.leps) : Infinity;
        const pbRatio = (ts !== 0 && bv !== undefined) ? (price / (bv / ts)) : Infinity;
        const dividendYield = (price !== 0) ? ((mostRecentDividends / price) * 100) : 0;

        // Order Book Information (if available in the full market data, which might not be for summary)
        // For anomalies across *all* stocks, we mainly infer from price/volume volatility.
        // Assuming bq, sq, bn, sn are from getsharedetail, not getsharemarket for all stocks.
        // So, we'll infer 'order book thinness' from significant price change on low volume.
        const orderSummary = shareDetailData?.ordersummary; // This only works if stock is currently selected and detail is loaded
        let bidQuantity = 'N/A', sellQuantity = 'N/A', buyersNum = 'N/A', sellersNum = 'N/A';
        if (orderSummary && selectedStockSymbol === stock.sID) {
            bidQuantity = orderSummary.bq;
            sellQuantity = Math.abs(orderSummary.sq);
            buyersNum = orderSummary.bn;
            sellersNum = orderSummary.sn;
        }


        // Criteria for potential "deals" or "anomalies" (these are examples and can be refined)
        // 1. Significantly undervalued based on P/B and recent price drop (potential rebound)
        if (pbRatio < 1.0 && change < -0.5 && volume > 1000) { // Example: PB less than 1, price dropped by >$0.5, decent volume
            potentialDeals.push({
                type: 'Undervalued Value Play',
                stock: stock.n,
                symbol: stock.sID,
                price: price,
                change: change,
                pbRatio: pbRatio,
                volume: volume,
                percent_change: percent_change,
                comment: `Potentially undervalued (P/B: ${pbRatio.toFixed(2)}) with a recent dip, might be a buying opportunity.`,
                orderBookInfo: `(Bid Q: ${bidQuantity}, Sell Q: ${sellQuantity})`
            });
        }
        // 2. High dividend yield with stable/positive change (potential income opportunity)
        if (dividendYield > 5.0 && change >= 0) { // Example: Dividend yield >5%, non-negative change
            potentialDeals.push({
                type: 'High Income Potential',
                stock: stock.n,
                symbol: stock.sID,
                price: price,
                dividendYield: dividendYield,
                change: change,
                percent_change: percent_change,
                comment: `Attractive dividend yield (${dividendYield.toFixed(2)}%) with stable performance for income strategy.`,
                orderBookInfo: `(Bid Q: ${bidQuantity}, Sell Q: ${sellQuantity})`
            });
        }
        // 3. Unusually high volume compared to typical volume for a low-priced stock (potential speculative activity)
        if (volume > 50000 && price < 50 && Math.abs(change) > 0.1) { // Example: Very high volume for cheap stock with some movement
            potentialDeals.push({
                type: 'High Volume Speculation',
                stock: stock.n,
                symbol: stock.sID,
                price: price,
                volume: volume,
                change: change,
                percent_change: percent_change,
                comment: `Significant volume suggests active trading, potentially indicating speculative interest.`,
                orderBookInfo: `(Bid Q: ${bidQuantity}, Sell Q: ${sellQuantity})`
            });
        }
        // 4. Potential Thin Order Book / Price Impact (Inferred: Large % change on relatively moderate volume)
        // This implies that not much volume was needed to move the price significantly.
        const moderateVolumeThreshold = 20000; // Example threshold for moderate volume
        const significantPercentChange = 7; // Example threshold for significant % change
        if (Math.abs(percent_change) > significantPercentChange && volume < moderateVolumeThreshold && volume > 100) { // Volume > 100 to exclude truly inactive stocks
            potentialDeals.push({
                type: 'Thin Market Volatility',
                stock: stock.n,
                symbol: stock.sID,
                price: price,
                change: change,
                percent_change: percent_change,
                volume: volume,
                comment: `A large percentage move (${percent_change.toFixed(2)}%) on relatively low volume suggests a thin market/order book, which could lead to rapid price swings.`,
                orderBookInfo: `(Bid Q: ${bidQuantity}, Sell Q: ${sellQuantity})`
            });
        }
        // 5. Order Book Imbalance (Directly for the currently selected stock if detailData is available)
        if (selectedStockSymbol === stock.sID && orderSummary) {
            const imbalanceRatio = (orderSummary.bq || 0) / ((Math.abs(orderSummary.sq) || 1)); // Avoid division by zero
            if (imbalanceRatio > 2 && orderSummary.bq > 500) { // Much more buy demand
                potentialDeals.push({
                    type: 'Strong Buy Pressure (Order Book)',
                    stock: stock.n,
                    symbol: stock.sID,
                    price: price,
                    bidQuantity: orderSummary.bq,
                    askQuantity: Math.abs(orderSummary.sq),
                    comment: `High total bid quantity (${orderSummary.bq.toLocaleString()}) vs. sell quantity suggests strong immediate demand from buyers.`,
                    orderBookInfo: `(Bid Q: ${orderSummary.bq}, Sell Q: ${Math.abs(orderSummary.sq)})`
                });
            } else if (imbalanceRatio < 0.5 && Math.abs(orderSummary.sq) > 500) { // Much more sell pressure
                potentialDeals.push({
                    type: 'Strong Sell Pressure (Order Book)',
                    stock: stock.n,
                    symbol: stock.sID,
                    price: price,
                    bidQuantity: orderSummary.bq,
                    askQuantity: Math.abs(orderSummary.sq),
                    comment: `High total sell quantity (${Math.abs(orderSummary.sq).toLocaleString()}) vs. bid quantity indicates potential downward pressure from sellers.`
                });
            }
        }
    });

    let anomaliesSummary = '';
    if (potentialDeals.length > 0) {
        anomaliesSummary += 'Identified Potential Anomalies/Deals (Game Data):\n';
        potentialDeals.slice(0, 7).forEach((deal, index) => { // Limit to top 7 examples
            anomaliesSummary += `${index + 1}. Type: ${deal.type}, Stock: ${deal.stock} (${deal.symbol}), Price: $${deal.price.toFixed(2)}, Change: ${deal.change.toFixed(2)}, % Change: ${deal.percent_change ? deal.percent_change.toFixed(2) + '%' : 'N/A'}\n`;
            if (deal.pbRatio !== undefined && deal.pbRatio !== Infinity) anomaliesSummary += `   P/B Ratio: ${deal.pbRatio.toFixed(2)}\n`;
            if (deal.dividendYield !== undefined) anomaliesSummary += `   Dividend Yield: ${deal.dividendYield.toFixed(2)}%\n`;
            if (deal.volume !== undefined) anomaliesSummary += `   Volume: ${deal.volume.toLocaleString()}\n`;
            if (deal.orderBookInfo) anomaliesSummary += `   Order Book Info: ${deal.orderBookInfo}\n`;
            if (deal.comment) anomaliesSummary += `   Insight: ${deal.comment}\n`;
        });
    } else {
        anomaliesSummary = 'No significant market anomalies or outstanding deals identified based on current criteria.';
    }

    // Add general market news context
    let marketNewsContext = '';
    if (newsSummaryData && newsSummaryData.length > 0) {
      marketNewsContext = '\n\nRecent Global News Summary:\n' + newsSummaryData.map(news => `- ${news.h}: ${news.d}`).join('\n');
    }

    const prompt = `You are Michael Burry, known for finding "Big Shorts" and identifying unusual market opportunities through rigorous, contrarian analysis. Based *only* on the provided *game data* (including stock financials, price/volume movements, and general news) and the identified patterns, provide a speculative analysis of these potential opportunities. Explicitly state that these are *speculations* and not guaranteed profits, highlighting any inherent risks. Your analysis should mention factors like price-to-book (P/B), dividend yield, implied market liquidity/order book thinness (derived from price-volume relationships), and direct order book imbalances (Total Bid Quantity 'bq', Total Sell Quantity 'sq', Total Buyers 'bn', Total Sellers 'sn' if available).
    
    Current User Financials:
    - Available Cash: $${formatCurrency(userProfile.cash)}
    - Portfolio Value: $${formatCurrency(userProfile.portfolioValue)}
    ${userStrategy ? `User's Investment Strategy: "${userStrategy}"\n` : ''}

    Glossary of Terms:
    - lp: Last Price, lm: Last Movement (price change from previous close), v: Volume, leps: Last Earnings Per Share, bv: Book Value, ts: Total Shares Outstanding, ld: Last Dividends per Share, P/E Ratio: Price-to-Earnings Ratio, P/B Ratio: Price-to-Book Ratio, Market Capital: Total value of a company's outstanding shares
    - bq: Total Bid Quantity, bn: Total Buyers, sq: Total Sell Quantity, sn: Total Sellers (from Order Book)

    Identified Potential Anomalies/Deals Game Data:
    ${anomaliesSummary}
    ${marketNewsContext}

    Explain why these might be considered opportunities or anomalies in the game, and offer a speculative outlook with a cautious yet incisive tone. If no anomalies are found, explain why the market seems stable, perhaps indicating a lack of mispricings. Keep the analysis to a maximum of 400 words.`;

    try {
        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });
        const payload = { contents: chatHistory };
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            setAiMarketAnomalies(text);
        } else {
            setErrorAiMarketAnomalies('AI market anomalies analysis failed: No response from LLM.');
            console.error('LLM response structure unexpected:', result);
        }
    } catch (err) {
        setErrorAiAnomalies(`AI market anomalies analysis failed: ${err.message}. Please try again.`);
        console.error('Error calling Gemini API for market anomalies:', err);
    } finally {
        setLoadingAiMarketAnomalies(false);
    }
  };

  // --- LLM Integration: AI Investment Fund - Suggest Trade ---
  const getAiTradeSuggestion = async () => {
    setLoadingAiTradeSuggestion(true);
    setErrorAiTradeSuggestion(null);
    setAiTradeSuggestions([]); // Clear previous suggestions

    if (!shareMarketData || shareMarketData.length === 0) {
      setErrorAiTradeSuggestion('No market data available for AI to suggest trades.');
      setLoadingAiTradeSuggestion(false);
      return;
    }

    // Prepare comprehensive market data for the AI to analyze
    const comprehensiveMarketData = shareMarketData.map(stock => {
      const price = stock.lp / 100;
      const eps = stock.leps / 100;
      const bv = stock.bv;
      const ts = stock.ts;
      const mostRecentDividends = stock.ld / 100;

      const peRatio = (eps !== 0) ? (price / eps).toFixed(2) : 'N/A';
      const pbRatio = (ts !== 0 && bv !== undefined) ? ((price) / (bv / ts)).toFixed(2) : 'N/A';
      const marketCapital = (price !== undefined && ts !== undefined) ? (price * ts) : 'N/A';
      const dividendYield = (price !== 0) ? ((mostRecentDividends / price) * 100).toFixed(2) : 'N/A';

      return {
        symbol: stock.sID,
        name: stock.n,
        price: price,
        volume: stock.v,
        change: stock.lm / 100,
        percentChange: ((stock.lm / stock.lp) * 100).toFixed(2) + '%',
        eps: eps,
        bv: bv,
        sharesOutstanding: ts,
        peRatio: peRatio,
        pbRatio: pbRatio,
        marketCapital: marketCapital,
        mostRecentDividends: mostRecentDividends,
        dividendYield: dividendYield,
        industry: stock.iID,
        // Include user's current holdings for the AI to consider
        userHoldingsQuantity: userPortfolio.find(h => h.sID === stock.sID)?.q || 0
      };
    });

    const marketNewsContext = newsSummaryData && newsSummaryData.length > 0 ?
      '\n\nRecent Global News Summary:\n' + newsSummaryData.map(news => `- ${news.h}: ${news.d}`).join('\n') :
      '';

    const prompt = `You are an advanced AI investment fund manager for a *game's stock market*, akin to a sophisticated quantitative fund like Renaissance Technologies. Your goal is to identify 1-3 optimal trades (buy or sell) for the user to execute, maximizing potential profit or minimizing loss based on the provided live *game data*. Prioritize diversification across different stock symbols if a strong rationale exists for multiple. However, if a single strong opportunity presents itself, it's fine to recommend just one. Your recommendations should be precise, data-driven, and focused on generating superior risk-adjusted returns within the game's mechanics.
    
    Current User Financials:
    - Available Cash: $${formatCurrency(userProfile.cash)}
    - Portfolio Value: $${formatCurrency(userProfile.portfolioValue)}
    ${userStrategy ? `User's Investment Strategy: "${userStrategy}"\n` : ''}

    Glossary of Terms:
    - lp: Last Price, lm: Last Movement (price change from previous close), v: Volume, leps: Last Earnings Per Share, bv: Book Value, ts: Total Shares Outstanding, ld: Last Dividends per Share, P/E Ratio: Price-to-Earnings Ratio, P/B Ratio: Price-to-Book Ratio, Market Capital: Total value of a company's outstanding shares
    - bq: Total Bid Quantity, bn: Total Buyers, sq: Total Sell Quantity, sn: Total Sellers (from Order Book)
    - userHoldingsQuantity: The quantity of this stock currently held by the user.

    Available Stocks and Market Data (JSON array):
    ${JSON.stringify(comprehensiveMarketData, null, 2)}
    ${marketNewsContext}

    Consider all factors including price movements, volume, financial ratios (P/E, P/B, Dividend Yield), recent news, and the user's available cash and investment strategy.

    Your response must be structured as a JSON array of trade suggestions. Each object in the array must have the following fields:
    -   **Symbol:** [Stock Symbol, e.g., "AET"]
    -   **Quantity:** [Number of shares. Positive for buy, negative for sell. Use 9983991 for "buy all available funds" of this stock. Use -99999991 for "sell all shares" of this stock.]
    -   **Type:** [ "buy", "sell", "buyallvalue", or "sellall" ] - Use "buyallvalue" if Quantity is 9983991. Use "sellall" if Quantity is -99999991. Otherwise, use "buy" or "sell".
    -   **Rationale:** [A detailed explanation (max 150 words) of why this specific trade is recommended, referencing the provided data and the user's strategy, with a focus on quantitative reasoning and efficiency.]

    If no immediate trades are recommended, return an empty array and explain why in a separate text output (which you don't need to format in JSON). Ensure suggested quantities do not exceed available cash for buys (unless 'buyallvalue'), or available shares for sells (unless 'sellall').
    `;

    try {
        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });
        
        // Request a JSON response for structured trade suggestions
        const payload = {
            contents: chatHistory,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            Symbol: { type: "STRING" },
                            Quantity: { type: "NUMBER" },
                            Type: { type: "STRING" },
                            Rationale: { type: "STRING" }
                        },
                        required: ["Symbol", "Quantity", "Type", "Rationale"]
                    }
                }
            }
        };

        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
            const jsonText = result.candidates[0].content.parts[0].text;
            try {
                const parsedSuggestions = JSON.parse(jsonText);
                if (Array.isArray(parsedSuggestions)) {
                    setAiTradeSuggestions(parsedSuggestions);
                } else {
                    setErrorAiTradeSuggestion(`AI trade suggestion failed: Expected an array but got a different structure. Raw: ${jsonText}`);
                }
            } catch (jsonError) {
                setErrorAiTradeSuggestion(`AI trade suggestion failed: Could not parse JSON response. Raw: ${jsonText}. Error: ${jsonError.message}`);
                console.error('JSON parsing error:', jsonError, 'Raw JSON:', jsonText);
            }
        } else {
            setErrorAiTradeSuggestion('AI trade suggestion failed: No structured response from LLM.');
            console.error('LLM response structure unexpected:', result);
        }
    } catch (err) {
        setErrorAiTradeSuggestion(`AI trade suggestion failed: ${err.message}. Please try again.`);
        console.error('Error calling Gemini API for trade suggestion:', err);
    } finally {
        setLoadingAiTradeSuggestion(false);
    }
  };


  // --- Trading Functions ---
  const executeTrade = async (symbol, quantity, tradeTypeParam) => {
    setLoadingTrade(true);
    setTradeMessage('');

    let actualQuantity = quantity;
    let tradeUrl;
    let tradeTParam; // To hold the 't' parameter for the API

    if (tradeTypeParam === 'sellall') {
        tradeUrl = `${BASE_API_URL}&f=dosharetrade&s=${symbol}&t=sellallmarket`;
    } else if (tradeTypeParam === 'buyallvalue') { // New case for "buy all available"
        // Use the specified quantity for "buy all money available" which is 9983991
        actualQuantity = 9983991;
        tradeTParam = 'value'; // The 't' parameter for this operation
        tradeUrl = `${BASE_API_URL}&f=dosharetrade&s=${symbol}&q=${actualQuantity}&t=${tradeTParam}`;
    } else { // Standard buy/sell with custom quantity
        actualQuantity = (tradeTypeParam === 'sell') ? -Math.abs(quantity) : Math.abs(quantity);
        tradeTParam = 'market'; // Standard market order type
        tradeUrl = `${BASE_API_URL}&f=dosharetrade&s=${symbol}&q=${actualQuantity}&t=${tradeTParam}`;
    }

    try {
      const response = await fetch(tradeUrl);
      if (!response.ok) {
        // Attempt to parse JSON even if not ok, as the game API returns JSON errors
        const errorResult = await response.json();
        const errorMessage = errorResult.msgbox?.d || `HTTP error! Status: ${response.status}`;
        setTradeMessage(`Trade failed: ${errorMessage}`); // Use detailed message
        // Do not update portfolio if trade failed
        return; // Exit if initial response is not ok
      }
      const result = await response.json();
      if (result.msgbox && result.msgbox.d) {
        setTradeMessage(result.msgbox.d); // Directly use the detailed message from msgbox.d for both success and failure
        // Only refresh data and update portfolio if the trade was successful based on the message content
        if (result.msgbox.d.includes('Order Completed') || result.msgbox.d.includes('accepted')) {
            fetchInitialData();
            fetchUserProfile(); // Refresh user balance after a trade and save snapshot
            if (selectedStockSymbol === symbol) {
                fetchShareDetail(); // Refresh detail for the traded stock
            }
            // Update user portfolio from the response
            if (Array.isArray(result.portfolio)) {
                setUserPortfolio(result.portfolio);
            }
        }
      } else {
        setTradeMessage(`Trade failed: Unexpected response from game API. Check console for details.`);
        console.error("Trade API returned unexpected structure:", result);
      }
    } catch (error) {
      setTradeMessage(`Error executing trade: ${error.message}`);
      console.error('Trading error:', error);
    } finally {
      setLoadingTrade(false);
    }
  };

  // --- LLM Integration: Get Market Sentiment ---
  const getMarketSentiment = async () => {
    setLoadingMarketSentiment(true);
    setErrorMarketSentiment(null);
    setMarketSentiment('Analyzing...');

    if (!shareMarketData.length && !newsSummaryData.length) {
        setErrorMarketSentiment('Not enough data to determine market sentiment.');
        setLoadingMarketSentiment(false);
        return;
    }

    const marketPerformance = shareMarketData.map(stock => { // Pass ALL market data for comprehensive analysis
        const price = stock.lp / 100;
        const change = stock.lm / 100;
        const percentChange = (price !== 0 && change !== undefined) ? ((change / price) * 100).toFixed(2) : 'N/A';
        return `${stock.n} (${stock.sID}): Price $${price.toFixed(2)}, Change ${change.toFixed(2)} (${percentChange}%), Volume: ${stock.v?.toLocaleString()}`;
    }).join('\n');

    const newsHeadlines = newsSummaryData.map(news => `- ${news.h}: ${news.d}`).join('\n'); // Pass all news

    const prompt = `You are an AI market psychologist named Daniel Kahneman. Analyze the overall sentiment of the *game stock market* based on the following data, focusing on how human cognitive biases and emotional responses might be shaping current market behavior:

    Current Market Performance (All stocks):
    ${marketPerformance}

    Recent Global News Headlines:
    ${newsHeadlines}

    Considering the price movements, overall volume, and the tone of the news, describe the current market sentiment using one of these categories: "Extremely Fearful", "Fearful", "Neutral", "Greedy", "Extremely Greedy". Provide a brief, one-sentence rationale for your assessment, highlighting the psychological underpinning.`;

    try {
        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });
        const payload = { contents: chatHistory };
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            // Attempt to extract the sentiment word (e.g., "Fearful")
            const sentimentMatch = text.match(/(Extremely Fearful|Fearful|Neutral|Greedy|Extremely Greedy)/);
            if (sentimentMatch) {
                setMarketSentiment(sentimentMatch[0]); // Set just the sentiment word
            } else {
                setMarketSentiment('Neutral'); // Fallback if parsing fails
                console.warn('Could not parse specific sentiment from LLM response:', text);
            }
        } else {
            setMarketSentiment('Neutral'); // Fallback
            setErrorMarketSentiment('Failed to determine market sentiment: No response from LLM.');
        }
    } catch (err) {
        setErrorMarketSentiment(`Failed to determine market sentiment: ${err.message}.`);
        setMarketSentiment('Neutral'); // Fallback
    } finally {
        setLoadingMarketSentiment(false);
    }
  };


  // --- Filter and Sort Logic ---
  const filteredAndSortedStocks = [...shareMarketData].filter(stock => {
    const price = stock.lp / 100;
    const volume = stock.v;
    const eps = stock.leps / 100;
    const bv = stock.bv;
    const ts = stock.ts; // Shares Outstanding
    const mostRecentDividends = stock.ld / 100; // Most Recent Dividends

    const peRatio = (eps !== 0) ? (price / eps) : NaN;
    const pbRatio = (ts !== 0 && bv !== undefined) ? (price / (bv / ts)) : NaN;
    const dividendYield = (price !== 0) ? (mostRecentDividends / price) * 100 : NaN;

    // Apply filters
    if (filters.minPrice !== '' && price < parseFloat(filters.minPrice)) return false;
    if (filters.maxPrice !== '' && price > parseFloat(filters.maxPrice)) return false;
    if (filters.minVolume !== '' && volume < parseInt(filters.minVolume)) return false;
    if (filters.maxVolume !== '' && volume > parseInt(filters.maxVolume)) return false;
    if (filters.minPE !== '' && (isNaN(peRatio) || peRatio < parseFloat(filters.minPE))) return false;
    if (filters.maxPE !== '' && (isNaN(peRatio) || peRatio > parseFloat(filters.maxPE))) return false;
    if (filters.minPB !== '' && (isNaN(pbRatio) || pbRatio < parseFloat(filters.minPB))) return false;
    if (filters.maxPB !== '' && (isNaN(pbRatio) || pbRatio > parseFloat(filters.maxPB))) return false;
    if (filters.minDividendYield !== '' && (isNaN(dividendYield) || dividendYield < parseFloat(filters.minDividendYield))) return false;
    if (filters.maxDividendYield !== '' && (isNaN(dividendYield) || dividendYield > parseFloat(filters.maxDividendYield))) return false;

    return true;
  }).sort((a, b) => {
    let aValue, bValue;

    // Helper to get raw values for sorting
    const getSortValue = (stock, column) => {
      switch (column) {
        case 'n': return stock.n; // Stock Name
        case 'lp': return stock.lp; // Price
        case 'lm': return stock.lm; // Change ($)
        case 'v': return stock.v; // Volume
        case 'leps': return stock.leps; // Last EPS
        case 'bv': return stock.bv; // Book Value
        case 'peRatio':
          const pe = (stock.leps !== undefined && stock.leps !== 0) ? (stock.lp / stock.leps) : NaN;
          return isNaN(pe) ? -Infinity : pe; // Handle N/A for sorting
        case 'pbRatio':
          const pb = (stock.ts !== undefined && stock.ts !== 0 && stock.bv !== undefined) ? ((stock.lp / 100) / (stock.bv / stock.ts)) : NaN;
          return isNaN(pb) ? -Infinity : pb; // Handle N/A for sorting
        case 'marketCapital':
          const mc = (stock.lp !== undefined && stock.ts !== undefined) ? (stock.lp / 100 * stock.ts) : NaN;
          return isNaN(mc) ? -Infinity : mc;
        case 'ts': return stock.ts; // Shares Outstanding
        case 'ld': // Most Recent Dividends (raw API value)
          return stock.ld;
        case 'dividendYield':
          const dy = (stock.lp !== 0) ? ((stock.ld / 100) / (stock.lp / 100)) * 100 : NaN;
          return isNaN(dy) ? -Infinity : dy;
        default: return stock[column];
      }
    };

    aValue = getSortValue(a, sortColumn);
    bValue = getSortValue(b, sortColumn);

    // Numeric comparison
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    // String comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    return 0;
  });


  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };


  if (!initialLoadComplete) { // Show full loading screen only if initial load hasn't completed
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 font-inter p-4">
        <div className="text-xl text-gray-700 flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Fetching initial market data...
        </div>
      </div>
    );
  }

  // Display errors if any, once initial load is complete
  if (overallError) { // Check overallError here
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 font-inter p-4">
        <p className="text-xl text-red-600">Error: {overallError}</p>
        <p className="text-lg text-gray-600 ml-4">Please check the API endpoints or your network connection.</p>
      </div>
    );
  }

  // Get the currently selected stock in the Trading Desk for Quick Actions
  const selectedTradingDeskStock = shareMarketData.find(stock => stock.sID === tradeSymbol);

  // Determine button text based on loading state and available data for the TRADING DESK's selected stock
  const getQuickBuySellButtonText = (isBuy) => {
    if (!selectedTradingDeskStock) {
      return isBuy ? 'Quick Buy All (Select Stock)' : 'Quick Sell All (Select Stock)';
    }
    const stockName = selectedTradingDeskStock.n;
    if (stockName) {
      return isBuy ? `Quick Buy All Available Cash for ${stockName}` : `Quick Sell All Shares of ${stockName}`;
    }
    // Fallback if name is not available but symbol is
    return isBuy ? `Quick Buy All Available Cash for ${selectedTradingDeskStock.sID}` : `Quick Sell All Shares of ${selectedTradingDeskStock.sID}`;
  };

  // Map sentiment to a value for the bar and color
  const sentimentValueMap = {
    'Extremely Fearful': 0,
    'Fearful': 25,
    'Neutral': 50,
    'Greedy': 75,
    'Extremely Greedy': 100,
  };

  const sentimentColorMap = {
    'Extremely Fearful': 'bg-red-700',
    'Fearful': 'bg-red-500',
    'Neutral': 'bg-yellow-500',
    'Greedy': 'bg-green-500',
    'Extremely Greedy': 'bg-green-700',
  };

  const sentimentProgressBarWidth = sentimentValueMap[marketSentiment] || 50; // Default to neutral

  return (
    <div className={`${themeClasses.bg} min-h-screen p-4 sm:p-6 lg:p-8 font-inter transition-colors duration-300`}>
      <div className={`${themeClasses.cardBg} max-w-7xl mx-auto rounded-lg ${themeClasses.cardShadow} p-6 sm:p-8 space-y-8`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-3xl sm:text-4xl font-bold ${themeClasses.headerText} text-center flex-grow`}>
            Apex Investor Platform
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAccountManagementModal(true)}
              className="px-3 py-2 bg-indigo-500 text-white font-semibold rounded-md shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-colors duration-200 text-sm"
            >
              Manage Accounts
            </button>
            <div className="relative">
              <select
                value={currentTheme}
                onChange={(e) => setCurrentTheme(e.target.value)}
                className={`p-2 rounded-md ${themeClasses.inputBg} ${themeClasses.inputText} border ${themeClasses.inputBorder}`}
              >
                <option value="light">☀️ Light</option>
                <option value="dark">🌙 Dark</option>
                <option value="wallstreet">🏛️ Wall Street</option>
                <option value="techInvestor">💻 Tech Investor</option>
                <option value="hedgeFund">💰 Hedge Fund</option>
              </select>
            </div>
          </div>
        </div>

        {/* Account Management Modal */}
        {showAccountManagementModal && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className={`${themeClasses.cardBg} rounded-lg ${themeClasses.cardShadow} p-6 w-full max-w-md`}>
                    <h2 className={`text-2xl font-bold ${themeClasses.headerText} mb-4`}>Manage Accounts</h2>
                    
                    {/* Current Active Account */}
                    <div className="mb-4 p-3 rounded-md border-2 border-green-500 bg-green-500/10">
                        <h3 className={`text-lg font-semibold ${themeClasses.inputText} mb-2`}>Currently Active:</h3>
                        <p className={`${themeClasses.subHeaderText} text-sm`}>
                            Name: {accountProfiles.find(p => p.accountId === currentAccountId && p.sessionId === currentSessionId)?.name || 'N/A'}
                        </p>
                        <p className={`${themeClasses.subHeaderText} text-sm`}>
                            Account ID: {currentAccountId}
                        </p>
                        <p className={`${themeClasses.subHeaderText} text-sm`}>
                            Session ID: {currentSessionId}
                        </p>
                    </div>

                    {/* Add New Account Form */}
                    <div className="mb-6 border-t pt-4 mt-4 border-gray-600">
                        <h3 className={`text-xl font-semibold ${themeClasses.headerText} mb-3`}>Add New Account Profile</h3>
                        <div className="space-y-3">
                            <div>
                                <label htmlFor="newAccountName" className={`block text-sm font-medium ${themeClasses.subHeaderText} mb-1`}>Profile Name</label>
                                <input
                                    type="text"
                                    id="newAccountName"
                                    value={newAccountName}
                                    onChange={(e) => setNewAccountName(e.target.value)}
                                    className={`w-full p-2 border ${themeClasses.inputBorder} rounded-md ${themeClasses.inputBg} ${themeClasses.inputText} ${themeClasses.placeholderText}`}
                                    placeholder="e.g., My Main Account"
                                />
                            </div>
                            <div>
                                <label htmlFor="newAccountIdInput" className={`block text-sm font-medium ${themeClasses.subHeaderText} mb-1`}>Account ID</label>
                                <input
                                    type="text"
                                    id="newAccountIdInput"
                                    value={newAccountIdInput}
                                    onChange={(e) => setNewAccountIdInput(e.target.value)}
                                    className={`w-full p-2 border ${themeClasses.inputBorder} rounded-md ${themeClasses.inputBg} ${themeClasses.inputText} ${themeClasses.placeholderText}`}
                                    placeholder="Enter Account ID"
                                />
                            </div>
                            <div>
                                <label htmlFor="newSessionIdInput" className={`block text-sm font-medium ${themeClasses.subHeaderText} mb-1`}>Session ID</label>
                                <input
                                    type="text"
                                    id="newSessionIdInput"
                                    value={newSessionIdInput}
                                    onChange={(e) => setNewSessionIdInput(e.target.value)}
                                    className={`w-full p-2 border ${themeClasses.inputBorder} rounded-md ${themeClasses.inputBg} ${themeClasses.inputText} ${themeClasses.placeholderText}`}
                                    placeholder="Enter Session ID"
                                />
                            </div>
                            <button
                                onClick={addAccountProfile}
                                className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
                            >
                                Add New Profile
                            </button>
                        </div>
                    </div>

                    {/* Existing Account Profiles List */}
                    <div>
                        <h3 className={`text-xl font-semibold ${themeClasses.headerText} mb-3`}>Saved Profiles</h3>
                        {accountProfiles.length === 0 ? (
                            <p className={`${themeClasses.subHeaderText}`}>No saved account profiles. Add one above!</p>
                        ) : (
                            <ul className="space-y-3 max-h-48 overflow-y-auto pr-2">
                                {accountProfiles.map((profile, index) => (
                                    <li key={index} className={`${themeClasses.subCardBg} p-3 rounded-md shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center`}>
                                        <div className={`${themeClasses.inputText} text-sm`}>
                                            <p><strong>{profile.name}</strong></p>
                                            <p className="text-xs text-gray-500">ID: {profile.accountId}, Sess: {profile.sessionId}</p>
                                        </div>
                                        <div className="flex gap-2 mt-2 sm:mt-0">
                                            <button
                                                onClick={() => switchAccount(profile.accountId, profile.sessionId)}
                                                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
                                                disabled={profile.accountId === currentAccountId && profile.sessionId === currentSessionId}
                                            >
                                                {profile.accountId === currentAccountId && profile.sessionId === currentSessionId ? 'Active' : 'Switch'}
                                            </button>
                                            <button
                                                onClick={() => deleteAccountProfile(profile)}
                                                className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors"
                                                disabled={profile.accountId === currentAccountId && profile.sessionId === currentSessionId || accountProfiles.length === 1}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <button
                        onClick={() => setShowAccountManagementModal(false)}
                        className="w-full mt-6 px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors duration-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        )}


        {/* Welcome and Account Info */}
        <div className={`${themeClasses.cardBg} rounded-lg ${themeClasses.cardShadow} p-4 sm:p-6 mb-8`}>
          {loadingWelcomeMessage ? (
              <p className={`text-2xl font-bold ${themeClasses.headerText} mb-3 animate-pulse`}>
                Generating welcome message...
              </p>
          ) : (
              <h2 className={`text-2xl font-bold ${themeClasses.headerText} mb-3`}>
                {welcomeMessage}
              </h2>
          )}
          {errorWelcomeMessage && (
            <p className="text-red-500 text-sm mt-2">{errorWelcomeMessage}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <p className={`${themeClasses.subHeaderText} text-lg`}>
              <strong>Available Cash:</strong> {loadingUserProfile ? 'Loading...' : `$${formatCurrency(userProfile.cash)}`}
            </p>
            <p className={`${themeClasses.subHeaderText} text-lg`}>
              <strong>Portfolio Value:</strong> {loadingUserProfile ? 'Loading...' : `$${formatCurrency(userProfile.portfolioValue)}`}
            </p>
            {errorUserProfile && (
                <p className="text-red-500 text-sm mt-2 col-span-full">Error fetching profile: {errorUserProfile}. Using placeholder data.</p>
            )}
          </div>
        </div>

        {/* Market Mood by Daniel Kahneman (Fear & Greed Bar) */}
        <div className={`${themeClasses.sectionBgGreen} p-4 rounded-lg ${themeClasses.cardShadow}`}>
          <TooltipComponent message="Daniel Kahneman analyzes market sentiment based on psychological biases and emotional states, providing a 'Fear & Greed' assessment.">
            <h2 className={`text-2xl font-semibold ${themeClasses.sectionTextGreen} mb-4`}>Market Mood by Daniel Kahneman</h2>
          </TooltipComponent>
          <div className="flex justify-center mb-4"> {/* Centering the button */}
              <button
                onClick={getMarketSentiment}
                className={`px-4 py-2 ${themeClasses.buttonPrimary} text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 w-fit`}
                disabled={loadingMarketSentiment || shareMarketData.length === 0}
              >
                {loadingMarketSentiment ? 'Analyzing Market Mood...' : '🧠 Assess Market Mood'}
              </button>
          </div>
          {errorMarketSentiment && (
            <p className="text-red-500 text-sm mt-2">{errorMarketSentiment}</p>
          )}
          {marketSentiment && (
            <div className="mt-4">
              <p className={`text-lg font-bold ${themeClasses.inputText} mb-2`}>Current Market Sentiment: {marketSentiment}</p>
              <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                <div
                  className={`${sentimentColorMap[marketSentiment]} h-4 rounded-full transition-all duration-500 ease-in-out`}
                  style={{ width: `${sentimentProgressBarWidth}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1 px-1">
                <span className={`${currentTheme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Extremely Fearful</span>
                <span className={`${currentTheme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Neutral</span>
                <span className={`${currentTheme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Extremely Greedy</span>
              </div>
            </div>
          )}
        </div>


        {/* User Strategy Input */}
        <div className={`${themeClasses.sectionBgBlue} p-4 rounded-lg ${themeClasses.cardShadow}`}>
            <h2 className={`text-2xl font-semibold ${themeClasses.sectionTextBlue} mb-4`}>Your Investment Strategy</h2>
            <p className={`text-sm ${themeClasses.subHeaderText} mb-2`}>
                Describe your investment philosophy (e.g., "aggressive growth," "long-term value," "dividend income focus," "risk-averse"). This will help the AI tailor its recommendations based on *your* approach to the *game's market*.
            </p>
            <textarea
                value={userStrategy}
                onChange={(e) => setUserStrategy(e.target.value)}
                placeholder="e.g., I focus on high-growth tech stocks with strong fundamentals and innovative products."
                rows="3"
                className={`w-full p-2 border ${themeClasses.inputBorder} rounded-md ${themeClasses.inputBg} ${themeClasses.inputText} ${themeClasses.placeholderText} focus:ring-blue-500 focus:border-blue-500`}
            ></textarea>
        </div>


        {/* Stock Screener Filters */}
        <div className={`${themeClasses.sectionBgIndigo} p-4 rounded-lg ${themeClasses.cardShadow}`}>
          <TooltipComponent message="Filter stocks based on various financial metrics like price, volume, P/E ratio, and dividend yield.">
            <h2 className={`text-2xl font-semibold ${themeClasses.sectionTextIndigo} mb-4`}>Stock Screener</h2>
          </TooltipComponent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <label htmlFor="minPrice" className={`text-sm font-medium ${themeClasses.subHeaderText} mb-1`}>Min Price</label>
              <input type="number" id="minPrice" name="minPrice" value={filters.minPrice} onChange={handleFilterChange} className={`p-2 border ${themeClasses.inputBorder} rounded-md ${themeClasses.inputBg} ${themeClasses.inputText} ${themeClasses.placeholderText}`} placeholder="e.g., 100.00" />
            </div>
            <div className="flex flex-col">
              <label htmlFor="maxPrice" className={`text-sm font-medium ${themeClasses.subHeaderText} mb-1`}>Max Price</label>
              <input type="number" id="maxPrice" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} className={`p-2 border ${themeClasses.inputBorder} rounded-md ${themeClasses.inputBg} ${themeClasses.inputText} ${themeClasses.placeholderText}`} placeholder="e.g., 500.00" />
            </div>
            <div className="flex flex-col">
              <label htmlFor="minVolume" className={`text-sm font-medium ${themeClasses.subHeaderText} mb-1`}>Min Volume</label>
              <input type="number" id="minVolume" name="minVolume" value={filters.minVolume} onChange={handleFilterChange} className={`p-2 border ${themeClasses.inputBorder} rounded-md ${themeClasses.inputBg} ${themeClasses.inputText} ${themeClasses.placeholderText}`} placeholder="e.g., 1000" />
            </div>
            <div className="flex flex-col">
              <label htmlFor="maxVolume" className={`text-sm font-medium ${themeClasses.subHeaderText} mb-1`}>Max Volume</label>
              <input type="number" id="maxVolume" name="maxVolume" value={filters.maxVolume} onChange={handleFilterChange} className={`p-2 border ${themeClasses.inputBorder} rounded-md ${themeClasses.inputBg} ${themeClasses.inputText} ${themeClasses.placeholderText}`} placeholder="e.g., 100000" />
            </div>
            <div className="flex flex-col">
              <label htmlFor="minPE" className={`text-sm font-medium ${themeClasses.subHeaderText} mb-1`}>Min P/E Ratio</label>
              <input type="number" id="minPE" name="minPE" value={filters.minPE} onChange={handleFilterChange} className={`p-2 border ${themeClasses.inputBorder} rounded-md ${themeClasses.inputBg} ${themeClasses.inputText} ${themeClasses.placeholderText}`} placeholder="e.g., 10" />
            </div>
            <div className="flex flex-col">
              <label htmlFor="maxPE" className={`text-sm font-medium ${themeClasses.subHeaderText} mb-1`}>Max P/E Ratio</label>
              <input type="number" id="maxPE" name="maxPE" value={filters.maxPE} onChange={handleFilterChange} className={`p-2 border ${themeClasses.inputBorder} rounded-md ${themeClasses.inputBg} ${themeClasses.inputText} ${themeClasses.placeholderText}`} placeholder="e.g., 30" />
            </div>
            <div className="flex flex-col">
              <label htmlFor="minPB" className={`text-sm font-medium ${themeClasses.subHeaderText} mb-1`}>Min P/B Ratio</label>
              <input type="number" id="minPB" name="minPB" value={filters.minPB} onChange={handleFilterChange} className={`p-2 border ${themeClasses.inputBorder} rounded-md ${themeClasses.inputBg} ${themeClasses.inputText} ${themeClasses.placeholderText}`} placeholder="e.g., 1" />
            </div>
            <div className="flex flex-col">
              <label htmlFor="maxPB" className={`text-sm font-medium ${themeClasses.subHeaderText} mb-1`}>Max P/B Ratio</label>
              <input type="number" id="maxPB" name="maxPB" value={filters.maxPB} onChange={handleFilterChange} className={`p-2 border ${themeClasses.inputBorder} rounded-md ${themeClasses.inputBg} ${themeClasses.inputText} ${themeClasses.placeholderText}`} placeholder="e.g., 5" />
            </div>
            <div className="flex flex-col">
              <label htmlFor="minDividendYield" className={`text-sm font-medium ${themeClasses.subHeaderText} mb-1`}>Min Div. Yield (%)</label>
              <input type="number" id="minDividendYield" name="minDividendYield" value={filters.minDividendYield} onChange={handleFilterChange} className={`p-2 border ${themeClasses.inputBorder} rounded-md ${themeClasses.inputBg} ${themeClasses.inputText} ${themeClasses.placeholderText}`} placeholder="e.g., 1.0" />
            </div>
            <div className="flex flex-col">
              <label htmlFor="maxDividendYield" className={`text-sm font-medium ${themeClasses.subHeaderText} mb-1`}>Max Div. Yield (%)</label>
              <input type="number" id="maxDividendYield" name="maxDividendYield" value={filters.maxDividendYield} onChange={handleFilterChange} className={`p-2 border ${themeClasses.inputBorder} rounded-md ${themeClasses.inputBg} ${themeClasses.inputText} ${themeClasses.placeholderText}`} placeholder="e.g., 5.0" />
            </div>
          </div>
        </div>


        {/* Share Market Data Section */}
        <div className={`${themeClasses.sectionBgGreen} p-4 rounded-lg ${themeClasses.cardShadow} relative`}> {/* Added relative for positioning loader */}
          <h2 className={`text-2xl font-semibold ${themeClasses.sectionTextGreen} mb-4`}>Live Share Market (Game Data)</h2>
          {/* Small Updating indicator */}
          {loadingMarket && (
            <div className="absolute top-4 right-4 flex items-center text-sm text-gray-600">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Updating...
            </div>
          )}
          <button
            onClick={fetchInitialData}
            className={`mb-4 px-4 py-2 ${themeClasses.buttonPrimary} text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200`}
            disabled={loadingMarket}
          >
            {loadingMarket ? 'Refreshing...' : '🔄 Refresh Market Data'}
          </button>

          {filteredAndSortedStocks.length === 0 ? (
            <p className={`text-center ${themeClasses.subHeaderText} text-lg`}>No share market data available based on current filters.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg shadow-inner">
              <table className={`min-w-full divide-y ${currentTheme === 'dark' || currentTheme === 'wallstreet' || currentTheme === 'hedgeFund' ? 'divide-gray-600' : 'divide-gray-200'}`}>
                <thead className={themeClasses.tableHeadBg}>
                  <tr>
                    <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${themeClasses.subHeaderText} uppercase tracking-wider sm:px-6 cursor-pointer`} onClick={() => handleSort('n')}>
                      Stock Name {sortColumn === 'n' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${themeClasses.subHeaderText} uppercase tracking-wider sm:px-6 cursor-pointer`} onClick={() => handleSort('lp')}>
                      Price {sortColumn === 'lp' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${themeClasses.subHeaderText} uppercase tracking-wider sm:px-6 cursor-pointer`} onClick={() => handleSort('lm')}>
                      Change ($) {sortColumn === 'lm' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${themeClasses.subHeaderText} uppercase tracking-wider sm:px-6`}>
                      % Change
                    </th>
                    <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${themeClasses.subHeaderText} uppercase tracking-wider sm:px-6 cursor-pointer`} onClick={() => handleSort('v')}>
                      Volume {sortColumn === 'v' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${themeClasses.subHeaderText} uppercase tracking-wider sm:px-6 cursor-pointer`} onClick={() => handleSort('leps')}>
                      Last EPS {sortColumn === 'leps' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${themeClasses.subHeaderText} uppercase tracking-wider sm:px-6 cursor-pointer`} onClick={() => handleSort('bv')}>
                      Book Value {sortColumn === 'bv' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${themeClasses.subHeaderText} uppercase tracking-wider sm:px-6 cursor-pointer`} onClick={() => handleSort('peRatio')}>
                      P/E Ratio {sortColumn === 'peRatio' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${themeClasses.subHeaderText} uppercase tracking-wider sm:px-6 cursor-pointer`} onClick={() => handleSort('pbRatio')}>
                      P/B Ratio {sortColumn === 'pbRatio' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${themeClasses.subHeaderText} uppercase tracking-wider sm:px-6 cursor-pointer`} onClick={() => handleSort('marketCapital')}>
                      Market Capital {sortColumn === 'marketCapital' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                     <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${themeClasses.subHeaderText} uppercase tracking-wider sm:px-6 cursor-pointer`} onClick={() => handleSort('ts')}>
                      Shares Outstanding {sortColumn === 'ts' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${themeClasses.subHeaderText} uppercase tracking-wider sm:px-6 cursor-pointer`} onClick={() => handleSort('ld')}>
                      Most Recent Dividends per Share {sortColumn === 'ld' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${themeClasses.subHeaderText} uppercase tracking-wider sm:px-6 cursor-pointer`} onClick={() => handleSort('dividendYield')}>
                      Dividend Yield {sortColumn === 'dividendYield' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                  </tr>
                </thead>
                <tbody className={`${themeClasses.subCardBg} divide-y ${currentTheme === 'dark' || currentTheme === 'wallstreet' || currentTheme === 'hedgeFund' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {filteredAndSortedStocks.map((stock) => {
                    const price = stock.lp;
                    const change = stock.lm;
                    const percent_change = price && change !== undefined && price !== 0
                      ? (change / price) * 100
                      : 0;

                    // Calculate P/E Ratio
                    const peRatio = (stock.leps !== undefined && stock.leps !== 0)
                      ? (price / stock.leps).toFixed(2)
                      : 'N/A';
                    
                    // Calculate P/B Ratio
                    const pbRatio = (stock.ts !== undefined && stock.ts !== 0 && stock.bv !== undefined)
                      ? ((price / 100) / (stock.bv / stock.ts)).toFixed(2)
                      : 'N/A';

                    // Calculate Market Capital
                    const marketCapital = (stock.lp !== undefined && stock.ts !== undefined)
                      ? (stock.lp / 100 * stock.ts)
                      : undefined;

                    // Calculate Dividend Yield
                    const dividendYield = (stock.ld !== undefined && stock.lp !== undefined && (stock.lp / 100) !== 0)
                      ? ((stock.ld / 100) / (stock.lp / 100) * 100).toFixed(2)
                      : 'N/A';

                    return (
                      <tr key={stock.sID} className={themeClasses.tableRowHover} onClick={() => setSelectedStockSymbol(stock.sID)}>
                        <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${themeClasses.inputText} sm:px-6`}>
                          {stock.n} ({stock.sID})
                        </td>
                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${themeClasses.subHeaderText} sm:px-6`}>
                          ${formatCurrency(price)}
                        </td>
                        <td
                          className={`px-4 py-4 whitespace-nowrap text-sm ${
                            change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : themeClasses.subHeaderText
                          } font-semibold sm:px-6`}
                        >
                          {change !== undefined ? (change / 100).toFixed(2).toLocaleString('en-US') : 'N/A'}
                        </td>
                        <td
                          className={`px-4 py-4 whitespace-nowrap text-sm ${
                            percent_change > 0 ? 'text-green-500' : percent_change < 0 ? 'text-red-500' : themeClasses.subHeaderText
                          } font-semibold sm:px-6`}
                        >
                          {percent_change?.toFixed(2)}%
                        </td>
                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${themeClasses.subHeaderText} sm:px-6`}>
                          {stock.v?.toLocaleString()}
                        </td>
                         <td className={`px-4 py-4 whitespace-nowrap text-sm ${themeClasses.subHeaderText} sm:px-6`}>
                          ${formatCurrency(stock.leps)}
                        </td>
                         <td className={`px-4 py-4 whitespace-nowrap text-sm ${themeClasses.subHeaderText} sm:px-6`}>
                          ${formatLargeNumber(stock.bv)}
                        </td>
                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${themeClasses.subHeaderText} sm:px-6`}>
                          {peRatio}
                        </td>
                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${themeClasses.subHeaderText} sm:px-6`}>
                          {pbRatio}
                        </td>
                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${themeClasses.subHeaderText} sm:px-6`}>
                          ${formatLargeNumber(marketCapital)}
                        </td>
                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${themeClasses.subHeaderText} sm:px-6`}>
                          {formatLargeNumber(stock.ts)}
                        </td>
                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${themeClasses.subHeaderText} sm:px-6`}>
                          ${formatCurrency(stock.ld)}
                        </td>
                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${themeClasses.subHeaderText} sm:px-6`}>
                          {dividendYield}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* My Portfolio Section */}
        <div className={`${themeClasses.sectionBgYellow} p-4 rounded-lg ${themeClasses.cardShadow}`}>
          <h2 className={`text-2xl font-semibold ${themeClasses.sectionTextYellow} mb-4`}>My Portfolio (Game Data)</h2>
          <p className={`text-sm ${themeClasses.subHeaderText} mb-4`}>
            Your portfolio details below are updated after each successful trade you make, as live portfolio retrieval is not available via a dedicated API endpoint in this game.
          </p>
          {userPortfolio.length === 0 ? (
            <p className={`text-center ${themeClasses.subHeaderText} text-lg`}>No stocks in your portfolio yet. Make a trade to see your holdings!</p>
          ) : (
            <div className="overflow-x-auto rounded-lg shadow-inner">
              <table className={`min-w-full divide-y ${currentTheme === 'dark' || currentTheme === 'wallstreet' || currentTheme === 'hedgeFund' ? 'divide-gray-600' : 'divide-gray-200'}`}>
                <thead className={themeClasses.tableHeadBg}>
                  <tr>
                    <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${themeClasses.subHeaderText} uppercase tracking-wider sm:px-6`}>
                      Symbol
                    </th>
                    <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${themeClasses.subHeaderText} uppercase tracking-wider sm:px-6`}>
                      Name
                    </th>
                    <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${themeClasses.subHeaderText} uppercase tracking-wider sm:px-6`}>
                      Quantity
                    </th>
                    <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${themeClasses.subHeaderText} uppercase tracking-wider sm:px-6`}>
                      Avg. Price
                    </th>
                    <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${themeClasses.subHeaderText} uppercase tracking-wider sm:px-6`}>
                      Last Price
                    </th>
                     <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${themeClasses.subHeaderText} uppercase tracking-wider sm:px-6`}>
                      Current Value
                    </th>
                    <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${themeClasses.subHeaderText} uppercase tracking-wider sm:px-6`}>
                      Profit/Loss
                    </th>
                  </tr>
                </thead>
                <tbody className={`${themeClasses.subCardBg} divide-y ${currentTheme === 'dark' || currentTheme === 'wallstreet' || currentTheme === 'hedgeFund' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {userPortfolio.map((holding) => {
                    // Ensure that lp and ap exist and are numbers before performing calculations
                    const lastPrice = holding.lp !== undefined && !isNaN(holding.lp) ? (holding.lp / 100) : 0;
                    const avgPrice = holding.ap !== undefined && !isNaN(holding.ap) ? (holding.ap / 100) : 0;
                    
                    const currentValue = (holding.q * lastPrice);
                    const costBasis = (holding.q * avgPrice);
                    const profitLoss = currentValue - costBasis;
                    const profitLossPercentage = (costBasis !== 0) ? ((profitLoss / costBasis) * 100).toFixed(2) : 'N/A';

                    return (
                      <tr key={holding.sID} className={themeClasses.tableRowHover}>
                        <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${themeClasses.inputText} sm:px-6`}>
                          {holding.sID}
                        </td>
                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${themeClasses.subHeaderText} sm:px-6`}>
                          {holding.n}
                        </td>
                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${themeClasses.subHeaderText} sm:px-6`}>
                          {holding.q?.toLocaleString()}
                        </td>
                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${themeClasses.subHeaderText} sm:px-6`}>
                          ${formatCurrency(holding.ap)}
                        </td>
                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${themeClasses.subHeaderText} sm:px-6`}>
                          ${formatCurrency(holding.lp)}
                        </td>
                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${themeClasses.subHeaderText} sm:px-6`}>
                          ${currentValue.toFixed(2).toLocaleString('en-US')}
                        </td>
                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${profitLoss > 0 ? 'text-green-500' : profitLoss < 0 ? 'text-red-500' : themeClasses.subHeaderText} font-semibold sm:px-6`}>
                          ${profitLoss.toFixed(2).toLocaleString('en-US')} ({isNaN(profitLossPercentage) ? 'N/A' : profitLossPercentage}%)
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Your P&L History Chart Section */}
        <div className={`${themeClasses.sectionBgBlue} p-4 rounded-lg ${themeClasses.cardShadow}`}>
          <h2 className={`text-2xl font-semibold ${themeClasses.sectionTextBlue} mb-4`}>Your P&L History (Game Data)</h2>
          {loadingPortfolioHistory ? (
              <p className={`text-center ${themeClasses.subHeaderText} text-lg animate-pulse`}>Loading portfolio history...</p>
          ) : errorPortfolioHistory ? (
              <p className="text-red-500 text-sm mt-2">{errorPortfolioHistory}</p>
          ) : portfolioHistory.length === 0 ? (
            <p className={`text-center ${themeClasses.subHeaderText} text-lg`}>No portfolio history available. Make some trades to see your P&L!</p>
          ) : (
            <div className={`${themeClasses.subCardBg} p-3 rounded-md shadow-sm`}>
              <h4 className={`font-semibold ${themeClasses.inputText} mb-2 text-center`}>Portfolio Value Over Time</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={portfolioHistory.map((data, index) => ({
                    index: index, // Use index for x-axis if timestamps are not frequent or for simplicity
                    time: new Date(data.timestamp).toLocaleTimeString(), // Or toLocaleDateString()
                    portfolioValue: data.portfolioValue / 100, // Divide by 100 for proper currency
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke={currentTheme === 'light' ? '#e2e8f0' : '#4a5568'} />
                  <XAxis dataKey="time" label={{ value: "Time", position: "insideBottom", offset: 0, fill: currentTheme === 'light' ? '#4a5568' : '#cbd5e0' }} tick={{ fill: currentTheme === 'light' ? '#4a5568' : '#cbd5e0' }} />
                  <YAxis tickFormatter={(value) => `$${value.toFixed(2)}`} tick={{ fill: currentTheme === 'light' ? '#4a5568' : '#cbd5e0' }} />
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Line type="monotone" dataKey="portfolioValue" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>


        {/* AI Stock Picker Section */}
        <div className={`${themeClasses.sectionBgOrange} p-4 rounded-lg ${themeClasses.cardShadow}`}>
          <TooltipComponent message="Cathie Wood identifies disruptive innovations and long-term growth trends for investment recommendations.">
            <h2 className={`text-2xl font-semibold ${themeClasses.sectionTextOrange} mb-4`}>Growth Investments by Cathie Wood</h2>
          </TooltipComponent>
          <div className="flex justify-center mb-4">
              <button
                onClick={getAiStockRecommendations}
                className={`px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200 w-fit`}
                disabled={loadingAiPickedStocks || shareMarketData.length === 0}
              >
                {loadingAiPickedStocks ? 'Analyzing Market...' : '💡 Discover Growth Picks'}
              </button>
          </div>
          {errorAiPickedStocks && (
            <p className="text-red-500 text-sm mt-2">{errorAiPickedStocks}</p>
          )}
          {aiPickedStocks && (
            <div className={`${themeClasses.subCardBg} p-3 rounded-md shadow-inner ${themeClasses.inputText} whitespace-pre-wrap`}>
              {aiPickedStocks}
            </div>
          )}
        </div>

        {/* AI Recommended Portfolio Section */}
        <div className={`${themeClasses.sectionBgTeal} p-4 rounded-lg ${themeClasses.cardShadow}`}>
          <TooltipComponent message="Benjamin Graham provides portfolio recommendations based on fundamental analysis and a margin of safety for value investing.">
            <h2 className={`text-2xl font-semibold ${themeClasses.sectionTextTeal} mb-4`}>Value Portfolio by Benjamin Graham</h2>
          </TooltipComponent>
          <div className="flex justify-center mb-4">
              <button
                onClick={getAiRecommendedPortfolio}
                className={`px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-colors duration-200 w-fit`}
                disabled={loadingAiRecommendedPortfolio || shareMarketData.length === 0}
              >
                {loadingAiRecommendedPortfolio ? 'Crafting Portfolio...' : '🛡️ Build Value Portfolio'}
              </button>
          </div>
          {errorAiRecommendedPortfolio && (
            <p className="text-red-500 text-sm mt-2">{errorAiRecommendedPortfolio}</p>
          )}
          {aiRecommendedPortfolio && (
            <div className={`${themeClasses.subCardBg} p-3 rounded-md shadow-inner ${themeClasses.inputText} whitespace-pre-wrap`}>
              {aiRecommendedPortfolio}
            </div>
          )}
        </div>

        {/* AI Hot Stocks Section */}
        <div className={`${themeClasses.sectionBgOrange} p-4 rounded-lg shadow-md`}>
          <TooltipComponent message="Jesse Livermore identifies 'hot stocks' (top movers) based on price action and volume, observing speculative activity.">
            <h2 className={`text-2xl font-semibold ${themeClasses.sectionTextOrange} mb-4`}>Market Movers by Jesse Livermore</h2>
          </TooltipComponent>
          <div className="flex justify-center mb-4">
              <button
                onClick={getAiHotStocks}
                className={`px-4 py-2 bg-pink-600 text-white font-semibold rounded-lg shadow-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors duration-200 w-fit`}
                disabled={loadingAiHotStocks || shareMarketData.length === 0}
              >
                {loadingAiHotStocks ? 'Identifying Hot Stocks...' : '🔥 Analyze Hot Stocks'}
              </button>
          </div>
          {errorAiHotStocks && (
            <p className="text-red-500 text-sm mt-2">{errorAiHotStocks}</p>
          )}
          {aiHotStocks && (
            <div className={`${themeClasses.subCardBg} p-3 rounded-md shadow-inner ${themeClasses.inputText} whitespace-pre-wrap`}>
              {aiHotStocks}
            </div>
          )}
        </div>

        {/* AI Industry Trends Section */}
        <div className={`${themeClasses.sectionBgTeal} p-4 rounded-lg shadow-md`}>
          <TooltipComponent message="Mary Meeker provides insights into industry trends, focusing on technological shifts and long-term evolution.">
            <h2 className={`text-2xl font-semibold ${themeClasses.sectionTextTeal} mb-4`}>Industry Insights by Mary Meeker</h2>
          </TooltipComponent>
          <div className="flex justify-center mb-4">
              <button
                onClick={getAiIndustryTrends}
                className={`px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg shadow-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors duration-200 w-fit`}
                disabled={loadingAiIndustryTrends || shareMarketData.length === 0}
              >
                {loadingAiIndustryTrends ? 'Analyzing Industries...' : '📊 Explore Industry Trends'}
              </button>
          </div>
          {errorAiIndustryTrends && (
            <p className="text-red-500 text-sm mt-2">{errorAiIndustryTrends}</p>
          )}
          {aiIndustryTrends && (
            <div className={`${themeClasses.subCardBg} p-3 rounded-md shadow-inner ${themeClasses.inputText} whitespace-pre-wrap`}>
              {aiIndustryTrends}
            </div>
          )}
        </div>

        {/* AI Market Anomalies & Deals Section */}
        <div className={`${themeClasses.sectionBgPurple} p-4 rounded-lg shadow-md`}>
          <TooltipComponent message="Michael Burry identifies potential market anomalies and 'deals' through rigorous, contrarian analysis, highlighting mispricings.">
            <h2 className={`text-2xl font-semibold ${themeClasses.sectionTextPurple} mb-4`}>Unusual Opportunities by Michael Burry</h2>
          </TooltipComponent>
          <div className="flex justify-center mb-4">
              <button
                onClick={getAiMarketAnomalies}
                className={`px-4 py-2 bg-yellow-600 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors duration-200 w-fit`}
                disabled={loadingAiMarketAnomalies || shareMarketData.length === 0}
              >
                {loadingAiMarketAnomalies ? 'Searching for Anomalies...' : '🕵️ Find Market Anomalies'}
              </button>
          </div>
          {errorAiMarketAnomalies && (
            <p className="text-red-500 text-sm mt-2">{errorAiMarketAnomalies}</p>
          )}
          {aiMarketAnomalies && (
            <div className={`${themeClasses.subCardBg} p-3 rounded-md shadow-inner ${themeClasses.inputText} whitespace-pre-wrap`}>
              {aiMarketAnomalies}
            </div>
          )}
        </div>


        {/* AI Market Q&A Section */}
        <div className={`${themeClasses.sectionBgBlue} p-4 rounded-lg ${themeClasses.cardShadow}`}>
          <TooltipComponent message="Peter Lynch answers market questions with a common-sense approach, helping you understand your investments.">
            <h2 className={`text-2xl font-semibold ${themeClasses.sectionTextBlue} mb-4`}>Market Wisdom by Peter Lynch</h2>
          </TooltipComponent>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              type="text"
              value={marketQuestion}
              onChange={(e) => setMarketQuestion(e.target.value)}
              placeholder="Ask a question about the market (e.g., 'What stock has the highest volume?')..."
              className={`flex-grow p-2 border ${themeClasses.inputBorder} rounded-md ${themeClasses.inputBg} ${themeClasses.inputText} ${themeClasses.placeholderText} focus:ring-blue-500 focus:border-blue-500`}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleMarketQuestion();
              }}
            />
            <button
              onClick={handleMarketQuestion}
              className={`px-4 py-2 ${themeClasses.buttonPrimary} text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200`}
              disabled={loadingAiMarketAnswer || !marketQuestion.trim()}
            >
              {loadingAiMarketAnswer ? 'Thinking...' : '❓ Ask Peter Lynch'}
            </button>
          </div>
          {errorAiMarketAnswer && (
            <p className="text-red-500 text-sm mt-2">{errorAiMarketAnswer}</p>
          )}
          {aiMarketAnswer && (
            <div className={`${themeClasses.subCardBg} p-3 rounded-md shadow-inner ${themeClasses.inputText} whitespace-pre-wrap`}>
              {aiMarketAnswer}
            </div>
          )}
        </div>

        {/* AI Investment Fund Section */}
        <div className={`${themeClasses.sectionBgTeal} p-4 rounded-lg ${themeClasses.cardShadow}`}>
            <TooltipComponent message="The Renaissance Fund uses advanced quantitative analysis to suggest optimal trades, aiming for superior risk-adjusted returns.">
              <h2 className={`text-2xl font-semibold ${themeClasses.sectionTextTeal} mb-4`}>Renaissance Fund (Experimental)</h2>
            </TooltipComponent>
            <p className={`text-sm ${themeClasses.subHeaderText} mb-4`}>
                The AI will analyze the market and suggest 1-3 optimal trades based on your strategy and current financials.
            </p>
            <div className="flex justify-center mb-4">
                <button
                    onClick={getAiTradeSuggestion}
                    className={`px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 w-fit`}
                    disabled={loadingAiTradeSuggestion || shareMarketData.length === 0}
                >
                    {loadingAiTradeSuggestion ? 'AI Thinking...' : '📈 Get AI Trade Suggestions'}
                </button>
            </div>

            {errorAiTradeSuggestion && (
                <p className="text-red-500 text-sm mt-2">{errorAiTradeSuggestion}</p>
            )}

            {aiTradeSuggestions.length > 0 && (
                <div className="space-y-4">
                    <h3 className={`text-xl font-semibold ${themeClasses.inputText} mb-2`}>AI's Suggested Trades:</h3>
                    {aiTradeSuggestions.map((suggestion, index) => (
                        <div key={index} className={`${themeClasses.subCardBg} p-4 rounded-md shadow-inner`}>
                            <p className={`${themeClasses.subHeaderText}`}>
                                <strong>Symbol:</strong> {suggestion.Symbol}
                            </p>
                            <p className={`${themeClasses.subHeaderText}`}>
                                <strong>Type:</strong> {suggestion.Type}
                            </p>
                            <p className={`${themeClasses.subHeaderText}`}>
                                <strong>Quantity:</strong>
                                {/* Display "All Shares" if it's a sellall type */}
                                {suggestion.Type === 'sellall' ? ' All Shares' : suggestion.Quantity?.toLocaleString()}
                            </p>
                            <p className={`${themeClasses.subHeaderText} mt-2 whitespace-pre-wrap`}>
                                <strong>Rationale:</strong> {suggestion.Rationale}
                            </p>
                            <div className="flex gap-4 mt-4">
                                <button
                                    onClick={() => {
                                        executeTrade(suggestion.Symbol, suggestion.Quantity, suggestion.Type);
                                        // Optionally remove this suggestion from the list after it's approved
                                        setAiTradeSuggestions(prev => prev.filter((_, i) => i !== index));
                                    }}
                                    className={`px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200`}
                                    disabled={loadingTrade}
                                >
                                    {loadingTrade ? 'Executing...' : '✅ Approve Trade'}
                                </button>
                                <button
                                    onClick={() => setAiTradeSuggestions(prev => prev.filter((_, i) => i !== index))} // Remove only this suggestion
                                    className={`px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200`}
                                >
                                    ❌ Reject Trade
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>


        {/* Trading Desk Section */}
        <div className={`${themeClasses.sectionBgGray} p-4 rounded-lg ${themeClasses.cardShadow}`}>
          <h2 className={`text-2xl font-semibold ${themeClasses.sectionTextGray} mb-2`}>Trading Desk</h2>
          {/* Add current cash and portfolio value here for easy reference */}
          <div className="mb-4 p-3 rounded-md bg-gray-600/20">
            <p className={`${themeClasses.subHeaderText} text-base mb-1`}>
              <strong>Current Cash:</strong> {loadingUserProfile ? 'Loading...' : `$${formatCurrency(userProfile.cash)}`}
            </p>
            <p className={`${themeClasses.subHeaderText} text-base`}>
              <strong>Current Portfolio Value:</strong> {loadingUserProfile ? 'Loading...' : `$${formatCurrency(userProfile.portfolioValue)}`}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Custom Buy/Sell */}
            <div className={`${themeClasses.subCardBg} p-4 rounded-md shadow-sm`}>
              <h3 className={`text-xl font-semibold ${themeClasses.inputText} mb-3`}>Custom Buy/Sell</h3>
              <div className="mb-4">
                <label htmlFor="tradeSymbol" className={`block text-sm font-medium ${themeClasses.subHeaderText} mb-1`}>Select Stock</label>
                <select
                  id="tradeSymbol"
                  value={tradeSymbol}
                  onChange={(e) => setTradeSymbol(e.target.value)}
                  className={`w-full p-2 border ${themeClasses.inputBorder} rounded-md ${themeClasses.inputBg} ${themeClasses.inputText} focus:ring-blue-500 focus:border-blue-500`}
                >
                  {shareMarketData.length > 0 ? (
                    shareMarketData.map(stock => (
                      <option key={stock.sID} value={stock.sID}>
                        {stock.n} ({stock.sID})
                      </option>
                    ))
                  ) : (
                    <option value="">No stocks available</option>
                  )}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="tradeQuantity" className={`block text-sm font-medium ${themeClasses.subHeaderText} mb-1`}>Quantity</label>
                <input
                  type="number"
                  id="tradeQuantity"
                  value={tradeQuantity}
                  onChange={(e) => setTradeQuantity(e.target.value)}
                  placeholder="e.g., 100"
                  className={`w-full p-2 border ${themeClasses.inputBorder} rounded-md ${themeClasses.inputBg} ${themeClasses.inputText} ${themeClasses.placeholderText} focus:ring-blue-500 focus:border-blue-500`}
                />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <label className={`inline-flex items-center ${themeClasses.subHeaderText}`}>
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-green-600"
                    name="tradeType"
                    value="buy"
                    checked={tradeType === 'buy'}
                    onChange={() => setTradeType('buy')}
                  />
                  <span className="ml-2">Buy</span>
                </label>
                <label className={`inline-flex items-center ${themeClasses.subHeaderText}`}>
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-red-600"
                    name="tradeType"
                    value="sell"
                    checked={tradeType === 'sell'}
                    onChange={() => setTradeType('sell')}
                  />
                  <span className="ml-2">Sell</span>
                </label>
              </div>
              <button
                onClick={() => executeTrade(tradeSymbol, tradeQuantity, tradeType)}
                className={`w-full px-4 py-2 ${tradeType === 'buy' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'} text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200`}
                disabled={loadingTrade || !tradeSymbol || !tradeQuantity || isNaN(tradeQuantity) || parseInt(tradeQuantity) <= 0}
              >
                {loadingTrade ? 'Executing...' : '🛒 Execute Market Order'}
              </button>
            </div>

            {/* Trade Status and Quick Buy/Sell All */}
            <div className={`${themeClasses.subCardBg} p-4 rounded-md shadow-sm flex flex-col justify-between`}>
              <div>
                <h3 className={`text-xl font-semibold ${themeClasses.inputText} mb-3`}>Trade Status</h3>
                {tradeMessage && (
                  <p className={`text-sm ${tradeMessage.includes('successful') || tradeMessage.includes('Order Completed') || tradeMessage.includes('accepted') ? 'text-green-500' : 'text-red-500'} mb-4`}>
                    {tradeMessage}
                  </p>
                )}
                {!tradeMessage && (
                  <p className={`text-sm ${themeClasses.subHeaderText}`}>Your trade results will appear here.</p>
                )}
              </div>
              {/* Quick Buy All and Quick Sell All for selected stock in trading desk */}
              {selectedTradingDeskStock && (
                 <div className="mt-4 pt-4 border-t border-gray-600 space-y-3">
                    <h3 className={`text-xl font-semibold ${themeClasses.inputText} mb-3`}>Quick Actions (Selected Stock in Desk)</h3>
                    <p className={`text-xs ${themeClasses.subHeaderText}`}>
                        "Quick Buy All" uses game's special command to buy with all available cash for {selectedTradingDeskStock.n}.
                    </p>
                    <button
                        onClick={() => executeTrade(tradeSymbol, 9983991, 'buyallvalue')} // 9983991 for 'buy all available money'
                        className={`w-full px-4 py-2 bg-green-700 text-white font-semibold rounded-lg shadow-md hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 transition-colors duration-200`}
                        disabled={loadingTrade}
                    >
                        {getQuickBuySellButtonText(true)}
                    </button>
                    <p className={`text-xs ${themeClasses.subHeaderText} mt-2`}>
                        "Quick Sell All" sells all your shares of {selectedTradingDeskStock.n} at market price.
                    </p>
                    <button
                        onClick={() => executeTrade(tradeSymbol, 0, 'sellall')}
                        className={`w-full px-4 py-2 bg-red-700 text-white font-semibold rounded-lg shadow-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 transition-colors duration-200`}
                        disabled={loadingTrade}
                    >
                        {getQuickBuySellButtonText(false)}
                    </button>
                 </div>
              )}
            </div>
          </div>
        </div>


        {/* Selected Stock Detail Section */}
        {selectedStockSymbol && shareDetailData && (
          <div className={`${themeClasses.sectionBgYellow} p-4 rounded-lg ${themeClasses.cardShadow} space-y-6`}>
            <h2 className={`text-2xl font-semibold ${themeClasses.sectionTextYellow} mb-4`}>
              Stock Details: {shareDetailData.sharedetail?.n} ({shareDetailData.sharedetail?.sID})
            </h2>
            {loadingShareDetail && (
              <div className="flex items-center text-sm text-gray-600 animate-pulse mb-4">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading stock details...
              </div>
            )}
            {errorShareDetail && (
              <p className="text-red-500 text-sm mt-2 mb-4">Error loading stock details: {errorShareDetail}</p>
            )}

            {/* Basic Stock Info from sharedetail */}
            {shareDetailData.sharedetail && (
                <div className={`${themeClasses.subCardBg} p-4 rounded-md shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ${themeClasses.inputText}`}>
                    <p>
                        <strong>Last Price:</strong> ${formatCurrency(shareDetailData.sharedetail.lp)}
                    </p>
                    <p>
                        <strong>Change ($):</strong> {shareDetailData.sharedetail.lm !== undefined ? (shareDetailData.sharedetail.lm / 100).toFixed(2).toLocaleString('en-US') : 'N/A'}
                    </p>
                    <p>
                        <strong>Last EPS:</strong> ${formatCurrency(shareDetailData.sharedetail.leps)}
                    </p>
                    <p><strong>Volume:</strong> {shareDetailData.sharedetail.v?.toLocaleString()}</p>
                    <p>
                        <strong>Book Value:</strong> ${formatLargeNumber(shareDetailData.sharedetail.bv)}
                    </p>
                     {/* Financial Ratios */}
                    <p>
                        <strong>P/E Ratio:</strong> {
                            (shareDetailData.sharedetail.leps !== undefined && shareDetailData.sharedetail.leps !== 0)
                                ? (shareDetailData.sharedetail.lp / shareDetailData.sharedetail.leps).toFixed(2)
                                : 'N/A'
                        }
                    </p>
                    <p>
                        <strong>P/B Ratio:</strong> {
                            (shareDetailData.sharedetail.ts !== undefined && shareDetailData.sharedetail.ts !== 0 && shareDetailData.sharedetail.bv !== undefined)
                                ? ((shareDetailData.sharedetail.lp / 100) / (shareDetailData.sharedetail.bv / shareDetailData.sharedetail.ts)).toFixed(2)
                                : 'N/A'
                        }
                    </p>
                     {/* Placeholders for data now derived from API or still unavailable */}
                    <p><strong>Market Capital:</strong> ${formatLargeNumber((shareDetailData.sharedetail.lp / 100) * shareDetailData.sharedetail.ts)}</p>
                    <p><strong>Shares Outstanding:</strong> {formatLargeNumber(shareDetailData.sharedetail.ts)}</p>
                    <p><strong>Most Recent Dividends per Share:</strong> ${formatCurrency(shareDetailData.sharedetail.ld)}</p>
                    <p>
                      <strong>Dividend Yield:</strong> {
                        (shareDetailData.sharedetail.ld !== undefined && shareDetailData.sharedetail.lp !== undefined && (shareDetailData.sharedetail.lp / 100) !== 0)
                        ? ((shareDetailData.sharedetail.ld / 100) / (shareDetailData.sharedetail.lp / 100) * 100).toFixed(2)
                        : 'N/A'
                      }%
                    </p>
                </div>
            )}

            {/* AI Stock Analysis Section for selected stock */}
            <div className={`${themeClasses.subCardBg} p-4 rounded-md shadow-sm`}>
                <TooltipComponent message="Ray Dalio analyzes a specific stock's financial health, news impact, and potential future movement through a systematic lens.">
                  <h3 className={`text-xl font-semibold ${themeClasses.subHeaderText} mb-3`}>Deep Dive Analysis by Ray Dalio</h3>
                </TooltipComponent>
                <div className="flex justify-center mb-4">
                    <button
                        onClick={getAiStockAnalysis}
                        className={`px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 w-fit`}
                        disabled={loadingAiAnalysis}
                    >
                        {loadingAiAnalysis ? 'Analyzing...' : '🔍 Get Stock Analysis'}
                    </button>
                </div>
                {errorAiAnalysis && (
                    <p className="text-red-500 text-sm mt-2">{errorAiAnalysis}</p>
                )}
                {aiAnalysis && (
                    <div className={`${themeClasses.subCardBg} p-3 rounded-md shadow-inner ${themeClasses.inputText} whitespace-pre-wrap`}>
                        {aiAnalysis}
                    </div>
                )}
            </div>

            {/* Order Depth Section */}
            <div className={`${themeClasses.subCardBg} p-4 rounded-md shadow-sm`}>
              <h3 className={`text-xl font-semibold ${themeClasses.subHeaderText} mb-3`}>Order Depth</h3>
              {shareDetailData.ordersummary ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className={`${currentTheme === 'light' ? 'bg-blue-200 text-blue-800' : 'bg-blue-800 text-blue-200'} p-3 rounded-md`}>
                      <h4 className="font-semibold">Buyers (Bid) Summary</h4>
                      <p><strong>Total Quantity (bq):</strong> {shareDetailData.ordersummary.bq?.toLocaleString()}</p>
                      <p><strong>Total Buyers (bn):</strong> {shareDetailData.ordersummary.bn?.toLocaleString()}</p>
                    </div>
                    <div className={`${currentTheme === 'light' ? 'bg-red-200 text-red-800' : 'bg-red-800 text-red-200'} p-3 rounded-md`}>
                      <h4 className="font-semibold">Sellers (Ask) Summary</h4>
                      <p><strong>Total Quantity (sq):</strong> {Math.abs(shareDetailData.ordersummary.sq)?.toLocaleString()}</p>
                      <p><strong>Total Sellers (sn):</strong> {shareDetailData.ordersummary.sn?.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className={`font-semibold ${currentTheme === 'light' ? 'text-blue-700' : 'text-blue-300'} mb-2`}>Individual Buy Orders</h4>
                      {shareDetailData.orders && shareDetailData.orders.filter(order => order.q > 0).length > 0 ? (
                        <ul className={`list-disc list-inside text-sm ${themeClasses.inputText} max-h-48 overflow-y-auto pr-2`}>
                          {shareDetailData.orders
                            .filter(order => order.q > 0)
                            .sort((a, b) => b.p - a.p) // Sort by price descending
                            .map((order, idx) => (
                              <li key={idx}>Quantity: {order.q?.toLocaleString()} at Price: ${formatCurrency(order.p)}</li>
                            ))}
                        </ul>
                      ) : (
                        <p className={`${themeClasses.subHeaderText} text-sm`}>No buy orders available.</p>
                      )}
                    </div>
                    <div>
                      <h4 className={`font-semibold ${currentTheme === 'light' ? 'text-red-700' : 'text-red-300'} mb-2`}>Individual Sell Orders</h4>
                      {shareDetailData.orders && shareDetailData.orders.filter(order => order.q < 0).length > 0 ? (
                        <ul className={`list-disc list-inside text-sm ${themeClasses.inputText} max-h-48 overflow-y-auto pr-2`}>
                          {shareDetailData.orders
                            .filter(order => order.q < 0)
                            .sort((a, b) => a.p - b.p) // Sort by price ascending
                            .map((order, idx) => (
                              <li key={idx}>Quantity: {Math.abs(order.q)?.toLocaleString()} at Price: ${formatCurrency(order.p)}</li>
                            ))}
                        </ul>
                      ) : (
                        <p className={`${themeClasses.subHeaderText} text-sm`}>No sell orders available.</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <p className={`text-center ${themeClasses.subHeaderText} text-lg`}>Order depth data not available for this stock.</p>
              )}
            </div>

            {/* Share News Section */}
            <div className={`${themeClasses.subCardBg} p-4 rounded-md shadow-sm`}>
                <h3 className={`text-xl font-semibold ${themeClasses.subHeaderText} mb-3`}>Recent News for {shareDetailData.sharedetail?.n}</h3>
                {shareDetailData.sharenews && shareDetailData.sharenews.length > 0 ? (
                    <div className="space-y-3">
                        {shareDetailData.sharenews.map((news, index) => (
                            <div key={index} className={`${themeClasses.cardBg} p-3 rounded-md shadow-sm`}>
                                <h4 className={`text-lg font-semibold ${themeClasses.inputText}`}>{news.h?.replace('%SID%', news.sid || '').replace('%INAME%', news.iID || '')}</h4>
                                <p className={`text-sm ${themeClasses.subHeaderText}`}>{news.d?.replace('%SID%', news.sid || '').replace('%INAME%', news.iID || '')}</p>
                                <p className={`text-xs ${currentTheme === 'light' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>Time: {news.tm} minutes ago</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className={`text-center ${themeClasses.subHeaderText} text-lg`}>No specific news available for this stock.</p>
                )}
            </div>

            {/* Share History Sections - Now with Charts and Month Labels */}
            <div className={`${themeClasses.subCardBg} p-4 rounded-lg shadow-sm`}>
              <h3 className={`text-xl font-semibold ${themeClasses.subHeaderText} mb-3`}>Price History Charts (In-Game Months)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shareDetailData.sharehistory1 && shareDetailData.sharehistory1.length > 0 && (
                  <div className={`${themeClasses.cardBg} p-3 rounded-md shadow-sm`}>
                    <h4 className={`font-semibold ${themeClasses.inputText} mb-2 text-center`}>1-Month History (Price, SMA, BBands, Signals)</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={prepareChartData(shareDetailData.sharehistory1)}>
                        <CartesianGrid strokeDasharray="3 3" stroke={currentTheme === 'light' ? '#e2e8f0' : '#4a5568'} />
                        <XAxis dataKey="index" label={{ value: "Month", position: "insideBottom", offset: 0, fill: currentTheme === 'light' ? '#4a5568' : '#cbd5e0' }} tick={{ fill: currentTheme === 'light' ? '#4a5568' : '#cbd5e0' }} />
                        <YAxis domain={['auto', 'auto']} tickFormatter={(value) => `$${value.toFixed(2)}`} tick={{ fill: currentTheme === 'light' ? '#4a5568' : '#cbd5e0' }} />
                        <Tooltip formatter={(value, name) => [`$${value.toFixed(2)}`, name === 'price' ? 'Price' : (name.includes('sma') ? `SMA ${name.replace('sma', '')}` : (name === 'upperBand' ? 'Upper BB' : name === 'lowerBand' ? 'Lower BB' : name))]} />
                        <Line type="monotone" dataKey="price" stroke={currentTheme === 'light' ? '#8884d8' : '#66b3ff'} dot={false} />
                        <Line type="monotone" dataKey="sma5" stroke={currentTheme === 'light' ? '#add8e6' : '#a0a0ff'} dot={false} strokeWidth={1} />
                        <Line type="monotone" dataKey="sma20" stroke={currentTheme === 'light' ? '#ffb6c1' : '#ffc0cb'} dot={false} strokeWidth={1} />
                        <Line type="monotone" dataKey="upperBand" stroke="#82ca9d" dot={false} strokeDasharray="3 3" strokeWidth={1} />
                        <Line type="monotone" dataKey="lowerBand" stroke="#82ca9d" dot={false} strokeDasharray="3 3" strokeWidth={1} />
                        <Line type="scatter" dataKey="price" dot={(props) => <SignalDot {...props} />} activeDot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                    {/* RSI Chart for 1-Month History */}
                    {prepareChartData(shareDetailData.sharehistory1).some(d => d.rsi !== null) && (
                      <div className={`${themeClasses.cardBg} p-3 rounded-md shadow-sm mt-4`}>
                        <h4 className={`font-semibold ${themeClasses.inputText} mb-2 text-center`}>1-Month RSI</h4>
                        <ResponsiveContainer width="100%" height={100}>
                          <LineChart data={prepareChartData(shareDetailData.sharehistory1)}>
                            <CartesianGrid strokeDasharray="3 3" stroke={currentTheme === 'light' ? '#e2e8f0' : '#4a5568'} />
                            <XAxis dataKey="index" hide />
                            <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}`} tick={{ fill: currentTheme === 'light' ? '#4a5568' : '#cbd5e0' }} />
                            <Tooltip formatter={(value) => [`${value.toFixed(2)}`, 'RSI']} />
                            <Line type="monotone" dataKey="rsi" stroke="#82ca9d" dot={false} />
                            <Line type="monotone" dataKey="70" stroke="#f00" strokeDasharray="5 5" dot={false} /> {/* Overbought line */}
                            <Line type="monotone" dataKey="30" stroke="#00f" strokeDasharray="5 5" dot={false} /> {/* Oversold line */}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )}
                {shareDetailData.sharehistory5 && shareDetailData.sharehistory5.length > 0 && (
                  <div className={`${themeClasses.cardBg} p-3 rounded-md shadow-sm`}>
                    <h4 className={`font-semibold ${themeClasses.inputText} mb-2 text-center`}>5-Month History (Price, SMA, BBands, Signals)</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={prepareChartData(shareDetailData.sharehistory5)}>
                        <CartesianGrid strokeDasharray="3 3" stroke={currentTheme === 'light' ? '#e2e8f0' : '#4a5568'} />
                        <XAxis dataKey="index" label={{ value: "Month", position: "insideBottom", offset: 0, fill: currentTheme === 'light' ? '#4a5568' : '#cbd5e0' }} tick={{ fill: currentTheme === 'light' ? '#4a5568' : '#cbd5e0' }} />
                        <YAxis domain={['auto', 'auto']} tickFormatter={(value) => `$${value.toFixed(2)}`} tick={{ fill: currentTheme === 'light' ? '#4a5568' : '#cbd5e0' }} />
                        <Tooltip formatter={(value, name) => [`$${value.toFixed(2)}`, name === 'price' ? 'Price' : (name.includes('sma') ? `SMA ${name.replace('sma', '')}` : (name === 'upperBand' ? 'Upper BB' : name === 'lowerBand' ? 'Lower BB' : name))]} />
                        <Line type="monotone" dataKey="price" stroke={currentTheme === 'light' ? '#82ca9d' : '#66ff99'} dot={false} />
                        <Line type="monotone" dataKey="sma5" stroke={currentTheme === 'light' ? '#98fb98' : '#a0ffb3'} dot={false} strokeWidth={1} />
                        <Line type="monotone" dataKey="sma20" stroke={currentTheme === 'light' ? '#ffb6c1' : '#ffc0cb'} dot={false} strokeWidth={1} />
                        <Line type="monotone" dataKey="upperBand" stroke="#82ca9d" dot={false} strokeDasharray="3 3" strokeWidth={1} />
                        <Line type="monotone" dataKey="lowerBand" stroke="#82ca9d" dot={false} strokeDasharray="3 3" strokeWidth={1} />
                        <Line type="scatter" dataKey="price" dot={(props) => <SignalDot {...props} />} activeDot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                    {/* RSI Chart for 5-Month History */}
                    {prepareChartData(shareDetailData.sharehistory5).some(d => d.rsi !== null) && (
                      <div className={`${themeClasses.cardBg} p-3 rounded-md shadow-sm mt-4`}>
                        <h4 className={`font-semibold ${themeClasses.inputText} mb-2 text-center`}>5-Month RSI</h4>
                        <ResponsiveContainer width="100%" height={100}>
                          <LineChart data={prepareChartData(shareDetailData.sharehistory5)}>
                            <CartesianGrid strokeDasharray="3 3" stroke={currentTheme === 'light' ? '#e2e8f0' : '#4a5568'} />
                            <XAxis dataKey="index" hide />
                            <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}`} tick={{ fill: currentTheme === 'light' ? '#4a5568' : '#cbd5e0' }} />
                            <Tooltip formatter={(value) => [`${value.toFixed(2)}`, 'RSI']} />
                            <Line type="monotone" dataKey="rsi" stroke="#82ca9d" dot={false} />
                            <Line type="monotone" dataKey="70" stroke="#f00" strokeDasharray="5 5" dot={false} />
                            <Line type="monotone" dataKey="30" stroke="#00f" strokeDasharray="5 5" dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )}
                {shareDetailData.sharehistory15 && shareDetailData.sharehistory15.length > 0 && (
                  <div className={`${themeClasses.cardBg} p-3 rounded-md shadow-sm`}>
                    <h4 className={`font-semibold ${themeClasses.inputText} mb-2 text-center`}>15-Month History (Price, SMA, BBands, Signals)</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={prepareChartData(shareDetailData.sharehistory15)}>
                        <CartesianGrid strokeDasharray="3 3" stroke={currentTheme === 'light' ? '#e2e8f0' : '#4a5568'} />
                        <XAxis dataKey="index" label={{ value: "Month", position: "insideBottom", offset: 0, fill: currentTheme === 'light' ? '#4a5568' : '#cbd5e0' }} tick={{ fill: currentTheme === 'light' ? '#4a5568' : '#cbd5e0' }} />
                        <YAxis domain={['auto', 'auto']} tickFormatter={(value) => `$${value.toFixed(2)}`} tick={{ fill: currentTheme === 'light' ? '#4a5568' : '#cbd5e0' }} />
                        <Tooltip formatter={(value, name) => [`$${value.toFixed(2)}`, name === 'price' ? 'Price' : (name.includes('sma') ? `SMA ${name.replace('sma', '')}` : (name === 'upperBand' ? 'Upper BB' : name === 'lowerBand' ? 'Lower BB' : name))]} />
                        <Line type="monotone" dataKey="price" stroke={currentTheme === 'light' ? '#ffc658' : '#ffd166'} dot={false} />
                        <Line type="monotone" dataKey="sma5" stroke={currentTheme === 'light' ? '#ffeeaa' : '#ffe082'} dot={false} strokeWidth={1} />
                        <Line type="monotone" dataKey="sma20" stroke={currentTheme === 'light' ? '#ffb6c1' : '#ffc0cb'} dot={false} strokeWidth={1} />
                        <Line type="monotone" dataKey="upperBand" stroke="#82ca9d" dot={false} strokeDasharray="3 3" strokeWidth={1} />
                        <Line type="monotone" dataKey="lowerBand" stroke="#82ca9d" dot={false} strokeDasharray="3 3" strokeWidth={1} />
                        <Line type="scatter" dataKey="price" dot={(props) => <SignalDot {...props} />} activeDot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                    {/* RSI Chart for 15-Month History */}
                    {prepareChartData(shareDetailData.sharehistory15).some(d => d.rsi !== null) && (
                      <div className={`${themeClasses.cardBg} p-3 rounded-md shadow-sm mt-4`}>
                        <h4 className={`font-semibold ${themeClasses.inputText} mb-2 text-center`}>15-Month RSI</h4>
                        <ResponsiveContainer width="100%" height={100}>
                          <LineChart data={prepareChartData(shareDetailData.sharehistory15)}>
                            <CartesianGrid strokeDasharray="3 3" stroke={currentTheme === 'light' ? '#e2e8f0' : '#4a5568'} />
                            <XAxis dataKey="index" hide />
                            <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}`} tick={{ fill: currentTheme === 'light' ? '#4a5568' : '#cbd5e0' }} />
                            <Tooltip formatter={(value) => [`${value.toFixed(2)}`, 'RSI']} />
                            <Line type="monotone" dataKey="rsi" stroke="#82ca9d" dot={false} />
                            <Line type="monotone" dataKey="70" stroke="#f00" strokeDasharray="5 5" dot={false} />
                            <Line type="monotone" dataKey="30" stroke="#00f" strokeDasharray="5 5" dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )}
                {shareDetailData.sharehistory60 && shareDetailData.sharehistory60.length > 0 && (
                  <div className={`${themeClasses.cardBg} p-3 rounded-md shadow-sm`}>
                    <h4 className={`font-semibold ${themeClasses.inputText} mb-2 text-center`}>60-Month History (Price, SMA, BBands, Signals)</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={prepareChartData(shareDetailData.sharehistory60)}>
                        <CartesianGrid strokeDasharray="3 3" stroke={currentTheme === 'light' ? '#e2e8f0' : '#4a5568'} />
                        <XAxis dataKey="index" label={{ value: "Month", position: "insideBottom", offset: 0, fill: currentTheme === 'light' ? '#4a5568' : '#cbd5e0' }} tick={{ fill: currentTheme === 'light' ? '#4a5568' : '#cbd5e0' }} />
                        <YAxis domain={['auto', 'auto']} tickFormatter={(value) => `$${value.toFixed(2)}`} tick={{ fill: currentTheme === 'light' ? '#4a5568' : '#cbd5e0' }} />
                        <Tooltip formatter={(value, name) => [`$${value.toFixed(2)}`, name === 'price' ? 'Price' : (name.includes('sma') ? `SMA ${name.replace('sma', '')}` : (name === 'upperBand' ? 'Upper BB' : name === 'lowerBand' ? 'Lower BB' : name))]} />
                        <Line type="monotone" dataKey="price" stroke={currentTheme === 'light' ? '#ff7300' : '#ff9933'} dot={false} />
                        <Line type="monotone" dataKey="sma5" stroke={currentTheme === 'light' ? '#ffcc99' : '#ffb366'} dot={false} strokeWidth={1} />
                        <Line type="monotone" dataKey="sma20" stroke={currentTheme === 'light' ? '#ffb6c1' : '#ffc0cb'} dot={false} strokeWidth={1} />
                        <Line type="monotone" dataKey="upperBand" stroke="#82ca9d" dot={false} strokeDasharray="3 3" strokeWidth={1} />
                        <Line type="monotone" dataKey="lowerBand" stroke="#82ca9d" dot={false} strokeDasharray="3 3" strokeWidth={1} />
                        <Line type="scatter" dataKey="price" dot={(props) => <SignalDot {...props} />} activeDot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                    {/* RSI Chart for 60-Month History */}
                    {prepareChartData(shareDetailData.sharehistory60).some(d => d.rsi !== null) && (
                      <div className={`${themeClasses.cardBg} p-3 rounded-md shadow-sm mt-4`}>
                        <h4 className={`font-semibold ${themeClasses.inputText} mb-2 text-center`}>60-Month RSI</h4>
                        <ResponsiveContainer width="100%" height={100}>
                          <LineChart data={prepareChartData(shareDetailData.sharehistory60)}>
                            <CartesianGrid strokeDasharray="3 3" stroke={currentTheme === 'light' ? '#e2e8f0' : '#4a5568'} />
                            <XAxis dataKey="index" hide />
                            <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}`} tick={{ fill: currentTheme === 'light' ? '#4a5568' : '#cbd5e0' }} />
                            <Tooltip formatter={(value) => [`${value.toFixed(2)}`, 'RSI']} />
                            <Line type="monotone" dataKey="rsi" stroke="#82ca9d" dot={false} />
                            <Line type="monotone" dataKey="70" stroke="#f00" strokeDasharray="5 5" dot={false} />
                            <Line type="monotone" dataKey="30" stroke="#00f" strokeDasharray="5 5" dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )}
                {!shareDetailData.sharehistory1 && !shareDetailData.sharehistory5 && !shareDetailData.sharehistory15 && !shareDetailData.sharehistory60 && (
                    <p className={`text-center ${themeClasses.subHeaderText} text-lg col-span-full`}>No price history available for this stock.</p>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Global News Summary Section (from getsharemarket) */}
        <div className={`${themeClasses.cardBg} p-4 rounded-lg ${themeClasses.cardShadow}`}>
          <h2 className={`text-2xl font-semibold ${themeClasses.headerText} mb-4`}>Global News Summary (Game Data)</h2>
          <button
            onClick={fetchInitialData} // This also refreshes news as it comes from the same API
            className={`mb-4 px-4 py-2 ${themeClasses.buttonPrimary} text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200`}
            disabled={loadingMarket}
          >
            {loadingMarket ? 'Refreshing...' : '📰 Refresh News'}
          </button>
          {newsSummaryData.length === 0 ? (
            <p className={`text-center ${themeClasses.subHeaderText} text-lg`}>No global news available.</p>
          ) : (
            <div className="space-y-4">
              {newsSummaryData.map((news, index) => (
                <div key={index} className={`${themeClasses.subCardBg} p-3 rounded-md shadow-sm`}>
                  <h3 className={`text-lg font-semibold ${themeClasses.inputText}`}>{news.h?.replace('%SID%', news.sid || '').replace('%INAME%', news.iID || '')}</h3>
                  <p className={`text-sm ${themeClasses.subHeaderText}`}>{news.d?.replace('%SID%', news.sid || '').replace('%INAME%', news.iID || '')}</p>
                  <p className={`text-xs ${currentTheme === 'light' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>Time: {news.tm} minutes ago</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
