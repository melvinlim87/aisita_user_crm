import React, { useState, useEffect } from 'react';
import { getRequest, postRequest } from '@/services/apiRequest';
import { Loader2, AlertCircle, CreditCard, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface UserSubscription {
  id: number;
  user_id: number;
  plan_id: number;
  stripe_subscription_id: string;
  status: string;
  next_billing_date: string;
  canceled_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
  plan: {
    name: string;
    price: number;
    interval: string;
  };
}

interface ApiResponse {
  success: boolean;
  message?: string;
  hasSubscription: boolean;
  subscription?: UserSubscription;
  url?: string;
}

const Billing: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserSubscription = async () => {
      try {
        setLoading(true);
        const response = await getRequest<ApiResponse>('/subscriptions/user');
        
        if (response.success && response.hasSubscription && response.subscription) {
          setUserSubscription(response.subscription);
        } else if (response.success && !response.hasSubscription) {
          // This is not an error, just no subscription
          setUserSubscription(null);
        } else {
          setError(response.message || t('FailedToLoadSubscription'));
        }
      } catch (err) {
        console.error('Subscription fetch error:', err);
        setError(t('ErrorFetchingSubscription'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserSubscription();
  }, [t]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleOpenBillingPortal = async () => {
    try {
      setPortalLoading(true);
      const response = await postRequest<ApiResponse>('/subscriptions/billing-portal', {});
      
      if (response.success && response.url) {
        // Open Stripe Billing Portal in a new tab
        window.open(response.url, '_blank');
        setPortalLoading(false);
      } else {
        setError(response.message || t('FailedToOpenBillingPortal'));
        setPortalLoading(false);
      }
    } catch (err) {
      console.error('Billing portal error:', err);
      setError(t('ErrorOpeningBillingPortal'));
      setPortalLoading(false);
    }
  };

  const handleViewPlans = () => {
    navigate('/membership-plan');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">{t('BillingAndSubscription')}</h1>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : userSubscription ? (
        <>
          {/* Current Plan Section */}
          <div className="bg-[#1a1a20] rounded-lg shadow-lg p-8 mb-8 border border-[#2d3748]">
            <h2 className="text-xl font-bold text-white mb-4">{t('CurrentPlan')}</h2>
            <p className="text-gray-400 mb-2">
              {t('CurrentlyOnPlan')} <span className="px-2 py-0.5 bg-[#2d3748] text-blue-400 text-xs font-medium rounded-full">
                {userSubscription.plan.name}
              </span> {t('PlanDot')}
            </p>
            <p className="text-gray-400 mb-6">
              {t('SubscriptionRenewsOn')} <span className="font-medium text-white">{formatDate(userSubscription.next_billing_date)}</span>.
              {userSubscription.canceled_at && (
                <span className="ml-2 text-red-400">
                  {t('CancellationPendingAccessUntil', { date: formatDate(userSubscription.ends_at || userSubscription.next_billing_date) })}
                </span>
              )}
            </p>
          </div>

          {/* Payment Management Section */}
          {/* <div className="bg-[#1a1a20] rounded-lg shadow-lg p-8 mb-8 border border-[#2d3748]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{t('PaymentDetails')}</h2>
                <p className="text-gray-400 mt-1">{t('UpdatePaymentInfo')}</p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-400" />
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={handleOpenBillingPortal}
                disabled={portalLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-sm transition-colors flex items-center"
              >
                {portalLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('ManagePaymentMethods')}
              </button>
            </div>
          </div> */}

          {/* Invoices Section */}
          <div className="bg-[#1a1a20] rounded-lg shadow-lg p-8 mb-8 border border-[#2d3748]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{t('Invoices')}</h2>
                <p className="text-gray-400 mt-1">{t('ViewDownloadInvoices')}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={handleOpenBillingPortal}
                disabled={portalLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-sm transition-colors flex items-center"
              >
                {portalLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('ViewInvoices')}
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-[#1a1a20] rounded-lg shadow-lg p-8 mb-8 border border-[#2d3748]">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-500 mr-3" />
            <h2 className="text-xl font-bold text-white">{t('NoActiveSubscription')}</h2>
          </div>
          <p className="text-gray-400 mb-6">
            {t('NoActiveSubscriptionMsgLong')}
          </p>
          <div className="flex justify-end">
            <button
              onClick={handleViewPlans}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-sm transition-colors"
            >
              {t('ViewPlans')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;