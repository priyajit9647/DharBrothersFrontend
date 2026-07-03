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
      icon: icons.ProjectOutlined
    },
    {
      id: 'my-jobs',
      title: 'Print Dashboard',
      type: 'item',
      url: '/print-dashboard',
      icon: icons.ScheduleOutlined
    },
    {
      id: 'bind-dashboard',
      title: 'Bind Dashboard',
      type: 'item',
      url: '/bind-dashboard',
      icon: icons.ScheduleOutlined
    },
    {
      id: 'extra-tasks',
      title: 'Extra Tasks',
      type: 'item',
      url: '/extra-tasks',
      icon: icons.ProjectOutlined
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      type: 'item',
      url: '/whatsapp',
      icon: icons.SendOutlined
    },
    {
      id: 'email',
      title: 'Email Inbox',
      type: 'item',
      url: '/email',
      icon: icons.MailOutlined
    },
    
    {
      id: 'delivery-dispatch',
      title: 'Delivery & Dispatch',
      type: 'item',
      url: '/delivery',
      icon: icons.SendOutlined
    }
  ]
};

export default utilities;
