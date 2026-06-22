import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from 'hooks/useAuth';

// ==============================|| ROUTE GUARD ||============================== //

export default function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const pathname = location?.pathname || '';
    // Special-case: customer feedback links should send unauthenticated users
    // to the customer landing page instead of the global login page.
    if (pathname.startsWith('/customer/orders/feedback')) {
      return <Navigate to="/customer" replace state={{ from: location }} />;
    }

    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

RequireAuth.propTypes = { children: PropTypes.node };
