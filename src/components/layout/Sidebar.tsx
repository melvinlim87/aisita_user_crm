import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Compass, BarChart2, Code, FileText, Shield, MessageCircle, ChevronLeft, ChevronRight, BookOpen, CandlestickChart, Calendar, LogOut, User, Settings, DollarSign, Coins } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { useTokenBalance } from '@/contexts/TokenBalanceContext';
import { FRONTEND_URL, APP_ENV } from '@/config';
import PricingPlanCard from './PricingPlanCard';
import Button from '../common/Button';
import { useTranslation } from 'react-i18next';

const Sidebar: React.FC = () => {
  const { tokenBalance, isLoadingTokens } = useTokenBalance();
  const { user, isAuthenticated, logout } = useAuth();
  const { isOpen, toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      {/* Toggle button */}
      <button 
        onClick={toggleSidebar}
        className={`
          fixed z-40 bg-[#0b0b0e] rounded-full
          border border-[#3a2a15]
          hover:bg-[#15120c] transition-all duration-300
          flex items-center justify-center w-9 h-9
          shadow-md
          ${isOpen ? 'left-[calc(15.5rem-3.5px)]' : 'left-[-3.5px]'}
          top-[calc(50vh)]
        `}
        aria-label={isOpen ? t('CloseSidebar') : t('OpenSidebar')}
      >
        {isOpen ? 
          <ChevronLeft className="w-5 h-5 text-[#10b981]" /> : 
          <ChevronRight className="w-5 h-5 text-[#10b981]" />
        }
      </button>
      
      <aside 
        className={`
          fixed left-0 top-[57px] h-[calc(100vh-57px)] bg-[#15120c] border-r border-[#3a2a15]
          transition-all duration-300 z-30
          ${isOpen ? 'w-64' : 'w-0 -translate-x-full opacity-0 pointer-events-none'} flex flex-col
          overflow-hidden
        `}
      >
        <div className="flex-1 flex flex-col mt-8 px-4 overflow-y-auto">
        {/* Main Navigation */}
        <nav className="space-y-1 mb-6">
          <Link to="/dashboard" className="flex items-center px-3 py-2 text-sm font-medium text-[#e2e8f0] rounded-md hover:bg-[#15120c] transition-colors">
            <Home className="w-5 h-5 mr-4 text-[#94a3b8]" />
            {t('Dashboard')}
          </Link>
          {/* Hide for now */}
          {/* <Link to="/explore" className="flex items-center px-3 py-2 text-sm font-medium text-[#e2e8f0] rounded-md hover:bg-[#15120c] transition-colors">
            <Compass className="w-5 h-5 mr-4 text-[#94a3b8]" />
            {t('Explore')}
          </Link> */}
        </nav>
        
        {/* AI Generation Section */}
        <div className="mb-6">
          <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('AIGeneration')}</h3>
          <nav className="space-y-1">
            {/* <Link to="/chart-analysis" className="flex items-center px-3 py-2 text-sm font-medium text-[#e2e8f0] rounded-md hover:bg-[#15120c] transition-colors">
              <BarChart2 className="w-5 h-5 mr-4 text-[#94a3b8]" />
              {t('ChartAnalysis')}
            </Link> */}
            <Link to="/chart-analysis" className="flex items-center px-3 py-2 text-sm font-medium text-[#e2e8f0] rounded-md hover:bg-[#15120c] transition-colors">
              <BarChart2 className="w-5 h-5 mr-4 text-[#94a3b8]" />
              {t('ChartAnalysis')}
            </Link>
            <Link to="/ea-generator" className="flex items-center px-3 py-2 text-sm font-medium text-[#e2e8f0] rounded-md hover:bg-[#15120c] transition-colors">
              <Code className="w-5 h-5 mr-4 text-[#94a3b8]" />
              {t('EAGenerator')}
            </Link>
            {APP_ENV !== 'production' && (
              <>
                <Link to="/ai-educator" className="flex items-center px-3 py-2 text-sm font-medium text-[#e2e8f0] rounded-md hover:bg-[#15120c] transition-colors">
                  <BookOpen className="w-5 h-5 mr-4 text-[#94a3b8]" />
                  {t('AIEducator')}
                </Link>
                <Link to="/chart-on-demand" className="flex items-center px-3 py-2 text-sm font-medium text-[#e2e8f0] rounded-md hover:bg-[#15120c] transition-colors">
                  <CandlestickChart className="w-5 h-5 mr-4 text-[#94a3b8]" />
                  {t('ChartOnDemand')}
                </Link>
                <Link to="/schedule-analysis" className="flex items-center px-3 py-2 text-sm font-medium text-[#e2e8f0] rounded-md hover:bg-[#15120c] transition-colors">
                  <Calendar className="w-5 h-5 mr-4 text-[#94a3b8]" />
                  {t('ScheduleAnalysis')}
                </Link>
              </>
            )}
            <Link to="/history" className="flex items-center px-3 py-2 text-sm font-medium text-[#e2e8f0] rounded-md hover:bg-[#15120c] transition-colors">
              <FileText className="w-5 h-5 mr-4 text-[#94a3b8]" />
              {t('History')}
            </Link>
          </nav>
        </div>
        
        {/* Mobile-only navbar elements */}
        <div className="md:hidden lg:hidden block sm:block portrait:block mb-6 mt-4">
          {isAuthenticated ? (
            <div className="flex flex-col space-y-4">
              {/* Token Balance Display */}
              <div className="flex items-center px-3 py-2 bg-[#15120c] rounded-md border border-[#3a2a15]">
                <Coins className="w-4 h-4 text-[#10b981] mr-1.5" />
                <span className="text-xs text-[#e2e8f0] mr-1">{t('Credits')}</span>
                <span className="text-xs font-medium text-[#10b981]">
                  {isLoadingTokens ? '...' : tokenBalance.toLocaleString()}
                </span>
              </div>
              
              <Button 
                variant="text" 
                size="sm"
                icon={<Settings className="w-4 h-4" />}
                onClick={() => navigate('/settings')}
                className="px-2 justify-start"
              >
                <span>{t('Settings')}</span>
              </Button>
              
              {/* User Profile with Dropdown Menu */}
              <div className="relative group">
                <button 
                  id="user-profile-button"
                  className="flex items-center space-x-2 px-3 py-2 bg-[#15120c] rounded-md border border-[#3a2a15] w-full justify-between"
                  aria-label={t('UserProfile')}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-[#94a3b8] shadow-inner">
                      {user?.profile_picture_url ? (
                        <img 
                          src={user.profile_picture_url} 
                          alt={user.name || 'User'} 
                          className="w-full h-full object-cover"
                          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            // Fallback to initials if image fails to load
                            const target = e.currentTarget as HTMLImageElement;
                            target.style.display = 'none';
                            
                            // Find the sibling element and show it
                            const sibling = target.nextElementSibling as HTMLDivElement;
                            if (sibling) {
                              sibling.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-full h-full bg-gradient-to-br from-[#cbd5e1] to-[#94a3b8] flex items-center justify-center text-gray-900 text-xs font-bold ${user?.profile_picture_url ? 'hidden' : ''}`}
                      >
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    </div>
                    <span className="text-[#e2e8f0] text-sm truncate">
                      {user?.name}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#94a3b8]" />
                </button>
                
                {/* Submenu Items - Absolutely positioned to the right */}
                <div className="absolute left-full top-0 ml-1 hidden group-hover:block z-[100]">
                  <div className="flex flex-col space-y-2 p-2 bg-[#15120c] border border-[#3a2a15] rounded-md shadow-lg">
                    <Link 
                      className="submenu-item px-3 py-2 text-sm text-[#e2e8f0] bg-[#15120c] hover:bg-[#3a3a45] rounded-md flex items-center space-x-2 border border-[#3a2a15]"
                      to="/membership-plan/credits"
                    >
                      <DollarSign className="w-4 h-4 text-[#10b981]" />
                      <span>{t('AddCredits')}</span>
                    </Link>
                    
                    <Link 
                      className="submenu-item px-3 py-2 text-sm text-[#e2e8f0] bg-[#15120c] hover:bg-[#3a3a45] rounded-md flex items-center space-x-2 border border-[#3a2a15]"
                      to="/profile"
                    >
                      <User className="w-4 h-4" />
                      <span>{t('Profile')}</span>
                    </Link>
                    
                    <button 
                      className="submenu-item px-3 py-2 text-sm text-[#e2e8f0] bg-[#15120c] hover:bg-[#3a3a45] rounded-md flex items-center space-x-2 border border-[#3a2a15] w-full"
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('Logout')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-2 px-3">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => window.location.href = 'https://user.aisita.ai'}
                className="w-full"
              >
                {t('Login')}
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => window.location.href = 'https://user.aisita.ai/signup'}
                className="w-full"
              >
                {t('SignUp')}
              </Button>
            </div>
          )}
        </div>
        
        {/* Spacer to push the pricing plan to the bottom */}
        <div className="flex-grow"></div>
        
      </div>
      
      {/* Support Ticket Button */}
      <div className="px-5 py-4 border-t border-[#3a2a15] bg-[#0b0b0e]">
        <Link
          to="/submit-ticket"
          className="block px-3 py-3 bg-gradient-to-r from-[#1f2937] to-[#111827] rounded-lg border border-[#4a5568] hover:border-[#10b981] transition-all duration-200 w-full mb-4 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0">
              <MessageCircle className="w-4 h-4 text-[#10b981] mr-2 flex-shrink-0" />
              <span className="text-xs font-semibold text-[#e2e8f0] truncate">{t('SubmitTicket')}</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-[#10b981] flex-shrink-0">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </div>
        </Link>
        
        {/* Pricing Plan */}
        <PricingPlanCard />

        
        {/* Footer Links */}
        <div className="flex flex-col items-center space-y-2 mb-3">
          <a href={`/assets/documents/terms-conditions-refund-policy.pdf`} className="flex items-center justify-center text-xs text-gray-400 hover:text-gray-300 w-full">
            <FileText className="w-3 h-3 mr-1" />
            {t('TermsRefundPolicy')}
          </a>
          <a href={`privacy-policy`} className="flex items-center justify-center text-xs text-gray-400 hover:text-gray-300 w-full">
            <Shield className="w-3 h-3 mr-1" />
            {t('PrivacyPolicy')}
          </a>
          <a href={`contact`} className="flex items-center justify-center text-xs text-gray-400 hover:text-gray-300 w-full">
            <MessageCircle className="w-3 h-3 mr-1" />
            {t('ContactUs')}
          </a>
        </div>
        
        {/* Copyright */}
        <div className="text-center text-[10px] text-gray-500 mt-2">
          {new Date().getFullYear()} AISITA AI. {t('AllRightsReserved')}
        </div>
      </div>
      </aside>
    </>
  );
};

export default Sidebar;