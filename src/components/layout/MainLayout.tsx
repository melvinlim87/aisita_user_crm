import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';

const MainLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-[#2b3048] text-[#e2e8f0]">
      <Navbar />
      
      <div className={`${isAuthenticated ? 'flex flex-1 pt-16' : 'pt-16'}`}>
        {isAuthenticated && <Sidebar />}
        
        <main 
          className={`flex-1 ${isAuthenticated ? 'md:ml-64' : ''} transition-all duration-300`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;