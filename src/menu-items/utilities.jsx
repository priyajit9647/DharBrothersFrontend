// assets
import { ProjectOutlined, ScheduleOutlined, ShoppingCartOutlined, SendOutlined, MailOutlined } from '@ant-design/icons';

// icons
const icons = {
  ProjectOutlined,
  ScheduleOutlined,
  ShoppingCartOutlined,
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
      title: 'My Jobs',
      type: 'item',
      url: '/my-jobs',
      icon: icons.ScheduleOutlined
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
      icon: icons.MailOutlined,
      breadcrumbs: false
    },
    {
      id: 'orders-intake',
      title: 'Orders & Intake',
      type: 'item',
      url: '/orders',
      icon: icons.ShoppingCartOutlined
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
