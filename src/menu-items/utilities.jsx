// assets
import { ProjectOutlined, ScheduleOutlined, ShoppingCartOutlined, SendOutlined } from '@ant-design/icons';

// icons
const icons = {
  ProjectOutlined,
  ScheduleOutlined,
  ShoppingCartOutlined,
  SendOutlined
};

// ==============================|| MENU ITEMS - OPERATIONS (BMS) ||============================== //

const utilities = {
  id: 'operations',
  title: 'Operations',
  type: 'group',
  children: [
    {
      id: 'jobs-board',
      title: 'Jobs Board',
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
