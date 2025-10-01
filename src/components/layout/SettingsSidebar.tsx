import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Users, Shield, HelpCircle, Settings, MessageCircle, ArrowRight, FileText, Clock, DollarSign, BarChart2, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';
import { FRONTEND_URL } from '@/config';
import { useTranslation } from 'react-i18next';

const SettingsSidebar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { isOpen, toggleSidebar } = useSidebar();
  const { t } = useTranslation();
  
  // Helper function to determine if a link is active
  const isActive = (path: string) => currentPath === path;
  
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
          fixed left-0 top-[57px] h-[calc(100vh-57px)] bg-[#0b0b0e] border-r border-[#3a2a15]
          transition-all duration-300 z-30
          ${isOpen ? 'w-64' : 'w-0 -translate-x-full opacity-0 pointer-events-none'} flex flex-col
          overflow-hidden
        `}
      >
      <div className="flex-1 flex flex-col px-4 overflow-y-auto">
        {/* Back to Dashboard Button */}
        <div className="mb-6 mt-4">
          <Link 
            to="/dashboard" 
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-[#e2e8f0] hover:bg-[#15120c] group"
          >
            <ChevronLeft className="w-5 h-5 mr-2 text-yellow-400 group-hover:translate-x-[-2px] transition-transform" />
            {t('Dashboard')}
          </Link>
        </div>

        <div className="h-px bg-[#2d3748] w-full my-4"></div>
        
        {/* Account Section */}
        <div className="mb-6">
          <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('Account')}</h3>
        
          <nav className="space-y-1">
          <Link 
              to="/profile" 
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/profile') 
                  ? 'bg-[#2d3748] text-white' 
                  : 'text-[#e2e8f0] hover:bg-[#15120c]'
              }`}
            >
              <User className={`w-5 h-5 mr-4 ${isActive('/profile') ? 'text-yellow-400' : 'text-[#94a3b8]'}`} />
              {t('Profile')}
            </Link>
            
            <Link 
              to="/referral" 
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/referral') 
                  ? 'bg-[#2d3748] text-white' 
                  : 'text-[#e2e8f0] hover:bg-[#15120c]'
              }`}
            >
              <Users className={`w-5 h-5 mr-4 ${isActive('/referral') ? 'text-yellow-400' : 'text-[#94a3b8]'}`} />
              {t('Referral')}
            </Link>

            <Link 
              to="/settings" 
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/settings') 
                  ? 'bg-[#2d3748] text-white' 
                  : 'text-[#e2e8f0] hover:bg-[#15120c]'
              }`}
            >
              <Settings className={`w-5 h-5 mr-4 ${isActive('/settings') ? 'text-yellow-400' : 'text-[#94a3b8]'}`} />
              {t('GeneralSettings')}
            </Link>
            
            {/* <Link 
              to="/settings/notifications" 
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/settings/notifications') 
                  ? 'bg-[#2d3748] text-white' 
                  : 'text-[#e2e8f0] hover:bg-[#15120c]'
              }`}
            >
              <Bell className={`w-5 h-5 mr-4 ${isActive('/settings/notifications') ? 'text-yellow-400' : 'text-[#94a3b8]'}`} />
              {t('Notifications')}
            </Link> */}
          </nav>
        </div>
        
        {/* Subscription Section */}
        <div className="mb-6">
          <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('Subscription')}</h3>
          
          <nav className="space-y-1">
            <Link 
              to="/usage" 
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/usage') 
                  ? 'bg-[#2d3748] text-white' 
                  : 'text-[#e2e8f0] hover:bg-[#15120c]'
              }`}
            >
              <BarChart2 className={`w-5 h-5 mr-4 ${isActive('/usage') ? 'text-yellow-400' : 'text-[#94a3b8]'}`} />
              {t('Usage')}
            </Link>
            
            <Link 
              to="/plan-management" 
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/plan-management') 
                  ? 'bg-[#2d3748] text-white' 
                  : 'text-[#e2e8f0] hover:bg-[#15120c]'
              }`}
            >
              <Package className={`w-5 h-5 mr-4 ${isActive('/plan-management') ? 'text-yellow-400' : 'text-[#94a3b8]'}`} />
              {t('PlanManagement')}
            </Link>
            
            <Link 
              to="/billing" 
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/billing') 
                  ? 'bg-[#2d3748] text-white' 
                  : 'text-[#e2e8f0] hover:bg-[#15120c]'
              }`}
            >
              <DollarSign className={`w-5 h-5 mr-4 ${isActive('/billing') ? 'text-yellow-400' : 'text-[#94a3b8]'}`} />
              {t('Billing')}
            </Link>
            
            <Link 
              to="/credit-history" 
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/credit-history') 
                  ? 'bg-[#2d3748] text-white' 
                  : 'text-[#e2e8f0] hover:bg-[#15120c]'
              }`}
            >
              <Clock className={`w-5 h-5 mr-4 ${isActive('/credit-history') ? 'text-yellow-400' : 'text-[#94a3b8]'}`} />
              {t('CreditHistory')}
            </Link>
          </nav>
        </div>
        
        {/* Help & Support Section */}
        <div className="mb-6">
          <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('HelpSupport')}</h3>
          <nav className="space-y-1">
            <Link 
              to="/submit-ticket" 
              className="flex items-center px-3 py-2 text-sm font-medium text-[#e2e8f0] rounded-md hover:bg-[#15120c] transition-colors"
            >
              <HelpCircle className="w-5 h-5 mr-4 text-[#94a3b8]" />
              {t('GetSupport')}
            </Link>
          </nav>
        </div>
        
        {/* Spacer to push the bottom content down */}
        <div className="flex-grow"></div>
      </div>
      
      {/* Bottom Section with links */}
      <div className="px-5 py-4 border-t border-[#3a2a15] bg-[#0b0b0e]">
        {/* Support Ticket Button */}
        <Link
          to="/submit-ticket"
          className="block px-3 py-3 bg-gradient-to-r from-[#1f2937] to-[#111827] rounded-lg border border-[#4a5568] hover:border-[#10b981] transition-all duration-200 w-full mb-4 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0">
              <MessageCircle className="w-4 h-4 text-[#10b981] mr-2 flex-shrink-0" />
              <span className="text-xs font-semibold text-[#e2e8f0] truncate">{t('SubmitTicket')}</span>
            </div>
            <ArrowRight className="w-3 h-3 text-[#10b981] flex-shrink-0" />
          </div>
        </Link>
        
        {/* Footer Links */}
        <div className="flex flex-col items-center space-y-2 mb-3">
          <a href={`${FRONTEND_URL}/assets/documents/terms-conditions-refund-policy.pdf`} className="flex items-center justify-center text-xs text-gray-400 hover:text-gray-300 w-full">
            <FileText className="w-3 h-3 mr-1" />
            {t('TermsRefundPolicy')}
          </a>
          <a href={`${FRONTEND_URL}/privacy-policy`} className="flex items-center justify-center text-xs text-gray-400 hover:text-gray-300 w-full">
            <Shield className="w-3 h-3 mr-1" />
            {t('PrivacyPolicy')}
          </a>
          <a href={`${FRONTEND_URL}/contact`} className="flex items-center justify-center text-xs text-gray-400 hover:text-gray-300 w-full">
            <MessageCircle className="w-3 h-3 mr-1" />
            {t('ContactUs')}
          </a>
        </div>
        
        {/* Copyright */}
        <div className="text-center text-[10px] text-gray-500 mt-2">
          {t('Copyright')} {new Date().getFullYear()} AISITA AI. {t('AllRightsReserved')}
        </div>
      </div>
    </aside>
    </>
  );
};

export default SettingsSidebar;
