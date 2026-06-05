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

  // Show Masters group only if user has MASTERS_MGMT or at least one child-specific <RESOURCE>_MGMT right
  if (item.id === 'masters') {
    if (!hasAccess('MASTERS_MGMT')) {
      const children = item.children || [];
      const anyChildMgmt = children.some((m) => {
        if (m.hidden || !m.url) return false;
        try {
          const parts = m.url.split('/').filter(Boolean);
          const last = parts[parts.length - 1] || '';
          const base = last.replace(/-/g, '_').toUpperCase();
          const right = `${base}_MGMT`;
          return hasAccess(right);
        } catch (e) {
          return false;
        }
      });
      if (!anyChildMgmt) return null;
    }
  }


  const visibleChildren = (item.children || []).filter((m) => {
    if (m.hidden) return false;
    // for items under masters, require specific <RESOURCE>_MGMT right
    if (item.id === 'masters' && m.url) {
      try {
        const parts = m.url.split('/').filter(Boolean);
        const last = parts[parts.length - 1] || '';
        const base = last.replace(/-/g, '_').toUpperCase();
        const right = `${base}_MGMT`;
        return hasAccess(right);
      } catch (e) {
        return false;
      }
    }

    // Hide the Reports collapse entirely if user lacks REPORTS_INSIGHTS_MGMT
    if (m.id === 'reports') {
      if (!hasAccess('REPORTS_INSIGHTS_MGMT')) return false;
      return true;
    }

    // for items that are report pages (url contains '/reports/'), require REPORTS_MGMT or a specific report right
    if (m.url && m.url.includes('/reports/')) {
      try {
        const parts = m.url.split('/').filter(Boolean);
        const last = parts[parts.length - 1] || '';
        const base = last.replace(/-/g, '_').toUpperCase();
        const rightCandidates = [`${base}_REPORTS`, `${base}_REPORT`, `${base}_MGMT`];
        return hasAccess('REPORTS_INSIGHTS_MGMT') || rightCandidates.some((r) => hasAccess(r));
      } catch (e) {
        return false;
      }
    }

    return true;
  });
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
