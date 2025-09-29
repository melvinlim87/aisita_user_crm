import React, { useState } from 'react';
import ChartUpload from '../components/chart/ChartUpload';
import ChatInterface from '../components/chat/ChatInterface';
import { useAuth } from '../contexts/AuthContext';
import { BarChart2, Upload } from 'lucide-react';
import { ChatProvider } from '../contexts/ChatContext';
import { META_TEXT_GRADIENT } from '../constants';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [chartFile, setChartFile] = useState<File | null>(null);
  const [chartPreview, setChartPreview] = useState<string | null>(null);

  const handleUpload = (file: File) => {
    setChartFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setChartPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <ChatProvider>
      <div className="min-h-screen bg-[#1a1a20]">
        <div className="container mx-auto p-4 md:px-6 pt-20 pb-10">
          <div className="flex flex-col md:flex-row border border-[#3a3a45] rounded-lg overflow-hidden">
            {/* Left Panel (60%) - Chart Section */}
            <div className="w-full md:w-3/5 bg-[#1a1a20] p-6">
              <div className="h-full flex flex-col">
                <div className="mb-6">
                  <div className="flex items-center">
                    <h1 className={`text-2xl font-bold ${META_TEXT_GRADIENT}`}>
                      Financial Chart Analysis
                    </h1>
                  </div>
                  <p className="text-gray-400 mt-1">
                    Upload your chart to receive AI-powered analysis
                  </p>
                </div>
                
                {chartPreview ? (
                  <div className="flex-1 flex flex-col">
                    <div className="bg-[#25252d] p-4 rounded-lg border border-[#3a3a45] mb-4">
                      <div className="rounded overflow-hidden">
                        <img 
                          src={chartPreview} 
                          alt="Uploaded Chart"
                          className="w-full h-auto max-h-[500px] object-contain" 
                        />
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <ChartUpload onUpload={handleUpload} />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="max-w-md w-full">
                      <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#25252d] mb-4">
                          <Upload className={`w-8 h-8 ${META_TEXT_GRADIENT}`} />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">
                          Upload a Financial Chart
                        </h2>
                        <p className="text-gray-400">
                          Upload a chart to get AI-powered analysis of patterns, indicators, and trading strategies
                        </p>
                      </div>
                      
                      <ChartUpload onUpload={handleUpload} />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right Panel (40%) - Chat Interface */}
            <div className="w-full md:w-2/5 h-[600px] md:h-auto">
              <ChatInterface />
            </div>
          </div>
        </div>
      </div>
    </ChatProvider>
  );
};

export default Dashboard;