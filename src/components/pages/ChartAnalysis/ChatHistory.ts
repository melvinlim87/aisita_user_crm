import { getRequest } from '@/services/apiRequest';

// Helper function to format analysis data into a structured message
const formatAnalysis = (data: any): string => {
  const sections = [];

  // Basic Info
  sections.push(`**${data.Symbol} ${data.Timeframe} Analysis**`);
  sections.push(`Current Price: ${data.Current_Price}`);

  // Market Structure
  if (data.Market_Structure) {
    sections.push(`\n**Market Structure**\n${data.Market_Structure}`);
  }

  // Price Levels
  if (data.Key_Price_Levels) {
    const levels = data.Key_Price_Levels;
    sections.push('\n**Key Price Levels**');
    if (levels.Support_Levels?.length) {
      sections.push(`- Support: ${levels.Support_Levels.join(', ')}`);
    }
    if (levels.Resistance_Levels?.length) {
      sections.push(`- Resistance: ${levels.Resistance_Levels.join(', ')}`);
    }
  }

  // Trade Setup
  sections.push('\n**Trade Setup**');
  sections.push(`- Entry: ${data.Entry_Price}`);
  sections.push(`- Stop Loss: ${data.Stop_Loss}`);
  sections.push(`- Take Profit: ${data.Take_Profit}`);

  // Technical Analysis
  if (data.Technical_Justification) {
    sections.push(`\n**Technical Justification**\n${data.Technical_Justification}`);
  }

  // Risk Assessment
  if (data.Risk_Assessment) {
    sections.push('\n**Risk Assessment**');
    if (data.Risk_Assessment.Invalidation_Scenarios) {
      sections.push(`- Invalidation: ${data.Risk_Assessment.Invalidation_Scenarios}`);
    }
    if (data.Risk_Assessment.Key_Risk_Levels) {
      sections.push(`- Key Risk Levels: ${data.Risk_Assessment.Key_Risk_Levels}`);
    }
  }

  // Confidence Score
  if (data.Analysis_Confidence?.Confidence_Level_Percent) {
    sections.push(`\n**Analysis Confidence**\n${data.Analysis_Confidence.Confidence_Level_Percent}%`);
  }

  return sections.join('\n');
};

// Define interfaces for history data based on actual API response
export interface AnalysisHistoryMessage {
  id: number;
  chat_session_id: number;
  user_id: number;
  history_id: number;
  sender: 'user' | 'assistant';
  status: string;
  text: string;
  metadata: {
    model: string;
    token_usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
      prompt_tokens_details?: any;
      completion_tokens_details?: any;
    };
    analysis_type: string;
    chart_analysis?: any;
  };
  timestamp: string;
  created_at: string;
  updated_at: string;
}

export interface AnalysisHistoryData {
  id: number;
  user_id: number;
  title: string;
  type: string;
  model: string;
  content: string;
  chart_urls: string[];
  timestamp: string;
  created_at: string;
  updated_at: string;
  chat_messages: AnalysisHistoryMessage[];
}

/**
 * Fetches analysis history data using the ID from the URL parameter
 * This function extracts and formats the initial AI analysis message
 * @param analysisId The analysis ID from the URL parameter
 * @returns Formatted analysis data or undefined if an error occurs
 */
export const fetchAnalysisHistory = async (analysisId: string): Promise<{
  initialAnalysis: string;
  model: string;
  chatMessages: AnalysisHistoryMessage[];
  chartUrls: string[];
} | undefined> => {
  if (!analysisId) {
    console.log('No analysis ID provided');
    return undefined;
  }
  
  try {
    const response = await getRequest<AnalysisHistoryData>(`/history/${analysisId}`);
    
    if (!response) {
      console.log('No response received from the server');
      return undefined;
    }
    
    // Process the initial AI analysis message from response.content
    if (response.content) {
      try {
        // Define the analysis content structure
        interface AnalysisContent {
          Symbol: string;
          Timeframe: string;
          Current_Price: string;
          Entry_Price: string;
          Stop_Loss: string;
          Take_Profit: string;
          [key: string]: any; // Allow for other properties
        }
        
        // Parse the content if it's a string
        let contentObj: AnalysisContent;
        
        if (typeof response.content === 'string') {
          try {
            contentObj = JSON.parse(response.content);
          } catch (parseError) {
            console.error('Failed to parse content JSON:', parseError);
            // If parsing fails, use a default object structure
            contentObj = { 
              Symbol: 'Chart', 
              Timeframe: 'Unknown', 
              Current_Price: 'N/A', 
              Entry_Price: 'N/A', 
              Stop_Loss: 'N/A', 
              Take_Profit: 'N/A' 
            };
          }
        } else {
          // If it's already an object, use it directly
          contentObj = response.content as AnalysisContent;
        }
        
        // Format the analysis data into a structured message
        const formattedAnalysis = formatAnalysis(contentObj);
        console.log('Formatted initial analysis:', formattedAnalysis);
        
        // Return the formatted analysis and other relevant data
        return {
          initialAnalysis: formattedAnalysis,
          model: response.model || 'default-model',
          chatMessages: response.chat_messages || [],
          chartUrls: response.chart_urls || []
        };
      } catch (formatError) {
        console.error('Failed to format analysis:', formatError);
        // Return a fallback object in case of formatting error
        return {
          initialAnalysis: 'Chart analysis could not be formatted properly.',
          model: response.model || 'default-model',
          chatMessages: response.chat_messages || [],
          chartUrls: response.chart_urls || []
        };
      }
    } else {
      console.log('No content available in the response');
      // Return a minimal object when no content is available
      return {
        initialAnalysis: 'No analysis content available.',
        model: response.model || 'default-model',
        chatMessages: response.chat_messages || [],
        chartUrls: response.chart_urls || []
      };
    }
    
  } catch (error) {
    console.error('Failed to fetch analysis history:', error);
    // Return undefined in case of network or other errors
    return undefined;
  }
};
