import { createBrowserRouter } from 'react-router-dom';

// project imports
import MainRoutes from './MainRoutes';
import LoginRoutes from './LoginRoutes';
import Email from "../pages/email";
import Whatsapp from "../pages/whatsapp";

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter([MainRoutes, LoginRoutes, Email, Whatsapp], { basename: import.meta.env.VITE_APP_BASE_NAME });

export default router;
