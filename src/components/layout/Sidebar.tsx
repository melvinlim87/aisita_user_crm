import React, { useState } from 'react';
import { ChevronLeft, History, Star, ChevronRight, Clock, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import { MOCK_ANALYSES } from '../../constants';
import { ChartAnalysis } from '../../types';
import { formatDistanceToNow } from 'date-fns';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'favorites'>('history');
  
  const analyses = MOCK_ANALYSES;
  const favorites = analyses.filter(analysis => analysis.isFavorite);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const renderAnalysisItem = (analysis: ChartAnalysis) => {
    const date = new Date(analysis.createdAt);
    const timeAgo = formatDistanceToNow(date, { addSuffix: true });
    
    return (
      <Card 
        key={analysis.id}
        variant="bordered"
        className={`mb-2 transition-all duration-200 hover:border-[#94a3b8] group ${isCollapsed ? 'p-2' : 'p-3'}`}
      >
        <Link to={`/analysis/${analysis.id}`} className="flex space-x-3">
          <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
            <img 
              src={analysis.chartUrl} 
              alt={analysis.title} 
              className="w-full h-full object-cover"
            />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h4 className="text-sm font-medium text-[#e2e8f0] truncate group-hover:text-white">
                {analysis.title}
              </h4>
              <p className="text-xs text-gray-400 flex items-center">
                <Clock className="w-3 h-3 mr-1 inline" />
                {timeAgo}
              </p>
            </div>
          )}
        </Link>
      </Card>
    );
  };

  return (
    <aside 
      className={`
        fixed left-0 top-[57px] h-[calc(100vh-57px)] bg-[#1a1a20] border-r border-[#3a3a45]
        transition-all duration-300 z-30
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}
    >
      <div className="h-full flex flex-col">
        <div className="flex justify-end p-2">
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-[#25252d]"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
        
        {!isCollapsed && (
          <div className="px-3 mb-4">
            <div className="flex space-x-1">
              <button
                className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors
                  ${activeTab === 'history' 
                    ? 'bg-[#25252d] text-[#e2e8f0]' 
                    : 'text-gray-400 hover:bg-[#25252d]/50'
                  }`}
                onClick={() => setActiveTab('history')}
              >
                <div className="flex items-center justify-center space-x-1">
                  <History size={14} />
                  <span>History</span>
                </div>
              </button>
              <button
                className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors
                  ${activeTab === 'favorites' 
                    ? 'bg-[#25252d] text-[#e2e8f0]' 
                    : 'text-gray-400 hover:bg-[#25252d]/50'
                  }`}
                onClick={() => setActiveTab('favorites')}
              >
                <div className="flex items-center justify-center space-x-1">
                  <Star size={14} />
                  <span>Favorites</span>
                </div>
              </button>
            </div>
          </div>
        )}
        
        {isCollapsed && (
          <div className="flex flex-col items-center px-2 space-y-2">
            <button
              className={`w-full p-2 rounded-md flex items-center justify-center
                ${activeTab === 'history' 
                  ? 'bg-[#25252d] text-[#e2e8f0]' 
                  : 'text-gray-400 hover:bg-[#25252d]/50'
                }`}
              onClick={() => setActiveTab('history')}
            >
              <History size={16} />
            </button>
            <button
              className={`w-full p-2 rounded-md flex items-center justify-center
                ${activeTab === 'favorites' 
                  ? 'bg-[#25252d] text-[#e2e8f0]' 
                  : 'text-gray-400 hover:bg-[#25252d]/50'
                }`}
              onClick={() => setActiveTab('favorites')}
            >
              <Star size={16} />
            </button>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin">
          {activeTab === 'history' ? (
            <div>
              {analyses.length > 0 ? (
                analyses.map(renderAnalysisItem)
              ) : (
                <div className="text-center py-8 px-4">
                  <BarChart2 className="w-8 h-8 mx-auto text-gray-500 mb-2" />
                  <p className="text-sm text-gray-400">No analysis history yet</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              {favorites.length > 0 ? (
                favorites.map(renderAnalysisItem)
              ) : (
                <div className="text-center py-8 px-4">
                  <Star className="w-8 h-8 mx-auto text-gray-500 mb-2" />
                  <p className="text-sm text-gray-400">No favorite analyses yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;