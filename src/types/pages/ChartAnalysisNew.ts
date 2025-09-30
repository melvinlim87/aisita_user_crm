// Define interfaces for the chart analysis data

export interface PriceLevels {
  Support_Levels?: string[];
  Resistance_Levels?: string[];
}

export interface RiskAssessment {
  Invalidation_Scenarios?: string;
  Key_Risk_Levels?: string;
  Position_Size_Calculation?: string;
  Volatility_Consideration?: string;
}

export interface AnalysisConfidence {
  Confidence_Level_Percent?: number;
  Pattern_Clarity_Percent?: number;
  Technical_Alignment_Percent?: number;
  Volume_Confirmation_Percent?: number;
  Signal_Reliability_Percent?: number;
  Timeframe?: string;
}

export interface IndicatorValues {
  Current_Values?: string;
  Signal?: string;
  Analysis?: string;
}

export interface Indicators {
  RSI_Indicator?: IndicatorValues;
  MACD_Indicator?: IndicatorValues;
  Other_Indicator?: string;
}

export interface ChartAnalysisData {
  history_id?: number | string;
  id?: number | string; // ID property which might come from API response
  Symbol?: string;
  Timeframe?: string;
  Current_Price?: string | number;
  Market_Structure?: string;
  Key_Price_Levels?: PriceLevels;
  Entry_Price?: string | number | null;
  Stop_Loss?: string | number | null;
  Take_Profit?: string | number | null;
  Technical_Justification?: string;
  Risk_Assessment?: RiskAssessment;
  Analysis_Confidence?: AnalysisConfidence;
  Analysis_Confidences?: AnalysisConfidence[];
  Volatility_Conditions?: string;
  Price_Movement?: string;
  Chart_Patterns?: string;
  Key_Breakout_Breakdown_Levels?: string;
  Volume_Confirmation?: string;
  Trend_Strength_Assessment?: string;
  INDICATORS?: Indicators;
  Multiple_Timeframe_Context?: string;
  content?: string; // For parsing from JSON string
  Action?: string;
  Risk_Ratio?: string;
  Summary?: string;
  share_content?: string;
  news?: ForexNew[];
}

interface ForexNew {
  id: number;
  title: string;
  country: string;
  impact: string;
  forecast: string;
  previous: string;
  date: string;
  created_at: string;
  updated_at: string;
}
