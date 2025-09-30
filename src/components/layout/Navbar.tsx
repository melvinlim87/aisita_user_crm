import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart2, LogOut, User, Settings, HelpCircle, Building2, Mail, DollarSign, Users, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import { META_TEXT_GRADIENT } from '../../constants';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a20]/95 backdrop-blur-lg border-b border-[#3a3a45]">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center flex-shrink-0">
          <Link 
            to="/" 
            className="flex items-center space-x-2 group"
          >
            <BarChart2 
              className={`w-7 h-7 ${META_TEXT_GRADIENT}`} 
              strokeWidth={1.5} 
            />
            <span className={`text-xl font-bold tracking-tight ${META_TEXT_GRADIENT}`}>
              AISITA
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center justify-center flex-1 space-x-8 px-8">
            <Link 
              to="/pricing" 
              className="flex items-center text-[#e2e8f0] hover:text-white transition-colors text-sm font-medium whitespace-nowrap"
            >
              <DollarSign className="w-4 h-4 mr-1.5" />
              Pricing
            </Link>
            <Link 
              to="/partners" 
              className="flex items-center text-[#e2e8f0] hover:text-white transition-colors text-sm font-medium"
            >
              <Users className="w-4 h-4 mr-1.5" />
              Partners
            </Link>
            <Link 
              to="/about" 
              className="flex items-center text-[#e2e8f0] hover:text-white transition-colors text-sm font-medium"
            >
              <Info className="w-4 h-4 mr-1.5" />
              About Us
            </Link>
            <a 
              href="/#faq"
              className="flex items-center text-[#e2e8f0] hover:text-white transition-colors text-sm font-medium"
            >
              <HelpCircle className="w-4 h-4 mr-1.5" />
              FAQ
            </a>
            <a 
              href="/#contact"
              className="flex items-center text-[#e2e8f0] hover:text-white transition-colors text-sm font-medium"
            >
              <Mail className="w-4 h-4 mr-1.5" />
              Contact Us
            </a>
          </nav>
          
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Button 
                  variant="text" 
                  size="sm"
                  icon={<Settings className="w-4 h-4" />}
                  onClick={() => navigate('/settings')}
                >
                  Settings
                </Button>
                
                <div className="relative group">
                  <button 
                    className="flex items-center space-x-2"
                    aria-label="User menu"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#94a3b8] shadow-inner">
                      {user?.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#cbd5e1] to-[#94a3b8] flex items-center justify-center text-gray-900 text-xs font-bold">
                          {user?.name.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <span className="text-[#e2e8f0] text-sm hidden md:block">
                      {user?.name}
                    </span>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out">
                    <div className="bg-[#25252d] rounded-md shadow-lg border border-[#3a3a45] py-1 overflow-hidden">
                      <button 
                        className="w-full text-left px-4 py-2 text-sm text-[#e2e8f0] hover:bg-[#3a3a45] flex items-center space-x-2"
                        onClick={() => navigate('/profile')}
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </button>
                      <button 
                        className="w-full text-left px-4 py-2 text-sm text-[#e2e8f0] hover:bg-[#3a3a45] flex items-center space-x-2"
                        onClick={() => {
                          logout();
                          navigate('/login');
                        }}
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => navigate('/signup')}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
      </div>
    </header>
  );
};

export default Navbar;