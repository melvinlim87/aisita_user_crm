import React, { useState, useEffect } from 'react';
import { User, Loader2 } from 'lucide-react';
import { getRequest } from '@/services/apiRequest';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface SubscriptionResponse {
  success: boolean;
  subscription: {
    next_billing_date: string;
    plan: {
      tokens_per_cycle: number;
    }
  }
}

interface TokenUsageResponse {
  success: boolean;
  stats: {
    total_tokens_used: string;
  };
}

interface AddonTokenResponse {
  success: boolean,
  addons_token: number,
  free_token: number,
  registration_token: number,
  subscription_token: number
}

interface ReferralResponse {
  success: boolean;
  message: string;
  data: any;
}

interface UserReferralStatistics {
  converted_referrals: number;
  pending_referrals: number;
  total_referrals: number;
  total_tokens_earned: number;
}

interface TokenHistoryResponse {
  success: boolean;
  data: {
    data: Array<{
      id: number;
      user_id: number;
      tokens: number;
      type: string;
      created_at: string;
      updated_at: string;
    }>;
  };
}

const Usage: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userSubscriptionDetails, setUserSubscriptionDetails] = useState({
    next_billing_date: '',
    daysUntilRefresh: 0
  });
  const [userSubscriptionTokens, setUserSubscriptionTokens] = useState({
    total: 0,
    used: 0,
    remaining: 0,
    subscriptionTokens: 0,
    subscriptionTokensUsed: 0,
    subscriptionTokensRemaining: 0,
    addonTokens: 0,
    addonTokensUsed: 0,
    addonTokensRemaining: 0,
    freeTokens: 0,
    freeTokensUsed: 0,
    freeTokensRemaining: 0,
    registrationTokens: 0,
    registrationTokensUsed: 0,
    registrationTokensRemaining: 0,
    referralTokens: 0,
    referralTokensUsed: 0,
    referralTokensRemaining: 0,
  });
  
  const [lastUsageDate, setLastUsageDate] = useState<string>('');

  useEffect(() => {
    setLoading(true);

    const fetchUserTokenData = async () => {
      // update total tokens, shows all awarded tokens
      try {
        const response = await Promise.all([
          getRequest<SubscriptionResponse>('/subscriptions/user'),
          getRequest<TokenUsageResponse>('/tokens/usage'),
          getRequest<AddonTokenResponse>('/tokens/balance'),
          getRequest<TokenHistoryResponse>('/tokens/history'),
          getRequest<ReferralResponse>('/referral/list')
        ]);

        console.log("response", response);
        
        // Get the total tokens from subscription plan and actual remaining balance
        const planSubscriptionTokens = response[0].subscription?.plan.tokens_per_cycle ?? 0;
        const remainingSubscriptionTokens = response[2].subscription_token ?? 0;
        
        // Get total tokens used from the stats
        let totalTokensUsed = 0;
        if (response[1].stats && response[1].stats.total_tokens_used) {
          totalTokensUsed = parseFloat(response[1].stats.total_tokens_used);
        }

        let userAddonTokens = 0;
        if (response[2].addons_token) {
          userAddonTokens = response[2].addons_token;
        }

        let userFreeTokens = 0;
        if (response[2].free_token) {
          userFreeTokens = response[2].free_token;
        }

        let userRegistrationTokens = 0;
        if (response[2].registration_token) {
          userRegistrationTokens = response[2].registration_token;
        }
            
        let userReferralTokens = 0;
        if (response[4].data.stats.total_tokens_earned) {
          userReferralTokens = response[4].data.stats.total_tokens_earned;
        }

        let totalTokens = remainingSubscriptionTokens + userAddonTokens + userFreeTokens + userRegistrationTokens + userReferralTokens; 
        // Get the last usage date from history
        if (response[3].success && response[3].data.data.length > 0) {
          // Find the first usage entry (tokens < 0)
          const usageEntry = response[3].data.data.find(entry => entry.tokens < 0);
          if (usageEntry) {
            setLastUsageDate(format(new Date(usageEntry.created_at), 'MMM d, yyyy'));
          }
        }
        
        // Use actual remaining balances from API (these are already calculated server-side)
        let subscriptionTokensUsed = planSubscriptionTokens - remainingSubscriptionTokens;
        let subscriptionTokensRemaining = remainingSubscriptionTokens;
        let addonTokensUsed = 0; // Addon tokens are not consumed yet based on API response
        let addonTokensRemaining = userAddonTokens;
        let freeTokensUsed = 0; // Free tokens are not consumed yet based on API response
        let freeTokensRemaining = userFreeTokens;
        let registrationTokensUsed = 0; // Registration tokens are not consumed yet
        let registrationTokensRemaining = userRegistrationTokens;
        let referralTokensUsed = 0; // Referral tokens are not consumed yet
        let referralTokensRemaining = userReferralTokens;
        
        // Calculate total remaining tokens
        let totalRemainingTokens = subscriptionTokensRemaining + addonTokensRemaining + freeTokensRemaining + registrationTokensRemaining + referralTokensRemaining;
        
        if (response[0].subscription) {
          setUserSubscriptionDetails({
            next_billing_date: format(new Date(response[0].subscription.next_billing_date), 'MMM d, yyyy'),
            daysUntilRefresh: Math.ceil((new Date(response[0].subscription.next_billing_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          });
        }
        
        setUserSubscriptionTokens({
          total: totalTokens,
          used: totalTokensUsed,
          remaining: totalRemainingTokens,
          subscriptionTokens: planSubscriptionTokens,
          subscriptionTokensUsed: subscriptionTokensUsed,
          subscriptionTokensRemaining: subscriptionTokensRemaining,
          addonTokens: userAddonTokens,
          addonTokensUsed: addonTokensUsed,
          addonTokensRemaining: addonTokensRemaining,
          freeTokens: userFreeTokens,
          freeTokensUsed: freeTokensUsed,
          freeTokensRemaining: freeTokensRemaining,
          registrationTokens: userRegistrationTokens,
          registrationTokensUsed: registrationTokensUsed,
          registrationTokensRemaining: registrationTokensRemaining,
          referralTokens: userReferralTokens,
          referralTokensUsed: referralTokensUsed,
          referralTokensRemaining: referralTokensRemaining
        });

      } catch (error) {
        setError(t('FailedToFetchUsageData'));
      } finally {
        setLoading(false);
      }
    }

    fetchUserTokenData();
  }, [t]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">{t('Usage')}</h1>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : (
        <>
          {/* Usage Summary Section */}
          <div className="bg-[#1a1a20] rounded-lg shadow-lg p-8 mb-8 border border-[#2d3748]">
            <h2 className="text-xl font-bold text-white mb-4">{t('DecypherUsageSummary')}</h2>
            <p className="text-gray-400 mb-2">
              {t('NextPlanRefreshInDays', { days: userSubscriptionDetails.daysUntilRefresh, date: userSubscriptionDetails.next_billing_date })}
            </p>
          </div>
          
          {/* User Prompt Credits Section */}
          <div className="bg-[#1a1a20] rounded-lg shadow-lg p-8 mb-8 border border-[#2d3748]">
            <h3 className="text-xl font-bold text-white mb-4">{t('UserPromptCredits')}</h3>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">{userSubscriptionTokens.subscriptionTokensUsed} / {userSubscriptionTokens.subscriptionTokens} {t('Used')}</span>
              <span className="text-gray-400">{userSubscriptionTokens.subscriptionTokensRemaining} {t('Left')}</span>
            </div>
            <p className="text-gray-500 text-sm mb-3">{t('SubscriptionPromptCredits')}</p>
            <div className="w-full bg-[#2d3748] rounded-full h-2.5 mb-2">
              <div 
                style={{ width: `${(userSubscriptionTokens.subscriptionTokens > 0 ? Math.min(100, (userSubscriptionTokens.subscriptionTokensUsed / userSubscriptionTokens.subscriptionTokens) * 100) : 0)}%` }} 
                className="bg-green-500 h-2.5 rounded-full"
              ></div>
            </div>
            <div className="flex justify-end">
              <span className="text-gray-500 text-sm">{t('UsageSince', { date: lastUsageDate || t('NA') })}</span>
            </div>
          </div>
          
          {/* Add-on Prompt Credits Section */}
          <div className="bg-[#1a1a20] rounded-lg shadow-lg p-8 mb-8 border border-[#2d3748]">
            <h3 className="text-xl font-bold text-white mb-4">{t('AddonPromptCredits')}</h3>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">{userSubscriptionTokens.addonTokensUsed} / {userSubscriptionTokens.addonTokens} {t('Used')}</span>
              <span className="text-gray-400">{userSubscriptionTokens.addonTokensRemaining} {t('Left')}</span>
            </div>
            <p className="text-gray-500 text-sm mb-3">{t('AdditionalPromptCredits')}</p>
            <div className="w-full bg-[#2d3748] rounded-full h-2.5 mb-2">
              <div 
                style={{ width: `${userSubscriptionTokens.addonTokens > 0 ? Math.min(100, (userSubscriptionTokens.addonTokensUsed / userSubscriptionTokens.addonTokens) * 100) : 0}%` }} 
                className="bg-green-500 h-2.5 rounded-full"
              ></div>
            </div>
            <div className="flex justify-end">
              <span className="text-gray-500 text-sm">{t('UsageSince', { date: lastUsageDate || t('NA') })}</span>
            </div>
          </div>

          {/* Free Tokens Section */}
          <div className="bg-[#1a1a20] rounded-lg shadow-lg p-8 mb-8 border border-[#2d3748]">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              {t('FreeTokens')}
              <span className="ml-2 px-2 py-1 bg-blue-600 text-xs font-medium rounded-full">{t('BONUS')}</span>
            </h3>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">{userSubscriptionTokens.freeTokensUsed} / {userSubscriptionTokens.freeTokens} {t('Used')}</span>
              <span className="text-gray-400">{userSubscriptionTokens.freeTokensRemaining} {t('Left')}</span>
            </div>
            <p className="text-gray-500 text-sm mb-3">{t('FreeTokensDesc')}</p>
            <div className="w-full bg-[#2d3748] rounded-full h-2.5 mb-2">
              <div 
                style={{ width: `${userSubscriptionTokens.freeTokens > 0 ? Math.min(100, (userSubscriptionTokens.freeTokensUsed / userSubscriptionTokens.freeTokens) * 100) : 0}%` }} 
                className="bg-blue-500 h-2.5 rounded-full"
              ></div>
            </div>
            <div className="flex justify-end">
              <span className="text-gray-500 text-sm">{t('UsageSince', { date: lastUsageDate || t('NA') })}</span>
            </div>
          </div>

          {/* Registration Tokens Section */}
          <div className="bg-[#1a1a20] rounded-lg shadow-lg p-8 mb-8 border border-[#2d3748]">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              {t('RegistrationTokens')}
              <span className="ml-2 px-2 py-1 bg-purple-600 text-xs font-medium rounded-full">{t('WELCOME')}</span>
            </h3>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">{userSubscriptionTokens.registrationTokensUsed} / {userSubscriptionTokens.registrationTokens} {t('Used')}</span>
              <span className="text-gray-400">{userSubscriptionTokens.registrationTokensRemaining} {t('Left')}</span>
            </div>
            <p className="text-gray-500 text-sm mb-3">{t('RegistrationTokensDesc')}</p>
            <div className="w-full bg-[#2d3748] rounded-full h-2.5 mb-2">
              <div 
                style={{ width: `${userSubscriptionTokens.registrationTokens > 0 ? Math.min(100, (userSubscriptionTokens.registrationTokensUsed / userSubscriptionTokens.registrationTokens) * 100) : 0}%` }} 
                className="bg-purple-500 h-2.5 rounded-full"
              ></div>
            </div>
            <div className="flex justify-end">
              <span className="text-gray-500 text-sm">{t('UsageSince', { date: lastUsageDate || t('NA') })}</span>
            </div>
          </div>

          {/* Referral Tokens Section */}
          {userSubscriptionTokens.referralTokens > 0 && (
            <div className="bg-[#1a1a20] rounded-lg shadow-lg p-8 mb-8 border border-[#2d3748]">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                {t('ReferralTokens')}
                <span className="ml-2 px-2 py-1 bg-yellow-600 text-xs font-medium rounded-full">{t('EARNED')}</span>
              </h3>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">{userSubscriptionTokens.referralTokensUsed} / {userSubscriptionTokens.referralTokens} {t('Used')}</span>
                <span className="text-gray-400">{userSubscriptionTokens.referralTokensRemaining} {t('Left')}</span>
              </div>
              <p className="text-gray-500 text-sm mb-3">{t('ReferralTokensDesc')}</p>
              <div className="w-full bg-[#2d3748] rounded-full h-2.5 mb-2">
                <div 
                  style={{ width: `${userSubscriptionTokens.referralTokens > 0 ? Math.min(100, (userSubscriptionTokens.referralTokensUsed / userSubscriptionTokens.referralTokens) * 100) : 0}%` }} 
                  className="bg-yellow-500 h-2.5 rounded-full"
                ></div>
              </div>
              <div className="flex justify-end">
                <span className="text-gray-500 text-sm">{t('UsageSince', { date: lastUsageDate || t('NA') })}</span>
              </div>
            </div>
          )}
          
          {/* Purchase Section */}
          {/* <div className="bg-[#1a1a20] rounded-lg shadow-lg p-8 mb-8 border border-[#2d3748]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-bold text-white mb-2">{t('NeedMoreCredits')}</h2>
                <p className="text-gray-400">
                  {t('UsageLimitReachedDesc')}
                </p>
              </div>
              <Link 
                to="/membership-plan" 
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md text-sm transition-colors self-start md:self-center"
              >
                {t('PurchaseCredits')}
              </Link>
            </div>
          </div> */}
          
          {/* Referral Section */}
          {/* <div className="bg-[#1a1a20] rounded-lg shadow-lg p-8 border border-[#2d3748]">
            <Link to="/referral" className="flex items-center text-gray-400 hover:text-white transition-colors">
              <User size={18} className="mr-2" />
              <span>{t('ReferFriendForCredits')}</span>
              <span className="ml-2">›</span>
            </Link>
          </div> */}
        </>
      )}
    </div>
  );
};

export default Usage;