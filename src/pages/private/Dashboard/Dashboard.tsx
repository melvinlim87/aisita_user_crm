import React, { useEffect, useState } from 'react';
import { BarChart2, Clock, ArrowRight, ImageOff } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { AnalysisItem } from '@/types/pages/Dashboard';
import { getRequest } from '@/services/apiRequest';
import { useTranslation } from "react-i18next";

const Dashboard: React.FC = () => {
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchHistories = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getRequest<AnalysisItem[]>('/history');
        if (Array.isArray(response)) {
          // Filter out ea_generation type
          const filteredResponse = response.filter(item => item.type !== 'ea_generation');
          setRecentAnalyses(filteredResponse.slice(0, 5));
        } else if (response && Array.isArray((response as any).data)) {
          // Filter out ea_generation type
          const filteredResponse = (response as any).data.filter((item: AnalysisItem) => item.type !== 'ea_generation');
          setRecentAnalyses(filteredResponse.slice(0, 5));
        } else {
          setRecentAnalyses([]);
        }
      } catch (err) {
        setError(t('FailedToLoadRecentAnalyses'));
        setRecentAnalyses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistories();
  }, [t]);

  return (
    <div className="container mx-auto p-6">
      {/* Welcome Section */}
      <div className="bg-[#0b0b0e] rounded-lg border border-[#3a2a15] p-8 mb-6">
        <h1 className="text-3xl font-bold text-white mb-4">{t("Dashboard")}</h1>
        <p className="text-gray-400">
          {t("DashboardDescription")}
        </p>
      </div>
      
      {/* Recent Analysis Section */}
      <div className="bg-[#0b0b0e] rounded-lg border border-[#3a2a15] p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-[#63b3ed] mr-2" />
            <h2 className="text-xl font-semibold text-white">{t("RecentAnalysis")}</h2>
          </div>
          <Link to="/history" className="flex items-center text-sm text-[#63b3ed] hover:text-[#90cdf4]">
            {t("ViewAll")} <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        
        {loading ? (
          <div className="text-center py-8 text-gray-400">{t('LoadingRecentAnalyses')}</div>
        ) : error ? (
          <div className="text-center py-8 text-red-400">{error}</div>
        ) : recentAnalyses.length > 0 ? (
          <div className="space-y-4">
            {recentAnalyses.map((analysis: any) => {
              return (
              <Link 
                to={`/chart-analysis/${analysis.id}`} 
                key={analysis.id} 
                className="block">
                <div className="flex items-center justify-between p-4 bg-[#15120c] rounded-lg border border-[#3a2a15] hover:border-[#4a5568] hover:bg-[#2d2d36] transition-all duration-200 cursor-pointer">
                  <div className="flex items-center">
                    <div className="p-2 bg-[#0b0b0e] rounded-md mr-4">
                      {/* Show image if exists and is a valid URL, else placeholder icon */}
                      {analysis.chart_urls && 
                       analysis.chart_urls.length > 0 && 
                       typeof analysis.chart_urls[0] === 'string' &&
                       (analysis.chart_urls[0].startsWith('http://') || analysis.chart_urls[0].startsWith('https://')) ? (
                        <img 
                          src={analysis.chart_urls[0]} 
                          alt="analysis" 
                          className="w-8 h-8 rounded object-cover" 
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.parentElement) {
                              e.currentTarget.parentElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-[#63b3ed]"><path d="M2 2l20 20"/><path d="M9 9v0"/><path d="M15 15v0"/><rect width="16" height="16" x="4" y="4"/></svg>';
                            }
                          }}
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
                    <span className="text-xs px-2 py-1 bg-[#0b0b0e] rounded-full text-gray-400">{t(analysis.type)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">{t('NoRecentAnalyses')}</p>
            <Link to="/chart-analysis" className="mt-4 inline-block px-4 py-2 bg-[#2d3748] text-white rounded-md hover:bg-[#4a5568] transition-all duration-200">
              {t('CreateFirstAnalysis')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;