import { lazy } from 'react';

const publicRoutes = [
    // {
    //     path: '/',
    //     component: lazy(() => import('@/pages/public/Home')),
    // },
    {
        path: '/',
        component: lazy(() => import('@/components/routing/RootRedirect')),
    },
    {
        path: '/login',
        component: lazy(() => import('@/pages/public/Login')),
    },
    {
        path: '/signup',
        component: lazy(() => import('@/pages/public/SignUp')),
    },
    {
        path: '/pricing',
        component: lazy(() => import('@/pages/public/Pricing')),
    },
    {
        path: '/about',
        component: lazy(() => import('@/pages/public/About')),
    },
    {
        path: '/partners',
        component: lazy(() => import('@/pages/public/Partners')),
    },
    {
        path: '/faq',
        component: lazy(() => import('@/pages/public/FAQ')),
    },
    {
        path: '/contact',
        component: lazy(() => import('@/pages/public/ContactUs')),
    },
    {
        path: '/terms-and-condition',
        component: lazy(() => import('@/pages/public/TermsCondition')),
    },
    {
        path: '/refund-policy',
        component: lazy(() => import('@/pages/public/RefundPolicy')),
    },
    {
        path: '/privacy-policy',
        component: lazy(() => import('@/pages/public/PrivacyPolicy')),
    },
    {
        path: '/verify-email/:token',
        component: lazy(() => import('@/pages/public/EmailVerification')),
    },
    {
        path: '/forgot-password',
        component: lazy(() => import('@/pages/public/ForgotPassword')),
    },
    {
        path: '/verify-signup',
        component: lazy(() => import('@/pages/public/SignUpVerification')),
    },
];

export default publicRoutes;
