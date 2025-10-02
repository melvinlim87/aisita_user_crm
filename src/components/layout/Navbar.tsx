import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Settings, HelpCircle, Mail, DollarSign, Users, Info, Coins, ChevronDown, Check } from 'lucide-react';
import { getRequest } from '@/services/apiRequest';
import { useAuth } from '../../contexts/AuthContext';
import { useTokenBalance } from '../../contexts/TokenBalanceContext';
import Button from '../common/Button';
// import { META_TEXT_GRADIENT } from '../../constants';
import { FRONTEND_URL } from '@/config';
import { useTranslation } from "react-i18next";

interface TokenBalance {
  addons_token: number;
  subscription_token: number;
  free_token: number;
  registration_token: number;
}

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { tokenBalance, setTokenBalance, isLoadingTokens, setIsLoadingTokens } = useTokenBalance();
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const { t, i18n } = useTranslation();
  
  // Sync current language from i18n/localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('lang');
    const initial = saved || i18n.language || 'en';
    setCurrentLang(initial);
  }, [i18n.language]);
  
  // Fetch token balance when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchTokenBalance();
    }
  }, [isAuthenticated]);
  
  const fetchTokenBalance = async () => {
    setIsLoadingTokens(true);
    try {
      const response = await getRequest<TokenBalance>('/tokens/balance');
      if (response) {
        // Calculate total tokens from all sources
        const total = (response.addons_token || 0) + 
                     (response.subscription_token || 0) + 
                     (response.free_token || 0) + 
                     (response.registration_token || 0);
        setTokenBalance(total);
      }
    } catch (error) {
      // Silently fail - we don't want to disrupt the UI for this
    } finally {
      setIsLoadingTokens(false);
    }
  };

  // Toggle language dropdown
  const toggleLangDropdown = () => setShowLangDropdown(!showLangDropdown);
  
  // Change language
  const changeLanguage = (lang: string) => {
    setCurrentLang(lang);
    setShowLangDropdown(false);
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.language-selector')) {
        setShowLangDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#15120c] border-b border-[#3a2a15]">
      <div className="flex items-center justify-between px-2 h-16 w-full max-w-[1400px] mx-auto sm:justify-between portrait:justify-center">
        <div className="flex items-center flex-shrink-0 sm:justify-start portrait:justify-center w-full sm:w-auto portrait:w-full">
          <Link to="/" className="flex items-center space-x-1 group">
            <img src="/assets/images/logo/decyphers-logo.png" alt="AISITA" className="w-full max-h-16 bg-transparent sm:mx-0 portrait:mx-auto" />
          </Link>
        </div>

        {!isAuthenticated && (
        <nav className="hidden md:flex items-center justify-center flex-1 space-x-8 px-8">
          <a href={`${FRONTEND_URL}/pricing`} className="flex items-center text-[#DAA520] hover:text-[#FFD700] transition-colors text-sm font-medium whitespace-nowrap">
            <DollarSign className="w-4 h-4 mr-1.5" />
            {t('Pricing')}
          </a>
          <a href={`${FRONTEND_URL}/partners`} className="flex items-center text-[#DAA520] hover:text-[#FFD700] transition-colors text-sm font-medium">
            <Users className="w-4 h-4 mr-1.5" />
            {t('Partners')}
          </a>
          <a href={`${FRONTEND_URL}/about`} className="flex items-center text-[#DAA520] hover:text-[#FFD700] transition-colors text-sm font-medium">
            <Info className="w-4 h-4 mr-1.5" />
            {t('AboutUs')}
          </a>
          <a href={`${FRONTEND_URL}/faq`} className="flex items-center text-[#DAA520] hover:text-[#FFD700] transition-colors text-sm font-medium">
            <HelpCircle className="w-4 h-4 mr-1.5" />
            {t('FAQ')}
          </a>
          <a href={`${FRONTEND_URL}/contact`} className="flex items-center text-[#DAA520] hover:text-[#FFD700] transition-colors text-sm font-medium">
            <Mail className="w-4 h-4 mr-1.5" />
            {t('ContactUs')}
          </a>
        </nav>
        )}
        {isAuthenticated && <div className="flex-1"></div>}
        
        <div className="hidden md:flex items-center lg:flex portrait:hidden">
          <div className="relative mr-4 language-selector">
            <button onClick={toggleLangDropdown} className="flex items-center text-[#DAA520] hover:text-[#FFD700] transition-colors text-sm font-medium px-3 py-1 rounded-md hover:bg-[#111111]">
              <span className="uppercase">{t(currentLang)}</span>
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            {showLangDropdown && (
              <div className="absolute right-0 mt-2 w-32 bg-[#0b0b0e] rounded-md shadow-lg border border-[#C0C0C0] overflow-hidden z-50">
                <button onClick={() => changeLanguage('en')} className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between ${currentLang === 'en' ? 'text-[#0b0b0e] bg-[#FFD700]' : 'text-[#DAA520] hover:bg-[#111111]'}`}>
                  <span>{t('en')}</span>
                  {currentLang === 'en' && <Check className="w-4 h-4" />}
                </button>
                <button onClick={() => changeLanguage('ch')} className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between ${currentLang === 'ch' ? 'text-[#0b0b0e] bg-[#FFD700]' : 'text-[#DAA520] hover:bg-[#111111]'}`}>
                  <span>{t('ch')}</span>
                  {currentLang === 'ch' && <Check className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>
          
          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center px-3 py-1 bg-[#0b0b0e] rounded-md border border-[#C0C0C0]">
                <Coins className="w-4 h-4 text-[#FFD700] mr-1.5" />
                <span className="text-xs text-[#DAA520] mr-1">{t('Available')}</span>
                <span className="text-xs font-medium text-[#FFD700]">{isLoadingTokens ? '...' : tokenBalance.toLocaleString()}</span>
              </div>
              
              <Button variant="text" size="sm" icon={<Settings className="w-4 h-4" />} onClick={() => navigate('/settings')} className="px-2">
                <span className="hidden sm:inline">{t('Settings')}</span>
              </Button>
              
              <div className="relative group">
                <button className="flex items-center space-x-1" aria-label="User menu">
                  <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-[#FFD700] shadow-inner">
                    {user?.profile_picture_url ? (
                      <img src={user.profile_picture_url} alt={user.name || 'User'} className="w-full h-full object-cover" onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                        const sibling = target.nextElementSibling as HTMLDivElement;
                        if (sibling) sibling.style.display = 'flex';
                      }} />
                    ) : null}
                    <div className={`w-full h-full bg-gradient-to-br from-[#FFD700] to-[#B87333] flex items-center justify-center text-gray-900 text-xs font-bold ${user?.profile_picture_url ? 'hidden' : ''}`}>
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>
                  <span className="text-[#DAA520] text-xs hidden md:block max-w-[80px] truncate">{user?.name}</span>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out">
                  <div className="bg-[#0b0b0e] rounded-md shadow-lg border border-[#C0C0C0] py-1 overflow-hidden">
                    <Link className="w-full text-left px-4 py-2 text-sm text-[#DAA520] hover:bg-[#111111] flex items-center space-x-2 border-b border-[#C0C0C0]" to="/membership-plan/credits">
                      <DollarSign className="w-4 h-4 text-[#FFD700]" />
                      <span>{t('AddCredits')}</span>
                    </Link>
                    <Link className="w-full text-left px-4 py-2 text-sm text-[#DAA520] hover:bg-[#111111] flex items-center space-x-2" to="/profile">
                      <User className="w-4 h-4" />
                      <span>{t('Profile')}</span>
                    </Link>
                    <button className="w-full text-left px-4 py-2 text-sm text-[#DAA520] hover:bg-[#111111] flex items-center space-x-2" onClick={() => { logout(); navigate('/'); }}>
                      <LogOut className="w-4 h-4" />
                      <span>{t('Logout')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              <Button variant="secondary" size="sm" onClick={() => window.location.href = 'https://user.aisita.ai'} className="px-2 py-1 text-xs">{t('Login')}</Button>
              <Button variant="primary" size="sm" onClick={() => window.location.href = 'https://user.aisita.ai/signup'} className="px-2 py-1 text-xs">{t('SignUp')}</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;