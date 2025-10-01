import React, { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

// Import tab components
import PlansTab from './tabs/Plans';
import CreditsTab from './tabs/Credits';
import { useTranslation } from 'react-i18next';

type TabType = 'plans' | 'credits';

const Main: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { tab } = useParams<{ tab?: string }>(); 
    const { t } = useTranslation();
    
    // Default to 'plans' if no tab is specified
    const activeTab: TabType = (tab === 'credits' ? 'credits' : 'plans');
    
    // Function to change tabs via navigation
    const handleTabChange = (newTab: TabType) => {
        navigate(`/membership-plan/${newTab}`);
    };
    
    // Handle the root path by redirecting to the plans tab
    useEffect(() => {
        if (location.pathname === '/membership-plan') {
            navigate('/membership-plan/plans', { replace: true });
        }
    }, [location.pathname, navigate]);
    
    // All subscription-related content is now in the Plans tab component

    return (
        <div className="container mx-auto p-6">
            <div className="mb-8">
                {/* Navigation Tabs */}
                <div className="flex border-b border-[#3a2a15]">
                    <button 
                        className={`px-6 py-4 font-medium transition-colors duration-200 ${activeTab === 'plans' ? 'text-white border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => handleTabChange('plans')}
                    >
                        {t('Plans')}
                    </button>
                    <button 
                        className={`px-6 py-4 font-medium transition-colors duration-200 ${activeTab === 'credits' ? 'text-white border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => handleTabChange('credits')}
                    >
                        {t('Credits')}
                    </button>
                </div>
            </div>
            
            {/* Render the active tab */}
            {activeTab === 'plans' && <PlansTab />}
            {activeTab === 'credits' && <CreditsTab />}
        </div>
    );
};

export default Main;