import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// project imports
import Loadable from 'components/Loadable';

// jwt auth
const LoginPage = Loadable(lazy(() => import('pages/auth/Login')));
const ForgotPasswordPage = Loadable(lazy(() => import('pages/auth/ForgotPassword')));
const ResetPasswordPage = Loadable(lazy(() => import('pages/auth/ResetPassword')));
const PlaceOrderPage = Loadable(lazy(() => import('pages/extra-pages/PlaceOrder')));
const PricePage = Loadable(lazy(() => import('pages/extra-pages/Price')));
const AboutPage = Loadable(lazy(() => import('pages/extra-pages/About')));
const WhatWeDoPage = Loadable(lazy(() => import('pages/extra-pages/WhatWeDo')));
const HowWeWorkPage = Loadable(lazy(() => import('pages/extra-pages/HowWeWork')));
const HardThesisBindingPage = Loadable(lazy(() => import('pages/extra-pages/HardThesisBinding')));
const SoftThesisBindingPage = Loadable(lazy(() => import('pages/extra-pages/SoftThesisBinding')));
const SynopsisPage = Loadable(lazy(() => import('pages/extra-pages/Synopsis')));
const ThesisBindingPage = Loadable(lazy(() => import('pages/extra-pages/ThesisBinding')));
const HomeReplicaPage = Loadable(lazy(() => import('pages/extra-pages/HomeReplica')));
const TestimonialPage = Loadable(lazy(() => import('pages/extra-pages/Testimonial')));
const OrderPaymentCallbackPage = Loadable(lazy(() => import('pages/extra-pages/OrderPaymentCallback')));
const SelectCoverPage = Loadable(lazy(() => import('pages/extra-pages/SelectCover')));
const FaqPage = Loadable(lazy(() => import('pages/extra-pages/Faq')));
const ContactPage = Loadable(lazy(() => import('pages/extra-pages/Contact')));

// customer portal (public, OTP-based)
const CustomerPortalEntryPage = Loadable(lazy(() => import('pages/customer/CustomerPortalEntry')));
const CustomerPortalPage = Loadable(lazy(() => import('pages/customer/CustomerPortal')));
const OrderDetails = Loadable(lazy(() => import('pages/operations/OrderDetails')));

// ==============================|| AUTH ROUTING ||============================== //

const LoginRoutes = {
  path: '/',
  children: [
    {
      index: true,
      element: <Navigate to="/home" replace />
    },
    {
      path: 'login',
      element: <LoginPage />
    },
    {
      path: 'forgot-password',
      element: <ForgotPasswordPage />
    },
    {
      path: 'reset-password',
      element: <ResetPasswordPage />
    },
    {
      path: 'home',
      element: <HomeReplicaPage />
    },
    {
      path: 'how-we-work',
      element: <HowWeWorkPage />
    },
    {
      path: 'what-we-do',
      element: <WhatWeDoPage />
    },
    {
      path: 'what-we-do/hard-thesis-binding',
      element: <HardThesisBindingPage />
    },
    {
      path: 'what-we-do/soft-thesis-binding',
      element: <SoftThesisBindingPage />
    },
    {
      path: 'what-we-do/synopsis',
      element: <SynopsisPage />
    },
    {
      path: 'what-we-do/thesis-binding',
      element: <ThesisBindingPage />
    },
    {
      path: 'about',
      element: <AboutPage />
    },
    {
      path: 'order',
      element: <PlaceOrderPage />
    },
    {
      path: 'select-cover/:type',
      element: <SelectCoverPage />
    },
    {
      path: 'order/payment/callback',
      element: <OrderPaymentCallbackPage />
    },
    {
      path: 'price',
      element: <PricePage />
    },
    {
      path: 'testimonial',
      element: <TestimonialPage />
    },
    {
      path: 'faq',
      element: <FaqPage />
    },
    {
      path: 'contact',
      element: <ContactPage />
    },
    {
      path: 'customer',
      element: <CustomerPortalEntryPage />
    },
    {
      path: 'customer/portal',
      element: <CustomerPortalPage />
    }
    ,
    {
      path: 'customer/orders/view/:orderId',
      element: <OrderDetails />
    }
  ]
};

export default LoginRoutes;
