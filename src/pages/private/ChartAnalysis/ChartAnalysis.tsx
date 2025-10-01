import React, { useState, useCallback, useEffect, useRef } from 'react';
import ChartUpload from '@components/chart/ChartUpload';
import ChatInterface from '@components/chat/ChatInterface';
import { Upload, X } from 'lucide-react';
import { ChatProvider, useChat } from '@contexts/ChatContext';
import { META_TEXT_GRADIENT } from '@/constants';
import { getRequest, postRequest } from '@/services/apiRequest';
import { useParams } from 'react-router-dom';
import { fetchAnalysisHistory } from '@components/pages/ChartAnalysis/ChatHistory';

// Interface for model data
interface Model {
  id: string;
  name: string;
  provider?: string;
  premium?: boolean;
  description?: string;
  creditCost?: number;
  beta?: boolean;
}

const ChartAnalysisContent: React.FC = () => {
  // Get chat context and URL params
  const { selectedModel, sendMessage, setSelectedModel, addHistoryMessages, startNewConversation } = useChat();
  const { id: analysisId } = useParams<{ id?: string }>();
  
  // State for UI rendering
  const [chartPreview, setChartPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  /**
   * Load available models and update state
   */
  const loadAvailableModels = useCallback(async () => {
    // Skip if we already have models
    if (models.length > 0) {
      return;
    }
    
    setIsLoadingModels(true);
    try {
      console.log('Loading available models...');
      const response = await getRequest<{ models: Model[] }>('/models');
      
      if (response && response.models) {
        // Store models in state
        setModels(response.models);
        console.log(`Loaded ${response.models.length} models`);
        
        // Set default model if none is selected
        if (!selectedModel && response.models.length > 0) {
          const defaultModel = response.models.find(model => !model.premium) || response.models[0];
          setSelectedModel(defaultModel.id);
        }
      }
    } catch (error) {
      console.error('Failed to load models:', error);
    } finally {
      setIsLoadingModels(false);
    }
  }, [models.length, selectedModel, setSelectedModel]);
  
  // Load models on component mount
  useEffect(() => {
    loadAvailableModels();
  }, [loadAvailableModels]);
  
  // Load analysis history if ID is present - using a ref to prevent multiple calls
  const historyLoadedRef = useRef(false);
  
  useEffect(() => {
    // Only load history if we have an ID and haven't loaded it yet
    if (analysisId && !historyLoadedRef.current) {
      console.log('Loading analysis history for ID:', analysisId);
      historyLoadedRef.current = true; // Mark as loaded immediately
      setIsLoadingHistory(true);
      
      // Save the analysis ID in localStorage for future interactions
      localStorage.setItem('chartAnalysisHistoryId', analysisId);
      
      fetchAnalysisHistory(analysisId).then(historyData => {
        if (historyData) {
          console.log('History data loaded successfully');
          // Set chart preview if available
          if (historyData.chartUrls && historyData.chartUrls.length > 0) {
            setChartPreview(historyData.chartUrls[0]);
            localStorage.setItem('chartPreview', historyData.chartUrls[0]);
            // Dispatch event to notify other components
            window.dispatchEvent(new Event('chartPreviewUpdate'));
          }
          
          // Start a new conversation for this analysis
          startNewConversation(analysisId);
          
          // Format chat messages for history
          const chatMessages = historyData.chatMessages.map(msg => {
            // Use the sender property from AnalysisHistoryMessage
            const sender = msg.sender === 'assistant' ? 'ai' : 'user';
            return {
              content: msg.text || '', // AnalysisHistoryMessage has text property
              sender: sender as 'ai' | 'user',
              modelId: msg.metadata?.model || historyData.model
            };
          });
          
          // Add all messages to conversation at once
          addHistoryMessages(historyData.initialAnalysis, chatMessages);
          
          // Set the model if available
          if (historyData.model) {
            setSelectedModel(historyData.model);
          }
        }
      }).catch(error => {
        console.error('Error loading history:', error);
        historyLoadedRef.current = false; // Reset if there was an error
      }).finally(() => {
        setIsLoadingHistory(false);
      });
    }
  }, [analysisId, addHistoryMessages, setSelectedModel, startNewConversation]); // Include these dependencies since they're used inside
  
  // Load saved chart preview from localStorage on component mount
  useEffect(() => {
    const savedChartPreview = localStorage.getItem('chartPreview');
    if (savedChartPreview) {
      setChartPreview(savedChartPreview);
    }
  }, []);
  
  // Save chart preview to localStorage whenever it changes
  useEffect(() => {
    if (chartPreview) {
      localStorage.setItem('chartPreview', chartPreview);
    } else if (chartPreview === null && localStorage.getItem('chartPreview')) {
      localStorage.removeItem('chartPreview');
    }
  }, [chartPreview]);
  
  /**
   * Handle file upload for chart analysis
   */
  const handleUpload = (files: File[]) => {
    if (!files.length) return;
    
    // Set analyzing to true immediately when upload starts
    setIsAnalyzing(true);
    
    files.map(file => {
      console.log('File selected:', {
        name: files[0].name,
        type: files[0].type,
        size: `${(files[0].size / 1024 / 1024).toFixed(2)}MB`
      });
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        alert('File is too large. Maximum size is 5MB.');
        setIsAnalyzing(false); // Reset analyzing state
        return;
      }
  
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        setIsAnalyzing(false); // Reset analyzing state
        return;
      }
      
      // Use FileReader for preview purposes
      const reader = new FileReader();
      reader.onerror = () => {
        alert('Error reading file. Please try again.');
        setIsAnalyzing(false);
      };
      
      reader.onload = (e) => {
        const base64Result = e.target?.result as string;
        if (base64Result) {
          setChartPreview(base64Result);
          // Also directly update localStorage here to ensure it's saved immediately
          localStorage.setItem('chartPreview', base64Result);
          // Dispatch custom event right away
          const event = new Event('chartPreviewUpdate');
          window.dispatchEvent(event);
          
          // Now process the file upload after preview is set
          processFileUpload(file);
        } else {
          alert('Error generating preview. Please try again.');
          setIsAnalyzing(false);
        }
      };
      
      // Read as data URL only for preview purposes
      reader.readAsDataURL(file);
    })

    
  };
  
  /**
   * Process file upload and send to API
   */
  const processFileUpload = async (file: File) => {
    try {
      // Loading indicator is already set in handleUpload
      
      if (!selectedModel) {
        throw new Error('Please select a model first');
      }
      
      // Create FormData to send the file
      const formData = new FormData();
      formData.append('image', file);
      formData.append('modelId', selectedModel);
      
      // Log request payload for debugging
      console.log('Sending request with:', {
        modelId: selectedModel,
        fileName: file.name,
        fileType: file.type,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`
      });
      
      // Define interface for the response data
      interface AnalysisResponse {
        history_id?: number;
        Symbol?: string;
        Timeframe?: string;
        Current_Price?: string;
        Market_Structure?: string;
        Key_Price_Levels?: {
          Support_Levels?: string[];
          Resistance_Levels?: string[];
        };
        Entry_Price?: string;
        Stop_Loss?: string;
        Take_Profit?: string;
        Technical_Justification?: string;
        Risk_Assessment?: {
          Invalidation_Scenarios?: string;
          Key_Risk_Levels?: string;
        };
        Analysis_Confidence?: {
          Confidence_Level_Percent?: number;
        };
      }
      
      // Use the existing postRequest function with FormData
      const data = await postRequest<AnalysisResponse>('/openrouter/analyze-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (!data) {
        throw new Error('No response received from the server');
      }
      
      // Save history_id to a new localStorage item if available
      if (data.history_id) {
        console.log('Saving chart analysis history_id:', data.history_id);
        localStorage.setItem('chartAnalysisHistoryId', data.history_id.toString());
      }
      
      // Format the analysis data into a readable message
      const analysis = formatAnalysis(data);
      await sendMessage(analysis, selectedModel, true);
    } catch (error: any) {
      console.error('Failed to analyze image:', error);
      console.log('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      const errorMessage = error.response?.data?.error || error.message || 'Failed to analyze image';
      alert(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  /**
   * Clear the current chart and related data
   */
  const clearCurrentChart = () => {
    setChartPreview(null);
    localStorage.removeItem('chartPreview');
    localStorage.removeItem('chartAnalysisHistoryId');
    // Notify other components about the change
    window.dispatchEvent(new Event('chartPreviewUpdate'));
  };
  
  /**
   * Format analysis data into a readable message
   */
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
    sections.push(`\n Buy Sell Holds`);
    sections.push(`- Buy: ${data.Entry_Price}`);
    sections.push(`- Hold: ${data.Stop_Loss}`);
    sections.push(`- Sell: ${data.Take_Profit}`);

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
  
  return (
    <div className="container mx-auto p-6">
      {/* Loading overlay for history */}
      {isLoadingHistory && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-[#0b0b0e] p-6 rounded-lg shadow-lg border border-[#3a2a15] max-w-md w-full">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
              <p className="text-xl font-semibold text-white">Loading analysis history...</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Header Section */}
      <div className="bg-[#0b0b0e] rounded-lg border border-[#3a2a15] p-6 mb-6">
        <h1 className={`text-2xl font-bold ${META_TEXT_GRADIENT} mb-2`}>
          Chart Analysis
        </h1>
        <p className="text-gray-400">
          Upload your financial chart to receive AI-powered analysis of patterns, indicators, and trading strategies
        </p>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Panel (60%) - Chart Section */}
        <div className="w-full md:w-3/5 bg-[#0b0b0e] p-6 rounded-lg border border-[#3a2a15]">
          <div className="h-full flex flex-col">
            {chartPreview ? (
              <div className="flex-1 flex flex-col">
                <div className="bg-[#15120c] p-4 rounded-lg border border-[#3a2a15] mb-4 relative">
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg z-50">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mb-2"></div>
                        <div className="text-white text-sm font-medium">Analyzing chart...</div>
                      </div>
                    </div>
                  )}
                  <div className="max-w-md mx-auto mb-4 rounded-lg overflow-hidden shadow-lg relative">
                    <img src={chartPreview} alt="Chart Preview" className="w-full h-auto" />
                    <button 
                      onClick={clearCurrentChart}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                      aria-label="Clear chart"
                      title="Clear current chart"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                
                
                
                <div className="mt-auto">
                  <ChartUpload onUpload={handleUpload} />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center py-8">
                <div className="max-w-md w-full">
                  
                  <ChartUpload onUpload={handleUpload} />
                </div>
              </div>
            )}
          </div>
        </div>
          
        {/* Right Panel (40%) - Chat Interface */}
        <div className="w-full md:w-2/5 bg-[#0b0b0e] rounded-lg border border-[#3a2a15] h-[600px] md:h-auto overflow-hidden">
          <div className="relative">
            {isLoadingModels && (
              <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs px-2 py-1 rounded-bl-md z-10">
                Loading models...
              </div>
            )}
            <ChatInterface externalModels={models} />
          </div>
        </div>
      </div>
    </div>
  );
};

const ChartAnalysis: React.FC = () => (
  <ChatProvider>
    <ChartAnalysisContent />
  </ChatProvider>
);

export default ChartAnalysis;