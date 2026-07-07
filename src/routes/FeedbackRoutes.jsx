import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';

// render - Customer Feedback
const FeedbackPage = Loadable(lazy(() => import('pages/customer/Feedback')));

// ==============================|| FEEDBACK ROUTING ||============================== //

const FeedbackRoutes = {
  path: '/',
  element: (
    /* No auth guard here — feedback is reachable from the customer portal */
    <FeedbackPage />
  ),
  children: [
    {
      path: 'customer/orders/feedback/:orderId',
      element: <FeedbackPage />
    }
  ]
};

export default FeedbackRoutes;
