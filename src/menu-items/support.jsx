// assets
import { BarChartOutlined, ApartmentOutlined, DatabaseOutlined, BellOutlined, SettingOutlined } from '@ant-design/icons';

// icons
const icons = {
  BarChartOutlined,
  ApartmentOutlined,
  DatabaseOutlined,
  BellOutlined,
  SettingOutlined
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
      type: 'item',
      url: '/reports',
      icon: icons.BarChartOutlined
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
          url: '/admin/branches'
        },
        {
          id: 'teams',
          title: 'Teams',
          type: 'item',
          url: '/admin/teams'
        }
      ]
    },
    {
      id: 'materials-inventory',
      title: 'Materials & Inventory',
      type: 'item',
      url: '/admin/materials',
      icon: icons.DatabaseOutlined
    },
    {
      id: 'notification-templates',
      title: 'Notification Templates',
      type: 'item',
      url: '/admin/notifications',
      icon: icons.BellOutlined
    },
        {
          id: 'masters',
          title: 'Masters',
          type: 'collapse',
          icon: icons.SettingOutlined,
          children: [
        {
          id: 'process-stage-master',
          title: 'Process Stages',
          type: 'item',
          url: '/admin/masters/process-stages'
        },
        {
          id: 'printing-type-master',
          title: 'Printing Types',
          type: 'item',
          url: '/admin/masters/printing-types'
        },
        {
          id: 'print-color-master',
          title: 'Print Colors',
          type: 'item',
          url: '/admin/masters/print-colors'
        },
        {
          id: 'paper-master',
          title: 'Papers',
          type: 'item',
          url: '/admin/masters/papers'
        },
        {
          id: 'paper-size-master',
          title: 'Paper Sizes',
          type: 'item',
          url: '/admin/masters/paper-sizes'
        },
        {
          id: 'page-type-master',
          title: 'Page Types',
          type: 'item',
          url: '/admin/masters/page-types'
        },
        {
          id: 'binding-type-master',
          title: 'Binding Types',
          type: 'item',
          url: '/admin/masters/binding-types'
        },
        {
          id: 'binding-cover-material-master',
          title: 'Binding Cover Materials',
          type: 'item',
          url: '/admin/masters/binding-cover-materials'
        },
        {
          id: 'printing-rate-master',
          title: 'Printing Rates',
          type: 'item',
          url: '/admin/masters/printing-rates'
        },
        {
          id: 'other-charge-master',
          title: 'Other Charges',
          type: 'item',
          url: '/admin/masters/other-charges'
        },
        {
          id: 'binding-rate-master',
          title: 'Binding Rates',
          type: 'item',
          url: '/admin/masters/binding-rates'
        }
      ]
    }
  ]
};

export default support;
