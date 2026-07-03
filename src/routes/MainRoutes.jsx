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
const Binddashboard = Loadable(lazy(() => import('pages/operations/Binddashboard')));
const DeliveryDispatch = Loadable(lazy(() => import('pages/operations/Delivery')));
const OrderDetails = Loadable(lazy(() => import('pages/operations/OrderDetails')));
const Whatsapp = Loadable(lazy(() => import('pages/operations/Whatsapp')));
const Email = Loadable(lazy(() => import('pages/operations/Email')));
const ExtraTask = Loadable(lazy(() => import('pages/operations/ExtraTask')));


// render - BMS Admin & Insights
const NotificationReports = Loadable(lazy(() => import('pages/reports/NotificationReports')));
const DelayReports = Loadable(lazy(() => import('pages/reports/DelayReports')));
const OpenJobsReport = Loadable(lazy(() => import('pages/reports/OpenJobsReport')));
const ReadyToDispatch = Loadable(lazy(() => import('pages/reports/ReadyToDispatch')));
const CompleteJobsReport = Loadable(lazy(() => import('pages/reports/CompleteJobsReport')));
const SalesReport = Loadable(lazy(() => import('pages/reports/SalesReport')));
// TaskReports removed
const GstReports = Loadable(lazy(() => import('pages/reports/GstReports')));
const CompanyCashCollection = Loadable(lazy(() => import('pages/reports/CompanyCashCollection')));
const Branches = Loadable(lazy(() => import('pages/admin/Branches')));
const Teams = Loadable(lazy(() => import('pages/admin/Teams')));
const DocumentVersionController = Loadable(lazy(() => import('pages/admin/DocumentVersionController')));
const AdminUsers = Loadable(lazy(() => import('pages/admin/AdminUsers')));
const AdminOrderDetails = Loadable(lazy(() => import('pages/admin/OrderDetailsAdmin')));
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
const WebServicesMaster = Loadable(lazy(() => import('pages/admin/masters/WebServicesMaster')));
const PrintingRateMaster = Loadable(lazy(() => import('pages/admin/masters/PrintingRateMaster')));
const OtherChargeMaster = Loadable(lazy(() => import('pages/admin/masters/OtherChargeMaster')));
const BindingRateMaster = Loadable(lazy(() => import('pages/admin/masters/BindingRateMaster')));
const PaymentConfigurationMaster = Loadable(lazy(() => import('pages/admin/PaymentConfigurationMaster')));
const EmailTemplate = Loadable(lazy(() => import('pages/admin/templates/EmailTemplate')));
const WhatsappTemplate = Loadable(lazy(() => import('pages/admin/templates/WhatsappTemplate')));
const InAppTemplate = Loadable(lazy(() => import('pages/admin/templates/InAppTemplate')));
const UpdateAccessRights = Loadable(lazy(() => import('pages/admin/UpdateAccessRights')));

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
      path: 'print-dashboard',
      element: <MyJobs />
    },
    {
      path: 'bind-dashboard',
      element: <Binddashboard/>
    },
    {
      path: 'extra-tasks',
      element: <ExtraTask />
    },
    {
      path: 'orders/view/:orderId',
      element: <OrderDetails />
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
      path: 'delivery',
      element: <DeliveryDispatch />
    },
    
    // Reports & Insights
    {
      path: 'reports',
      children: [
        
        {
          path: 'delay-reports',
          element: <DelayReports />
        },
        {
          path: 'open-jobs',
          element: <OpenJobsReport />
        },
        {
          path: 'ready-to-dispatch',
          element: <ReadyToDispatch />
        },
        {
          path: 'complete-jobs',
          element: <CompleteJobsReport />
        },
        {
          path: 'sales',
          element: <SalesReport />
        },
        // Task Reports route removed
        {
          path: 'gst-reports',
          element: <GstReports />
        },
        {
          path: 'company-cash-collection',
          element: <CompanyCashCollection />
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
          path: 'orders',
          children: [
            {
              path: 'view/:orderId',
              element: <AdminOrderDetails />
            }
          ]
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
          path: 'update-access-rights',
          element: <UpdateAccessRights />
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
            ,
            {
              path: 'web-services',
              element: <WebServicesMaster />
            }
          ]
        }
      ]
    }
  ]
};

export default MainRoutes;
