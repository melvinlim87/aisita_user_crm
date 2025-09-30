import { lazy } from 'react';

const privateRoutes = [
    {
        path: '/dashboard',
        component: lazy(() => import('@/pages/private/Dashboard')),
        protected: true,
    },
    // {
    //     path: '/chart-analysis',
    //     component: lazy(() => import('@/pages/private/ChartAnalysis')),
    //     protected: true,
    // },
    {
        path: '/chart-analysis',
        component: lazy(() => import('@/pages/private/ChartAnalysisNew')),
        protected: true,
    },
    {
        path: '/chart-analysis/:id',
        component: lazy(() => import('@/pages/private/ChartAnalysisNew')),
        protected: true,
    },
    {
        path: '/ea-generator',
        component: lazy(() => import('@/pages/private/EAGenerator')),
        protected: true,
    },
    {
        path: '/ea-generator/:id',
        component: lazy(() => import('@/pages/private/EAGenerator')),
        protected: true,
    },
    {
        path: '/history',
        component: lazy(() => import('@/pages/private/History')),
        protected: true,
    },
    {
        path: '/membership-plan',
        component: lazy(() => import('@/pages/private/PlansCredits')),
        protected: true,
    },
    {
        path: '/membership-plan/:tab',
        component: lazy(() => import('@/pages/private/PlansCredits')),
        protected: true,
    },
    {
        path: '/submit-ticket',
        component: lazy(() => import('@/pages/private/Support')),
        protected: true,
    },
    {
        path: '/profile',
        component: lazy(() => import('@/pages/private/Profile')),
        protected: true,
    },
    {
        path: '/referral',
        component: lazy(() => import('@/pages/private/Referral')),
        protected: true,
    },
    {
        path: '/settings',
        component: lazy(() => import('@/pages/private/Settings')),
        protected: true,
    },
    {
        path: '/plan-management',
        component: lazy(() => import('@/pages/private/PlanManagement')),
        protected: true,
    },
    {
        path: '/billing',
        component: lazy(() => import('@/pages/private/Billing')),
        protected: true,
    },
    {
        path: '/usage',
        component: lazy(() => import('@/pages/private/Usage')),
        protected: true,
    },
    {
        path: '/credit-history',
        component: lazy(() => import('@/pages/private/CreditHistory')),
        protected: true,
    },
    {
        path: '/ai-educator',
        component: lazy(() => import('@/pages/private/AIEducator')),
        protected: true,
    },
    {
        path: '/chart-on-demand',
        component: lazy(() => import('@/pages/private/ChartOnDemand')),
        protected: true,
    },
    {
        path: '/schedule-analysis',
        component: lazy(() => import('@/pages/private/ScheduleAnalysis')),
        protected: true,
    },
    {
        path: '/schedule-analysis/:id',
        component: lazy(() => import('@/pages/private/ScheduleAnalysis')),
        protected: true,
    },
];

export default privateRoutes;
