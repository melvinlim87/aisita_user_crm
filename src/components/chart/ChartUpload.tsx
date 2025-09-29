import React, { useState, useRef } from 'react';
import { Upload, X, FileUp, Image, AlertCircle, ChevronDown, Clock, BarChart2 } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { META_TEXT_GRADIENT, CHART_TIMEFRAMES, SAMPLE_INDICATORS } from '../../constants';

interface ChartUploadProps {
  onUpload: (file: File) => void;
}

const IndicatorBadge: React.FC<{ type: string; value: number; signal: string }> = ({ type, value, signal }) => (
  <div className="flex items-center gap-2 bg-[#25252d] rounded-md px-3 py-1.5 glow-border">
    <span className="text-sm font-medium">{type}</span>
    <span className={`text-sm ${
      signal === 'bullish' ? 'text-green-400' : 
      signal === 'bearish' ? 'text-red-400' : 
      'text-gray-400'
    }`}>
      {value}
    </span>
  </div>
);

const ChartUpload: React.FC<ChartUploadProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState(CHART_TIMEFRAMES[3]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload a PNG, JPG, or GIF image.');
      return false;
    }
    
    if (file.size > maxSize) {
      setError('File is too large. Maximum size is 5MB.');
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      handleFile(droppedFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      handleFile(selectedFile);
    }
  };

  const handleFile = (selectedFile: File) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
      
      onUpload(selectedFile);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card className="w-full">
      {!file ? (
        <div 
          className={`
            p-6 rounded-lg border-2 border-dashed transition-colors duration-200
            ${isDragging ? 'border-[#94a3b8] bg-[#25252d]/80' : 'border-[#3a3a45]'}
            ${error ? 'border-red-500/70' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center py-6">
            <div className={`mb-4 p-4 rounded-full bg-[#25252d] ${isDragging ? 'bg-[#3a3a45]' : ''}`}>
              <Upload className={`w-8 h-8 ${META_TEXT_GRADIENT}`} />
            </div>
            
            <h3 className="text-lg font-medium mb-2 text-center">
              Upload a Financial Chart
            </h3>
            
            <p className="text-sm text-gray-400 mb-4 text-center max-w-md">
              Drag and drop your chart image here, or click to browse
            </p>
            
            <Button
              variant="secondary"
              onClick={triggerFileInput}
              icon={<FileUp className="w-4 h-4" />}
            >
              Select File
            </Button>
            
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept="image/png,image/jpeg,image/gif"
              onChange={handleFileInput}
            />
            
            <p className="text-xs text-gray-500 mt-4">
              Supported formats: PNG, JPG, GIF (max 5MB)
            </p>
            
            {error && (
              <div className="mt-4 bg-red-500/20 border border-red-500/40 rounded-md p-3 max-w-md">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="relative p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="relative">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="appearance-none bg-[#25252d] border border-[#3a3a45] rounded-md py-1.5 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-[#94a3b8]"
              >
                {CHART_TIMEFRAMES.map((tf) => (
                  <option key={tf} value={tf}>{tf}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
          
          <div className="absolute top-4 right-4 z-10">
            <button 
              className="p-1 rounded-full bg-gray-800/80 hover:bg-gray-700/80 transition-colors"
              onClick={resetUpload}
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          
          <div className="rounded-lg overflow-hidden border border-[#3a3a45]">
            {preview && (
              <img 
                src={preview} 
                alt="Chart Preview" 
                className="w-full h-auto max-h-[600px] object-contain bg-[#16161a] glow-border" 
              />
            )}
          </div>
          
          <div className="mt-4 bg-[#1a1a20] rounded-md p-4 glow-border">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <BarChart2 className="w-4 h-4" />
              Quick Analysis
            </h4>
            
            <div className="flex flex-wrap gap-2">
              {SAMPLE_INDICATORS.map((indicator) => (
                <IndicatorBadge key={indicator.type} {...indicator} />
              ))}
            </div>
          </div>
          
          <div className="mt-4 flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-gray-400">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={triggerFileInput}
              icon={<Image className="w-4 h-4" />}
            >
              Change
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ChartUpload;