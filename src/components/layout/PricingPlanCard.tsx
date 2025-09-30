import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getRequest } from '@/services/apiRequest';
import { useTranslation } from 'react-i18next';

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

const PricingPlanCard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [hasSubscription, setHasSubscription] = useState(false);
  const [planName, setPlanName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    // Only fetch subscription data if user is authenticated
    if (isAuthenticated) {
      const fetchSubscription = async () => {
        try {
          const response = await getRequest<SubscriptionResponse>('/subscriptions/user');
          
          if (response && response.success) {
            setHasSubscription(response.hasSubscription);
            
            if (response.hasSubscription && response.subscription) {
              // Extract the base plan name without the billing interval suffix
              const name = response.subscription.plan.name
                .replace(' Annual', '')
                .replace(' Monthly', '')
                .replace(' Yearly', '');
              setPlanName(name);
            }
          }
        } catch (error) {
          console.error('Error fetching subscription data:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchSubscription();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="block px-3 py-3 bg-gradient-to-r from-[#2d3748] to-[#1a202c] rounded-lg border border-[#4a5568] transition-all duration-200 w-full mb-4">
        <div className="flex items-center justify-center">
          <Loader2 className="w-4 h-4 text-[#63b3ed] animate-spin" />
        </div>
      </div>
    );
  }

  if (hasSubscription && planName) {
    // User has an active subscription
    return (
      <Link 
        to="/membership-plan"
        className="block px-3 py-3 bg-gradient-to-r from-[#1f2937] to-[#111827] rounded-lg border border-[#4a5568] hover:border-[#10b981] transition-all duration-200 w-full mb-4"
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center min-w-0 flex-shrink-1">
            <CheckCircle className="w-4 h-4 text-[#10b981] mr-2 flex-shrink-0" />
            <span className="text-xs font-semibold text-[#e2e8f0] truncate">{t('ActivePlan')}</span>
          </div>
          <span className="text-[#10b981] font-bold ml-1 flex-shrink-0">{t(planName)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 truncate">{t('ManageSubscription')}</span>
          <ArrowRight className="w-3 h-3 text-[#10b981] flex-shrink-0" />
        </div>
      </Link>
    );
  }

  // User doesn't have an active subscription or is not authenticated
  return (
    <Link 
      to={isAuthenticated ? "/membership-plan" : "/"}
      className="block px-3 py-3 bg-gradient-to-r from-[#2d3748] to-[#1a202c] rounded-lg border border-[#4a5568] hover:border-[#63b3ed] transition-all duration-200 w-full mb-4"
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center min-w-0 flex-shrink-1">
          <DollarSign className="w-4 h-4 text-[#63b3ed] mr-2 flex-shrink-0" />
          <span className="text-xs font-semibold text-[#e2e8f0] truncate">{t('PlanStartsAt')}</span>
        </div>
        <span className="text-[#63b3ed] font-bold ml-1 flex-shrink-0">$19</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 truncate">{t('UpgradeNow')}</span>
        <ArrowRight className="w-3 h-3 text-[#63b3ed] flex-shrink-0" />
      </div>
    </Link>
  );
};

export default PricingPlanCard;
