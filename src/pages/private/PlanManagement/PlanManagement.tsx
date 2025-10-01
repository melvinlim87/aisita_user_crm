import React, { useState, useEffect } from 'react';
import { getRequest, postRequest } from '@/services/apiRequest';
import { Loader2, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  regular_price: number | null;
  discount_percentage: number | null;
  has_discount: boolean;
  currency: string;
  interval: string;
  tokens_per_cycle: number;
  features: string[];
  stripe_price_id: string;
  is_active: boolean;
  premium_models_access: boolean;
  created_at: string;
  updated_at: string;
  savings: number;
  savings_percentage: number;
}

interface UserSubscription {
  id: number;
  user_id: number;
  plan_id: number;
  stripe_subscription_id: string;
  status: string;
  trial_ends_at: string | null;
  next_billing_date: string;
  canceled_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
  plan: Plan;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  hasSubscription: boolean;
  subscription?: UserSubscription;
}

interface CancelResponse {
  success: boolean;
  message?: string;
  url?: string;
}

const PlanManagement: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [cancelLoading, setCancelLoading] = useState<boolean>(false);
  const [cancelSuccess, setCancelSuccess] = useState<boolean>(false);
  const [cancelMessage, setCancelMessage] = useState<string>('');

  useEffect(() => {
    const fetchUserSubscription = async () => {
      try {
        setLoading(true);
        const response = await getRequest<ApiResponse>('/subscriptions/user');
        
        if (response.success && response.hasSubscription && response.subscription) {
          setUserSubscription(response.subscription);
        } else if (response.success && !response.hasSubscription) {
          // User doesn't have a subscription - this is not an error state
          setUserSubscription(null);
        } else {
          setError(response.message || t('FailedToLoadSubscription'));
        }
      } catch (err) {
        setError(t('ErrorFetchingSubscription'));
        console.error('Subscription fetch error:', err);
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

  const handleSwitchPlan = async () => {
    if (!userSubscription) {
      navigate('/membership-plan');
      return;
    }
    
    try {
      setLoading(true);
      const response = await postRequest<CancelResponse>('/subscriptions/change-plan', {
        subscription_id: userSubscription.stripe_subscription_id
      });
      
      if (response.success && response.url) {
        window.open(response.url, '_blank');
      } else {
        // Fallback to navigating to the plans page if no URL is provided
        navigate('/membership-plan');
      }
    } catch (err) {
      console.error('Switch plan error:', err);
      navigate('/membership-plan');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPlan = () => {
    setShowCancelModal(true);
  };

  const confirmCancelPlan = async () => {
    if (!userSubscription) return;
    
    try {
      setCancelLoading(true);
      const response = await postRequest<CancelResponse>('/subscriptions/cancel', {
        subscription_id: userSubscription.id
      });
      
      setCancelSuccess(response.success);
      setCancelMessage(response.message || '');
      
      // If successful and URL is provided, open Stripe portal in new tab
      if (response.success && response.url) {
        window.open(response.url, '_blank');
        setShowCancelModal(false); // Close the modal after opening Stripe
      }
      // If successful but no URL (legacy behavior), update subscription status locally
      else if (response.success && userSubscription) {
        setUserSubscription({
          ...userSubscription,
          canceled_at: new Date().toISOString()
        });
      }
    } catch (err) {
      setCancelSuccess(false);
      setCancelMessage(t('ErrorCancelingSubscription'));
      console.error('Cancel subscription error:', err);
    } finally {
      setCancelLoading(false);
    }
  };
  
  const closeCancelModal = () => {
    setShowCancelModal(false);
    // Reset state after animation completes
    setTimeout(() => {
      setCancelSuccess(false);
      setCancelMessage('');
    }, 300);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">{t('PlanManagement')}</h1>
      
      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0b0b0e] rounded-lg shadow-xl border border-[#2d3748] max-w-md w-full p-6 relative">
            <button 
              onClick={closeCancelModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              disabled={cancelLoading}
            >
              <X className="w-5 h-5" />
            </button>
            
            {!cancelSuccess && !cancelLoading && (
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{t('CancelYourSubscription')}</h3>
                <p className="text-gray-400 mb-6">{t('CancelSubscriptionConfirm')}</p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={closeCancelModal}
                    className="px-4 py-2 bg-[#2d3748] hover:bg-[#3d4a5f] text-white font-medium rounded-md text-sm transition-colors"
                    disabled={cancelLoading}
                  >
                    {t('KeepSubscription')}
                  </button>
                  <button
                    onClick={confirmCancelPlan}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md text-sm transition-colors"
                    disabled={cancelLoading}
                  >
                    {t('YesCancel')}
                  </button>
                </div>
              </div>
            )}
            
            {cancelLoading && (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">{t('ProcessingRequest')}</p>
              </div>
            )}
            
            {cancelSuccess && !cancelLoading && (
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{t('SubscriptionCanceled')}</h3>
                <p className="text-gray-400 mb-6">{cancelMessage}</p>
                <button
                  onClick={closeCancelModal}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-sm transition-colors"
                >
                  {t('Close')}
                </button>
              </div>
            )}
            
            {!cancelSuccess && !cancelLoading && cancelMessage && (
              <div className="text-center mt-4">
                <p className="text-red-500">{cancelMessage}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : userSubscription === null ? (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
          <div className="text-2xl font-semibold mb-3">{t('NoActiveSubscription')}</div>
          <p className="text-gray-400 mb-6">{t('SubscribeToAccessPremium')}</p>
          <Link to="/membership-plan">
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
              {t('ViewAvailablePlans')}
            </button>
          </Link>
        </div>
      ) : userSubscription ? (
        <>
          
          {/* Manage your plan section */}
          <div className="bg-[#0b0b0e] rounded-lg shadow-lg p-8 mb-8 border border-[#2d3748]">
            <h2 className="text-xl font-bold text-white mb-4">{t('ManageYourPlan')}</h2>
            <p className="text-gray-400 mb-6">
              {t('YourAccountCurrentlyOn')} <span className="px-2 py-0.5 bg-[#2d3748] text-blue-400 text-xs font-medium rounded-full">
                {userSubscription.plan.name}
              </span> {t('PlanCostsPerInterval', { price: userSubscription.plan.price, interval: userSubscription.plan.interval })}
            </p>
            <div className="flex justify-end">
              <button 
                onClick={handleSwitchPlan}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md text-sm transition-colors"
              >
                {t('SwitchPlan')}
              </button>
            </div>
          </div>
          
          {/* Cancel your plan section */}
          <div className="bg-[#0b0b0e] rounded-lg shadow-lg p-8 mb-8 border border-[#2d3748]">
            <h2 className="text-xl font-bold text-white mb-4">{t('CancelYourPlan')}</h2>
            <p className="text-gray-400 mb-6">
              {t('CancelPlanKeepAccessUntil', { date: formatDate(userSubscription.next_billing_date) })}
            </p>
            <div className="flex justify-end">
              <button 
                onClick={handleCancelPlan}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md text-sm transition-colors"
                disabled={userSubscription?.canceled_at !== null}
              >
                {userSubscription?.canceled_at ? t('CancellationPending') : t('CancelPlan')}
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-[#0b0b0e] rounded-lg shadow-lg p-8 mb-8 border border-[#2d3748]">
          <p className="text-gray-400">{t('NoActiveSubscriptionFound')}</p>
          <div className="flex justify-end mt-4">
            <button 
              onClick={handleSwitchPlan}
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

export default PlanManagement;
