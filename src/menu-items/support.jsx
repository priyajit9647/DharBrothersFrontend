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
      type: 'item',
      url: '/admin/branches',
      icon: icons.ApartmentOutlined
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
      id: 'system-settings',
      title: 'System Settings',
      type: 'item',
      url: '/admin/settings',
      icon: icons.SettingOutlined
    }
  ]
};

export default support;
