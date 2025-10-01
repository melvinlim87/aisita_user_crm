import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, ArrowRight, ImageOff, Search, Filter } from 'lucide-react';
import { getRequest } from '@/services/apiRequest';
import { META_TEXT_GRADIENT } from '@/constants';
import { useTranslation } from 'react-i18next';

interface AnalysisItem {
  id: string;
  title: string;
  type: string;
  created_at: string;
  chart_urls: string[];
  user_id?: string;
  status?: string;
}

const History: React.FC = () => {
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const { t } = useTranslation();
  
  const itemsPerPage = 10;

  // Fetch history data with pagination
  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real API, you might have pagination parameters like ?page=${page}&limit=${itemsPerPage}
      // Here we're handling pagination client-side since the API doesn't support it yet
      const response = await getRequest<AnalysisItem[]>('/history');
      
      if (Array.isArray(response)) {
        // Filter out ea_generation type
        const filteredResponse = response.filter(item => item.type !== 'ea_generation');
        // Calculate total pages based on total items
        const totalItems = filteredResponse.length;
        setTotalPages(Math.ceil(totalItems / itemsPerPage));
        
        // Store all analyses for filtering
        setAnalyses(filteredResponse);
      } else if (response && Array.isArray((response as any).data)) {
        // Filter out ea_generation type
        const filteredResponse = (response as any).data.filter((item: AnalysisItem) => item.type !== 'ea_generation');
        const totalItems = filteredResponse.length;
        setTotalPages(Math.ceil(totalItems / itemsPerPage));
        setAnalyses(filteredResponse);
      } else {
        setAnalyses([]);
        setTotalPages(1);
      }
    } catch (err) {
      setError(t('FailedToLoadAnalysisHistory'));
      setAnalyses([]);
    } finally {
      setLoading(false);
    }
  };

  // Get filtered analyses based on search and filter criteria
  const getFilteredAnalyses = () => {
    // First apply search filter
    let filtered = analyses;
    
    if (searchTerm) {
      filtered = filtered.filter(analysis => 
        analysis.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analysis.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Then apply type filter if not 'all'
    if (filterType !== 'all') {
      filtered = filtered.filter(analysis => 
        analysis.type.toLowerCase() === filterType.toLowerCase()
      );
    }
    
    return filtered;
  };
  
  // Get paginated results from the filtered analyses
  const getPaginatedAnalyses = () => {
    const filtered = getFilteredAnalyses();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };
  
  // Update total pages when filtered data changes
  useEffect(() => {
    const filtered = getFilteredAnalyses();
    console.log(filtered)
    const totalFilteredItems = filtered.length;
    const newTotalPages = Math.ceil(totalFilteredItems / itemsPerPage);
    setTotalPages(newTotalPages);
  }, [analyses, searchTerm, filterType, itemsPerPage]);
  
  // Reset to page 1 if current page is beyond available pages
  useEffect(() => {
    if (currentPage > 1 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages]);

  // Handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img && img.parentElement) {
      img.style.display = 'none';
      
      // Find if there's already an ImageOff icon
      const existingIcon = img.parentElement.querySelector('svg');
      if (!existingIcon) {
        // Create and append the ImageOff icon if it doesn't exist
        const iconContainer = document.createElement('div');
        iconContainer.className = 'w-5 h-5 text-[#63b3ed]';
        img.parentElement.appendChild(iconContainer);
      }
    }
  };

  // Load history on component mount
  useEffect(() => {
    fetchHistory();
  }, []);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // If we had a server-side pagination API:
    // fetchHistory(page);
    window.scrollTo(0, 0); // Scroll to top when changing pages
  };

  // Get unique analysis types for the filter dropdown
  const analysisTypes = ['all', ...new Set(analyses.map(analysis => analysis.type.toLowerCase()))];

  return (
    <div className="container mx-auto p-6">
      {/* Header Section */}
      <div className="bg-[#0b0b0e] rounded-lg border border-[#3a2a15] p-6 mb-6">
        <h1 className={`text-2xl font-bold ${META_TEXT_GRADIENT} mb-2`}>
          {t('AnalysisHistory')}
        </h1>
        <p className="text-gray-400">
          {t('ViewAccessPreviousAnalyses')}
        </p>
      </div>
      
      {/* Search and Filter */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={t('SearchByTitleOrType')}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on new search
            }}
            className="w-full pl-10 pr-4 py-2 bg-[#15120c] border border-[#3a2a15] rounded-lg text-white focus:outline-none focus:border-[#63b3ed] transition-colors"
          />
        </div>
        <div className="relative w-full md:w-1/4">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1); // Reset to first page on new filter
            }}
            className="w-full appearance-none pl-10 pr-8 py-2 bg-[#15120c] border border-[#3a2a15] rounded-lg text-white focus:outline-none focus:border-[#63b3ed] transition-colors"
          >
            {analysisTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? t('AllTypes') : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <ArrowRight className="w-4 h-4 text-gray-400 rotate-90" />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="bg-[#0b0b0e] rounded-lg border border-[#3a2a15] p-6 mb-6">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={() => fetchHistory()}
              className="mt-4 px-4 py-2 bg-[#63b3ed] text-white rounded-lg hover:bg-[#90cdf4] transition-colors"
            >
              {t('TryAgain')}
            </button>
          </div>
        ) : getFilteredAnalyses().length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400">{t('NoAnalysisHistoryFound')}</p>
            {(searchTerm || filterType !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setCurrentPage(1);
                }}
                className="mt-4 px-4 py-2 bg-[#15120c] text-white rounded-lg hover:bg-[#3a3a45] transition-colors"
              >
                {t('ClearFilters')}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {getPaginatedAnalyses().map((analysis) => (
              <Link to={analysis.type === 'ea_generation' ? `/ea-generator/${analysis.id}` : `/chart-analysis/${analysis.id}`} key={analysis.id} className="block">
                <div className="flex items-center justify-between p-4 bg-[#15120c] rounded-lg border border-[#3a2a15] hover:border-[#4a5568] hover:bg-[#2d2d36] transition-all duration-200 cursor-pointer">
                  <div className="flex items-center">
                    <div className="p-2 bg-[#0b0b0e] rounded-md mr-4">
                      {analysis.chart_urls && analysis.chart_urls.length > 0 && typeof analysis.chart_urls[0] === 'string' && 
                      (analysis.chart_urls[0].startsWith('http://') || analysis.chart_urls[0].startsWith('https://')) ? (
                        <img 
                          src={analysis.chart_urls[0]} 
                          alt="analysis" 
                          className="w-8 h-8 rounded object-cover" 
                          onError={handleImageError}
                        />
                      ) : (
                        <ImageOff className="w-5 h-5 text-[#63b3ed]" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white">{analysis.title}</h3>
                      <p className="text-xs text-gray-400">
                        {analysis.created_at ? format(new Date(analysis.created_at), 'MMM d, yyyy h:mm a') : ''}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs px-2 py-1 bg-[#0b0b0e] rounded-full text-gray-400">
                      {analysis.type}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#15120c]'}`}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          
          {/* Display page numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Show pages around current page
            let pageNum;
            if (totalPages <= 5) {
              // If 5 or fewer total pages, show all
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              // Near the start
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              // Near the end
              pageNum = totalPages - 4 + i;
            } else {
              // In the middle
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-10 h-10 rounded-lg ${currentPage === pageNum 
                  ? 'bg-[#63b3ed] text-white' 
                  : 'bg-[#15120c] text-white hover:bg-[#3a3a45]'}`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#15120c]'}`}
          >
            <ArrowRight className="w-5 h-5 text-white" />
          </button>
        </div>
      )}
    </div>
  );
};

export default History;
