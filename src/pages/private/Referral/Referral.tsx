import React, { useState, useEffect } from 'react';
import './style.css';
import { Loader2, ArrowUpDown } from 'lucide-react';
import { getRequest } from '@/services/apiRequest';
import { useTranslation } from 'react-i18next';

interface UserReferral {
    referral_code: string | null;
    shareable_link: string | null;
}

interface UserReferralList {
    converted_at: string | null;
    created_at: string;
    id: number;
    is_converted: boolean;
    referral_code: string;
    referred: {
        id: number;
        name: string;
        email: string;
    };
    referred_email: string;
    referred_id: number;
    referrer_id: number;
    tokens_awarded: number;
    updated_at: string;
    user_id: number | null;
}

interface UserReferralStatistics {
    converted_referrals: number;
    pending_referrals: number;
    total_referrals: number;
    total_tokens_earned: number;
}

interface ApiResponse {
    success: boolean;
    message: string;
    data: any;
}

const Referral: React.FC = () => {
    const { t } = useTranslation();
    const [referral, setReferral] = useState<UserReferral | null>(null);
    const [referralStatistics, setReferralStatistics] = useState<UserReferralStatistics | null>(null);
    const [referralList, setReferralList] = useState<UserReferralList[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState<boolean>(false);

    useEffect(() => {
        const fetchUserReferralCode = async () => {
            try {
                setLoading(true);
                const response = await getRequest<ApiResponse>('/referral/code');
                if (response.success) {
                    setReferral(response.data);
                } else {
                    setError(t('FailedToLoadReferral'));
                }
            } catch (err) {
                setError(t('ErrorFetchingProfile'));
                console.error('Profile fetch error:', err);
            } finally {
                setLoading(false);
            }
        }
        const fetchUserReferralList = async () => {
            try {
                setLoading(true);
                const response = await getRequest<ApiResponse>('/referral/list');
                const response2 = await getRequest<ApiResponse>('/referral/status');
                console.log(response2)
                if (response.success) {
                    setReferralStatistics(response.data.stats);
                    setReferralList(response.data.referrals);
                } else {
                    setError(t('FailedToLoadReferral'));
                }
            } catch (err) {
                setError(t('ErrorFetchingProfile'));
                console.error('Profile fetch error:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchUserReferralCode();
        fetchUserReferralList()
    }, [t]);

    const handleCopy = async () => {
        if (!referral?.referral_code) return;
        const link = `${window.location.origin}/signup?referral_code=${referral.referral_code}`;
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
      
            {/* Referral Header Section */}
            <h1 className="text-3xl font-bold text-white mb-8">{t('Referral')}</h1>

            {/* Statistics Overview */}
            {referralStatistics && (
              <div className="mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#18181b] rounded-lg p-4 flex flex-col items-center border border-[#23232a]">
                    <span className="text-sm text-gray-400 mb-1">{t('ConvertedReferrals')}</span>
                    <span className="text-lg font-bold text-green-400">{referralStatistics.converted_referrals}</span>
                  </div>
                  <div className="bg-[#18181b] rounded-lg p-4 flex flex-col items-center border border-[#23232a]">
                    <span className="text-sm text-gray-400 mb-1">{t('PendingReferrals')}</span>
                    <span className="text-lg font-bold text-blue-400">{referralStatistics.pending_referrals}</span>
                  </div>
                  <div className="bg-[#18181b] rounded-lg p-4 flex flex-col items-center border border-[#23232a]">
                    <span className="text-sm text-gray-400 mb-1">{t('TotalReferrals')}</span>
                    <span className="text-lg font-bold text-white">{referralStatistics.total_referrals}</span>
                  </div>
                  <div className="bg-[#18181b] rounded-lg p-4 flex flex-col items-center border border-[#23232a]">
                    <span className="text-sm text-gray-400 mb-1">{t('TotalTokensEarned')}</span>
                    <span className="text-lg font-bold text-yellow-400">{referralStatistics.total_tokens_earned}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-[#1a1a20] rounded-lg shadow-lg p-8 mb-8 border border-[#2d3748]">
                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-center py-4">{error}</div>
                ) : referral ? (
                    <div className="flex-col md:flex-row items-center md:items-start gap-6">
                        {/* User Info */}
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <h2 className="text-xl font-bold text-white">{t('MyReferralCode')}</h2>
                            </div>
                        </div>

                        {/* Show input of referral code, and button to copy or share */}
                        <div className="flex items-center gap-2 grid grid-cols-4">
                            <div className="flex col-span-3">
                                <input
                                    type="text"
                                    value={`${window.location.origin}/signup?referral_code=${referral.referral_code}`}
                                    readOnly
                                    disabled
                                    className="bg-[#191a2a] px-4 py-2 rounded-lg text-blue-300 border border-[#23232a] tracking-wider shadow-sm select-all transition-all w-full"
                                />
                            </div>
                            <div className="flex col-span-1 gap-2">
                                <button
                                    onClick={handleCopy}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-sm transition-colors items-center w-full justify-center overflow-hidden text-ellipsis line-clamp-1 whitespace-nowrap max-w-full"
                                >
                                    {copied ? t('Copied') : t('CopyReferralLink')}
                                </button>
                                <button
                                    onClick={() => console.log('pending platform to share')}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md text-sm transition-colors items-center w-full justify-center overflow-hidden text-ellipsis line-clamp-1 whitespace-nowrap max-w-full"
                                >
                                    {t('ShareReferralLink')}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
            
            {/* User Referral List */}
            <div className="bg-[#1a1a20] rounded-lg shadow-lg p-8 mb-8 border border-[#2d3748]">
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white">{t('MyReferrals')}</h2>
                    </div>
                    {/* Referral List Table */}
                    {referralList.length > 0 ? (

                        <div className="bg-[#1a1a20] border border-[#3a3a45] rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-[#25252d]">
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                <button className="flex items-center focus:outline-none">
                                                    {t('User')}
                                                    <ArrowUpDown className="ml-1 h-3 w-3" />
                                                </button>
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                <button className="flex items-center focus:outline-none">
                                                    {t('Email')}
                                                    <ArrowUpDown className="ml-1 h-3 w-3" />
                                                </button>
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                <button className="flex items-center focus:outline-none">
                                                    {t('Status')}
                                                    <ArrowUpDown className="ml-1 h-3 w-3" />
                                                </button>
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                <button className="flex items-center focus:outline-none">
                                                    {t('TokensAwarded')}
                                                    <ArrowUpDown className="ml-1 h-3 w-3" />
                                                </button>
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                <button className="flex items-center focus:outline-none">
                                                    {t('ReferredAt')}
                                                    <ArrowUpDown className="ml-1 h-3 w-3" />
                                                </button>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#3a3a45]">
                                        {referralList.map((ref) => (
                                            <tr key={ref.id} className="hover:bg-[#25252d]">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-white">{ref.referred?.name || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-white">{ref.referred?.email || ref.referred_email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-white">
                                                        {ref.is_converted ? (
                                                            <span className="text-green-400 font-medium">{t('Converted')}</span>
                                                        ) : (
                                                            <span className="text-blue-400 font-medium">{t('Pending')}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-white">{ref.tokens_awarded}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-white">{new Date(ref.created_at).toLocaleDateString()}</div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                    <div className="text-center text-gray-400 py-6">{t('NoReferralsYet')}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Referral;
