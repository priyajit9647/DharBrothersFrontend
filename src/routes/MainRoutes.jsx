import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import RequireAuth from './RequireAuth';

// render - Dashboard
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));

// render - BMS Operations
const OrderBoard = Loadable(lazy(() => import('pages/operations/OrderBoard')));
const MyJobs = Loadable(lazy(() => import('pages/operations/MyJobs')));
const OrdersIntake = Loadable(lazy(() => import('pages/operations/Orders')));
const DeliveryDispatch = Loadable(lazy(() => import('pages/operations/Delivery')));
const Whatsapp = Loadable(lazy(() => import('pages/operations/Whatsapp')));
const Email = Loadable(lazy(() => import('pages/operations/Email')));


// render - BMS Admin & Insights
const ReportsOverview = Loadable(lazy(() => import('pages/reports/Overview')));
const NotificationReports = Loadable(lazy(() => import('pages/reports/NotificationReports')));
const Branches = Loadable(lazy(() => import('pages/admin/Branches')));
const Teams = Loadable(lazy(() => import('pages/admin/Teams')));
const DocumentVersionController = Loadable(lazy(() => import('pages/admin/DocumentVersionController')));
const AdminUsers = Loadable(lazy(() => import('pages/admin/AdminUsers')));
const Materials = Loadable(lazy(() => import('pages/admin/Materials')));
const NotificationTemplates = Loadable(lazy(() => import('pages/admin/NotificationTemplates')));
const NotificationEmail = Loadable(lazy(() => import('pages/admin/NotificationEmail')));
const WhatsappNotifications = Loadable(lazy(() => import('pages/admin/WhatsappNotifications')));
const InAppNotifications = Loadable(lazy(() => import('pages/admin/InAppNotifications')));
const SystemSettings = Loadable(lazy(() => import('pages/admin/Settings')));
const Template = Loadable(lazy(() => import('pages/admin/Template')));
const ProcessStageMaster = Loadable(lazy(() => import('pages/admin/masters/ProcessStageMaster')));
const ProcessStageAssignment = Loadable(lazy(() => import('pages/admin/masters/ProcessStageAssignment')));
const PrintingTypeMaster = Loadable(lazy(() => import('pages/admin/masters/PrintingTypeMaster')));
const PrintColorMaster = Loadable(lazy(() => import('pages/admin/masters/PrintColorMaster')));
const PaperMaster = Loadable(lazy(() => import('pages/admin/masters/PaperMaster')));
const PaperSizeMaster = Loadable(lazy(() => import('pages/admin/masters/PaperSizeMaster')));
const PageTypeMaster = Loadable(lazy(() => import('pages/admin/masters/PageTypeMaster')));
const BindingTypeMaster = Loadable(lazy(() => import('pages/admin/masters/BindingTypeMaster')));
const BindingCoverMaterialMaster = Loadable(lazy(() => import('pages/admin/masters/BindingCoverMaterialMaster')));
const PrintingRateMaster = Loadable(lazy(() => import('pages/admin/masters/PrintingRateMaster')));
const OtherChargeMaster = Loadable(lazy(() => import('pages/admin/masters/OtherChargeMaster')));
const BindingRateMaster = Loadable(lazy(() => import('pages/admin/masters/BindingRateMaster')));
const PaymentConfigurationMaster = Loadable(lazy(() => import('pages/admin/PaymentConfigurationMaster')));
const EmailTemplate = Loadable(lazy(() => import('pages/admin/templates/EmailTemplate')));
const WhatsappTemplate = Loadable(lazy(() => import('pages/admin/templates/WhatsappTemplate')));
const InAppTemplate = Loadable(lazy(() => import('pages/admin/templates/InAppTemplate')));

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
      element: <OrderBoard />
    },
    {
      path: 'my-jobs',
      element: <MyJobs />
    },
    {
      path: 'whatsapp',
      element: <Whatsapp />
    },
    {
      path: 'email',
      element: <Email />
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
      children: [
        {
          path: '',
          element: <ReportsOverview />
        },
        {
          path: 'notifications',
          element: <NotificationReports />
        }
      ]
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
          path: 'teams',
          element: <Teams />
        },
        {
          path: 'payment-details',
          element: <PaymentConfigurationMaster />
        },
        {
          path: 'documents',
          element: <DocumentVersionController />
        },
        {
          path: 'template',
          children: [
            {
              path: '',
              element: <Template />
            },
            {
              path: 'email',
              element: <EmailTemplate />
            },
            {
              path: 'whatsapp',
              element: <WhatsappTemplate />
            },
            {
              path: 'in-app',
              element: <InAppTemplate />
            }
          ]
        },
        {
          path: 'users',
          element: <AdminUsers />
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
          path: 'notifications/email',
          element: <NotificationEmail />
        },
        {
          path: 'notifications/whatsapp-history',
          element: <WhatsappNotifications />
        },
        {
          path: 'notifications/in-app',
          element: <InAppNotifications />
        },
        {
          path: 'settings',
          element: <SystemSettings />
        },
        {
          path: 'masters',
          children: [
            {
              path: 'process-stages',
              element: <ProcessStageMaster />
            },
            {
              path: 'process-stage-assignments',
              element: <ProcessStageAssignment />
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
