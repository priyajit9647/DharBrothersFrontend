import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import RequireAuth from './RequireAuth';

// render - Customer Feedback
const FeedbackPage = Loadable(lazy(() => import('pages/customer/Feedback')));

// ==============================|| FEEDBACK ROUTING ||============================== //

const FeedbackRoutes = {
  path: '/',
  element: (
    <RequireAuth>
      {/* No specific layout here, FeedbackPage will handle its own minimal layout */}
      <FeedbackPage />
    </RequireAuth>
  ),
  children: [
    {
      path: 'customer/orders/feedback/:orderId',
      element: <FeedbackPage />
    }
  ]
};

export default FeedbackRoutes;
