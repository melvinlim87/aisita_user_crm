export const CHART_TYPES = ['Candlestick', 'Line', 'Bar', 'Area'];

export const CHART_TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1d', '1w'];

export const SAMPLE_INDICATORS = [
  {
    type: 'RSI',
    value: 58.4,
    signal: 'neutral',
    description: 'Moderate buying pressure, not yet overbought'
  },
  {
    type: 'MACD',
    value: 235.12,
    signal: 'bullish',
    description: 'Bullish crossover with increasing momentum'
  },
  {
    type: 'MA',
    value: 42150,
    signal: 'bullish',
    description: '50 EMA trending above 200 EMA'
  }
];

export const QUICK_ANALYSIS_PROMPTS = [
  {
    category: 'Technical Analysis',
    prompts: [
      'Identify key support and resistance levels',
      'Analyze the current trend direction',
      'Check for chart patterns forming',
      'Evaluate volume profile'
    ]
  },
  {
    category: 'Indicators',
    prompts: [
      'Explain RSI readings',
      'Interpret MACD signals',
      'Analyze Moving Averages',
      'Check Bollinger Bands'
    ]
  },
  {
    category: 'Trading Strategies',
    prompts: [
      'Suggest entry points',
      'Identify stop loss levels',
      'Recommend position sizing',
      'Calculate risk/reward ratio'
    ]
  }
];

export const TECHNICAL_INDICATORS = [
  { 
    name: 'RSI', 
    description: 'Relative Strength Index - Momentum oscillator that measures the speed and change of price movements'
  },
  { 
    name: 'MACD', 
    description: 'Moving Average Convergence Divergence - Trend-following momentum indicator'
  },
  { 
    name: 'Moving Average', 
    description: 'Average of a security\'s price over a specific period of time'
  },
  { 
    name: 'Bollinger Bands', 
    description: 'Volatility indicator that creates a price channel around a moving average'
  },
  { 
    name: 'Fibonacci Retracement', 
    description: 'Tool that uses horizontal lines to indicate areas of support or resistance'
  },
  { 
    name: 'Volume Profile', 
    description: 'Display of trading volume at specific price levels over a period of time'
  }
];

export const CHART_PATTERNS = [
  {
    name: 'Head and Shoulders',
    description: 'A bearish reversal pattern featuring three peaks with the middle peak being the highest',
    significance: 'Indicates a potential bullish-to-bearish trend reversal'
  },
  {
    name: 'Double Top',
    description: 'A bearish reversal pattern showing two consecutive peaks of similar height',
    significance: 'Signals that an uptrend is likely to reverse into a downtrend'
  },
  {
    name: 'Double Bottom',
    description: 'A bullish reversal pattern showing two consecutive troughs of similar depth',
    significance: 'Signals that a downtrend is likely to reverse into an uptrend'
  },
  {
    name: 'Bull Flag',
    description: 'A continuation pattern where a strong uptrend is followed by a consolidation period',
    significance: 'Suggests the uptrend will likely continue after a brief pause'
  },
  {
    name: 'Triangle',
    description: 'A consolidation pattern where price oscillates in a narrowing range',
    significance: 'Indicates a period of indecision, often followed by a breakout'
  }
];

export const MOCK_ANALYSES = [
  {
    id: '1',
    userId: 'user-1',
    chartUrl: 'https://images.pexels.com/photos/6770610/pexels-photo-6770610.jpeg',
    title: 'BTC/USD 4h Analysis',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    isFavorite: true
  },
  {
    id: '2',
    userId: 'user-1',
    chartUrl: 'https://images.pexels.com/photos/6771985/pexels-photo-6771985.jpeg',
    title: 'AAPL Daily Chart',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    isFavorite: false
  },
  {
    id: '3',
    userId: 'user-1',
    chartUrl: 'https://images.pexels.com/photos/6781340/pexels-photo-6781340.jpeg',
    title: 'EUR/USD Technical Analysis',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    isFavorite: true
  }
];

export const MOCK_CONVERSATION = {
  id: 'conv-1',
  analysisId: '1',
  messages: [
    {
      id: 'msg-1',
      sender: 'user',
      content: 'Analyze this BTC/USD chart for me',
      timestamp: new Date(Date.now() - 5000).toISOString()
    },
    {
      id: 'msg-2',
      sender: 'ai',
      content: `I've analyzed your BTC/USD 4h chart and identified several key patterns:

1. **Bullish Trend Confirmation**: The price is trading above the 50-period EMA (blue line), indicating overall bullish momentum.

2. **RSI Divergence**: There's a hidden bullish divergence on the RSI indicator, with the price making lower lows while the RSI makes higher lows.

3. **Support Zone**: There's a strong support zone around $41,200 which has been tested twice and held.

4. **Volume Profile**: Trading volume increases during upward price movements, confirming buyer strength.

What specific aspect of this chart would you like me to explain in more detail?`,
      timestamp: new Date(Date.now() - 3000).toISOString()
    }
  ]
};

export const META_GRADIENT = 'bg-gradient-to-r from-[#cbd5e1] to-[#94a3b8]';
export const META_TEXT_GRADIENT = 'metallic-text';