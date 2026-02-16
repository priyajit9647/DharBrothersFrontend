import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, matchPath, Link } from 'react-router-dom';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

// project imports
import NavItem from './NavItem';
import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';

// ==============================|| NAVIGATION - COLLAPSIBLE GROUP ITEM ||============================== //

export default function NavCollapse({ item, level = 1 }) {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  const { pathname } = useLocation();

  const hasChildSelected = useMemo(
    () =>
      item.children?.some((child) => {
        if (!child.url) return false;
        return !!matchPath({ path: child.link ? child.link : child.url, end: false }, pathname);
      }) ?? false,
    [item.children, pathname]
  );

  const [open, setOpen] = useState(hasChildSelected);

  useEffect(() => {
    setOpen(hasChildSelected);
  }, [hasChildSelected]);

  const Icon = item.icon;
  const itemIcon = item.icon ? (
    <Icon
      style={{
        fontSize: drawerOpen ? '1rem' : '1.25rem'
      }}
    />
  ) : null;

  const handleToggle = () => {
    if (downLG) {
      handlerDrawerOpen(true);
    }
    setOpen((prev) => !prev);
  };

  const textColor = 'text.primary';
  const iconSelectedColor = 'primary.main';

  return (
    <Box sx={{ position: 'relative' }}>
      <ListItemButton
        onClick={handleToggle}
        sx={(theme) => ({
          zIndex: 1201,
          pl: drawerOpen ? `${level * 28}px` : 1.5,
          py: !drawerOpen && level === 1 ? 1.25 : 1,
          ...(drawerOpen && {
            '&:hover': { bgcolor: 'primary.lighter' },
            ...(hasChildSelected && {
              bgcolor: 'primary.lighter',
              borderRight: '2px solid',
              borderColor: 'primary.main',
              color: iconSelectedColor,
              '&:hover': { color: iconSelectedColor, bgcolor: 'primary.lighter' }
            })
          }),
          ...(!drawerOpen && {
            '&:hover': { bgcolor: 'transparent' }
          })
        })}
      >
        {itemIcon && (
          <ListItemIcon
            sx={{
              minWidth: 28,
              color: hasChildSelected ? iconSelectedColor : textColor
            }}
          >
            {itemIcon}
          </ListItemIcon>
        )}
        {(drawerOpen || (!drawerOpen && level !== 1)) && (
          <ListItemText
            primary={
              <Typography variant="h6" sx={{ color: hasChildSelected ? iconSelectedColor : textColor }}>
                {item.title}
              </Typography>
            }
          />
        )}
      </ListItemButton>

      <Collapse in={open && drawerOpen} timeout="auto" unmountOnExit>
        <List disablePadding>
          {item.children?.map((child) => (
            <NavItem key={child.id} item={child} level={level + 1} />
          ))}
        </List>
      </Collapse>
    </Box>
  );
}

NavCollapse.propTypes = {
  item: PropTypes.object.isRequired,
  level: PropTypes.number
};
