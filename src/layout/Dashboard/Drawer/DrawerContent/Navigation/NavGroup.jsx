import PropTypes from 'prop-types';
// material-ui
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project import
import NavItem from './NavItem';
import NavCollapse from './NavCollapse';
import { useGetMenuMaster } from 'api/menu';
import useAccess from 'hooks/useAccess';

// ==============================|| NAVIGATION - LIST GROUP ||============================== //

export default function NavGroup({ item }) {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const { hasAccess } = useAccess();

  const visibleChildren = (item.children || []).filter((m) => {
    if (m.hidden) return false;
    
    // Check access for the item itself
    if (m.access) {
      const accessArray = Array.isArray(m.access) ? m.access : [m.access];
      if (!accessArray.some((right) => hasAccess(right))) return false;
    }

    // If it's a collapse, check if any of its children are visible.
    // This prevents showing an empty collapsible menu.
    if (m.type === 'collapse' && m.children) {
      const anyVisibleChild = m.children.some((child) => {
        if (child.hidden) return false;
        if (child.access) {
          const childAccessArray = Array.isArray(child.access) ? child.access : [child.access];
          return childAccessArray.some((right) => hasAccess(right));
        }
        return true;
      });
      if (!anyVisibleChild) return false;
    }

    return true;
  });

  if (visibleChildren.length === 0) return null;

  const navCollapse = visibleChildren.map((menuItem) => {
    switch (menuItem.type) {
      case 'collapse':
        return <NavCollapse key={menuItem.id} item={menuItem} level={1} />;
      case 'item':
        return <NavItem key={menuItem.id} item={menuItem} level={1} />;
      default:
        return (
          <Typography key={menuItem.id} variant="h6" color="error" align="center">
            Fix - Group Collapse or Items
          </Typography>
        );
    }
  });

  return (
    <List
      subheader={
        item.title &&
        drawerOpen && (
          <Box sx={{ pl: 3, mb: 1.5 }}>
            <Typography variant="subtitle2" color="textSecondary">
              {item.title}
            </Typography>
            {/* only available in paid version */}
          </Box>
        )
      }
      sx={{ mb: drawerOpen ? 1.5 : 0, py: 0, zIndex: 0 }}
    >
      {navCollapse}
    </List>
  );
}

NavGroup.propTypes = { item: PropTypes.object };
