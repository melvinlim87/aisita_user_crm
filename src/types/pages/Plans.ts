export interface PlanFeature {
    name: string;
    included: boolean;
}

export interface Plan {
    id: string;
    name: string;
    price: string;
    yearlyPrice?: string;
    description: string;
    features: PlanFeature[];
    buttonText: string;
    popular?: boolean;
    color: string;
    isCurrentPlan?: boolean;
    isSamePlanType?: boolean;
}