import React, { useState, useRef } from 'react';
import { Upload, X, FileUp, Image, AlertCircle, ChevronDown, Clock, BarChart2 } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { META_TEXT_GRADIENT, CHART_TIMEFRAMES, SAMPLE_INDICATORS } from '../../constants';

interface ChartUploadProps {
  onUpload: (file: File[]) => void;
}

const IndicatorBadge: React.FC<{ type: string; value: number; signal: string }> = ({ type, value, signal }) => (
  <div className="flex items-center gap-2 bg-[#15120c] rounded-md px-3 py-1.5 glow-border">
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
  const [files, setFiles] = useState<File[] | null>(null);
  const [previews, setPreviews] = useState<any[] | null>(null);
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

  const validateFile = (files: File[]): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    let bool = false;
    files.map(file => {
      if (!validTypes.includes(file.type)) {
        setError('Invalid file type. Please upload a PNG, JPG, or GIF image.');
        bool = false;
      }
      
      if (file.size > maxSize) {
        setError('File is too large. Maximum size is 5MB.');
        bool = false;
      }
      
      setError(null);
      bool = true;
    })
    return bool;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = e.dataTransfer.files;
      handleFile([...droppedFiles]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = e.target.files;
      handleFile([...selectedFiles]);
    }
  };

  const handleFile = (selectedFiles: File[]) => {
    if (!validateFile(selectedFiles)) return;
  
    setFiles(selectedFiles);
  
    // generate previews for every file
    const previewPromises = selectedFiles.map(
      file =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result); // data-URL
            } else {
              reject(new Error('Unexpected FileReader result'));
            }
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        }),
    );
  
    Promise.all(previewPromises)
      .then((previews) => setPreviews(previews)) // previews: string[]
      .catch(console.error);
  
      onUpload(selectedFiles);
  };

  const resetUpload = () => {
    setFiles(null);
    setPreviews(null);
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
      {!files ? (
        <div 
          className={`
            p-6 rounded-lg border-2 border-dashed transition-colors duration-200
            ${isDragging ? 'border-[#94a3b8] bg-[#15120c]/80' : 'border-[#3a2a15]'}
            ${error ? 'border-red-500/70' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center py-6">
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
              multiple
            />
            
            <p className="text-xs text-gray-500 mt-4">
              Supported formats: PNG, JPG, GIF (max 5MB) <br />
              Maximum 3 images with the same symbols
            </p>
            
            {error && (
              <div className="bg-red-900/20 border border-red-700 text-red-300 p-4 rounded-lg mb-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Analysis Error</h3>
                    <p>{error.includes('CORS') ? 'An error occurred while analyzing your chart. Please try again later.' : error}</p>
                  </div>
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
                className="appearance-none bg-[#15120c] border border-[#3a2a15] rounded-md py-1.5 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-[#94a3b8]"
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
          
          <div className="rounded-lg overflow-hidden border border-[#3a2a15]">
            {previews && previews.map((preview, index) => (
              <img
                key={'preview' + index} 
                src={preview} 
                alt="Chart Preview" 
                className="w-full h-auto max-h-[600px] object-contain bg-[#16161a] glow-border" 
              />
            ))}
          </div>
          
          <div className="mt-4 bg-[#0b0b0e] rounded-md p-4 glow-border">
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
            {files && files.map((file, index) => (
              <div className="flex-1" key={file.name + index}>
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-gray-400">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ))}
            
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