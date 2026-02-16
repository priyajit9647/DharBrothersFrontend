import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';

// render - Dashboard
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));

// render - BMS Operations
const JobsBoard = Loadable(lazy(() => import('pages/operations/JobsBoard')));
const MyJobs = Loadable(lazy(() => import('pages/operations/MyJobs')));
const OrdersIntake = Loadable(lazy(() => import('pages/operations/Orders')));
const DeliveryDispatch = Loadable(lazy(() => import('pages/operations/Delivery')));

// render - BMS Admin & Insights
const ReportsOverview = Loadable(lazy(() => import('pages/reports/Overview')));
const Branches = Loadable(lazy(() => import('pages/admin/Branches')));
const Materials = Loadable(lazy(() => import('pages/admin/Materials')));
const NotificationTemplates = Loadable(lazy(() => import('pages/admin/NotificationTemplates')));
const SystemSettings = Loadable(lazy(() => import('pages/admin/Settings')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <DashboardLayout />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    // Operations
    {
      path: 'jobs',
      element: <JobsBoard />
    },
    {
      path: 'my-jobs',
      element: <MyJobs />
    },
    {
      path: 'orders',
      element: <OrdersIntake />
    },
    {
      path: 'delivery',
      element: <DeliveryDispatch />
    },
    // Reports & Insights
    {
      path: 'reports',
      element: <ReportsOverview />
    },
    // Admin
    {
      path: 'admin',
      children: [
        {
          path: 'branches',
          element: <Branches />
        },
        {
          path: 'materials',
          element: <Materials />
        },
        {
          path: 'notifications',
          element: <NotificationTemplates />
        },
        {
          path: 'settings',
          element: <SystemSettings />
        }
      ]
    }
  ]
};

export default MainRoutes;
