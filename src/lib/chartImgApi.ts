// =====================================================
// FILE: src/lib/chartImgApi.ts
// Complete Chart-IMG API Library
// =====================================================

export const BASE_URL = 'https://api.chart-img.com';

// Resolve API key from env if not provided directly
function getEnvApiKey(): string | undefined {
  // Vite-style env
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viteEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env) ? (import.meta as any).env : undefined;
  const viteKey = viteEnv?.VITE_CHARTIMG_API_KEY || viteEnv?.VITE_CHARTIMG_KEY;
  // CRA/Node-style env (best-effort in browser builds)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeEnv = (typeof process !== 'undefined' && (process as any).env) ? (process as any).env : undefined;
  const reactKey = nodeEnv?.REACT_APP_CHARTIMG_API_KEY || nodeEnv?.CHARTIMG_API_KEY;
  return viteKey || reactKey;
}

export function resolveApiKey(provided?: string): string {
  const key = provided || getEnvApiKey();
  if (!key) {
    throw new ChartImgApiError('Missing Chart-IMG API key. Provide it or set VITE_CHARTIMG_API_KEY.', 401);
  }
  return key;
}

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface ChartV2Parameters {
  apiKey?: string;
  symbol?: string;
  interval?: string;
  width?: number;
  height?: number;
  style?: string;
  theme?: string;
  scale?: string;
  session?: string;
  timezone?: string;
  format?: string;
  range?: string | DateRange;
  shiftLeft?: number;
  shiftRight?: number;
  watermark?: string;
  watermarkSize?: number;
  watermarkOpacity?: number;
  sessionId?: string;
  sessionIdSign?: string;
  override?: ChartOverride;
  studies?: ChartStudy[];
  drawings?: ChartDrawing[];
}

export interface DateRange {
  from: string; // ISO8601 format
  to: string;   // ISO8601 format
}

export interface ChartOverride {
  showLegend?: boolean;
  showLegendValues?: boolean;
  showMainPane?: boolean;
  showPriceLine?: boolean;
  showSeriesLastValue?: boolean;
  showSeriesOHLC?: boolean;
  showBarChange?: boolean;
  showStudyLastValue?: boolean;
  showStudyPlotNamesAction?: boolean;
  showSymbolLabelsAction?: boolean;
  showSymbolWatermark?: boolean;
  showInvertScale?: boolean;
  showInvertScaleStudies?: boolean;
  mainPaneHeight?: number;
  scalesFontSize?: number;
  priceRange?: {
    from?: number;
    to?: number;
    margin?: number;
  };
  style?: Record<string, any>;
}

export interface ChartStudy {
  id?: number;
  name: string;
  forceOverlay?: boolean;
  input?: Record<string, any>;
  override?: Record<string, any>;
}

export interface ChartDrawing {
  id?: number;
  name: string;
  input: Record<string, any>;
  override?: Record<string, any>;
  zOrder?: 'top' | 'bottom';
}

export interface SymbolData {
  symbol: string;
  description?: string;
  type?: string;
  exchange: string;
  currency_code?: string;
  'currency-logoid'?: string;
  'base-currency-logoid'?: string;
  provider_id?: string;
  source2?: {
    id: string;
    name: string;
    description: string;
  };
  source_id?: string;
  typespecs?: string[];
}

export interface ExchangeListResponse {
  updatedAt: string | null;
  payload: string[] | null;
}

export interface ExchangeSymbolsResponse {
  updatedAt: string | null;
  payload: SymbolData[] | null;
}

export interface ChartResponse {
  url: string;
  etag: string;
  expire?: string;
  size?: number;
  cors?: string;
  createdAt?: string;
  expireAt?: string;
}

// =====================================================
// CHART CONFIGURATION OPTIONS
// =====================================================

export const chartV2Parameters = {
  apiKey: '',
  symbol: 'BINANCE:BTCUSDT',
  interval: '1D',
  width: 800,
  height: 600,
  style: 'candle',
  theme: 'light',
  scale: 'regular',
  session: 'regular',
  timezone: 'Etc/UTC',
  format: 'png',
  range: '1D',
  shiftLeft: 10,
  shiftRight: 5,
  watermark: '',
  watermarkSize: 16,
  watermarkOpacity: 1.0,
  sessionId: '',
  sessionIdSign: '',
  override: {
    showLegend: true,
    showLegendValues: true,
    showMainPane: true,
    showPriceLine: true,
    showSeriesLastValue: true,
    showSeriesOHLC: true,
    showBarChange: true,
    showStudyLastValue: true,
    showStudyPlotNamesAction: false,
    showSymbolLabelsAction: false,
    showSymbolWatermark: false,
    showInvertScale: false,
    showInvertScaleStudies: false,
    mainPaneHeight: 400,
    scalesFontSize: 12,
    priceRange: { from: 100.0, to: 200.0, margin: 0.01 },
    style: {
      'candleStyle.upColor': 'rgb(8,153,129)',
      'candleStyle.downColor': 'rgb(242,54,69)',
      'candleStyle.borderUpColor': 'rgb(8,153,129)',
      'candleStyle.borderDownColor': 'rgb(242,54,69)',
      'candleStyle.wickUpColor': 'rgb(8,153,129)',
      'candleStyle.wickDownColor': 'rgb(242,54,69)',
      'candleStyle.drawWick': true,
      'candleStyle.drawBody': true,
      'candleStyle.drawBorder': true,
    },
  },
  studies: [
    {
      name: 'Volume',
      forceOverlay: true,
      input: {},
      override: {
        'Volume.plottype': 'columns',
        'Volume.color.0': 'rgba(247,82,95,0.5)',
        'Volume.color.1': 'rgba(34,171,148,0.5)',
      },
    },
    {
      name: 'MACD',
      input: { in_0: 12, in_1: 26, in_2: 9, in_3: 'close' },
      override: {
        'Histogram.color.0': 'rgb(34,171,148)',
        'MACD.color': 'rgb(33,150,243)',
        'Signal.color': 'rgb(255,109,0)',
      },
    },
    {
      name: 'Bollinger Bands',
      input: { in_0: 20, in_1: 2 },
      override: {
        'Upper.color': 'rgb(33,150,243)',
        'Lower.color': 'rgb(33,150,243)',
        'Median.color': 'rgb(255,109,0)',
      },
    },
    {
      name: 'Relative Strength Index',
      input: { length: 14, smoothingLine: 'SMA', smoothingLength: 14 },
      override: { 'Plot.color': 'rgb(126,87,194)', 'UpperLimit.value': 70, 'LowerLimit.value': 30 },
    },
  ],
  drawings: [
    {
      name: 'Horizontal Line',
      input: { price: 50000, text: 'Support Level' },
      override: { lineColor: 'rgb(255,0,0)', lineWidth: 2, fontSize: 14 },
      zOrder: 'top',
    },
    {
      name: 'Trend Line',
      input: {
        startDatetime: '2024-01-01T00:00:00.000Z',
        startPrice: 40000,
        endDatetime: '2024-02-01T00:00:00.000Z',
        endPrice: 60000,
        text: 'Uptrend',
      },
      override: { lineColor: 'rgb(0,255,0)', lineWidth: 3, showLabel: true },
    },
    {
      name: 'Rectangle',
      input: {
        startDatetime: '2024-01-15T00:00:00.000Z',
        startPrice: 45000,
        endDatetime: '2024-01-25T00:00:00.000Z',
        endPrice: 55000,
        text: 'Consolidation Zone',
      },
      override: { lineColor: 'rgb(255,255,0)', backgroundColor: 'rgba(255,255,0,0.2)', fillBackground: true },
    },
  ],
};

// Chart configuration options
export const chartStyles = [
  { text: 'Bar', value: 'bar' },
  { text: 'Candle', value: 'candle' },
  { text: 'Line', value: 'line' },
  { text: 'Area', value: 'area' },
  { text: 'HeikinAshi', value: 'heikinAshi' },
  { text: 'HollowCandle', value: 'hollowCandle' },
  { text: 'Baseline', value: 'baseline' },
  { text: 'HiLo', value: 'hiLo' },
  { text: 'Column', value: 'column' }
];

export const chartIntervals = [
  '1m', '3m', '5m', '15m', '30m', '45m', 
  '1h', '2h', '3h', '4h', '6h', '12h', 
  '1D', '1W', '1M', '3M', '6M', '1Y'
];

export const chartRanges = [
  '1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'ALL', 'DTD', 'WTD', 'MTD'
];

export const priceScales = [
  { value: 'regular', text: 'Regular' },
  { value: 'percent', text: 'Percent' },
  { value: 'indexedTo100', text: 'IndexedTo100' },
  { value: 'logarithmic', text: 'Logarithmic' },
];

export const tradingSessions = [
  { value: 'regular', text: 'Regular' },
  { value: 'extended', text: 'Extended' }
];

export const timezones = [
  'Etc/UTC',
  'America/New_York',
  'America/Chicago', 
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Europe/Amsterdam',
  'Europe/Zurich',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Singapore',
  'Asia/Seoul',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland'
];

// =====================================================
// TECHNICAL INDICATORS LIBRARY
// =====================================================

export const technicalIndicators = {
  // Trend Indicators
  'Moving Average': {
    name: 'Moving Average',
    input: { length: 9, source: 'close', offset: 0, smoothingLine: 'SMA', smoothingLength: 9 },
    inputName: { length: 'Length', source: 'Source', offset: 'Offset', smoothingLine: 'Smoothing Line', smoothingLength: 'Smoothing Length' },
    ranges: { length: { min: 1, max: 10000, step: 1 }, offset: { min: -10000, max: 10000, step: 1 }, smoothingLength: { min: 1, max: 10000, step: 1 } }
  },
  'Moving Average Exponential': {
    name: 'Moving Average Exponential',
    input: { length: 9, source: 'close', offset: 0, smoothingLine: 'SMA', smoothingLength: 9 },
    inputName: { length: 'Length', source: 'Source', offset: 'Offset', smoothingLine: 'Smoothing Line', smoothingLength: 'Smoothing Length' },
    ranges: { length: { min: 1, max: 10000, step: 1 }, offset: { min: -10000, max: 10000, step: 1 }, smoothingLength: { min: 1, max: 10000, step: 1 } }
  },
  'Moving Average Weighted': {
    name: 'Moving Average Weighted',
    input: { in_0: 9, in_1: 'close', in_2: 0 },
    inputName: { in_0: 'Length', in_1: 'Source', in_2: 'Offset' },
    ranges: { in_0: { min: 1, max: 2000, step: 1 }, in_2: { min: -10000, max: 10000, step: 1 } }
  },
  'Moving Average Double': {
    name: 'Moving Average Double',
    input: { firstPeriods: 14, secondPeriods: 21, method: 'Simple' },
    inputName: { firstPeriods: '1st Period', secondPeriods: '2nd Period', method: 'Method' },
    ranges: { firstPeriods: { min: 1, max: 10000, step: 1 }, secondPeriods: { min: 1, max: 10000, step: 1 } }
  },
  'Moving Average Triple': {
    name: 'Moving Average Triple',
    input: { firstPeriods: 14, secondPeriods: 21, thirdPeriods: 35, method: 'Simple' },
    inputName: { firstPeriods: '1st Period', secondPeriods: '2nd Period', thirdPeriods: '3rd Period', method: 'Method' },
    ranges: { firstPeriods: { min: 1, max: 10000, step: 1 }, secondPeriods: { min: 1, max: 10000, step: 1 }, thirdPeriods: { min: 1, max: 10000, step: 1 } }
  },
  'Moving Average Multiple': {
    name: 'Moving Average Multiple',
    input: { firstPeriods: 14, secondPeriods: 21, thirdPeriods: 35, fourthPeriods: 50, fifthPeriods: 100, sixthPeriods: 200, method: 'Simple' },
    inputName: { firstPeriods: '1st Period', secondPeriods: '2nd Period', thirdPeriods: '3rd Period', fourthPeriods: '4th Period', fifthPeriods: '5th Period', sixthPeriods: '6th Period', method: 'Method' },
    ranges: { firstPeriods: { min: 1, max: 10000, step: 1 }, secondPeriods: { min: 1, max: 10000, step: 1 }, thirdPeriods: { min: 1, max: 10000, step: 1 }, fourthPeriods: { min: 1, max: 10000, step: 1 }, fifthPeriods: { min: 1, max: 10000, step: 1 }, sixthPeriods: { min: 1, max: 10000, step: 1 } }
  },
  'Moving Average Adaptive': {
    name: 'Moving Average Adaptive',
    input: { periods: 10 },
    inputName: { periods: 'Periods' },
    ranges: { periods: { min: 2, max: 10000, step: 1 } }
  },
  'Moving Average Hamming': {
    name: 'Moving Average Hamming',
    input: { periods: 10 },
    inputName: { periods: 'Period' },
    ranges: { periods: { min: 1, max: 10000, step: 1 } }
  },
  'Smoothed Moving Average': {
    name: 'Smoothed Moving Average',
    input: { in_0: 7, in_1: 'close' },
    inputName: { in_0: 'Length', in_1: 'Source' },
    ranges: { in_0: { min: 1, max: 100000, step: 1 } }
  },
  'Bollinger Bands': {
    name: 'Bollinger Bands',
    input: { in_0: 20, in_1: 2 },
    inputName: { in_0: 'Length', in_1: 'Multiplier' },
    ranges: { in_0: { min: 1, max: 10000, step: 1 }, in_1: { min: 0.001, max: 50, step: 0.1 } }
  },
  'Bollinger Bands %B': {
    name: 'Bollinger Bands %B',
    input: { in_0: 20, in_1: 2 },
    inputName: { in_0: 'Length', in_1: 'Multiplier' },
    ranges: { in_0: { min: 1, max: 10000, step: 1 }, in_1: { min: 0.001, max: 50, step: 0.1 } }
  },
  'Bollinger Bands Width': {
    name: 'Bollinger Bands Width',
    input: { in_0: 20, in_1: 2 },
    inputName: { in_0: 'Length', in_1: 'Multiplier' },
    ranges: { in_0: { min: 1, max: 10000, step: 1 }, in_1: { min: 0.001, max: 50, step: 0.1 } }
  },
  'Donchian Channels': {
    name: 'Donchian Channels',
    input: { in_0: 20 },
    inputName: { in_0: 'Length' },
    ranges: { in_0: { min: 1, max: 2000, step: 1 } }
  },
  'Keltner Channels': {
    name: 'Keltner Channels',
    input: { in_0: true, in_1: 20, in_2: 1 },
    inputName: { in_0: 'Use True Range', in_1: 'Length', in_2: 'Multiplier' },
    ranges: { in_1: { min: 1, max: 2000, step: 1 }, in_2: { min: -100000, max: 100000, step: 0.1 } }
  },
  'Moving Average Channel': {
    name: 'Moving Average Channel',
    input: { in_0: 20, in_1: 20, in_2: 0, in_3: 0 },
    inputName: { in_0: 'Upper Length', in_1: 'Lower Length', in_2: 'Upper Offset', in_3: 'Lower Offset' },
    ranges: { in_0: { min: 1, max: 10000, step: 1 }, in_1: { min: 1, max: 10000, step: 1 }, in_2: { min: -10000, max: 10000, step: 1 }, in_3: { min: -10000, max: 10000, step: 1 } }
  },
  'Envelopes': {
    name: 'Envelopes',
    input: { in_0: 20, in_1: 2, in_2: 2, in_3: 'Simple', in_4: 'close' },
    inputName: { in_0: 'Length', in_1: 'Upper Percentage', in_2: 'Lower Percentage', in_3: 'Method', in_4: 'Source' },
    ranges: { in_0: { min: 1, max: 2000, step: 1 }, in_1: { min: 1, max: 2000, step: 0.1 }, in_2: { min: 1, max: 2000, step: 0.1 } }
  },
  'Ichimoku Cloud': {
    name: 'Ichimoku Cloud',
    input: { in_0: 9, in_1: 26, in_2: 52, in_3: 26 },
    inputName: { in_0: 'Conversion Line Periods', in_1: 'Base Line Periods', in_2: 'Leading Span B', in_3: 'Lagging Span' },
    ranges: { in_0: { min: 1, max: 100000, step: 1 }, in_1: { min: 1, max: 100000, step: 1 }, in_2: { min: 1, max: 100000, step: 1 }, in_3: { min: 1, max: 100000, step: 1 } }
  },
  'Parabolic SAR': {
    name: 'Parabolic SAR',
    input: { in_0: 0.02, in_1: 0.02, in_2: 0.2 },
    inputName: { in_0: 'Start', in_1: 'Increment', in_2: 'Maximum' },
    ranges: { in_0: { min: -100000, max: 100000, step: 0.01 }, in_1: { min: -100000, max: 100000, step: 0.01 }, in_2: { min: -100000, max: 100000, step: 0.01 } }
  },
  'Hull Moving Average': {
    name: 'Hull Moving Average',
    input: { in_0: 9 },
    inputName: { in_0: 'Length' },
    ranges: { in_0: { min: 1, max: 10000, step: 1 } }
  },
  'Double EMA': {
    name: 'Double EMA',
    input: { in_0: 9 },
    inputName: { in_0: 'Length' },
    ranges: { in_0: { min: 1, max: 10000, step: 1 } }
  },
  'Triple EMA': {
    name: 'Triple EMA',
    input: { in_0: 9 },
    inputName: { in_0: 'Length' },
    ranges: { in_0: { min: 1, max: 10000, step: 1 } }
  },
  'Super Trend': {
    name: 'Super Trend',
    input: { in_0: 10, in_1: 3 },
    inputName: { in_0: 'Length', in_1: 'Factor' },
    ranges: { in_0: { min: 1, max: 100, step: 1 }, in_1: { min: 1, max: 100, step: 1 } }
  },
  'Least Squares Moving Average': {
    name: 'Least Squares Moving Average',
    input: { in_0: 25, in_1: 0 },
    inputName: { in_0: 'Length', in_1: 'Offset' },
    ranges: { in_0: { min: 1, max: 100000, step: 1 }, in_1: { min: -100000, max: 100000, step: 1 } }
  },
  'Linear Regression Curve': {
    name: 'Linear Regression Curve',
    input: { in_0: 9 },
    inputName: { in_0: 'Length' },
    ranges: { in_0: { min: 1, max: 2000, step: 1 } }
  },
  'Arnaud Legoux Moving Average': {
    name: 'Arnaud Legoux Moving Average',
    input: { in_0: 9, in_1: 0.85, in_2: 6 },
    inputName: { in_0: 'Window Size', in_1: 'Offset', in_2: 'Sigma' },
    ranges: { in_0: { min: 0, max: 5000, step: 1 }, in_1: { min: -100000, max: 100000, step: 0.01 }, in_2: { min: -100000, max: 100000, step: 0.1 } }
  },

  // Momentum Oscillators
  'MACD': {
    name: 'MACD',
    input: { in_0: 12, in_1: 26, in_2: 9, in_3: 'close' },
    inputName: { in_0: 'Fast Length', in_1: 'Slow Length', in_2: 'Signal Length', in_3: 'Source' },
    ranges: { in_0: { min: 1, max: 2000, step: 1 }, in_1: { min: 1, max: 2000, step: 1 }, in_2: { min: 1, max: 50, step: 1 } }
  },
  'Relative Strength Index': {
    name: 'Relative Strength Index',
    input: { length: 14, smoothingLine: 'SMA', smoothingLength: 14 },
    inputName: { length: 'Length', smoothingLine: 'Smoothing Line', smoothingLength: 'Smoothing Length' },
    ranges: { length: { min: 1, max: 2000, step: 1 }, smoothingLength: { min: 1, max: 10000, step: 1 } }
  },
  'Stochastic': {
    name: 'Stochastic',
    input: { in_0: 14, in_1: 1, in_2: 3 },
    inputName: { in_0: '%K', in_1: '%D', in_2: 'Smooth' },
    ranges: { in_0: { min: 1, max: 10000, step: 1 }, in_1: { min: 1, max: 10000, step: 1 }, in_2: { min: 1, max: 10000, step: 1 } }
  },
  'Stochastic RSI': {
    name: 'Stochastic RSI',
    input: { in_0: 14, in_1: 14, in_2: 3, in_3: 3 },
    inputName: { in_0: 'Length RSI', in_1: 'Length Stoch', in_2: 'Smooth K', in_3: 'Smooth D' },
    ranges: { in_0: { min: 1, max: 10000, step: 1 }, in_1: { min: 1, max: 10000, step: 1 }, in_2: { min: 1, max: 10000, step: 1 }, in_3: { min: 1, max: 10000, step: 1 } }
  },
  'Williams %R': {
    name: 'Williams %R',
    input: { in_0: 14 },
    inputName: { in_0: 'Length' },
    ranges: { in_0: { min: 1, max: 2000, step: 1 } }
  },
  'Awesome Oscillator': {
    name: 'Awesome Oscillator',
    input: {},
    inputName: {},
    ranges: {}
  },
  'Momentum': {
    name: 'Momentum',
    input: { in_0: 10, in_1: 'close' },
    inputName: { in_0: 'Length', in_1: 'Source' },
    ranges: { in_0: { min: 1, max: 1000, step: 1 } }
  },
  'Rate Of Change': {
    name: 'Rate Of Change',
    input: { in_0: 9 },
    inputName: { in_0: 'Length' },
    ranges: { in_0: { min: 1, max: 100000, step: 1 } }
  },
  'Commodity Channel Index': {
    name: 'Commodity Channel Index',
    input: { in_0: 20, smoothingLine: 'SMA', smoothingLength: 20 },
    inputName: { in_0: 'Length', smoothingLine: 'Smoothing Line', smoothingLength: 'Smoothing Length' },
    ranges: { in_0: { min: 1, max: 2000, step: 1 }, smoothingLength: { min: 1, max: 10000, step: 1 } }
  },
  'Money Flow Index': {
    name: 'Money Flow Index',
    input: { in_0: 14 },
    inputName: { in_0: 'Length' },
    ranges: { in_0: { min: 1, max: 2000, step: 1 } }
  },
  'Ultimate Oscillator': {
    name: 'Ultimate Oscillator',
    input: { in_0: 7, in_1: 14, in_2: 28 },
    inputName: { in_0: 'Length7', in_1: 'Length14', in_2: 'Length28' },
    ranges: { in_0: { min: 1, max: 100000, step: 1 }, in_1: { min: 1, max: 100000, step: 1 }, in_2: { min: 1, max: 100000, step: 1 } }
  },
  'Chande Momentum Oscillator': {
    name: 'Chande Momentum Oscillator',
    input: { in_0: 9 },
    inputName: { in_0: 'Length' },
    ranges: { in_0: { min: 1, max: 2000, step: 1 } }
  },
  'Connors RSI': {
    name: 'Connors RSI',
    input: { in_0: 3, in_1: 2, in_2: 100 },
    inputName: { in_0: 'RSI Length', in_1: 'Up/Down Length', in_2: 'ROC Length' },
    ranges: { in_0: { min: 1, max: 10000, step: 1 }, in_1: { min: 1, max: 10000, step: 1 }, in_2: { min: 1, max: 10000, step: 1 } }
  },
  'Fisher Transform': {
    name: 'Fisher Transform',
    input: { in_0: 9 },
    inputName: { in_0: 'Length' },
    ranges: { in_0: { min: 1, max: 10000, step: 1 } }
  },
  'True Strength Index': {
    name: 'True Strength Index',
    input: { in_0: 25, in_1: 13, in_2: 13 },
    inputName: { in_0: 'Long', in_1: 'Short', in_2: 'Signal Length' },
    ranges: { in_0: { min: 1, max: 4999, step: 1 }, in_1: { min: 1, max: 4999, step: 1 }, in_2: { min: 1, max: 4999, step: 1 } }
  },
  'Relative Vigor Index': {
    name: 'Relative Vigor Index',
    input: { in_0: 10 },
    inputName: { in_0: 'Length' },
    ranges: { in_0: { min: 1, max: 2000, step: 1 } }
  },
  'Aroon': {
    name: 'Aroon',
    input: { in_0: 14 },
    inputName: { in_0: 'Length' },
    ranges: { in_0: { min: 1, max: 2000, step: 1 } }
  },
  'Average Directional Index': {
    name: 'Average Directional Index',
    input: { in_0: 14, in_1: 14 },
    inputName: { in_0: 'Smoothing', in_1: 'DI Length' },
    ranges: { in_0: { min: -100000, max: 100000, step: 1 }, in_1: { min: -100000, max: 100000, step: 1 } }
  },
  'Directional Movement': {
    name: 'Directional Movement',
    input: { in_0: 14, in_1: 14 },
    inputName: { in_0: 'DI Length', in_1: 'ADX Smoothing' },
    ranges: { in_0: { min: 1, max: 2000, step: 1 }, in_1: { min: 1, max: 50, step: 1 } }
  },
  'Detrended Price Oscillator': {
    name: 'Detrended Price Oscillator',
    input: { in_0: 21, in_1: false },
    inputName: { in_0: 'Period', in_1: 'Is Centered' },
    ranges: { in_0: { min: 1, max: 100000, step: 1 } }
  },
  'Price Oscillator': {
    name: 'Price Oscillator',
    input: { in_0: 10, in_1: 21 },
    inputName: { in_0: 'Short Length', in_1: 'Long Length' },
    ranges: { in_0: { min: 1, max: 2000, step: 1 }, in_1: { min: 1, max: 2000, step: 1 } }
  },
  'Coppock Curve': {
    name: 'Coppock Curve',
    input: { in_0: 10, in_1: 14, in_2: 11 },
    inputName: { in_0: 'WMA Length', in_1: 'Long ROC Length', in_2: 'Short ROC Length' },
    ranges: { in_0: { min: -10000, max: 5000, step: 1 }, in_1: { min: 1, max: 4999, step: 1 }, in_2: { min: 1, max: 4999, step: 1 } }
  },
  'Know Sure Thing': {
    name: 'Know Sure Thing',
    input: { in_0: 10, in_1: 15, in_2: 20, in_3: 30, in_4: 10, in_5: 10, in_6: 10, in_7: 15, in_8: 9 },
    inputName: { in_0: 'ROC Length #1', in_1: 'ROC Length #2', in_2: 'ROC Length #3', in_3: 'ROC Length #4', in_4: 'SMA Length #1', in_5: 'SMA Length #2', in_6: 'SMA Length #3', in_7: 'SMA Length #4', in_8: 'Signal Line Length' },
    ranges: { in_0: { min: 1, max: 2000, step: 1 }, in_1: { min: 1, max: 2000, step: 1 }, in_2: { min: 1, max: 2000, step: 1 }, in_3: { min: 1, max: 2000, step: 1 }, in_4: { min: 1, max: 2000, step: 1 }, in_5: { min: 1, max: 2000, step: 1 }, in_6: { min: 1, max: 2000, step: 1 }, in_7: { min: 1, max: 2000, step: 1 }, in_8: { min: 1, max: 2000, step: 1 } }
  },

  // Volume Indicators
  'Volume': {
    name: 'Volume',
    input: {},
    inputName: {},
    ranges: {}
  },
  'Volume Oscillator': {
    name: 'Volume Oscillator',
    input: { in_0: 5, in_1: 10 },
    inputName: { in_0: 'Short Length', in_1: 'Long Length' },
    ranges: { in_0: { min: 1, max: 4999, step: 1 }, in_1: { min: 1, max: 4999, step: 1 } }
  },
  'On Balance Volume': {
    name: 'On Balance Volume',
    input: { smoothingLine: 'SMA', smoothingLength: 9 },
    inputName: { smoothingLine: 'Smoothing Line', smoothingLength: 'Smoothing Length' },
    ranges: { smoothingLength: { min: 1, max: 10000, step: 1 } }
  },
  'Accumulation/Distribution': {
    name: 'Accumulation/Distribution',
    input: {},
    inputName: {},
    ranges: {}
  },
  'Chaikin Money Flow': {
    name: 'Chaikin Money Flow',
    input: { in_0: 20 },
    inputName: { in_0: 'Length' },
    ranges: { in_0: { min: 1, max: 2000, step: 1 } }
  },
  'Chaikin Oscillator': {
    name: 'Chaikin Oscillator',
    input: { in_0: 3, in_1: 10 },
    inputName: { in_0: 'Short', in_1: 'Long' },
    ranges: { in_0: { min: 1, max: 2000, step: 1 }, in_1: { min: 1, max: 2000, step: 1 } }
  },
  'Chaikin Volatility': {
    name: 'Chaikin Volatility',
    input: { periods: 10, rocLookback: 10 },
    inputName: { periods: 'Periods', rocLookback: 'Rate of Change Lookback' },
    ranges: { periods: { min: 1, max: 2000, step: 1 }, rocLookback: { min: 1, max: 2000, step: 1 } }
  },
  'Price Volume Trend': {
    name: 'Price Volume Trend',
    input: {},
    inputName: {},
    ranges: {}
  },
  'Ease of Movement': {
    name: 'Ease of Movement',
    input: { in_0: 10000, in_1: 14 },
    inputName: { in_0: 'Divisor', in_1: 'Length' },
    ranges: { in_0: { min: 1, max: 1000000000, step: 1000 }, in_1: { min: 1, max: 2000, step: 1 } }
  },
  'Elder\'s Force Index': {
    name: 'Elder\'s Force Index',
    input: { in_0: 13 },
    inputName: { in_0: 'Length' },
    ranges: { in_0: { min: 1, max: 2000, step: 1 } }
  },
  'Volume Profile Visible Range': {
    name: 'Volume Profile Visible Range',
    input: { rows: 24, volume: 'Up/Down', vaVolume: 70 },
    inputName: { rows: 'Row Size', volume: 'Volume', vaVolume: 'Value Area Volume' },
    ranges: { rows: { min: 1, max: 1000000, step: 1 }, vaVolume: { min: 0, max: 100, step: 1 } }
  },
  'VWAP': {
    name: 'VWAP',
    input: {},
    inputName: {},
    ranges: {}
  },
  'VWMA': {
    name: 'VWMA',
    input: { in_0: 20 },
    inputName: { in_0: 'Length' },
    ranges: { in_0: { min: 1, max: 10000, step: 1 } }
  },
  'Net Volume': {
    name: 'Net Volume',
    input: {},
    inputName: {},
    ranges: {}
  },
  'Klinger Oscillator': {
    name: 'Klinger Oscillator',
    input: {},
    inputName: {},
    ranges: {}
  },

  // Volatility Indicators
  'Average True Range': {
    name: 'Average True Range',
    input: { in_0: 14 },
    inputName: { in_0: 'Length' },
    ranges: { in_0: { min: 1, max: 2000, step: 1 } }
  },
  'Historical Volatility': {
    name: 'Historical Volatility',
    input: { in_0: 10 },
    inputName: { in_0: 'Length' },
    ranges: { in_0: { min: 1, max: 100000, step: 1 } }
  },
  'Standard Deviation': {
    name: 'Standard Deviation',
    input: { periods: 5, deviations: 1 },
    inputName: { periods: 'Periods', deviations: 'Deviations' },
    ranges: { periods: { min: 1, max: 100000, step: 1 }, deviations: { min: -100000, max: 100000, step: 1 } }
  },
  'Standard Error': {
    name: 'Standard Error',
    input: { length: 14 },
    inputName: { length: 'Length' },
    ranges: { length: { min: 3, max: 100000, step: 1 } }
  },
  'Standard Error Bands': {
    name: 'Standard Error Bands',
    input: { periods: 21, errors: 2, method: 'Simple', averagePeriods: 3 },
    inputName: { periods: 'Period', errors: 'Standard Errors', method: 'Method', averagePeriods: 'Average Periods' },
    ranges: { periods: { min: -100000, max: 100000, step: 1 }, errors: { min: -100000, max: 100000, step: 0.1 }, averagePeriods: { min: 1, max: 100000, step: 1 } }
  },
  'Volatility Close-to-Close': {
    name: 'Volatility Close-to-Close',
    input: { periods: 10, daysPerYear: 252 },
    inputName: { periods: 'Periods', daysPerYear: 'Days Per Year' },
    ranges: { periods: { min: 2, max: 100000, step: 1 }, daysPerYear: { min: 1, max: 366, step: 1 } }
  },
  'Volatility O-H-L-C': {
    name: 'Volatility O-H-L-C',
    input: { periods: 10, marketClosedPercentage: 0, daysPerYear: 252 },
    inputName: { periods: 'Periods', marketClosedPercentage: 'Market Closed Percentage', daysPerYear: 'Days Per Year' },
    ranges: { periods: { min: 1, max: 100000, step: 1 }, marketClosedPercentage: { min: 0, max: 0.999, step: 0.001 }, daysPerYear: { min: 1, max: 100000, step: 1 } }
  },
  'Volatility Zero Trend Close-to-Close': {
    name: 'Volatility Zero Trend Close-to-Close',
    input: { periods: 10, daysPerYear: 252 },
    inputName: { periods: 'Periods', daysPerYear: 'Days Per Year' },
    ranges: { periods: { min: 1, max: 10000, step: 1 }, daysPerYear: { min: 1, max: 100000, step: 1 } }
  },
  'Volatility Index': {
    name: 'Volatility Index',
    input: { periods: 10, atrMult: 3, method: 'Wilder Smoothing' },
    inputName: { periods: 'Periods', atrMult: 'ATR Multiplier', method: 'Method' },
    ranges: { periods: { min: 2, max: 10000, step: 1 }, atrMult: { min: -10000, max: 10000, step: 0.1 } }
  },

  // Support/Resistance & Patterns
  'Price Channel': {
    name: 'Price Channel',
    input: { in_0: 20, in_1: 0 },
    inputName: { in_0: 'Length', in_1: 'Offset Length' },
    ranges: { in_0: { min: 1, max: 2000, step: 1 }, in_1: { min: 0, max: 2000, step: 1 } }
  },
  'Zig Zag': {
    name: 'Zig Zag',
    input: { in_0: 5, in_1: 10 },
    inputName: { in_0: 'Deviation', in_1: 'Depth' },
    ranges: { in_0: { min: 0.001, max: 100, step: 0.1 }, in_1: { min: 2, max: 1000, step: 1 } }
  },
  'Williams Fractal': {
    name: 'Williams Fractal',
    input: { in_0: 2 },
    inputName: { in_0: 'Periods' },
    ranges: { in_0: { min: 2, max: 100000, step: 1 } }
  },
  'Linear Regression Slope': {
    name: 'Linear Regression Slope',
    input: { periods: 14 },
    inputName: { periods: 'Length' },
    ranges: { periods: { min: 2, max: 100000, step: 1 } }
  },

  // Market Breadth
  'Advance/Decline': {
    name: 'Advance/Decline',
    input: { in_0: 10 },
    inputName: { in_0: 'Length' },
    ranges: { in_0: { min: 1, max: 2000, step: 1 } }
  },
  'Chop Zone': {
    name: 'Chop Zone',
    input: {},
    inputName: {},
    ranges: {}
  },
  'Choppiness Index': {
    name: 'Choppiness Index',
    input: { in_0: 14 },
    inputName: { in_0: 'Length' },
    ranges: { in_0: { min: 1, max: 1000, step: 1 } }
  },
  'Majority Rule': {
    name: 'Majority Rule',
    input: { rollingPeriod: 14 },
    inputName: { rollingPeriod: 'Rolling Period' },
    ranges: { rollingPeriod: { min: 1, max: 10000, step: 1 } }
  },
  'Trend Strength Index': {
    name: 'Trend Strength Index',
    input: { periods: 9 },
    inputName: { periods: 'Periods' },
    ranges: { periods: { min: 2, max: 100000, step: 1 } }
  },

  // Specialized Indicators
  'Balance of Power': {
    name: 'Balance of Power',
    input: {},
    inputName: {},
    ranges: {}
  },
  'Mass Index': {
    name: 'Mass Index',
    input: { in_0: 10 },
    inputName: { in_0: 'Length' },
    ranges: { in_0: { min: 1, max: 2000, step: 1 } }
  },
  'McGinley Dynamic': {
    name: 'McGinley Dynamic',
    input: { in_0: 10 },
    inputName: { in_0: 'Length' },
    ranges: { in_0: { min: 1, max: 2000, step: 1 } }
  },
  'Williams Alligator': {
    name: 'Williams Alligator',
    input: { in_0: 21, in_1: 13, in_2: 8, in_3: 8, in_4: 5, in_5: 3 },
    inputName: { in_0: 'Jaw Length', in_1: 'Teeth Length', in_2: 'Lips Length', in_3: 'Jaw Offset', in_4: 'Teeth Offset', in_5: 'Lips Offset' },
    ranges: { in_0: { min: 1, max: 2000, step: 1 }, in_1: { min: 1, max: 2000, step: 1 }, in_2: { min: 1, max: 2000, step: 1 }, in_3: { min: 1, max: 2000, step: 1 }, in_4: { min: 1, max: 2000, step: 1 }, in_5: { min: 1, max: 2000, step: 1 } }
  },
  'Accumulative Swing Index': {
    name: 'Accumulative Swing Index',
    input: { in_0: 10 },
    inputName: { in_0: 'Limit Move Value' },
    ranges: { in_0: { min: 0.1, max: 100000, step: 0.1 } }
  },
  'Chande Kroll Stop': {
    name: 'Chande Kroll Stop',
    input: { in_0: 10, in_1: 1, in_2: 9 },
    inputName: { in_0: 'P', in_1: 'X', in_2: 'Q' },
    ranges: { in_0: { min: 1, max: 4999, step: 1 }, in_1: { min: 1, max: 1000000, step: 1 }, in_2: { min: 1, max: 1000000, step: 1 } }
  },
  'TRIX': {
    name: 'TRIX',
    input: { in_0: 18 },
    inputName: { in_0: 'Length' },
    ranges: { in_0: { min: 1, max: 2000, step: 1 } }
  },
  'Vortex Indicator': {
    name: 'Vortex Indicator',
    input: { in_0: 14 },
    inputName: { in_0: 'Period' },
    ranges: { in_0: { min: 2, max: 100000, step: 1 } }
  },
  'SMI Ergodic Indicator/Oscillator': {
    name: 'SMI Ergodic Indicator/Oscillator',
    input: { in_0: 5, in_1: 20, in_2: 5 },
    inputName: { in_0: 'Short Length', in_1: 'Long Length', in_2: 'Signal Length' },
    ranges: { in_0: { min: 1, max: 2000, step: 1 }, in_1: { min: 1, max: 2000, step: 1 }, in_2: { min: 1, max: 2000, step: 1 } }
  },
  'MA Cross': {
    name: 'MA Cross',
    input: { in_0: 9, in_1: 26 },
    inputName: { in_0: 'Short', in_1: 'Long' },
    ranges: { in_0: { min: 1, max: 2000, step: 1 }, in_1: { min: 1, max: 2000, step: 1 } }
  },
  'MA with EMA Cross': {
    name: 'MA with EMA Cross',
    input: { in_0: 10, in_1: 10 },
    inputName: { in_0: 'MA Length', in_1: 'EMA Length' },
    ranges: { in_0: { min: 1, max: 2000, step: 1 }, in_1: { min: 1, max: 2000, step: 1 } }
  }
};

// =====================================================
// POPULAR EXCHANGES AND SYMBOLS
// =====================================================

export const popularExchanges = [
  'BINANCE', 'NASDAQ', 'NYSE', 'COINBASE', 'KRAKEN', 'BYBIT', 
  'OKX', 'FX', 'CME', 'EURONEXT', 'LSE', 'TSX', 'MEXC',
  'GATEIO', 'HTX', 'KUCOIN', 'BITFINEX', 'GEMINI', 'OANDA'
];

export const exchangeCategories = {
  crypto: [
    'BINANCE', 'BINANCEUS', 'COINBASE', 'KRAKEN', 'BYBIT', 'OKX', 
    'MEXC', 'GATEIO', 'HTX', 'KUCOIN', 'BITFINEX', 'GEMINI',
    'BITSTAMP', 'BITTREX', 'POLONIEX', 'DERIBIT', 'PHEMEX'
  ],
  stocks: [
    'NASDAQ', 'NYSE', 'AMEX', 'LSE', 'EURONEXT', 'TSX', 'ASX',
    'XETR', 'FWB', 'MIL', 'BME', 'OMXSTO', 'JSE', 'HKEX',
    'SSE', 'SZSE', 'TSE', 'KRX', 'BSE', 'NSE'
  ],
  forex: [
    'FX', 'OANDA', 'FXCM', 'FOREXCOM', 'PEPPERSTONE', 'ICE',
    'SAXO', 'ACTIVTRADES', 'EIGHTCAP', 'ICMARKETS'
  ],
  futures: [
    'CME', 'CBOT', 'COMEX', 'NYMEX', 'EUREX', 'ICEUS',
    'CBOE', 'MGEX', 'MATBAROFEX', 'BMFBOVESPA'
  ],
  indices: [
    'TVC', 'SP', 'NASDAQ', 'DJ', 'RUSSELL', 'CAPITALCOM',
    'INDEX', 'CBOEEU', 'CURRENCYCOM'
  ]
};

// =====================================================
// DRAWING PRESETS
// =====================================================

export const drawingPresets = {
  // 'Support Line': {
  //   name: 'Support Line',
  //   input: { 
  //       price: 0, 
  //       text: 'Support', 
  //       startDatetime: '',
  //       startPrice: 0,
  //       endDatetime: '',
  //       endPrice: 0,
  //       datetime: '', 
  //   },
  //   override: { 
  //     lineColor: 'rgb(0,255,0)', 
  //     lineWidth: 2,
  //     fontSize: 12,
  //     showPrice: true,
  //     fontBold: false
  //   },
  //   zOrder: 'top'
  // },
  // 'Resistance Line': {
  //   name: 'Resistance Line', 
  //   input: { 
  //       price: 0, 
  //       text: 'Resistance', 
  //       startDatetime: '',
  //       startPrice: 0,
  //       endDatetime: '',
  //       endPrice: 0,
  //       datetime: '', 
  //   },
  //   override: { 
  //     lineColor: 'rgb(255,0,0)', 
  //     lineWidth: 2,
  //     fontSize: 12,
  //     showPrice: true,
  //     fontBold: false
  //   },
  //   zOrder: 'top'
  // },
  'Trend Line': {
    name: 'Trend Line',
    input: {
      startDatetime: '',
      startPrice: 0,
      endDatetime: '',
      endPrice: 0,
      datetime: '',
      text: 'Trend'
    },
    override: { 
      lineColor: 'rgb(255,255,0)', 
      lineWidth: 2,
      fontSize: 14,
      showLabel: true,
      extendRight: false
    },
    zOrder: 'top'
  },
  'Rectangle': {
    name: 'Rectangle',
    input: {
      startDatetime: '',
      startPrice: 0,
      endDatetime: '',
      endPrice: 0,
      datetime: '',
      text: 'Rectangle Zone'
    },
    override: { 
      lineColor: 'rgb(255,165,0)', 
      backgroundColor: 'rgba(255,165,0,0.2)',
      fillBackground: true,
      lineWidth: 1,
      showLabel: false
    },
    zOrder: 'top'
  },
  'Long Position': {
    name: 'Long Position',
    input: {
      startDatetime: '',
      entryPrice: 0,
      targetPrice: 0,
      stopPrice: 0,
      endDatetime: '',
      datetime: '',
      text: 'Long Position'
    },
    override: {
      fontSize: 12,
      lineWidth: 1,
      accountSize: 1000,
      lotSize: 1,
      risk: 25,
      showStats: false
    },
    zOrder: 'top'
  },
  'Short Position': {
    name: 'Short Position',
    input: {
      startDatetime: '',
      entryPrice: 0,
      targetPrice: 0,
      stopPrice: 0,
      endDatetime: '',
      datetime: '',
      text: 'Short Position'
    },
    override: {
      fontSize: 12,
      lineWidth: 1,
      accountSize: 1000,
      lotSize: 1,
      risk: 25,
      showStats: false
    },
    zOrder: 'top'
  },
  'Fib Retracement': {
    name: 'Fib Retracement',
    input: {
      startDatetime: '',
      startPrice: 0,
      endDatetime: '',
      endPrice: 0,
      datetime: '',
      text: 'Fib Retracement'
    },
    override: {
      fontSize: 12,
      transparency: 80,
      fillBackground: true,
      extendLines: false,
      showCoeff: true,
      showPrice: true
    },
    zOrder: 'top'
  },
  'Arrow Mark Up': {
    name: 'Arrow Mark Up',
    input: {
      startDatetime: '',
      startPrice: 0,
      endDatetime: '',
      endPrice: 0,
      datetime: '',
      price: 0,
      text: 'Buy Signal'
    },
    override: {
      fontSize: 14,
      fontBold: false,
      textColor: 'rgb(8,153,129)',
      arrowColor: 'rgb(8,153,129)'
    },
    zOrder: 'top'
  },
  'Arrow Mark Down': {
    name: 'Arrow Mark Down',
    input: {
      startDatetime: '',
      startPrice: 0,
      endDatetime: '',
      endPrice: 0,
      datetime: '',
      price: 0,
      text: 'Sell Signal'
    },
    override: {
      fontSize: 14,
      fontBold: false,
      textColor: 'rgb(204,47,60)',
      arrowColor: 'rgb(204,47,60)'
    },
    zOrder: 'top'
  },
  'Text Note': {
    name: 'Text Note',
    input: {
      startDatetime: '',
      startPrice: 0,
      endDatetime: '',
      endPrice: 0,
      datetime: '',
      price: 0,
      text: 'Note'
    },
    override: {
      fontSize: 14,
      fontBold: false,
      showBorder: false,
      fillBackground: false,
      textColor: 'rgb(41,98,255)'
    },
    zOrder: 'top'
  }
};

// =====================================================
// STUDY PRESETS
// =====================================================

export const studyPresets = {
  'MACD': {
    name: 'MACD',
    input: { in_0: 12, in_1: 26, in_2: 9, in_3: 'close' },
    forceOverlay: true,
    zOrder: 'top',
    override: {
      'MACD.color': 'rgb(33,150,243)',
      'Signal.color': 'rgb(255,109,0)',
      'Histogram.color.0': 'rgb(34,171,148)',
      'Histogram.color.1': 'rgb(172,229,220)',
      'Histogram.color.2': 'rgb(252,203,205)',
      'Histogram.color.3': 'rgb(255,82,82)'
    }
  },
  'Relative Strength Index': {
    name: 'Relative Strength Index',
    input: { length: 14, smoothingLine: 'SMA', smoothingLength: 14 },
    forceOverlay: true,
    zOrder: 'top',
    override: {
      'Plot.color': 'rgb(126,87,194)',
      'UpperLimit.value': 70,
      'LowerLimit.value': 30,
      'UpperLimit.color': 'rgb(120,123,134)',
      'LowerLimit.color': 'rgb(120,123,134)',
      'Hlines Background.visible': true,
      'Hlines Background.color': 'rgba(126,87,194,0.1)'
    }
  },
  'Bollinger Bands': {
    name: 'Bollinger Bands',
    input: { in_0: 20, in_1: 2 },
    forceOverlay: true,
    zOrder: 'top',
    override: {
      'Upper.color': 'rgb(33,150,243)',
      'Lower.color': 'rgb(33,150,243)',
      'Median.color': 'rgb(255,109,0)',
      'Median.linewidth': 1,
      'Upper.linewidth': 1,
      'Lower.linewidth': 1,
      'Plots Background.visible': true,
      'Plots Background.color': 'rgba(33,150,243,0.1)'
    }
  },
  'Moving Average': {
    name: 'Moving Average',
    input: { length: 50, source: 'close', offset: 0 },
    forceOverlay: true,
    zOrder: 'top',
    override: {
      'Plot.color': 'rgb(255,109,0)',
      'Plot.linewidth': 2,
      'Plot.plottype': 'line'
    }
  },
  'EMA': {
    name: 'Moving Average Exponential',
    input: { length: 21, source: 'close', offset: 0 },
    forceOverlay: true,
    zOrder: 'top',
    override: {
      'Plot.color': 'rgb(34,171,148)',
      'Plot.linewidth': 1,
      'Plot.plottype': 'line'
    }
  },
  'Stochastic': {
    name: 'Stochastic',
    input: { in_0: 14, in_1: 1, in_2: 3 },
    forceOverlay: true,
    zOrder: 'top',
    override: {
      '%K.color': 'rgb(33,150,243)',
      '%D.color': 'rgb(255,109,0)',
      'UpperLimit.value': 80,
      'LowerLimit.value': 20,
      'Hlines Background.visible': true,
      'Hlines Background.color': 'rgba(33,150,243,0.1)'
    }
  },
  'VWAP': {
    name: 'VWAP',
    input: {},
    forceOverlay: true,
    zOrder: 'top',
    override: {
      'VWAP.color': 'rgb(255,215,0)',
      'VWAP.linewidth': 2,
      'VWAP.plottype': 'line'
    }
  },
  'ATR': {
    name: 'Average True Range',
    input: { in_0: 14 },
    forceOverlay: true,
    zOrder: 'top',
    override: {
      'Plot.color': 'rgb(128,25,34)',
      'Plot.linewidth': 1
    }
  },
  'Ichimoku Cloud': {
    name: 'Ichimoku Cloud',
    input: { in_0: 9, in_1: 26, in_2: 52, in_3: 26 },
    forceOverlay: true,
    zOrder: 'top',
    override: {
      'ConversionLine.color': 'rgb(33,150,243)',
      'BaseLine.color': 'rgb(128,25,34)',
      'LaggingSpan.color': 'rgb(67,160,71)',
      'LeadingSpanA.color': 'rgb(165,214,167)',
      'LeadingSpanB.color': 'rgb(250,161,164)',
      'Plots Background.visible': true,
      'Plots Background.transparency': 90
    }
  }
};

// =====================================================
// API FUNCTIONS
// =====================================================

/**
 * Get list of all supported exchanges
 */
export async function getExchangeList(apiKey?: string): Promise<ExchangeListResponse> {
  const key = resolveApiKey(apiKey);
  try {
    const response = await fetch(`${BASE_URL}/v3/tradingview/exchange/list`, {
      method: 'GET',
      headers: {
        'x-api-key': key
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Error ${response.status}: ${errorData.message || response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(`Failed to get exchange list: ${error.message}`);
  }
}

/**
 * Get symbols for a specific exchange
 */
export async function getExchangeSymbols(params: {
  apiKey?: string;
  exchangeId: string;
  symbol?: string;
  type?: string;
}): Promise<ExchangeSymbolsResponse> {
  const key = resolveApiKey(params.apiKey);
  const queryParams = new URLSearchParams();
  if (params.symbol) queryParams.set('symbol', params.symbol);
  if (params.type) queryParams.set('type', params.type);

  const queryString = queryParams.toString();
  const url = `${BASE_URL}/v3/tradingview/exchange/${params.exchangeId.toLowerCase()}${queryString ? `?${queryString}` : ''}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': key
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Error ${response.status}: ${errorData.message || response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(`Failed to get exchange symbols: ${error.message}`);
  }
}

// =====================================================
// MAIN CHART GENERATION API
// =====================================================

/**
 * Generate advanced chart using Chart-IMG API v2
 */
export async function generateChartV2(params: ChartV2Parameters): Promise<ChartResponse> {
  const key = resolveApiKey(params.apiKey);
  const {
    symbol = 'BINANCE:BTCUSDT',
    interval = '1D',
    theme = 'light',
    width = 800,
    height = 600,
    format = 'png',
    style = 'candle',
    scale,
    session,
    timezone,
    range,
    override,
    studies,
    drawings,
    shiftLeft,
    shiftRight,
    watermark,
    watermarkSize = 16,
    watermarkOpacity = 1.0,
    sessionId,
    sessionIdSign
  } = params;

  const requestBody: any = {
    symbol,
    interval,
    width,
    height,
    style,
    theme,
    format,
  };

  // Add optional parameters only if they exist
  if (scale) requestBody.scale = scale;
  if (session) requestBody.session = session;
  if (timezone) requestBody.timezone = timezone;
  if (range) requestBody.range = range;
  if (override) requestBody.override = override;
  if (studies && studies.length > 0) requestBody.studies = studies;
  if (drawings && drawings.length > 0) requestBody.drawings = drawings;
  if (shiftLeft) requestBody.shiftLeft = shiftLeft;
  if (shiftRight) requestBody.shiftRight = shiftRight;
  if (watermark) {
    requestBody.watermark = watermark;
    requestBody.watermarkSize = watermarkSize;
    requestBody.watermarkOpacity = watermarkOpacity;
  }

  const headers: Record<string, string> = {
    'x-api-key': key,
    'content-type': 'application/json',
  };

  if (sessionId) headers['tradingview-session-id'] = sessionId;
  if (sessionIdSign) headers['tradingview-session-id-sign'] = sessionIdSign;

  try {
    const response = await fetch(`${BASE_URL}/v2/tradingview/advanced-chart/storage`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let msg = response.statusText;
      try {
        const data = await response.json();
        msg = data?.message || msg;
      } catch {}
      throw new Error(`API Error ${response.status}: ${msg}`);
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(`Failed to generate chart: ${error.message}`);
  }
}

// =====================================================
// MINI CHART API
// =====================================================

/**
 * Generate Mini Chart using Chart-IMG API v1
 */
export async function generateMiniChart(params: {
  apiKey?: string;
  symbol?: string;
  interval?: string;
  theme?: string;
  width?: number;
  height?: number;
  format?: string;
  watermark?: string;
  watermarkSize?: number;
  watermarkOpacity?: number;
}): Promise<ChartResponse> {
  const key = resolveApiKey(params.apiKey);
  const {
    symbol = 'BINANCE:BTCUSDT',
    interval = '1M',
    theme = 'dark',
    width = 350,
    height = 220,
    format = 'png',
    watermark,
    watermarkSize = 16,
    watermarkOpacity = 1.0
  } = params;

  const queryParams = new URLSearchParams({
    symbol,
    interval,
    theme,
    width: width.toString(),
    height: height.toString(),
    format
  });

  if (watermark) {
    queryParams.set('watermark', watermark);
    queryParams.set('watermarkSize', watermarkSize.toString());
    queryParams.set('watermarkOpacity', watermarkOpacity.toString());
  }

  try {
    const response = await fetch(
      `${BASE_URL}/v1/tradingview/mini-chart/storage?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${key}`
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Error ${response.status}: ${errorData.message || response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(`Failed to generate mini chart: ${error.message}`);
  }
}

// =====================================================
// LAYOUT CHART API
// =====================================================

/**
 * Generate Layout Chart using Chart-IMG API v2
 */
export async function generateLayoutChart(params: {
  apiKey?: string;
  layoutId: string;
  symbol?: string;
  interval?: string;
  width?: number;
  height?: number;
  format?: string;
  resetZoom?: boolean;
  zoomIn?: number;
  zoomOut?: number;
  moveLeft?: number;
  moveRight?: number;
  watermark?: string;
  watermarkSize?: number;
  watermarkOpacity?: number;
  sessionId?: string;
  sessionIdSign?: string;
}): Promise<ChartResponse> {
  const key = resolveApiKey(params.apiKey);
  const {
    layoutId,
    symbol,
    interval,
    width = 800,
    height = 600,
    format = 'png',
    resetZoom = false,
    zoomIn,
    zoomOut,
    moveLeft,
    moveRight,
    watermark,
    watermarkSize = 16,
    watermarkOpacity = 1.0,
    sessionId,
    sessionIdSign
  } = params;

  const requestBody: any = {
    width,
    height,
    format,
    resetZoom
  };

  if (symbol) requestBody.symbol = symbol;
  if (interval) requestBody.interval = interval;
  if (zoomIn) requestBody.zoomIn = zoomIn;
  if (zoomOut) requestBody.zoomOut = zoomOut;
  if (moveLeft) requestBody.moveLeft = moveLeft;
  if (moveRight) requestBody.moveRight = moveRight;
  if (watermark) {
    requestBody.watermark = watermark;
    requestBody.watermarkSize = watermarkSize;
    requestBody.watermarkOpacity = watermarkOpacity;
  }

  const headers: Record<string, string> = {
    'x-api-key': key,
    'content-type': 'application/json'
  };

  if (sessionId) headers['tradingview-session-id'] = sessionId;
  if (sessionIdSign) headers['tradingview-session-id-sign'] = sessionIdSign;

  try {
    const response = await fetch(
      `${BASE_URL}/v2/tradingview/layout-chart/storage/${layoutId}`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Error ${response.status}: ${errorData.message || response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(`Failed to generate layout chart: ${error.message}`);
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Validate symbol format (EXCHANGE:SYMBOL)
 */
export function validateSymbol(symbol: string): boolean {
  const symbolRegex = /^[A-Z0-9]+:[A-Z0-9._-]+$/i;
  return symbolRegex.test(symbol);
}

/**
 * Parse symbol into exchange and symbol parts
 */
export function parseSymbol(symbol: string): { exchange: string; symbol: string } | null {
  if (!validateSymbol(symbol)) {
    return null;
  }
  
  const [exchange, symbolPart] = symbol.split(':');
  return { exchange: exchange.toUpperCase(), symbol: symbolPart.toUpperCase() };
}

/**
 * Format symbol for display
 */
export function formatSymbol(exchange: string, symbol: string): string {
  return `${exchange.toUpperCase()}:${symbol.toUpperCase()}`;
}

/**
 * Get exchange category
 */
export function getExchangeCategory(exchange: string): string {
  for (const [category, exchanges] of Object.entries(exchangeCategories)) {
    if (exchanges.includes(exchange.toUpperCase())) {
      return category;
    }
  }
  return 'other';
}

/**
 * Get popular symbols for an exchange
 */
export function getPopularSymbolsForExchange(exchange: string): string[] {
  const popularSymbols: Record<string, string[]> = {
    'BINANCE': ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT', 'MATICUSDT'],
    'NASDAQ': ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'],
    'NYSE': ['BABA', 'JNJ', 'V', 'WMT', 'PG', 'DIS', 'JPM', 'UNH'],
    'COINBASE': ['BTCUSD', 'ETHUSD', 'LTCUSD', 'BCHUSD', 'ADAUSD', 'SOLUSD', 'LINKUSD', 'AVAXUSD'],
    'KRAKEN': ['XXBTZUSD', 'XETHZUSD', 'XLTCZUSD', 'XXRPZUSD', 'ADAUSD', 'LINKUSD', 'DOTUSD', 'ATOMUSD'],
    'BYBIT': ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'LINKUSDT'],
    'OKX': ['BTCUSDT', 'ETHUSDT', 'LTCUSDT', 'BCHUSDT', 'XRPUSDT', 'EOSUSDT', 'ETCUSDT', 'TRXUSDT'],
    'FX': ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD', 'EURJPY'],
    'CME': ['ES1!', 'NQ1!', 'YM1!', 'RTY1!', 'CL1!', 'GC1!', 'SI1!', 'NG1!'],
    'EURONEXT': ['ASML', 'LVMH', 'SAP', 'TTE', 'OR', 'MC', 'RMS', 'SAN'],
    'LSE': ['SHEL', 'AZN', 'BP', 'VOD', 'RIO', 'HSBA', 'ULVR', 'GSK'],
    'TSX': ['SHOP', 'RY', 'TD', 'BNS', 'BMO', 'CNR', 'CP', 'WCN']
  };
  
  return popularSymbols[exchange.toUpperCase()] || [];
}

/**
 * Create study configuration from preset
 */
export function createStudyFromPreset(presetName: string, customInput?: Record<string, any>): ChartStudy | null {
  const preset = studyPresets[presetName as keyof typeof studyPresets];
  if (!preset) return null;
  
  return {
    name: preset.name,
    forceOverlay: preset.forceOverlay,
    input: { ...preset.input, ...customInput },
    override: preset.override
  };
}

/**
 * Create drawing configuration from preset
 */
export function createDrawingFromPreset(presetName: string, customInput?: Record<string, any>): ChartDrawing | null {
  const preset = drawingPresets[presetName as keyof typeof drawingPresets];
  if (!preset) return null;
  
  return {
    name: preset.name,
    input: { ...preset.input, ...customInput },
    override: preset.override,
    zOrder: preset.zOrder as 'top' | 'bottom' | undefined
  };
}

/**
 * Get color theme for chart style
 */
export function getColorTheme(theme: 'light' | 'dark') {
  const themes = {
    light: {
      background: '#ffffff',
      text: '#000000',
      grid: '#e1e1e1',
      candleUp: 'rgb(8,153,129)',
      candleDown: 'rgb(242,54,69)',
      volume: 'rgba(33,150,243,0.5)'
    },
    dark: {
      background: '#1a1a20',
      text: '#ffffff',
      grid: '#3a3a45',
      candleUp: 'rgb(8,153,129)',
      candleDown: 'rgb(242,54,69)',
      volume: 'rgba(33,150,243,0.5)'
    }
  };
  
  return themes[theme];
}

/**
 * Validate API response
 */
export function validateChartResponse(response: any): ChartResponse {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid response format');
  }
  
  if (!response.url || typeof response.url !== 'string') {
    throw new Error('Missing or invalid chart URL in response');
  }
  
  return response as ChartResponse;
}

// =====================================================
// ERROR HANDLING UTILITIES
// =====================================================

export class ChartImgApiError extends Error {
  public statusCode?: number;
  public response?: any;
  
  constructor(message: string, statusCode?: number, response?: any) {
    super(message);
    this.name = 'ChartImgApiError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: any, context: string): never {
  if (error instanceof ChartImgApiError) {
    throw error;
  }
  
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    throw new ChartImgApiError(`Network error in ${context}: ${error.message}`);
  }
  
  throw new ChartImgApiError(`${context} failed: ${error.message}`);
}

// =====================================================
// RATE LIMITING UTILITIES
// =====================================================

export class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly timeWindow: number;
  
  constructor(maxRequests: number = 10, timeWindowMs: number = 1000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMs;
  }
  
  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    return this.requests.length < this.maxRequests;
  }
  
  recordRequest(): void {
    this.requests.push(Date.now());
  }
  
  getWaitTime(): number {
    if (this.canMakeRequest()) return 0;
    const oldest = Math.min(...this.requests);
    return this.timeWindow - (Date.now() - oldest);
  }
}

// =====================================================
// EXPORT DEFAULT CONFIGURATION
// =====================================================

export default {
  BASE_URL,
  chartV2Parameters,
  chartStyles,
  chartIntervals,
  chartRanges,
  priceScales,
  tradingSessions,
  timezones,
  technicalIndicators,
  popularExchanges,
  exchangeCategories,
  drawingPresets,
  studyPresets,
  generateChartV2,
  getExchangeList,
  getExchangeSymbols,
  generateMiniChart,
  generateLayoutChart,
  validateSymbol,
  parseSymbol,
  formatSymbol,
  getExchangeCategory,
  getPopularSymbolsForExchange,
  createStudyFromPreset,
  createDrawingFromPreset,
  getColorTheme,
  validateChartResponse,
  ChartImgApiError,
  handleApiError,
  RateLimiter
};

// =====================================================
// POPULAR EXCHANGES AND SYMBOLS
// =====================================================

export const popularSymbolsByExchange = {
    'BINANCE': ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT', 'MATICUSDT'],
    'NASDAQ': ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'],
    'NYSE': ['BABA', 'JNJ', 'V', 'WMT', 'PG', 'DIS', 'JPM', 'UNH'],
    'COINBASE': ['BTCUSD', 'ETHUSD', 'LTCUSD', 'BCHUSD', 'ADAUSD', 'SOLUSD', 'LINKUSD', 'AVAXUSD'],
    'KRAKEN': ['XXBTZUSD', 'XETHZUSD', 'XLTCZUSD', 'XXRPZUSD', 'ADAUSD', 'LINKUSD', 'DOTUSD', 'ATOMUSD'],
    'BYBIT': ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'LINKUSDT'],
    'OKX': ['BTCUSDT', 'ETHUSDT', 'LTCUSDT', 'BCHUSDT', 'XRPUSDT', 'EOSUSDT', 'ETCUSDT', 'TRXUSDT'],
    'FX': ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD', 'EURJPY'],
    'CME': ['ES1!', 'NQ1!', 'YM1!', 'RTY1!', 'CL1!', 'GC1!', 'SI1!', 'NG1!'],
    'EURONEXT': ['ASML', 'LVMH', 'SAP', 'TTE', 'OR', 'MC', 'RMS', 'SAN'],
    'LSE': ['SHEL', 'AZN', 'BP', 'VOD', 'RIO', 'HSBA', 'ULVR', 'GSK'],
    'TSX': ['SHOP', 'RY', 'TD', 'BNS', 'BMO', 'CNR', 'CP', 'WCN']
};

export const smoothingLengthOptions = ["SMA", "EMA", "WMA"]

export const inputOptions = [
  {value:"open", name: "Open"},
  {value:"high", name: "High"},
  {value:"low", name: "Low"},
  {value:"close", name: "Close"},
  {value:"hl2", name: "Median Price (HL/2)"},
  {value:"hlc3", name: "Typical Price (HLC/3)"},
  {value:"ohlc4", name: "Weighted Close (HLCC/4)"}
]
