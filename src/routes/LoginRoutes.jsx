import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// project imports
import Loadable from 'components/Loadable';

// jwt auth
const LoginPage = Loadable(lazy(() => import('pages/auth/Login')));
const PlaceOrderPage = Loadable(lazy(() => import('pages/extra-pages/PlaceOrder')));

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
    }
  ]
};

export default LoginRoutes;
