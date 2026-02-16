import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import RequireAuth from './RequireAuth';

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
const SpinePrintingOptionMaster = Loadable(lazy(() => import('pages/admin/masters/SpinePrintingOptionMaster')));
const ProcessStageMaster = Loadable(lazy(() => import('pages/admin/masters/ProcessStageMaster')));
const PrintingTypeMaster = Loadable(lazy(() => import('pages/admin/masters/PrintingTypeMaster')));
const PrintColorMaster = Loadable(lazy(() => import('pages/admin/masters/PrintColorMaster')));
const PaperMaster = Loadable(lazy(() => import('pages/admin/masters/PaperMaster')));
const PaperSizeMaster = Loadable(lazy(() => import('pages/admin/masters/PaperSizeMaster')));
const PageTypeMaster = Loadable(lazy(() => import('pages/admin/masters/PageTypeMaster')));
const OrderStatusMaster = Loadable(lazy(() => import('pages/admin/masters/OrderStatusMaster')));
const DocumentTypeMaster = Loadable(lazy(() => import('pages/admin/masters/DocumentTypeMaster')));
const DeliveryTypeMaster = Loadable(lazy(() => import('pages/admin/masters/DeliveryTypeMaster')));
const CoverDesignTypeMaster = Loadable(lazy(() => import('pages/admin/masters/CoverDesignTypeMaster')));
const ContentPositionMaster = Loadable(lazy(() => import('pages/admin/masters/ContentPositionMaster')));
const BindingTypeMaster = Loadable(lazy(() => import('pages/admin/masters/BindingTypeMaster')));
const BindingCoverMaterialMaster = Loadable(lazy(() => import('pages/admin/masters/BindingCoverMaterialMaster')));
const PrintingRateMaster = Loadable(lazy(() => import('pages/admin/masters/PrintingRateMaster')));
const OtherChargeMaster = Loadable(lazy(() => import('pages/admin/masters/OtherChargeMaster')));
const BindingRateMaster = Loadable(lazy(() => import('pages/admin/masters/BindingRateMaster')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: (
    <RequireAuth>
      <DashboardLayout />
    </RequireAuth>
  ),
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
        },
        {
          path: 'masters',
          children: [
            {
              path: 'spine-printing-options',
              element: <SpinePrintingOptionMaster />
            },
            {
              path: 'process-stages',
              element: <ProcessStageMaster />
            },
            {
              path: 'printing-types',
              element: <PrintingTypeMaster />
            },
            {
              path: 'print-colors',
              element: <PrintColorMaster />
            },
            {
              path: 'papers',
              element: <PaperMaster />
            },
            {
              path: 'paper-sizes',
              element: <PaperSizeMaster />
            },
            {
              path: 'page-types',
              element: <PageTypeMaster />
            },
            {
              path: 'order-statuses',
              element: <OrderStatusMaster />
            },
            {
              path: 'document-types',
              element: <DocumentTypeMaster />
            },
            {
              path: 'delivery-types',
              element: <DeliveryTypeMaster />
            },
            {
              path: 'cover-design-types',
              element: <CoverDesignTypeMaster />
            },
            {
              path: 'content-positions',
              element: <ContentPositionMaster />
            },
            {
              path: 'binding-types',
              element: <BindingTypeMaster />
            },
            {
              path: 'binding-cover-materials',
              element: <BindingCoverMaterialMaster />
            },
            {
              path: 'printing-rates',
              element: <PrintingRateMaster />
            },
            {
              path: 'other-charges',
              element: <OtherChargeMaster />
            },
            {
              path: 'binding-rates',
              element: <BindingRateMaster />
            }
          ]
        }
      ]
    }
  ]
};

export default MainRoutes;
