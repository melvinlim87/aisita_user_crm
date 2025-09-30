import React, { useState, useEffect } from 'react';
import { Loader2, Download, ArrowUpDown, Info, X } from 'lucide-react';
import { getRequest, postRequest } from '@/services/apiRequest';
import { useTranslation } from 'react-i18next';

interface CreditTransaction {
    id: number;
    user_id: number;
    session_id: string;
    price_id: string;
    amount: string;
    tokens: number;
    referrer_id: number;
    tokens_awarded: number;
    status: string;
    customer_email: string;
    currency: string;
    type: string;
    created_at: string;
    updated_at: string;
}

interface PaginatedResponse<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

const CreditHistory: React.FC = () => {
    const { t } = useTranslation();
    const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, _setError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState<boolean>(false);
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const userData = localStorage.getItem('user');
    const user = JSON.parse(userData || '{}');
    
    // Check for session_id in URL for purchase verification
    useEffect(() => {
        const verifyCheckout = async () => {
            // Get URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const sessionId = urlParams.get('session_id');
            
            if (sessionId) {
                console.log('Found session_id in URL:', sessionId);
                setIsVerifying(true); // Show verification modal
                setVerificationError(null);
                
                try {
                    // Send the session_id to verify-purchase endpoint
                    const response = await postRequest<{ success: boolean; message: string }>(
                        '/tokens/verify-purchase',
                        { session_id: sessionId }
                    );
                    
                    console.log('Purchase verification response:', response);
                    
                    // Remove the session_id from URL to prevent multiple verifications
                    const newUrl = window.location.pathname;
                    window.history.replaceState({}, document.title, newUrl);
                    
                    // Close the modal after verification
                    setTimeout(() => {
                        setIsVerifying(false);
                        // Refresh the page to show updated token balance
                        window.location.reload();
                    }, 1500);
                } catch (err: any) {
                    console.error('Error verifying purchase:', err);
                    setVerificationError(err.response?.data?.message || t('FailedVerifyTokenPurchase'));
                }
            }
        };
        
        verifyCheckout();
        
        // Load transaction data
        loadTransactionHistory();
    }, [t]);
    
    const loadTransactionHistory = async () => {
        setIsLoading(true);
        
        try {
            // Fetch transaction history from API
            const response = await getRequest<{ success: boolean; data: PaginatedResponse<CreditTransaction> }>('/tokens/history');
            console.log('Transaction history response:', response)
            if (response && response.success && response.data) {
                console.log('Transaction history:', response.data);
                
                // Filter out transactions with type "usage-deductions"
                const filteredTransactions = response.data.data.filter(
                    transaction => transaction.price_id !== 'usage-deduction'
                );
                
                setTransactions(filteredTransactions);
            } else {
                throw new Error(t('FailedToLoadTransactionHistory'));
            }
        } catch (err: any) {
            console.error('Error loading transaction history:', err);
            _setError(err.response?.data?.message || t('FailedToLoadTransactionHistoryTryAgain'));
        } finally {
            setIsLoading(false);
        }
    };
    
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
    };
    
    const getTransactionStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'text-emerald-500';
            case 'pending':
                return 'text-yellow-500';
            case 'failed':
                return 'text-red-500';
            default:
                return 'text-gray-500';
        }
    };
    
    const getTransactionTypeColor = (type: string, tokens: number) => {
        if (type === 'purchase' || type === 'subscription') {
            return 'text-emerald-500';
        } else if (type === 'usage') {
            return 'text-blue-400';
        } else {
            return 'text-gray-500';
        }
    };
    
    const getTransactionDescription = (transaction: CreditTransaction) => {
        switch (transaction.type) {
            case 'purchase':
                if (transaction.referrer_id !== null && transaction.referrer_id == user.id) {
                    return t('ReferralTokenAward', { tokens: transaction.tokens_awarded });
                }
                return t('TokenPurchaseX', { tokens: transaction.tokens });
            case 'subscription':
                if (transaction.referrer_id !== null && transaction.referrer_id == user.id) {
                    return t('ReferralTokenAward', { tokens: transaction.tokens_awarded });
                }
                return t('SubscriptionCreditX', { tokens: transaction.tokens });
            case 'usage':
                return t('TokenUsageX', { tokens: transaction.tokens });
            default:
                return t('GenericTypeTokens', { type: transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1), tokens: transaction.tokens });
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{t('CreditHistory')}</h1>
                    <p className="text-gray-400">{t('CreditHistoryDesc')}</p>
                </div>
                {/* <button 
                    className="flex items-center px-4 py-2 bg-[#2d3748] hover:bg-[#3d4a5f] text-white rounded-md transition-colors"
                    onClick={() => alert('Export functionality would be implemented here')}
                >
                    <Download className="w-4 h-4 mr-2" />
                    {t('Export')}
                </button> */}
            </div>
            
            {/* Payment Verification Modal */}
            {isVerifying && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-[#1a1a20] border border-[#3a3a45] rounded-xl p-6 max-w-md w-full">
                        {!verificationError ? (
                            <div className="flex flex-col items-center">
                                <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">{t('VerifyingYourPurchase')}</h3>
                                <p className="text-gray-400 text-center">{t('PleaseWaitVerifyPurchase')}</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <div className="bg-red-500/20 p-3 rounded-full mb-4">
                                    <X className="h-8 w-8 text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{t('PurchaseError')}</h3>
                                <p className="text-red-400 text-center mb-4">
                                    {verificationError}
                                </p>
                                <button 
                                    onClick={() => setIsVerifying(false)}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                                >
                                    {t('Close')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                    <span className="ml-2 text-gray-400">{t('LoadingTransactionHistory')}</span>
                </div>
            ) : error ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                    <p className="text-red-400">{error}</p>
                    <button 
                        onClick={() => loadTransactionHistory()}
                        className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                    >
                        {t('Retry')}
                    </button>
                </div>
            ) : transactions.length === 0 ? (
                <div className="bg-[#1a1a20] border border-[#3a3a45] rounded-lg p-8 text-center">
                    <div className="bg-blue-500/20 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Info className="h-8 w-8 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{t('NoTransactionHistory')}</h3>
                    <p className="text-gray-400 max-w-md mx-auto">{t('NoTransactionHistoryDesc')}</p>
                </div>
            ) : (
                <div className="bg-[#1a1a20] border border-[#3a3a45] rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-[#25252d]">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        <button className="flex items-center focus:outline-none">
                                            {t('Description')}
                                            <ArrowUpDown className="ml-1 h-3 w-3" />
                                        </button>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        <button className="flex items-center focus:outline-none">
                                            {t('Amount')}
                                            <ArrowUpDown className="ml-1 h-3 w-3" />
                                        </button>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        <button className="flex items-center focus:outline-none">
                                            {t('Date')}
                                            <ArrowUpDown className="ml-1 h-3 w-3" />
                                        </button>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        {t('Status')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#3a3a45]">
                                {transactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-[#25252d]">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-white">{getTransactionDescription(transaction)}</div>
                                            <div className="text-xs text-gray-400">{t('IDLabel')}: {transaction.session_id}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`text-sm font-medium ${getTransactionTypeColor(transaction.type, transaction.tokens)}`}>
                                                {transaction.type !== 'usage' ? '+' : ''}{transaction.referrer_id !== null && transaction.referrer_id == user.id ? transaction.tokens_awarded : transaction.tokens} {t('TokensLabel')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-white">{formatDate(transaction.created_at)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTransactionStatusColor(transaction.status)} bg-opacity-10`}>
                                                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreditHistory;
