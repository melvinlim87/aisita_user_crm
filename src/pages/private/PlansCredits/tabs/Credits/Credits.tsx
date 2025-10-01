import React, { useState, useEffect } from 'react';
import { CreditCard, History, PieChart, Loader2, X } from 'lucide-react';
import { getRequest, postRequest } from '@/services/apiRequest';
import { useTranslation } from 'react-i18next';

interface CreditOption {
    name: string;
    tokens: number;
    price: number;
    original_value: number;
    savings: string;
    price_id: string;
    description: string;
    popular?: boolean;
    key?: string; // For identifying the package type (micro, starter, etc.)
}

interface TokenPackagesResponse {
    success: boolean;
    packages: {
        [key: string]: CreditOption;
    };
}

interface PurchaseResponse {
    success: boolean;
    session_id: string;
    checkout_url: string;
}

interface UserCredits {
    balance: number;
    used: number;
    total: number;
}

interface CreditHistory {
    amount: string;
    created_at: string;
    currency: string;
    customer_email: string;
    id: number;
    price_id: string;
    session_id: string;
    status: string;
    tokens: number;
    type: string;
    updated_at: string;
    user_id: number;
    referrer_id: number;
    tokens_awarded: number;
}

interface UsageBreakdown {
    category: string;
    percentage: number;
    color: string;
}

const Credits: React.FC = () => {
    const { t } = useTranslation();
    const [selectedOption, setSelectedOption] = useState<number | null>(2); // Default to 'Standard' package
    const [creditOptions, setCreditOptions] = useState<CreditOption[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isPurchasing, setIsPurchasing] = useState<boolean>(false);
    const [purchaseError, setPurchaseError] = useState<string | null>(null);
    const [creditHistory, setCreditHistory] = useState<CreditHistory[]>([]);
    const [usageBreakdown, setUsageBreakdown] = useState<UsageBreakdown[]>([]);
    // User credit data - will be replaced with real data in the future
    const userCredits: UserCredits = {
        balance: 450,
        used: 2350,
        total: 2800
    };
    
    // Credit usage history - will be replaced with real data in the future
    // const creditHistory: CreditHistory[] = [
    //     { date: '2025-06-25', description: 'AI Chart Analysis', credits: -50 },
    //     { date: '2025-06-24', description: 'EA Generation', credits: -150 },
    //     { date: '2025-06-22', description: 'Credit Purchase', credits: 660 },
    //     { date: '2025-06-20', description: 'AI Chat Messages', credits: -80 },
    //     { date: '2025-06-18', description: 'AI Chart Analysis', credits: -30 },
    //     { date: '2025-06-15', description: 'Credit Purchase', credits: 1320 },
    // ];
    
    // Credit usage breakdown - will be replaced with real data in the future
    // const usageBreakdown: UsageBreakdown[] = [
    //     { category: 'AI Chart Analysis', percentage: 45, color: 'bg-blue-500' },
    //     { category: 'EA Generation', percentage: 30, color: 'bg-emerald-500' },
    //     { category: 'AI Chat Messages', percentage: 25, color: 'bg-purple-500' },
    // ];
    
    // Fetch token packages from the API
    useEffect(() => {
        // get user current package, current usage, and credit history
        
        // fetch user current usage
        const fetchUserCurrentUsage = async () => {
            try {
                const response = await getRequest<any>('/usage');
                if (response.success) {
                    setUsageBreakdown(response.data);
                }
            } catch (error) {
                console.error('Error fetching user current usage:', error);
            }
        };

        // fetch user credit history
        const fetchUserCreditHistory = async () => {
            try {
                const response = await getRequest<any>('/tokens/history');
                if (response.success) {
                    setCreditHistory(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching user credit history:', error);
            }
        };

        const fetchTokenPackages = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const response = await getRequest<TokenPackagesResponse>('/tokens/packages');
                
                if (response && response.success && response.packages) {
                    // Convert the packages object to an array and add the key as a property
                    const packagesArray = Object.entries(response.packages).map(([key, pkg]) => ({
                        ...pkg,
                        key
                    }));
                    
                    // Mark the 'standard' package as popular, or the middle one if no standard exists
                    const packagesWithPopular = packagesArray.map(pkg => ({
                        ...pkg,
                        popular: pkg.key === 'standard'
                    }));
                    
                    setCreditOptions(packagesWithPopular);
                } else {
                    throw new Error(t('FailedToFetchTokenPackages'));
                }
            } catch (err) {
                console.error('Error fetching token packages:', err);
                setError(t('FailedToLoadTokenPackages'));
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchUserCurrentUsage()
        fetchUserCreditHistory()
        fetchTokenPackages();
    }, []);
    
    const handlePurchase = async () => {
        if (selectedOption !== null && creditOptions[selectedOption]) {
            try {
                const selectedPackage = creditOptions[selectedOption];
                
                setIsPurchasing(true);
                setPurchaseError(null);
                
                // Call the token purchase API endpoint
                const response = await postRequest<PurchaseResponse>('/tokens/purchase', {
                    package_id: selectedPackage.key // Use the key (micro, starter, etc.) as package_id
                });
                
                // If successful, open the Stripe checkout URL in a new tab
                if (response && response.success && response.checkout_url) {
                    window.open(response.checkout_url, '_blank');
                } else {
                    throw new Error(t('InvalidResponseFromServer'));
                }
            } catch (err: any) {
                console.error('Error processing purchase:', err);
                setPurchaseError(err.response?.data?.message || err.message || t('FailedToProcessPurchase'));
            }
        }
    };
    
    const closePurchaseModal = () => {
        setIsPurchasing(false);
        setPurchaseError(null);
    };
    
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Purchase Processing Modal */}
            {isPurchasing && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-[#0b0b0e] border border-[#3a2a15] rounded-xl p-6 max-w-md w-full">
                        {!purchaseError ? (
                            <div className="flex flex-col items-center">
                                <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">{t('ProcessingYourPurchase')}</h3>
                                <p className="text-gray-400 text-center">{t('PleaseWaitPreparePaymentSession')}</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <div className="bg-red-500/20 p-3 rounded-full mb-4">
                                    <X className="h-8 w-8 text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{t('PaymentError')}</h3>
                                <p className="text-red-400 text-center mb-4">
                                    {purchaseError}
                                </p>
                                <button 
                                    onClick={closePurchaseModal}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                                >
                                    {t('Close')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Credit Purchase Options */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4">{t('PurchaseCreditsTitle')}</h2>
                {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
                </div>
            ) : error ? (
                <div className="bg-red-900/20 border border-red-700 text-red-300 p-4 rounded-lg mb-4">
                    <p>{error}</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {creditOptions.map((option, index) => (
                        <div 
                            key={option.price_id}
                            className={`relative p-4 border rounded-xl cursor-pointer transition-all ${
                                selectedOption === index 
                                    ? 'border-emerald-500 bg-emerald-500/10' 
                                    : 'border-[#3a2a15] bg-[#0b0b0e] hover:border-gray-500'
                            }`}
                            onClick={() => setSelectedOption(index)}
                        >
                            {option.popular && (
                                <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                    {t('Popular')}
                                </div>
                            )}
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-white mb-1">{option.tokens.toLocaleString()}</h3>
                                <p className="text-gray-400 text-sm">{t('CreditsLabel')}</p>
                                <div className="mt-2 text-lg font-medium text-emerald-400">${option.price}</div>
                                {option.savings && option.savings !== "0%" && (
                                    <div className="mt-1 text-xs text-emerald-300">{t('SavingsSuffix', { savings: option.savings })}</div>
                                )}
                                {option.description && (
                                    <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
                <div className="mt-6 flex justify-end">
                    <button
                        className={`px-6 py-2.5 rounded-md font-medium ${
                            selectedOption !== null
                                ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white hover:opacity-90'
                                : 'bg-[#3a3a45] text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={selectedOption === null}
                        onClick={handlePurchase}
                    >
                        <div className="flex items-center">
                            <CreditCard className="w-4 h-4 mr-2" />
                            {t('PurchaseCreditsButton')}
                        </div>
                    </button>
                </div>
            </div>
            
            {/* Usage and History Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Usage Breakdown */}
                <div className="bg-[#0b0b0e] border border-[#3a2a15] rounded-xl overflow-hidden shadow-lg p-6">
                    <div className="flex items-center mb-4">
                        <PieChart className="w-5 h-5 text-emerald-500 mr-2" />
                        <h2 className="text-lg font-bold text-white">{t('UsageBreakdownTitle')}</h2>
                    </div>
                    <div className="space-y-4">
                        {usageBreakdown.map((item, index) => (
                            <div key={index}>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-gray-400">{t(item.category)}</span>
                                    <span className="text-sm text-white font-medium">{item.percentage}%</span>
                                </div>
                                <div className="w-full bg-[#252530] rounded-full h-2">
                                    <div 
                                        className={`${item.color} h-2 rounded-full`} 
                                        style={{ width: `${item.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Credit History */}
                <div className="bg-[#0b0b0e] border border-[#3a2a15] rounded-xl overflow-hidden shadow-lg p-6">
                    <div className="flex items-center mb-4">
                        <History className="w-5 h-5 text-emerald-500 mr-2" />
                        <h2 className="text-lg font-bold text-white">{t('CreditHistory')}</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#3a2a15]">
                                    <th className="text-left py-2 text-xs font-medium text-gray-400">{t('Date')}</th>
                                    <th className="text-left py-2 text-xs font-medium text-gray-400">{t('Description')}</th>
                                    <th className="text-right py-2 text-xs font-medium text-gray-400">{t('CreditsLabel')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {creditHistory.map((item, index) => (
                                    <tr key={index} className="border-b border-[#3a2a15] last:border-b-0">
                                        <td className="py-3 text-sm text-gray-400">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 text-sm text-white">{item.referrer_id != null ? t('ReferralAward') : item.type}</td>
                                        <td className={`py-3 text-sm text-right font-medium ${
                                            item.tokens > 0 ? 'text-emerald-400' : 'text-gray-400'
                                        }`}>

                                            {item.referrer_id != null ? '+' + item.tokens_awarded : item.tokens > 0 ? '+' + item.tokens : ''}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Credits;
