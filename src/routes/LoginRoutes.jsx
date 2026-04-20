import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// project imports
import Loadable from 'components/Loadable';

// jwt auth
const LoginPage = Loadable(lazy(() => import('pages/auth/Login')));
const PlaceOrderPage = Loadable(lazy(() => import('pages/extra-pages/PlaceOrder')));
const PricePage = Loadable(lazy(() => import('pages/extra-pages/Price')));

// customer portal (public, OTP-based)
const CustomerPortalEntryPage = Loadable(lazy(() => import('pages/customer/CustomerPortalEntry')));
const CustomerPortalPage = Loadable(lazy(() => import('pages/customer/CustomerPortal')));

// ==============================|| AUTH ROUTING ||============================== //

const LoginRoutes = {
  path: '/',
  children: [
    {
      index: true,
      element: <Navigate to="/login" replace />
    },
    {
      path: 'login',
      element: <LoginPage />
    },
    {
      path: 'order',
      element: <PlaceOrderPage />
    },
    {
      path: 'price',
      element: <PricePage />
    },
    {
      path: 'customer',
      element: <CustomerPortalEntryPage />
    },
    {
      path: 'customer/portal',
      element: <CustomerPortalPage />
    }
  ]
};

export default LoginRoutes;
