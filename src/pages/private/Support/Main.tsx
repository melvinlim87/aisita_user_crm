import React, { useState } from 'react';

// Import tab components
import SubmitTicket from './tabs/SubmitTicket';
import MyTickets from './tabs/MyTickets';
import { useTranslation } from 'react-i18next';

type TabType = 'submit-ticket' | 'my-tickets';

const Main: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('submit-ticket');
    const { t } = useTranslation();
        
    // Function to change tabs
    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
    };
    
    // All subscription-related content is now in the Plans tab component

    return (
        <div className="container mx-auto p-6">
            <div className="mb-8">
                {/* Navigation Tabs */}
                <div className="flex border-b border-[#3a3a45]">
                    <button 
                        className={`px-6 py-4 font-medium transition-colors duration-200 ${activeTab === 'submit-ticket' ? 'text-white border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => handleTabChange('submit-ticket')}
                    >
                        {t('SubmitTicket')}
                    </button>
                    <button 
                        className={`px-6 py-4 font-medium transition-colors duration-200 ${activeTab === 'my-tickets' ? 'text-white border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => handleTabChange('my-tickets')}
                    >
                        {t("MyTickets")}
                    </button>
                </div>
            </div>
            
            {/* Render the active tab */}
            {activeTab === 'submit-ticket' && <SubmitTicket />}
            {activeTab === 'my-tickets' && <MyTickets />}
        </div>
    );
};

export default Main;