import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import SettingsSidebar from './SettingsSidebar';
import Footer from '../common/Footer';
import { useAuth } from '../../contexts/AuthContext';
import { SidebarProvider, useSidebar } from '../../contexts/SidebarContext';
import { TokenBalanceProvider } from '../../contexts/TokenBalanceContext';
import FloatingChatButton from '@/components/layout/FloatingChatButton';

// Inner component that uses the sidebar context
const MainLayoutContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { isOpen } = useSidebar();
  const location = useLocation();
  const path = location.pathname;
  
  // Determine which pages should use the specialized sidebar
  const useSettingsSidebar = path === '/profile' || path === '/settings' || path === '/referral' || 
                             path.startsWith('/settings/') || 
                             path === '/plan-management' ||
                             path.startsWith('/plan-management/') ||
                             path === '/billing' ||
                             path.startsWith('/billing/') ||
                             path === '/usage' ||
                             path.startsWith('/usage/') ||
                             path === '/credit-history' ||
                             path.startsWith('/credit-history/');
  
  // Determine if any sidebar should be shown
  const showSidebar = isAuthenticated;
  
  return (
    <div className="min-h-screen bg-[#2b3048] text-[#e2e8f0] flex flex-col">
      <Navbar />
      
      <div className={`${showSidebar ? 'flex flex-1 pt-16' : 'pt-16'} flex-grow h-[calc(100vh-57px)]`}>
        {showSidebar && (
          useSettingsSidebar ? <SettingsSidebar /> : <Sidebar />
        )}
        
        <main 
          className={`flex-1 ${showSidebar && isOpen ? 'md:ml-[16rem]' : ''} transition-all duration-300`}
        >
          <Outlet />
        </main>
      </div>
      <FloatingChatButton />
      {!isAuthenticated && <Footer />}
    </div>
  );
};

// Wrapper component that provides the sidebar context
const MainLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <TokenBalanceProvider>
        <MainLayoutContent />
      </TokenBalanceProvider>
    </SidebarProvider>
  );
};

export default MainLayout;