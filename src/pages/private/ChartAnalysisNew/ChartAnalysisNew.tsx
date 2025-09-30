import React, { useState, useEffect, useRef } from 'react';
import { Trash, BarChart2, TrendingUp, AlertCircle, DollarSign, Shield, PieChart, Clock, ScatterChart, Percent, HelpCircle, Lightbulb } from 'lucide-react';
import { META_TEXT_GRADIENT } from '@/constants';
import ChartUpload from '@/components/chart/ChartUpload';
import ChartAnalysisChat from '@/components/chart/ChartAnalysisChat';
import { postRequest, getRequest } from '@/services/apiRequest';
import { ChartAnalysisData } from '@/types/pages/ChartAnalysisNew';
import { useParams } from 'react-router-dom';
import RadarChart from '@/components/chart/RadarChart';
import { useTranslation } from 'react-i18next';

// Define interfaces for history data based on actual API response
interface AnalysisHistoryMessage {
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
    };
    analysis_type: string;
    chart_analysis?: any;
  };
  timestamp: string;
  created_at: string;
  updated_at: string;
}

interface AnalysisHistoryData {
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

// set default colors for radar chart
const defaultColors = [
  '#60a5fa', '#f472b6', '#34d399', '#f87171', '#a78bfa', '#facc15', '#38bdf8', '#818cf8', '#4ade80', '#fbbf24'
];

const ChartAnalysisNew: React.FC = () => {
  const { id: analysisId } = useParams<{ id?: string }>();
  const [chartPreviews, setChartPreviews] = useState<string[] | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<ChartAnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'percent' | 'pie'>('percent');
  const historyLoadedRef = useRef(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [copied, setCopied] = useState(false);
  // Fixed model - using gpt-4o as requested
  // const selectedModel = 'gpt-4o-2024-08-06';
  // const selectedModel = 'qwen/qwen2.5-vl-72b-instruct:free';
  const selectedModel = 'qwen/qwen2.5-vl-32b-instruct:free';
  // const selectedModel = 'meta-llama/llama-3.2-11b-vision-instruct:free';

  const { t } = useTranslation();

  /**
   * Fetches analysis history data using the ID from the URL parameter
   * Implements the two-step process for loading chart analysis history:
   * 1. First parse and format the chart analysis data from response.content (JSON string)
   * 2. Then add all chat messages from response.chat_messages
   */
  const fetchAnalysisHistory = async (historyId: string) => {
    if (!historyId) {
      return;
    }
    
    try {
      const response = await getRequest<AnalysisHistoryData>(`/history/${historyId}`);
      
      if (!response) {
        return;
      }
      
      // Set chart preview if available
      if (response.chart_urls && response.chart_urls.length > 0) {
        setChartPreviews(response.chart_urls);
        localStorage.setItem('chartAnalysisPreview', JSON.stringify(response.chart_urls));
        // Dispatch event to notify other components
        window.dispatchEvent(new Event('chartPreviewUpdate'));
      }
      
      // Process the initial AI analysis message from response.content
      if (response.content) {
        try {
          // Parse the content if it's a string (based on memory about two-step processing)
          const contentObj = typeof response.content === 'string' 
            ? JSON.parse(response.content) 
            : response.content;
          
          // Add history_id to the analysis data
          const analysisWithId = {
            ...contentObj,
            history_id: response.id
          };
          
          // Save to state and localStorage
          setAnalysisData(analysisWithId);
          localStorage.setItem('chartAnalysisData', JSON.stringify(analysisWithId));
          localStorage.setItem('chartAnalysisHistoryId', historyId);
          
          // Save chat messages to localStorage for ChartAnalysisChat component
          if (response.chat_messages && response.chat_messages.length > 0) {
            const formattedMessages = response.chat_messages.map((msg: any) => ({
              content: msg.text || '',
              sender: msg.sender === 'assistant' ? 'ai' : 'user',
              timestamp: msg.timestamp || msg.created_at
            }));
            
            localStorage.setItem('chatConversation', JSON.stringify(formattedMessages));
          }
          
        } catch (parseError) {
          setError(t('FailedToLoadAnalysisHistory'));
        }
      }
    } catch (error) {
      setError(t('FailedToLoadAnalysisHistory'));
    } finally {
      setIsLoadingHistory(false);
    }
  };
  
  // Load saved data or history data on component mount
  useEffect(() => {
    // If we have an analysis ID from the URL, load the history
    if (analysisId && !historyLoadedRef.current) {
      historyLoadedRef.current = true;
      setIsLoadingHistory(true);
      fetchAnalysisHistory(analysisId);
    } 
    // Otherwise load from localStorage as before
    else if (!analysisId) {
      // Load chart preview
      const savedChartPreview = localStorage.getItem('chartAnalysisPreview');
      if (savedChartPreview) {
        try {
          // Try to parse as JSON array
          const parsedData = JSON.parse(savedChartPreview);
          setChartPreviews(parsedData);
        } catch (error) {
          // If it starts with data:image, it's a legacy direct base64 string
          if (savedChartPreview.startsWith('data:image')) {
            setChartPreviews([savedChartPreview]);
            // Update localStorage to new format
            localStorage.setItem('chartAnalysisPreview', JSON.stringify([savedChartPreview]));
          } else {
            // If we can't parse it and it's not a base64 image, clear it
            localStorage.removeItem('chartAnalysisPreview');
          }
        }
      }
      
      // Load analysis data
      const savedAnalysisData = localStorage.getItem('chartAnalysisData');
      if (savedAnalysisData) {
        try {
          setAnalysisData(JSON.parse(savedAnalysisData));
          setShowAnalyzeButton(true);
        } catch (error) {
          setError(t('FailedToLoadAnalysisHistory'));
        }
      }
    }
    
    // Using fixed model 'gpt-4o' - no need to load from localStorage
  }, [analysisId]);

  // State to track if we should show the analyze button
  const [showAnalyzeButton, setShowAnalyzeButton] = useState(true);

  // Add event listener for paste events to handle clipboard images
  useEffect(() => {
    // Function to handle paste events
    const handlePaste = async (e: ClipboardEvent) => {
      console.log('handle paste called')
      const items = e.clipboardData?.items;
      if (!items) return;
      
      let imageProcessed = false;
      
      for (let i = 0; i < items.length; i++) {
        
        // Only process image types and only if we haven't processed one yet
        if (!imageProcessed && items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          
          if (file) {
            imageProcessed = true; // Mark that we've processed an image
            
            // Create a preview of the pasted image
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                const base64Result = event.target.result as string;
                
                // Check if we already have 3 images
                if (chartPreviews && chartPreviews.length >= 3) {
                  setError(t('MaxImagesAllowed'));
                  return;
                }
                
                // Use functional state update to ensure we're working with the latest state
                setChartPreviews(prevPreviews => {
                  // Check if we already have 3 images
                  if (prevPreviews && prevPreviews.length >= 3) {
                    setError(t('MaxImagesAllowed'));
                    return prevPreviews;
                  }
                  
                  // Create new array with the new image
                  const newImages = prevPreviews ? [...prevPreviews, base64Result] : [base64Result];
                  
                  // Save to localStorage
                  localStorage.setItem('chartAnalysisPreview', JSON.stringify(newImages));
                  
                  return newImages;
                });
                
                // Show analyze button if not already shown
                setShowAnalyzeButton(true);
              }
            };
            reader.readAsDataURL(file);
            
            // Break after processing the first image
            break;
          }
        }
      }
    };
  
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [chartPreviews]);
  
  // Confirm before leaving the page while analyzing (tab close/refresh and in-app link nav)
  useEffect(() => {
    // Browser/tab close or refresh
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isAnalyzing) {
        e.preventDefault();
        // Some browsers require returnValue to be set
        e.returnValue = '';
        return '';
      }
    };

    // In-app navigation via anchor/Link clicks
    const clickCapture = (e: Event) => {
      if (!isAnalyzing) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest('a');
      if (!anchor) return;
      // Ignore if explicitly opening in new tab/window
      const aEl = anchor as HTMLAnchorElement;
      const newTab = aEl.target && aEl.target.toLowerCase() === '_blank';
      if (newTab) return;
      // Only intercept same-origin or app-relative navigations
      const href = aEl.getAttribute('href') || '';
      if (!href || href.startsWith('#')) return;
      // Confirm
      const ok = window.confirm(t('ConfirmLeavePage'));
      if (!ok) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    // Capture phase to intercept before react-router handles
    document.addEventListener('click', clickCapture, true);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', clickCapture, true);
    };
  }, [isAnalyzing]);

  // Function to handle chart upload
  /**
   * Read a File as a base-64 data-URL (helper).
   */
  const fileToDataURL = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  /**
   * Upload one or many chart images.
   */
  const handleUpload = async (files: File[]) => {
    if (!files.length) return;
    if (files.length > 3) {
      setError(t('MaxImagesAllowed'));
      return;
    }
    setError(null)
    const startTime = performance.now();
    setAnalysisData(null);
    setIsAnalyzing(true);
    try {
      /* -----------------------------------------------------------
        1) Build base-64 previews for *all* images
      ----------------------------------------------------------- */
      const previews = await Promise.all(files.map(fileToDataURL));
      setChartPreviews(previews);                                   // <-- make this state string[] in your component
      localStorage.setItem('chartAnalysisPreview', JSON.stringify(previews));
      window.dispatchEvent(new Event('chartPreviewUpdate'));
      setShowAnalyzeButton(true)
      // /* -----------------------------------------------------------
      //   2) Build FormData
      // ----------------------------------------------------------- */
      // const formData = new FormData();

      // // If you still want the clipboard-resize safeguard,
      // // convert oversize data-URL strings back to blobs & re-append.
      // for (let i = 0; i < files.length; i++) {
      //   const f = files[i];
        
      //   // Keep the original file unless you pasted an image and want a size check
      //   if (f.size <= 2 * 1024 * 1024) {
      //     formData.append('images[]', f);                            // multiple images key
      //   } else {
      //     // Optional resize for very large files
      //     const resized = await resizeImageToMaxSize(previews[i], 1.9 * 1024 * 1024);
      //     const blob = await (await fetch(resized)).blob();        // convert base64 → Blob
      //     formData.append('images[]', blob, f.name);
      //   }
      // }

      // formData.append('model_id', selectedModel);
      
      // console.log('Uploading', {
      //   count: files.length,
      //   names: files.map(f => f.name),
      //   model: selectedModel
      // });

      // console.log(formData)
      // /* -----------------------------------------------------------
      //   3) Send request
      // ----------------------------------------------------------- */
      // const response = await postRequest<ChartAnalysisData>(
      //   '/openrouter/analyze-image',
      //   formData,
      //   { headers: { 'Content-Type': 'multipart/form-data' } }
      // );


      // /* -----------------------------------------------------------
      //   4) Handle response  (unchanged from your original logic)
      // ----------------------------------------------------------- */
      // if (response) {
      //   let analysisData: ChartAnalysisData;
      //   console.log(response)
      //   if (response.content && typeof response.content === 'string') {
      //     try {
      //       analysisData = JSON.parse(response.content);
      //       // maintain history_id mapping
      //       const id = response.history_id ?? response.id;
      //       if (id !== undefined) analysisData.history_id = +id;
      //     } catch (err) {
      //       console.error('JSON parse failed:', err);
      //       analysisData = response; // Fallback to the response object
      //     }
      //   } else {
      //     // Direct response format
      //     analysisData = response;
      //   }
      //   console.log(analysisData)
      //   if (analysisData.history_id) {
      //     localStorage.setItem('chartAnalysisHistoryId', String(analysisData.history_id));
      //     localStorage.setItem('chartAnalysisData', JSON.stringify(analysisData));
      //   }

      //   setAnalysisData(analysisData);

      //   const endTime = performance.now();
      //   console.log('Execution Time: ' + (endTime - startTime)/1000 + "s")
      //   console.log('Final analysis data:', analysisData);
      // }
    } catch (error: any) {
      setError(error.response.data.message ?? t('FailedToAnalyzeImagesPlural'));
      setAnalysisData(null);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Function to clear chart preview and analysis
  const clearChartPreview = () => {
    setChartPreviews(null);
    setShowAnalyzeButton(false);
    setAnalysisData(null);
    setError(null);
  };

  // Function to clear selected chart preview
  const clearSelectedChartPreview = (index: number) => {
    if (!chartPreviews) return;
    const newPreviews = [...chartPreviews];
    newPreviews.splice(index, 1);
    setChartPreviews(newPreviews);
    if (newPreviews.length === 0) {
      clearChartPreview();
    }
    setShowAnalyzeButton(true)
  };

  const handlePreviewImage = (preview: string) => {
    setSelectedPreview(preview);
    setShowPreviewModal(true);
  };

  const handleAnalyze = async () => {
    // Process all clipboard images
    if (!chartPreviews) return;
    const formData = new FormData();
    // Process each image
    for (let i = 0; i < chartPreviews.length; i++) {
      // Resize the image to ensure it's under 2MB
      const resizedImage = await resizeImageToMaxSize(chartPreviews[i], 1.9 * 1024 * 1024);
      const blob = await (await fetch(resizedImage)).blob();
      formData.append('images[]', blob, `clipboard-image-${i}.jpg`);
    }
    
    // Add model ID to FormData
    formData.append('model_id', selectedModel);
    
    // Add language to FormData
    formData.append('language', localStorage.getItem('lang') || 'en');
    // Start analysis
    setAnalysisData(null);
    setIsAnalyzing(true);
    
    try {
      const startTime = performance.now();
      const response = await postRequest<ChartAnalysisData>('/openrouter/analyze-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response) {
        console.log(response);
        // Process the response similar to what was in analyzeChart
        let analysisData: ChartAnalysisData;
        if (response.content && typeof response.content === 'string') {
          try {
            // Parse the content JSON string
            analysisData = JSON.parse(response.content);
            // Preserve the history_id from the response
            if (response.history_id !== undefined) {
              analysisData.history_id = typeof response.history_id === 'string' 
                ? parseInt(response.history_id, 10) 
                : response.history_id;
            } else if (response.id !== undefined) {
              analysisData.history_id = typeof response.id === 'string' 
                ? parseInt(response.id, 10) 
                : response.id;
            }
          } catch (parseError) {
            analysisData = response; // Fallback to the response object
          }
        } else {
          // Direct response format
          analysisData = response;
        }
        
        // Save history_id if available
        if (analysisData.history_id) {
          localStorage.setItem('chartAnalysisHistoryId', String(analysisData.history_id));
          localStorage.setItem('chartAnalysisData', JSON.stringify(analysisData));
        }
        
        const endTime = performance.now();
        setAnalysisData(analysisData);
      }
    } catch (error: any) {
      setError(error.response.data.message || t('FailedToAnalyzeImagesPlural'));
      setAnalysisData(null);
    } finally {
      setIsAnalyzing(false);
    }
  }

  
  // Function to resize an image to stay under a maximum size in bytes
  const resizeImageToMaxSize = async (base64Image: string, maxSizeBytes: number): Promise<string> => {
    return new Promise((resolve) => {
      // If the image is already smaller than the max size, return it as is
      if (base64Image.length <= maxSizeBytes) {
        return resolve(base64Image);
      }
      
      // Create an image element to load the base64 data
      const img = new Image();
      img.onload = () => {
        // Start with original dimensions
        let width = img.width;
        let height = img.height;
        let quality = 0.9;
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        
        // Function to check if we're under the size limit
        const checkSize = (dataUrl: string) => {
          return dataUrl.length <= maxSizeBytes;
        };
        
        // Iterative approach to find the right size/quality
        const resize = () => {
          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;
          
          // Draw image on canvas
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to base64 with current quality
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            
            // Check if we're under the size limit
            if (checkSize(dataUrl)) {
              resolve(dataUrl);
            } else {
              // Reduce dimensions or quality and try again
              if (quality > 0.5) {
                // First try reducing quality
                quality -= 0.1;
              } else {
                // Then try reducing dimensions
                width = Math.floor(width * 0.9);
                height = Math.floor(height * 0.9);
              }
              
              // If dimensions get too small, stop and use what we have
              if (width < 800 || height < 800) {
                console.log('Reached minimum dimensions, using current result');
                resolve(canvas.toDataURL('image/jpeg', quality));
              } else {
                // Try again with new parameters
                resize();
              }
            }
          }
        };
        
        // Start the resize process
        resize();
      };
      
      // Set the source of the image to the base64 data
      img.src = base64Image;
    });
  };
  
  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="bg-[#1a1a20] rounded-lg border border-[#3a3a45] p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-2xl font-bold ${META_TEXT_GRADIENT} mb-2`}>
              {t('ChartAnalysis')}
            </h1>
            <p className="text-gray-400">
              {isLoadingHistory ? t('LoadingSavedAnalysis') : t('UploadChartForAnalysis')}
            </p>
          </div>
          {(chartPreviews || analysisData) && (
            <button
              onClick={() => {
                // Clear all data
                setChartPreviews(null);
                setAnalysisData(null);
                setError(null);
                
                // Clear localStorage items
                localStorage.removeItem('chartAnalysisData');
                localStorage.removeItem('chartAnalysisHistoryId');
                localStorage.removeItem('chatConversation');
                localStorage.removeItem('chartAnalysisPreview');
              }}
              className="px-4 py-2 bg-[#10b981] text-white rounded-md hover:bg-[#0d9669] transition-colors"
            >
              {t('NewAnalysis')}
            </button>
          )}
        </div>
      </div>
      
      {/* Full Width Chart Upload Area */}
      <div className="w-full bg-[#1a1a20] p-6 rounded-lg border border-[#3a3a45]">
        
        {/* Show Modal according to image */}
        {showPreviewModal && selectedPreview && (
           <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
           <div className="bg-[#1a1a20] border border-[#3a3a45] rounded-xl p-6 w-full">
              <div className="flex flex-col items-center">
                  <div className="p-3 rounded-full mb-4">
                      <img src={selectedPreview} alt={t('ChartPreview')} className="w-full h-auto" />
                  </div>
                  <button 
                      onClick={() => setShowPreviewModal(false)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                  >
                      {t('Close')}
                  </button>
              </div>
           </div>
       </div>
        )}

        {/* Using fixed model: gpt-4o - Model selection UI removed */}
        
        {isLoadingHistory ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mb-3"></div>
              <p className="text-gray-400">{t('LoadingSavedAnalysis')}</p>
            </div>
          </div>
        ) : chartPreviews ? (
          <div className="flex flex-col">
            {/* Chart Preview */}
            <div className="bg-[#25252d] p-4 rounded-lg border border-[#3a3a45] mb-4 relative">
              {/* Clear button positioned at the top right of the container */}
              <button 
                onClick={clearChartPreview}
                className="absolute top-2 right-2 px-4 py-2 bg-red-500 rounded-md text-white hover:bg-red-600 transition-colors z-10"
                aria-label={t('Aria_ClearChart')}
                title={t('RemoveAllCharts')}
              >
                {/* <Trash size={16} /> */}
                {t('ClearAllImages')}
              </button>
              
              {/* Simple flex layout for images */}
              <div className="flex flex-wrap justify-center items-center gap-8">
                {chartPreviews.map((preview, index) => (
                  <div key={'preview'+index} className='relative flex flex-col group'>
                    <img 
                      key={index} 
                      src={preview} 
                      alt={`${t('ChartPreview')} ${index + 1}`}
                      className="cursor-pointer object-contain border border-gray-700 rounded-md" 
                      style={{ 
                        width: '400px',
                        height: '300px',
                        objectFit: 'contain',
                        backgroundColor: '#1a1a20'
                      }}
                      onClick={() => handlePreviewImage(preview)} 
                    />
                    {/* Overlay that appears on hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the image click
                          clearSelectedChartPreview(index);
                        }}
                        className="p-3 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors z-10"
                        aria-label={t('Aria_ClearChart')}
                        title={t('RemoveChart')}
                      >
                        <Trash size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Start Analyzing button for clipboard images */}
            {showAnalyzeButton && (
              <div className="flex justify-center mt-4">
                <div className="flex items-center">
                  <span className="text-gray-400 mr-3">
                    {t('ImagesPastedCount', { count: chartPreviews.length })}
                  </span>
                  <button
                    onClick={async () => {
                      if (chartPreviews && chartPreviews.length > 0) {
                        setShowAnalyzeButton(false);
                        handleAnalyze()
                      }
                    }}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors flex items-center"
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        {t('Analyzing')}
                      </>
                    ) : (
                      t('StartAnalyzing')
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <ChartUpload 
              onUpload={handleUpload}
            />
            
            {/* Chart Analysis Tips */}
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Lightbulb className="text-yellow-400 mt-0.5 flex-shrink-0" size={20} />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-yellow-400 mb-2">{t('ChartAnalysisTipsTitle')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <span className="text-green-400 font-bold">•</span>
                        <span><strong>{t('ChartTips_ChartTypeLabel')}:</strong> {t('ChartTips_ChartTypeDesc')}</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-green-400 font-bold">•</span>
                        <span><strong>{t('ChartTips_TimeframesLabel')}:</strong> {t('ChartTips_TimeframesDesc')}</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-green-400 font-bold">•</span>
                        <span><strong>{t('ChartTips_VolumeLabel')}:</strong> {t('ChartTips_VolumeDesc')}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <span className="text-blue-400 font-bold">•</span>
                        <span><strong>{t('ChartTips_KeyIndicatorsLabel')}:</strong> {t('ChartTips_KeyIndicatorsDesc')}</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-blue-400 font-bold">•</span>
                        <span><strong>{t('ChartTips_SupportResistanceLabel')}:</strong> {t('ChartTips_SupportResistanceDesc')}</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-blue-400 font-bold">•</span>
                        <span><strong>{t('ChartTips_CleanChartsLabel')}:</strong> {t('ChartTips_CleanChartsDesc')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Analysis Cards Section */}
      {(isAnalyzing || analysisData || error) && (
        <div className="mt-6">
          <div className='flex flex-row items-center align-center justify-between mb-4'>
            <h2 className="flex items-center align-center text-xl font-bold">{t('ChartAnalysisResults')}</h2>
            {/* Show copy button at right side, clicked will copy analysis result  */}
            <div className="flex items-center justify-center align-center">
              {analysisData && (
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(analysisData.share_content?.replace(/\\n/g, '\n') || '');
                    setCopied(true);
                    setTimeout(() => {
                      setCopied(false);
                    }, 2000);
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                >
                  {copied ? t('Copied') : t('CopyAnalysis')}
                </button>
              )}
            </div>
          </div>
          {isAnalyzing && (
            <div className="flex items-center justify-center py-12 bg-[#1a1a20] rounded-lg border border-[#3a3a45]">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mb-3"></div>
                <p className="text-gray-400">{t('Analyzing')}</p>
                <p className="text-gray-400 text-sm italic">{t('AnalyzingETA')}</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-900/20 border border-red-700 text-red-300 p-4 rounded-lg mb-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                <div>
                  <h3 className="font-semibold">{t('AnalysisError')}</h3>
                  <p>{error.includes('CORS') ? t('AnalysisErrorCORS') : error}</p>
                </div>
              </div>
            </div>
          )}
          
          {analysisData && !isAnalyzing && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Basic Info Card */}
              <div className="bg-[#1a1a20] rounded-lg border border-[#3a3a45] p-5">
                <div className="flex items-center mb-3">
                  <BarChart2 className="mr-2 text-blue-400" />
                  <h3 className="text-lg font-semibold">{t('MarketOverview')}</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('Symbol')}:</span>
                    <span className="font-medium">{analysisData.Symbol || t('N/A')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('Timeframe')}:</span>
                    <span className="font-medium">{analysisData.Timeframe || t('N/A')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('CurrentPrice')}:</span>
                    <span className="font-medium">{analysisData.Current_Price || t('N/A')}</span>
                  </div>
                </div>
              </div>

              {/* Entry Analysis Card */}
              {(analysisData.Entry_Price || analysisData.Stop_Loss || analysisData.Take_Profit || analysisData.Risk_Ratio) && (
                <div className="bg-[#1a1a20] rounded-lg border border-[#3a3a45] p-5 col-span-1 md:col-span-1">
                  <div className="flex items-center mb-3">
                    <DollarSign className="mr-2 text-yellow-400" />
                    <h3 className="text-lg font-semibold">{t('TradeSetup')}</h3>
                  </div>
                  <div className="space-y-2">
                    {analysisData.Action && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('Action')}:</span>
                        <span className={"font-medium " + (analysisData.Action === "BUY" ? "text-green-400" : analysisData.Action === "SELL" ? "text-red-400" : "text-yellow-400")}>{analysisData.Action}</span>
                      </div>
                    )}
                    {analysisData.Entry_Price && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('EntryPrice')}:</span>
                        <span className="font-medium">{analysisData.Entry_Price}</span>
                      </div>
                    )}
                    {analysisData.Stop_Loss && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('StopLoss')}:</span>
                        <span className="font-medium text-red-400">{analysisData.Stop_Loss}</span>
                      </div>
                    )}
                    {analysisData.Take_Profit && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('TakeProfit')}:</span>
                        <span className="font-medium text-green-400">{analysisData.Take_Profit}</span>
                      </div>
                    )}
                    {analysisData.Risk_Ratio && (
                      <div className="flex justify-between">
                        {/* add question mark for detail how the risk ratio is calculated, when hover to question mark, show a tooltip */}
                        <span className="flex items-center text-gray-400">
                          {t('RiskRatio')} 
                          <div
                            className="relative ml-1"
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                          >
                            <HelpCircle className="w-4 h-4 text-blue-400 cursor-pointer" />
                            {showTooltip && (
                              <div className="absolute left-5 top-1 z-10 w-64 p-2 text-xs text-white bg-gray-800 rounded shadow-md">
                                <p>
                                  {t('RiskRatioCalculation')}
                                </p>
                              </div>
                            )}
                          </div>
                        </span> 
                        <span className="font-medium text-green-400">{analysisData.Risk_Ratio}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Market Structure Card */}
              {analysisData.Market_Structure && (
                <div className="bg-[#1a1a20] rounded-lg border border-[#3a3a45] p-5 col-span-1 md:col-span-2">
                  <div className="flex items-center mb-3">
                    <TrendingUp className="mr-2 text-purple-400" />
                    <h3 className="text-lg font-semibold">{t('MarketStructure')}</h3>
                  </div>
                  <p className="text-gray-300">{analysisData.Market_Structure}</p>
                </div>
              )}
              
              {/* Indicators Card */}
              {(analysisData.INDICATORS?.RSI_Indicator || analysisData.INDICATORS?.MACD_Indicator) && (
                <div className="bg-[#1a1a20] rounded-lg border border-[#3a3a45] p-5 col-span-1 md:col-span-2">
                  <div className="flex items-center mb-3">
                    <ScatterChart className="mr-2 text-orange-400" />
                    <h3 className="text-lg font-semibold">{t('Indicators')}</h3>
                  </div>
                  <div className="space-y-3">
                    {analysisData.INDICATORS?.RSI_Indicator ? (
                      <div>
                        <h4 className="text-sm text-gray-400 mb-1">{t('RSIIndicator')}</h4>
                        <p className="text-gray-300">{analysisData?.INDICATORS?.RSI_Indicator?.Analysis || t('N/A')}</p>
                      </div>
                    ) : null}
                    {analysisData.INDICATORS?.MACD_Indicator ? (
                      <div>
                        <h4 className="text-sm text-gray-400 mb-1 mt-2">{t('MACDIndicator')}</h4>
                        <p className="text-gray-300">{analysisData?.INDICATORS?.MACD_Indicator?.Analysis || t('N/A')}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Price Levels Card */}
              {/* {analysisData.Key_Price_Levels && (
                <div className="bg-[#1a1a20] rounded-lg border border-[#3a3a45] p-5 col-span-1 md:col-span-1">
                  <div className="flex items-center mb-3">
                    <ArrowDown className="mr-2 text-green-400" />
                    <h3 className="text-lg font-semibold">{t('KeyPriceLevels')}</h3>
                  </div>
                  <div className="flex justify-between">
                    {analysisData.Key_Price_Levels?.Support_Levels && analysisData.Key_Price_Levels.Support_Levels.length > 0 && (
                      <div>
                        <h4 className="text-sm text-gray-400 mb-1">{t('SupportLevels')}</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysisData.Key_Price_Levels.Support_Levels.map((level, i) => (
                            <span key={i} className="bg-green-900/30 text-green-300 rounded px-2 py-1 text-sm">
                              {level}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {analysisData.Key_Price_Levels?.Resistance_Levels && analysisData.Key_Price_Levels.Resistance_Levels.length > 0 && (
                      <div>
                        <h4 className="text-sm text-gray-400 mb-1">{t('ResistanceLevels')}</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysisData.Key_Price_Levels.Resistance_Levels.map((level, i) => (
                            <span key={i} className="bg-red-900/30 text-red-300 rounded px-2 py-1 text-sm">
                              {level}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )} */}
            
              {/* Risk Assessment Card */}
              {analysisData.Risk_Assessment && analysisData.Key_Price_Levels && (
                <div className="bg-[#1a1a20] rounded-lg border border-[#3a3a45] p-5 col-span-1 md:col-span-2">
                  <div className="flex items-center mb-3">
                    <Shield className="mr-2 text-green-400" />
                    <h3 className="text-lg font-semibold">{t('RiskAssessment')}</h3>
                  </div>

                  <div className="grid grid-cols-2 mb-3">
                    {analysisData.Key_Price_Levels?.Support_Levels && analysisData.Key_Price_Levels.Support_Levels.length > 0 && (
                      <div>
                        <h4 className="text-sm text-gray-400 mb-1">{t('SupportLevels')}</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysisData.Key_Price_Levels.Support_Levels.map((level: any, i: any) => (
                            <span key={i} className="bg-green-900/30 text-green-300 rounded px-2 py-1 text-sm">
                              {level}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {analysisData.Key_Price_Levels?.Resistance_Levels && analysisData.Key_Price_Levels.Resistance_Levels.length > 0 && (
                      <div>
                        <h4 className="text-sm text-gray-400 mb-1">{t('ResistanceLevels')}</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysisData.Key_Price_Levels.Resistance_Levels.map((level: any, i: any) => (
                            <span key={i} className="bg-red-900/30 text-red-300 rounded px-2 py-1 text-sm">
                              {level}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {analysisData.Risk_Assessment.Invalidation_Scenarios && (
                      <div>
                        <h4 className="text-sm text-gray-400 mb-1">{t('InvalidationScenarios')}</h4>
                        <p className="text-gray-300">{analysisData.Risk_Assessment.Invalidation_Scenarios}</p>
                      </div>
                    )}
                    {analysisData.Risk_Assessment.Key_Risk_Levels && (
                      <div>
                        <h4 className="text-sm text-gray-400 mb-1">{t('KeyRiskLevels')}</h4>
                        <p className="text-gray-300">{analysisData.Risk_Assessment.Key_Risk_Levels}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Technical Justification Card */}
              {analysisData.Technical_Justification && (
                <div className="bg-[#1a1a20] rounded-lg border border-[#3a3a45] p-5 col-span-1 md:col-span-2">
                  <div className="flex items-center mb-3">
                    <Clock className="mr-2 text-blue-400" />
                    <h3 className="text-lg font-semibold">{t('DetailedAnalysis')}</h3>
                  </div>
                  <p className="text-gray-300">{analysisData.Technical_Justification}</p>
                </div>
              )}
              
              {/* Analysis Confidence Card */}
              {analysisData.Analysis_Confidence?.Confidence_Level_Percent && (
                <div className="bg-[#1a1a20] rounded-lg border border-[#3a3a45] p-5 col-span-1 md:col-span-2">
                  <div className="flex items-center mb-3 justify-between">
                    <div className="flex">
                      <PieChart className="mr-2 text-purple-400" />
                      <h3 className="text-lg font-semibold">{t('AnalysisConfidence')}</h3>
                    </div>
                    <div className='flex gap-1 rounded-full bg-gray-50/5 p-1 items-center justify-center align-center' role="tablist" aria-orientation="horizontal">
                      <button className={`rounded-full p-1 ${selectedTab === 'percent' ? 'bg-gray-50/5' : ''}`} role="tab" aria-selected={selectedTab === 'percent'} onClick={() => setSelectedTab('percent')}>
                        <Percent className="text-purple-400" />
                      </button>
                      <button className={`rounded-full p-1 ${selectedTab === 'pie' ? 'bg-gray-50/5' : ''}`} role="tab" aria-selected={selectedTab === 'pie'} onClick={() => setSelectedTab('pie')}>
                        <PieChart className="text-purple-400" />
                      </button>
                    </div>
                  </div>
                  {selectedTab === 'pie' && analysisData.Analysis_Confidences ? (
                    <div className="w-full justify-center items-center flex">
                      <RadarChart 
                        axes={Object.keys(analysisData.Analysis_Confidences[0]).filter(k => k !== "Timeframe").map(label => ({ label: label.replace('_Percent', '').replace('_', ' '), max: 100 }))} 
                        series={analysisData.Analysis_Confidences.map((d: any, d_index: any) => ({
                          label: d.Timeframe? d.Timeframe : "",
                          values: Object.entries(d).filter(([k]) => k !== 'Timeframe').map(([, v]) => Math.round(v as number)),
                          color: defaultColors[d_index]
                        }))}
                        showLegend={analysisData.Analysis_Confidences.length > 1 ? true : false} 
                      />
                    </div>
                  ) : (
                    <>
                      {analysisData.Analysis_Confidence?.Confidence_Level_Percent ? (
                        <>
                          <h4 className="text-sm text-gray-400 mb-1">{t('ConfidenceLevel')}</h4>
                          <div className="flex items-center">
                            <div className="relative h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="absolute left-0 top-0 h-full bg-purple-500 rounded-full"
                                style={{ width: `${analysisData.Analysis_Confidence.Confidence_Level_Percent}%` }}
                              ></div>
                            </div>
                            <span className="ml-3 text-lg font-semibold">
                              {analysisData.Analysis_Confidence.Confidence_Level_Percent}%
                            </span>
                          </div>
                        </>
                      ) : null}
                      {analysisData.Analysis_Confidence?.Pattern_Clarity_Percent ? (
                        <>
                          <h4 className="text-sm text-gray-400 mb-1">{t('PatternClarity')}</h4>
                          <div className="flex items-center">
                            <div className="relative h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="absolute left-0 top-0 h-full bg-purple-500 rounded-full"
                                style={{ width: `${analysisData.Analysis_Confidence.Pattern_Clarity_Percent}%` }}
                              ></div>
                            </div>
                            <span className="ml-3 text-lg font-semibold">
                              {analysisData.Analysis_Confidence.Pattern_Clarity_Percent}%
                            </span>
                          </div>
                        </>
                      ) : null}
                      {analysisData.Analysis_Confidence?.Signal_Reliability_Percent ? (
                        <>
                          <h4 className="text-sm text-gray-400 mb-1">{t('SignalReliability')}</h4>
                          <div className="flex items-center">
                            <div className="relative h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="absolute left-0 top-0 h-full bg-purple-500 rounded-full"
                                style={{ width: `${analysisData.Analysis_Confidence.Signal_Reliability_Percent}%` }}
                              ></div>
                            </div>
                            <span className="ml-3 text-lg font-semibold">
                              {analysisData.Analysis_Confidence.Signal_Reliability_Percent}%
                            </span>
                          </div>
                        </>
                      ) : null}
                      {analysisData.Analysis_Confidence?.Technical_Alignment_Percent ? (
                        <>
                          <h4 className="text-sm text-gray-400 mb-1">{t('TechnicalAlignment')}</h4>
                          <div className="flex items-center">
                            <div className="relative h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="absolute left-0 top-0 h-full bg-purple-500 rounded-full"
                                style={{ width: `${analysisData.Analysis_Confidence.Technical_Alignment_Percent}%` }}
                              ></div>
                            </div>
                            <span className="ml-3 text-lg font-semibold">
                              {analysisData.Analysis_Confidence.Technical_Alignment_Percent}%
                            </span>
                          </div>
                        </>
                      ) : null}
                      {analysisData.Analysis_Confidence?.Volume_Confirmation_Percent ? (
                        <>
                          <h4 className="text-sm text-gray-400 mb-1">{t('VolumeConfirmation')}</h4>
                          <div className="flex items-center">
                            <div className="relative h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="absolute left-0 top-0 h-full bg-purple-500 rounded-full"
                                style={{ width: `${analysisData.Analysis_Confidence.Volume_Confirmation_Percent}%` }}
                              ></div>
                            </div>
                            <span className="ml-3 text-lg font-semibold">
                              {analysisData.Analysis_Confidence.Volume_Confirmation_Percent}%
                            </span>
                          </div>
                        </>
                      ) : null}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* News Section */}
          {analysisData?.news && analysisData.news.length > 0 && (
            <div className="bg-[#1a1a20] rounded-lg border border-[#3a3a45] p-5 my-4">
              <div className="flex items-center mb-2">
                <BarChart2 className="mr-2 text-blue-400" />
                <h3 className="text-lg font-semibold">{t('News')}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {analysisData.news
                  .filter((n: any) => n.impact?.toLowerCase() === 'high')
                  .map((n: any) => (
                  <div key={n.id} className="bg-[#0f0f14] rounded-lg border border-[#3a3a45] p-4">
                    <p className="text-gray-100 font-medium mb-3">{n.title}</p>
                    <div className="text-sm text-gray-300 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('Country')}:</span>
                        <span className="font-medium w-[180px] text-right whitespace-normal break-words">{n.country}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">{t('Impact')}:</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/40">
                          {n.impact}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('Date')}:</span>
                        <span className="font-medium w-[220px] text-right whitespace-normal break-words">
                          {(() => {
                            // Expecting ISO with offset, e.g. 2025-09-12T04:00:00-04:00
                            const m = String(n.date).match(
                              /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2})?([+-])(\d{2}):(\d{2})$/
                            );
                            if (!m) {
                              // Fallback to readable local format
                              const d = new Date(n.date);
                              return d.toLocaleString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              });
                            }
                            const [, y, mo, d, hh, mm, sign, offH, offM] = m;
                            const months = [
                              'January', 'February', 'March', 'April', 'May', 'June',
                              'July', 'August', 'September', 'October', 'November', 'December'
                            ];
                            const monthName = months[parseInt(mo, 10) - 1];
                            const dayNum = String(parseInt(d, 10));
                            const hNum = parseInt(hh, 10);
                            const ampm = hNum >= 12 ? 'PM' : 'AM';
                            const h12 = ((hNum + 11) % 12) + 1; // 0->12, 13->1
                            const h12Str = String(h12).padStart(2, '0');
                            const timeStr = `${h12Str}:${mm} ${ampm}`;
                            const tzSuffix = `UTC${sign}${String(parseInt(offH, 10))}${offM !== '00' ? ':' + offM : ''}`;
                            return `${monthName} ${dayNum}, ${y} at ${timeStr} in ${tzSuffix}.`;
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
           {/* Show disclaimer */}
           {(isAnalyzing || analysisData || error) && (
             <div className="mt-6">
               <p className="text-gray-100 text-md">
                 {t("PoweredByDecyphersAI")}
               </p>
               <p className="text-gray-400 text-sm">
                 {t('Disclaimer')}
               </p>
             </div>
           )}
          
          {/* Chat Interface - only show after analysis is complete */}
          {analysisData && !isAnalyzing && !error && (
            <div className="mt-6">
              <ChartAnalysisChat 
                analysisId={analysisData.history_id as number} 
                chartSymbol={analysisData.Symbol}
                chartTimeframe={analysisData.Timeframe}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChartAnalysisNew;
