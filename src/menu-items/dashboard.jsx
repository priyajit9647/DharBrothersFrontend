// assets
import {
  DashboardOutlined,
  MailOutlined,
  MessageOutlined
} from '@ant-design/icons';

// icons
const icons = {
  DashboardOutlined,
  MailOutlined,
  MessageOutlined
};

const dashboard = {
  id: 'group-dashboard',
  title: 'Navigation',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard/default',
      icon: icons.DashboardOutlined,
      breadcrumbs: false
    }
  ]
};

export default dashboard;


// ==============================|| MENU ITEMS - DASHBOARD ||============================== //


