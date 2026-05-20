import { createBrowserRouter } from 'react-router-dom';

// project imports
import MainRoutes from './MainRoutes';
import LoginRoutes from './LoginRoutes';
import FeedbackRoutes from './FeedbackRoutes';

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter([MainRoutes, LoginRoutes, FeedbackRoutes], { basename: import.meta.env.VITE_APP_BASE_NAME });

export default router;
