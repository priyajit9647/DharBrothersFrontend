// assets
import { ProjectOutlined, ScheduleOutlined, SendOutlined, MailOutlined } from '@ant-design/icons';

// icons
const icons = {
  ProjectOutlined,
  ScheduleOutlined,
  SendOutlined,
  MailOutlined
};

// ==============================|| MENU ITEMS - OPERATIONS (BMS) ||============================== //

const utilities = {
  id: 'operations',
  title: 'Operations',
  type: 'group',
  children: [
    {
      id: 'order-board',
      title: 'Order Board',
      type: 'item',
      url: '/jobs',
      icon: icons.ProjectOutlined,
      access: 'ORDER_BOARD_MGMT'
    },
    {
      id: 'my-jobs',
      title: 'Print Dashboard',
      type: 'item',
      url: '/print-dashboard',
      icon: icons.ScheduleOutlined,
      access: 'PRINTING_DASHBOARD_MGMT'
    },
    {
      id: 'bind-dashboard',
      title: 'Bind Dashboard',
      type: 'item',
      url: '/bind-dashboard',
      icon: icons.ScheduleOutlined,
      access: 'BINDING_DASHBOARD_MGMT'
    },
    {
      id: 'extra-tasks',
      title: 'Extra Tasks',
      type: 'item',
      url: '/extra-tasks',
      icon: icons.ProjectOutlined,
      access: 'EXTRA_JOBS_MGMT'
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      type: 'item',
      url: '/whatsapp',
      icon: icons.SendOutlined,
      access: 'WHATSAPP_MGMT'
    },
    {
      id: 'email',
      title: 'Email Inbox',
      type: 'item',
      url: '/email',
      icon: icons.MailOutlined,
      access: 'EMAIL_INBOX_MGMT'
    },
    
    {
      id: 'delivery-dispatch',
      title: 'Delivery & Dispatch',
      type: 'item',
      url: '/delivery',
      icon: icons.SendOutlined,
      access: 'READY_TO_DISPATCH_MGMT'
    }
  ]
};

export default utilities;
