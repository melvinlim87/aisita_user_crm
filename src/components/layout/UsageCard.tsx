import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TerminalSquare, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getRequest } from '@/services/apiRequest';

interface SubscriptionResponse {
  success: boolean;
  hasSubscription: boolean;
  subscription?: {
    id: number;
    user_id: number;
    plan_id: number;
    stripe_subscription_id: string;
    status: string;
    trial_ends_at: string | null;
    next_billing_date: string | null;
    canceled_at: string | null;
    ends_at: string | null;
    created_at: string;
    updated_at: string;
    plan: {
      id: number;
      name: string;
      interval: string;
      price: number;
      currency: string;
    };
  };
}

interface TokenUsageResponse {
    success: boolean;
    stats: {
      total_tokens_used: string;
    };
}
 
interface AddonTokenResponse {
  success: boolean,
  addons_token: number
}
  
interface ReferralResponse {
    success: boolean;
    message: string;
    data: any;
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

const UsageCard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [hasSubscription, setHasSubscription] = useState(false);
  const [planName, setPlanName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      addonTokens: 0,
      addonTokensUsed: 0,
      addonTokensRemaining: 0
    });
    
    const [lastUsageDate, setLastUsageDate] = useState<string>('');
  
    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }
      setIsLoading(true);
  
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
          console.log('API responses:', response);
          
          // Get the total tokens from subscription
          const totalSubscriptionTokens = response[0].subscription?.plan.tokens_per_cycle ?? 0;
          
          // Get total tokens used from the stats
          let totalTokensUsed = 0;
          if (response[1].stats && response[1].stats.total_tokens_used) {
            totalTokensUsed = parseFloat(response[1].stats.total_tokens_used);
          }
  
          let userAddonTokens = 0;
          if (response[2].addons_token) {
            userAddonTokens = response[2].addons_token;
          }
          
          let userReferralTokens = 0;
          if (response[4].data.stats.total_tokens_earned) {
            userReferralTokens = response[4].data.stats.total_tokens_earned;
          }
  
          console.log('Total subscription tokens:', totalSubscriptionTokens);
          console.log('Total tokens used:', totalTokensUsed);
          console.log('User addon tokens:', response[2].addons_token);
          console.log('User referral tokens:', response[4].data.stats.total_tokens_earned);
          
          let totalTokens = totalSubscriptionTokens + userAddonTokens + userReferralTokens; 
          console.log('Total tokens:', totalTokens);
          
          // Calculate subscription and addon token usage
          let subscriptionTokensUsed = totalTokensUsed;
          let addonTokensUsed = 0;
          let subscriptionTokensRemaining = totalSubscriptionTokens - subscriptionTokensUsed;
          let addonTokensRemaining = userAddonTokens;
          
          // If subscription tokens are depleted, calculate how many addon tokens are used
          if (subscriptionTokensRemaining < 0) {
            addonTokensUsed = Math.abs(subscriptionTokensRemaining);
            subscriptionTokensUsed = totalSubscriptionTokens; // Cap at total
            subscriptionTokensRemaining = 0;
            addonTokensRemaining = Math.max(0, userAddonTokens - addonTokensUsed);
          }
          
          console.log('Subscription tokens remaining:', subscriptionTokensRemaining);
          console.log('Addon tokens used:', addonTokensUsed);
          console.log('Addon tokens remaining:', addonTokensRemaining);
  
          setUserSubscriptionTokens({
            total: totalSubscriptionTokens,
            used: subscriptionTokensUsed,
            remaining: subscriptionTokensRemaining,
            addonTokens: userAddonTokens,
            addonTokensUsed: addonTokensUsed,
            addonTokensRemaining: addonTokensRemaining
          });
  
        } catch (error) {
          console.error('Error fetching token data:', error);
          setError('Failed to fetch user subscription and token usage data');
        } finally {
            setIsLoading(false);
        }
      }
  
      fetchUserTokenData();
    }, [isAuthenticated]);

    const changeColorAccordingUsage = (used: number, total: number) => {
        // the more used, the more red
      if (total === 0) return 'from-[#10b981] to-[#22d3ee]';
      const percentage = (used / total) * 100;
      // green color from bg-green-600 to bg-green-200
      if (percentage < 25) return 'from-[#10b981] to-[#22d3ee]';
      // yellow color from bg-yellow-600 to bg-yellow-200
      if (percentage < 50) return 'from-[#f59e0b] to-[#ef4444]';
      // orange color from bg-orange-600 to bg-orange-200
      if (percentage < 75) return 'from-[#f59e0b] to-[#ef4444]';
      // red color from bg-red-600 to bg-red-200
      return 'from-[#f97316] to-[#ef4444]';
    };

  if (isLoading) {
    return (
      <div className="block px-4 py-6 bg-gradient-to-r from-[#23263a] to-[#181a23] rounded-lg border border-[#3a3a45] shadow-lg transition-all duration-200 w-full mb-4">
        <div className="flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-[#63b3ed] animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <Link
      to={isAuthenticated ? "/membership-plan#credits" : "/"}
      className="block group px-3 py-3 bg-gradient-to-br from-[#23263a] to-[#181a23] rounded-lg border border-[#3a3a45] shadow-lg hover:border-[#63b3ed] hover:shadow-xl transition-all duration-200 w-full mb-4"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center align-center justify-center">
          <TerminalSquare className="w-4 h-4 text-[#10b981] mr-2" />
          <span className="text-[#e2e8f0] text-xs font-semibold text-base tracking-wide">Credit Usage</span>
        </div>
        <ArrowRight className="w-3 h-3 text-[#10b981] flex-shrink-0" />
      </div>
      <div className="">
        {/* Subscription Tokens Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[#94a3b8] font-medium">Plan Credits</span>
            <span className="text-xs text-[#e2e8f0] font-semibold">{userSubscriptionTokens.used} / {userSubscriptionTokens.total}</span>
          </div>
          <div className="w-full bg-[#23263a] rounded-full h-2 relative">
            <div
              style={{ width: `${userSubscriptionTokens.total > 0 ? Math.min(100, (userSubscriptionTokens.used / userSubscriptionTokens.total) * 100) : 0}%` }}
              className={`bg-gradient-to-r ${changeColorAccordingUsage(userSubscriptionTokens.used, userSubscriptionTokens.total)} h-2 rounded-full transition-all duration-300`}
            ></div>
            {/* Dot at the end */}
            {/* {userSubscriptionTokens.total > 0 && (
              <div
                className="absolute top-0 -right-1 w-4 h-4 flex items-center justify-center"
                style={{ left: `calc(${userSubscriptionTokens.total > 0 ? Math.min(100, (userSubscriptionTokens.used / userSubscriptionTokens.total) * 100) : 0}% - 8px)` }}
              >
                <span className="w-3 h-3 bg-[#10b981] border-2 border-[#23263a] rounded-full block"></span>
              </div>
            )} */}
          </div>
          <div className="flex justify-between mt-1 text-[11px] text-[#94a3b8]">
            <span>Used</span>
            <span>Remaining: <span className="font-semibold text-[#e2e8f0]">{userSubscriptionTokens.remaining}</span></span>
          </div>
        </div>
        {/* Addon Tokens Section */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[#94a3b8] font-medium">Addon Credits</span>
            <span className="text-xs text-[#e2e8f0] font-semibold">{userSubscriptionTokens.addonTokensUsed} / {userSubscriptionTokens.addonTokens}</span>
          </div>
          <div className="w-full bg-[#23263a] rounded-full h-2 relative">
            <div
              style={{ width: `${userSubscriptionTokens.addonTokens > 0 ? Math.min(100, (userSubscriptionTokens.addonTokensUsed / userSubscriptionTokens.addonTokens) * 100) : 0}%` }}
              className={`bg-gradient-to-r ${changeColorAccordingUsage(userSubscriptionTokens.addonTokensUsed, userSubscriptionTokens.addonTokens)} h-2 rounded-full transition-all duration-300`}
            ></div>
            {/* Dot at the end */}
            {/* {userSubscriptionTokens.addonTokens > 0 && (
              <div
                className="absolute top-0 -right-1 w-4 h-4 flex items-center justify-center"
                style={{ left: `calc(${userSubscriptionTokens.addonTokens > 0 ? Math.min(100, (userSubscriptionTokens.addonTokensUsed / userSubscriptionTokens.addonTokens) * 100) : 0}% - 8px)` }}
              >
                <span className="w-3 h-3 bg-[#fbbf24] border-2 border-[#23263a] rounded-full block"></span>
              </div>
            )} */}
          </div>
          <div className="flex justify-between mt-1 text-[11px] text-[#94a3b8]">
            <span>Used</span>
            <span>Remaining: <span className="font-semibold text-[#e2e8f0]">{userSubscriptionTokens.addonTokensRemaining}</span></span>
          </div>
        </div>
        {/* Summary Grid */}
        {/* <div className="grid grid-cols-2 gap-2 mt-5">
          <div className="flex flex-col items-start bg-[#23263a] rounded-lg px-3 py-2">
            <span className="text-[11px] text-[#94a3b8]">Plan Credits Left</span>
            <span className="text-sm font-bold text-[#10b981]">{userSubscriptionTokens.remaining}</span>
          </div>
          <div className="flex flex-col items-start bg-[#23263a] rounded-lg px-3 py-2">
            <span className="text-[11px] text-[#94a3b8]">Addon Credits Left</span>
            <span className="text-sm font-bold text-[#fbbf24]">{userSubscriptionTokens.addonTokensRemaining}</span>
          </div>
        </div> */}
      </div>
    </Link>
  );
}

export default UsageCard;
