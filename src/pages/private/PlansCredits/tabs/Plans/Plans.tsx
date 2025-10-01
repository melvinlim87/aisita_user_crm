import React, { useState, useEffect } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { Plan } from '@/types/pages/Plans';
import { getRequest, postRequest } from '@/services/apiRequest';
import { useTranslation } from 'react-i18next';

interface PlanApiResponse {
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
    stripe_price_id: string | null;
    is_active: boolean;
    premium_models_access: boolean;
    created_at: string;
    updated_at: string;
    savings: number;
    savings_percentage: number;
}

const Plans: React.FC = () => {
    const { t } = useTranslation();
    const [isYearly, setIsYearly] = useState(false);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPlanId, setCurrentPlanId] = useState<number | null>(null);
    const [currentPlanInterval, setCurrentPlanInterval] = useState<string | null>(null);
    const [currentPlanName, setCurrentPlanName] = useState<string | null>(null);
    const [currentSubscriptionId, setCurrentSubscriptionId] = useState<string | null>(null);
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [upgradeError, setUpgradeError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmPlan, setConfirmPlan] = useState<Plan | null>(null);

    // Check for session_id in URL and verify checkout
    useEffect(() => {
        const verifyCheckout = async () => {
            // Get URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const sessionId = urlParams.get('session_id');
            
            if (sessionId) {
                setIsUpgrading(true); // Show loading modal while verifying
                setUpgradeError(null);
                
                try {
                    // Send the session_id to verify-checkout endpoint
                    const response = await postRequest<{ success: boolean; message: string }>(                        
                        '/subscriptions/verify-checkout',
                        { session_id: sessionId }
                    );
                    
                    // Remove the session_id from URL to prevent multiple verifications
                    const newUrl = window.location.pathname;
                    window.history.replaceState({}, document.title, newUrl);
                    
                    // Close the modal after verification
                    setIsUpgrading(false);
                    
                    // Refresh the page to show updated subscription
                    window.location.reload();
                } catch (err: any) {
                    console.error('Error verifying checkout:', err);
                    setUpgradeError(err.response?.data?.message || t('FailedToVerifyPayment'));
                }
            }
        };
        
        verifyCheckout();
    }, []);

    // Fetch user's current subscription
    useEffect(() => {
        const fetchUserSubscription = async () => {
            try {
                const response = await getRequest<{
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
                        plan: PlanApiResponse;
                    };
                }>('/subscriptions/user');
                
                if (response && response.success && response.hasSubscription && response.subscription && response.subscription.plan) {
                    // Store the current plan ID, interval, and name
                    setCurrentPlanId(response.subscription.plan.id);
                    setCurrentPlanInterval(response.subscription.plan.interval);
                    
                    // Store the subscription ID for plan changes
                    if (response.subscription.stripe_subscription_id) {
                        setCurrentSubscriptionId(response.subscription.stripe_subscription_id);
                    }
                    
                    // Extract the base plan name without the billing interval suffix
                    const planName = response.subscription.plan.name
                        .replace(' Annual', '')
                        .replace(' Monthly', '')
                        .replace(' Yearly', '');
                    setCurrentPlanName(planName);
                }
            } catch (err) {
                console.error('Error fetching user subscription:', err);
                // Don't set error state here as it would override the plans error
            }
        };

        fetchUserSubscription();
    }, []);

    // Set isYearly based on user's current plan interval when it's loaded
    useEffect(() => {
        if (currentPlanInterval) {
            setIsYearly(currentPlanInterval === 'yearly');
        }
    }, [currentPlanInterval]);

    // Fetch plans when component mounts or when isYearly changes
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setIsLoading(true);
                const response = await getRequest<{success: boolean, plans: PlanApiResponse[]}>('/subscriptions/plans');
                
                if (response && response.success && Array.isArray(response.plans)) {
                    // Filter plans based on interval (monthly/yearly)
                    const filteredPlans = response.plans.filter(plan => 
                        isYearly ? plan.interval === 'yearly' : plan.interval === 'monthly'
                    );
                    
                    // Transform the API response to match our Plan type
                    const formattedPlans = filteredPlans.map((plan: PlanApiResponse) => {
                        // Determine color based on plan name
                        let color = 'blue';
                        let popular = false;
                        
                        if (plan.name.toLowerCase().includes('pro')) {
                            color = 'emerald';
                            popular = true;
                        } else if (plan.name.toLowerCase().includes('enterprise')) {
                            color = 'purple';
                        }
                        
                        // Format price with currency symbol
                        const formattedPrice = `$${plan.price}`;
                        
                        // Extract the base plan name without the billing interval suffix
                        const planBaseName = plan.name
                            .replace(' Annual', '')
                            .replace(' Monthly', '')
                            .replace(' Yearly', '');
                        
                        // This is the exact current plan if ID matches
                        const isExactCurrentPlan = plan.id === currentPlanId;
                        
                        // This is the same plan type but possibly different billing interval
                        const isSamePlanType = planBaseName === currentPlanName;
                        
                        // Only mark as current plan if it's the exact plan AND the billing interval matches the view
                        const isCurrentPlan = isExactCurrentPlan && 
                            ((isYearly && plan.interval === 'yearly') || (!isYearly && plan.interval === 'monthly'));
                        
                        return {
                            id: String(plan.id),
                            name: plan.name.replace(' Annual', ''),
                            price: formattedPrice,
                            yearlyPrice: formattedPrice, // Not used directly as we filter by interval
                            description: plan.description,
                            color: color,
                            buttonText: isCurrentPlan ? t('CurrentPlan') : isSamePlanType ? t('ChangeBilling') : currentPlanId ? t('Switch') : t('Upgrade'),
                            popular: popular,
                            isCurrentPlan: isCurrentPlan,
                            isSamePlanType: isSamePlanType,
                            features: plan.features ? plan.features.map(feature => ({
                                name: feature,
                                included: true
                            })) : []
                        };
                    });
                    
                    setPlans(formattedPlans);
                } else {
                    throw new Error('Invalid response format');
                }
            } catch (err: any) {
                console.error('Error fetching plans:', err);
                setError(err.response?.data?.message || t('FailedToLoadPlans'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlans();
    }, [isYearly, currentPlanId]);

    const handleUpgrade = async (plan: Plan) => {
        // Get the plan ID
        const planId = plan.id;
        
        // If this is the exact current plan, do nothing
        if (Number(planId) === currentPlanId) return;
        
        // Show the loading modal
        setIsUpgrading(true);
        setUpgradeError(null);
        
        try {
            // If this is the same plan type but different billing interval
            if (plan.isSamePlanType) {
                // Send request to initiate subscription change
                const response = await postRequest<{ success: boolean; sessionUrl: string; message?: string }>(
                    '/subscriptions/initiate', 
                    { plan_id: planId }
                );
                // If successful and we have a sessionUrl, redirect to it
                if (response && response.sessionUrl) {
                    window.location.href = response.sessionUrl;
                } else {
                    throw new Error('No session URL returned from the server');
                }
            } 
            // If user already has a plan and is switching to a different plan
            else if (currentPlanId && currentSubscriptionId) {
                // Send request to change plan
                const changePlanResponse = await postRequest<{ success: boolean; message: string; url?: string, details?: any }>(
                    '/subscriptions/change-plan', 
                    { 
                        subscription_id: currentSubscriptionId, // Current subscription ID
                        plan_id: planId // New plan ID
                    }
                );

                if (changePlanResponse && changePlanResponse.success) {
                    // Open Stripe billing page in a new tab
                    // console.log(changePlanResponse)
                    // if (changePlanResponse.details?.url) {
                    //     window.open(changePlanResponse.details?.url, '_blank');
                    // }
                    // show success message and change current plan
                    setIsUpgrading(false);
                    let message = changePlanResponse.message
                    setSuccessMessage(message);
                    setCurrentPlanId(Number(planId));
                    
                } else {
                    throw new Error(changePlanResponse?.message || 'Failed to change plan');
                }
            } 
            // New subscription (no current plan)
            else {
                // Send request to initiate subscription
                const response = await postRequest<{ success: boolean; sessionUrl: string; message?: string }>(
                    '/subscriptions/initiate', 
                    { plan_id: planId }
                );
                
                // If successful and we have a sessionUrl, redirect to it
                if (response && response.sessionUrl) {
                    window.location.href = response.sessionUrl;
                } else {
                    throw new Error('No session URL returned from the server');
                }
            }
        } catch (err: any) {
            console.error('Error processing plan change/upgrade:', err);
            setUpgradeError(err.response?.data?.message || err.message || t('FailedToProcessRequest'));
        }
    };

    return (
        <div>
            <div id="plans-section" className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-white mb-2">{t('ChooseYourPlan')}</h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    {t('ChooseYourPlanSubtitle')}
                </p>
                
                <div className="flex items-center justify-center mt-8 mb-2">
                    <div className="bg-[#0b0b0e] border border-[#3a2a15] rounded-full p-1 flex items-center shadow-lg">
                        <span 
                            className={`px-4 py-2 text-sm rounded-full transition-all duration-300 cursor-pointer ${!isYearly ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-medium shadow-md' : 'text-gray-400 hover:text-white'}`}
                            onClick={() => setIsYearly(false)}
                        >
                            {t('Monthly')}
                        </span>
                        <span 
                            className={`px-4 py-2 text-sm rounded-full transition-all duration-300 cursor-pointer flex items-center ${isYearly ? 'bg-gradient-to-r from-emerald-600 to-purple-600 text-white font-medium shadow-md' : 'text-gray-400 hover:text-white'}`}
                            onClick={() => setIsYearly(true)}
                        >
                            {t('Yearly')}
                            <span className="ml-1.5 bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-medium">{t('SaveXPercent', { percent: 16 })}</span>
                        </span>
                    </div>
                </div>
            </div>
            
            {/* Payment Processing Modal */}
            {isUpgrading && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-[#0b0b0e] border border-[#3a2a15] rounded-xl p-6 max-w-md w-full">
                        {!upgradeError ? (
                            <div className="flex flex-col items-center">
                                <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {window.location.search.includes('session_id') ? t('VerifyingYourPayment') : t('ProcessingYourSubscription')}
                                </h3>
                                <p className="text-gray-400 text-center">
                                    {window.location.search.includes('session_id') 
                                        ? t('PleaseWaitVerifyPayment') 
                                        : t('PleaseWaitPreparePaymentSession')}
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <div className="bg-red-500/20 p-3 rounded-full mb-4">
                                    <X className="h-8 w-8 text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{t('PaymentError')}</h3>
                                <p className="text-red-400 text-center mb-4">
                                    {upgradeError}
                                </p>
                                <button 
                                    onClick={() => setIsUpgrading(false)}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                                >
                                    {t('Close')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {successMessage && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-[#0b0b0e] p-6 rounded-lg shadow-lg">
                        <div className="flex flex-col items-center">
                            <div className="bg-red-500/20 p-3 rounded-full mb-4">
                                <Check className="h-8 w-8 text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{t('Success')}</h3>
                            <p className="text-white text-center mb-4 max-w-[500px]">
                                    {successMessage}
                                </p>
                                <button 
                                    onClick={() => setSuccessMessage(null)}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                                >
                                    {t('Close')}
                                </button>
                            </div>
                    </div>
                </div>
            )}

            {/* Confirm Plan Change Modal */}
            {showConfirm && confirmPlan && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-[#0b0b0e] border border-[#3a2a15] rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-white mb-2">{t('ConfirmPlanChange')}</h3>
                        <p className="text-gray-300">{t('ConfirmChangeToPlan', { name: confirmPlan.name })}</p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => { setShowConfirm(false); setConfirmPlan(null); }}
                                className="px-4 py-2 bg-[#2a2a31] text-gray-200 rounded-md hover:bg-[#34343d] transition-colors"
                            >
                                {t('Cancel')}
                            </button>
                            <button
                                onClick={() => {
                                    const planToUpgrade = confirmPlan;
                                    setShowConfirm(false);
                                    setConfirmPlan(null);
                                    if (planToUpgrade) {
                                        handleUpgrade(planToUpgrade);
                                    }
                                }}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                            >
                                {t('Confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                    <span className="ml-2 text-gray-400">{t('LoadingPlans')}</span>
                </div>
            ) : error ? (
                <div className="text-center py-8">
                    <p className="text-red-400">{t('Error')}: {error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                    >
                        {t('Retry')}
                    </button>
                </div>
            ) : plans.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-400">{t('NoPlansAvailable')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {plans.map((plan) => (
                    <div 
                        key={plan.id}
                        className={`relative rounded-xl overflow-hidden border ${plan.isCurrentPlan ? 'border-blue-500 border-2' : plan.popular ? 'border-emerald-500' : 'border-[#3a2a15]'} bg-[#0b0b0e] shadow-lg flex flex-col`}
                    >
                        {plan.isCurrentPlan ? (
                            <div className="absolute top-0 right-0">
                                <div className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl">
                                    {t('CurrentPlan')}
                                </div>
                            </div>
                        ) : plan.popular && (
                            <div className="absolute top-0 right-0">
                                <div className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl">
                                    {t('Popular')}
                                </div>
                            </div>
                        )}
                        <div className={`p-6 border-b border-[#3a2a15]`}>
                            <h3 className="text-xl font-bold text-white mb-1">{t(plan.name)}</h3>
                            <div className="flex items-baseline mb-2">
                                <span className="text-3xl font-extrabold text-white">
                                    {isYearly ? plan.yearlyPrice : plan.price}
                                </span>
                                {plan.price !== 'Free' && (
                                    <span className="text-gray-400 ml-1">
                                        {isYearly ? t('PerYear') : t('PerMonth')}
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-400 text-sm">{plan.description}</p>
                        </div>

                        <div className="p-6 flex-grow">
                            <ul className="space-y-3">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start">
                                        {feature.included ? (
                                            <Check className={`w-5 h-5 mr-2 flex-shrink-0 ${plan.color === 'blue' ? 'text-blue-500' : plan.color === 'emerald' ? 'text-emerald-500' : 'text-purple-500'}`} />
                                        ) : (
                                            <X className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0" />
                                        )}
                                        <span className={`text-sm ${feature.included ? 'text-white' : 'text-gray-500'}`}>
                                            {feature.name}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="p-6 border-t border-[#3a2a15] relative">
                            <button
                                disabled={plan.isCurrentPlan}
                                onClick={() => { setConfirmPlan(plan); setShowConfirm(true); }}
                                className={`w-full py-2 px-4 rounded-md font-medium transition-all duration-200 ${plan.isCurrentPlan ? 'bg-gray-700 cursor-not-allowed text-gray-300' : plan.isSamePlanType ? 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white' : plan.popular ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white' : plan.color === 'blue' ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white' : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white'}`}
                            >
                                {plan.buttonText}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            )}
        </div>
    );
};

export default Plans;
