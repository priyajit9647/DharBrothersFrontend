// assets
import { BarChartOutlined, ApartmentOutlined, DatabaseOutlined, BellOutlined, SettingOutlined, LockOutlined } from '@ant-design/icons';

// icons
const icons = {
  BarChartOutlined,
  ApartmentOutlined,
  DatabaseOutlined,
  BellOutlined,
  SettingOutlined,
  LockOutlined
};

// ==============================|| MENU ITEMS - ADMIN & INSIGHTS (BMS) ||============================== //

const support = {
  id: 'admin-insights',
  title: 'Admin & Insights',
  type: 'group',
  children: [
    {
      id: 'reports',
      title: 'Reports & Insights',
      type: 'collapse',
      icon: icons.BarChartOutlined,
      access: 'REPORTS_INSIGHTS_MGMT',
      children: [
        {
          id: 'delay-reports',
          title: 'Delay Reports',
          type: 'item',
          url: '/reports/delay-reports',
          access: 'DELAY_REPORTS_MGMT'
        },
        {
          id: 'open-jobs-report',
          title: 'Open Jobs Report',
          type: 'item',
          url: '/reports/open-jobs',
          access: 'OPEN_JOBS_REPORT_MGMT'
        },
        {
          id: 'ready-to-dispatch',
          title: 'Ready To Dispatch',
          type: 'item',
          url: '/reports/ready-to-dispatch',
          access: 'READY_TO_DISPATCH_MGMT'
        },
        {
          id: 'complete-jobs-report',
          title: 'Complete Jobs Report',
          type: 'item',
          url: '/reports/complete-jobs',
          access: 'COMPLETE_JOBS_REPORT_MGMT'
        }
        ,
        {
          id: 'sales-report',
          title: 'Sales Report',
          type: 'item',
          url: '/reports/sales',
          access: 'SALES_REPORT_MGMT'
        },
        {
          id: 'gst-reports',
          title: 'GST Reports',
          type: 'item',
          url: '/reports/gst-reports'
        },
        {
          id: 'company-cash-collection',
          title: 'Cash Collection',
          type: 'item',
          url: '/reports/company-cash-collection'
        }
      ]
    },
    {
      id: 'branches-teams',
      title: 'Branches & Teams',
      type: 'collapse',
      icon: icons.ApartmentOutlined,
      children: [
        {
          id: 'branches',
          title: 'Branches',
          type: 'item',
          url: '/admin/branches',
          access: 'BRANCHES_SUB_MGMT'
        },
        {
          id: 'teams',
          title: 'Teams',
          type: 'item',
          url: '/admin/teams',
          access: ['BRANCHES_TEAMS_MGMT', 'TEAMS_SUB_MGMT']
        },
        {
          id: 'payment-details',
          title: 'Payment Details',
          type: 'item',
          url: '/admin/payment-details',
          access: 'PAYMENT_DETAILS_MGMT'
        },
        {
          id: 'process-stage-assignment',
          title: 'Stage Assignments',
          type: 'item',
          url: '/admin/masters/process-stage-assignments',
          access: 'STAGE_ASSIGNMENTS_SUB_MGMT'
        }
      ]
    },
    
    {
      id: 'notification-templates',
      title: 'Notification History',
      type: 'collapse',
      icon: icons.BellOutlined,
      access: 'NOTIFICATION_HISTORY_MGMT',
      children: [
        {
          id: 'notification-email',
          title: 'Email Notification',
          type: 'item',
          url: '/admin/notifications/email',
          access: 'EMAIL_NOTIFICATION_MGMT'
        },
        {
          id: 'whatsapp-notifications',
          title: 'WhatsApp Notifications',
          type: 'item',
          url: '/admin/notifications/whatsapp-history',
          access: 'WHATSAPP_NOTIFICATIONS_MGMT'
        },
        {
          id: 'in-app-notifications',
          title: 'In-App Notifications',
          type: 'item',
          url: '/admin/notifications/in-app',
          access: 'IN_APP_NOTIFICATIONS_MGMT'
        }
      ]
    },
    {
      id: 'masters',
      title: 'Masters',
      type: 'collapse',
      icon: icons.SettingOutlined,
      access: 'MASTERS_MGMT',
      children: [
        {
          id: 'process-stage-master',
          title: 'Process Stages',
          type: 'item',
          url: '/admin/masters/process-stages',
          access: 'PROCESS_STAGES_MGMT'
        },
        {
          id: 'printing-type-master',
          title: 'Printing Types',
          type: 'item',
          url: '/admin/masters/printing-types',
          access: 'PRINTING_TYPES_MGMT'
        },
        {
          id: 'print-color-master',
          title: 'Print Colors',
          type: 'item',
          url: '/admin/masters/print-colors',
          access: 'PRINT_COLORS_MGMT'
        },
        {
          id: 'paper-master',
          title: 'Papers',
          type: 'item',
          url: '/admin/masters/papers',
          access: 'PAPERS_MGMT'
        },
        {
          id: 'paper-size-master',
          title: 'Paper Sizes',
          type: 'item',
          url: '/admin/masters/paper-sizes',
          access: 'PAPER_SIZES_MGMT'
        },
        {
          id: 'page-type-master',
          title: 'Page Types',
          type: 'item',
          url: '/admin/masters/page-types',
          access: 'PAGE_TYPES_MGMT'
        },
        {
          id: 'binding-type-master',
          title: 'Binding Types',
          type: 'item',
          url: '/admin/masters/binding-types',
          access: 'BINDING_TYPES_MGMT'
        },
        {
          id: 'binding-cover-material-master',
          title: 'Binding Cover Materials',
          type: 'item',
          url: '/admin/masters/binding-cover-materials',
          access: 'BINDING_COVER_MATERIALS_MGMT'
        },
        {
          id: 'printing-rate-master',
          title: 'Printing Rates',
          type: 'item',
          url: '/admin/masters/printing-rates',
          access: ['PRINTING_RATES_MGMT', 'BINDING_RATES_MGMT']
        },
        {
          id: 'other-charge-master',
          title: 'Other Charges',
          type: 'item',
          url: '/admin/masters/other-charges',
          access: 'OTHER_CHARGES_MGMT'
        },
        {
          id: 'binding-rate-master',
          title: 'Binding Rates',
          type: 'item',
          url: '/admin/masters/binding-rates',
          access: 'BINDING_RATES_MGMT'
        }
      ]
    },
    {
      id: 'template',
      title: 'Template',
      type: 'item',
      icon: icons.DatabaseOutlined,
      url: '/admin/template',
      access: 'TEMPLATE_MGMT'
    }
    ,
    {
      id: 'update-access-rights',
      title: 'Update Access Rights',
      type: 'item',
      hidden: true,
      icon: icons.LockOutlined,
      url: '/admin/update-access-rights'
    }
  ]
};

export default support;
