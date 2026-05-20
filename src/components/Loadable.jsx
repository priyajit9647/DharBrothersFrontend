import { Suspense } from 'react';

// project imports
import Loader from './Loader';
import ErrorBoundary from './ErrorBoundary';

// ==============================|| LOADABLE - LAZY LOADING ||============================== //

const Loadable = (Component) => (props) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader />}>
        <Component {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default Loadable;
