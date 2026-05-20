import { useEffect, useMemo, useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';

// material-ui
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import MonthlyBarChart from 'sections/dashboard/default/MonthlyBarChart';
import ReportAreaChart from 'sections/dashboard/default/ReportAreaChart';
import UniqueVisitorCard from 'sections/dashboard/default/UniqueVisitorCard';
import OrdersTable from 'sections/dashboard/default/OrdersTable';
import { getDashboardKpis } from 'api/dashboard';
import PlacementTypeAnalytics from 'components/cards/PlacementTypeAnalytics';
import { useAuth } from 'hooks/useAuth';
import { formatLabel } from 'utils/formatLabel';
import { requestPermissionAndRegister, listenForMessages } from 'firebase/messaging';

// assets
import CarryOutOutlined from '@ant-design/icons/CarryOutOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import ExclamationCircleOutlined from '@ant-design/icons/ExclamationCircleOutlined';
import EllipsisOutlined from '@ant-design/icons/EllipsisOutlined';
import TruckOutlined from '@ant-design/icons/TruckOutlined';

import avatar1 from 'assets/images/users/avatar-1.png';
import avatar2 from 'assets/images/users/avatar-2.png';
import avatar3 from 'assets/images/users/avatar-3.png';
import avatar4 from 'assets/images/users/avatar-4.png';

// ==============================|| DASHBOARD - DEFAULT ||============================== //

export default function DashboardDefault() {
  const [orderMenuAnchor, setOrderMenuAnchor] = useState(null);
  const [kpiCards, setKpiCards] = useState([]);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [kpiError, setKpiError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const branchId = useMemo(() => user?.branchId ?? user?.branch?.id ?? user?.branch?.branchId ?? user?.profile?.branchId ?? null, [user]);

  const fallbackCards = useMemo(
    () => [
      {
        key: 'openJobs',
        title: 'Open Jobs',
        count: '—',
        percentage: undefined,
        subtitle: 'Currently active production jobs',
        color: 'primary',
        accent: 'primary',
        icon: CarryOutOutlined,
        isLoss: false,
        link: '/reports/open-jobs'
      },
      {
        key: 'delayedJobs',
        title: 'Delayed Jobs',
        count: '—',
        percentage: undefined,
        subtitle: 'Jobs exceeding expected delivery timelines',
        color: 'warning',
        accent: 'warning',
        icon: ExclamationCircleOutlined,
        isLoss: true,
        link: '/reports/delay-reports'
      },
      {
        key: 'completedJobs',
        title: 'Jobs Completed',
        count: '—',
        percentage: undefined,
        subtitle: 'Successfully completed binding orders',
        color: 'success',
        accent: 'success',
        icon: CheckCircleOutlined,
        isLoss: false,
        link: '/reports/complete-jobs'
      },
      {
        key: 'readyForDispatch',
        title: 'Ready for Dispatch',
        count: '—',
        percentage: undefined,
        subtitle: 'Orders ready for shipment and dispatch',
        color: 'secondary',
        accent: 'secondary',
        icon: TruckOutlined,
        isLoss: false,
        link: '/reports/ready-to-dispatch'
      }
    ],
    []
  );

  useEffect(() => {
    let active = true;

    const loadKpis = async () => {
      setKpiLoading(true);
      setKpiError('');

      try {
        const data = await getDashboardKpis({ branchId });
        if (!active) return;

        setKpiCards(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        if (!active) return;

        setKpiError(fetchError?.message || 'Failed to load dashboard KPIs');
        setKpiCards([]);
      } finally {
        if (active) {
          setKpiLoading(false);
        }
      }
    };

    loadKpis();

    return () => {
      active = false;
    };
  }, [branchId]);

  // Prompt for push notifications on dashboard load (admin users).
  useEffect(() => {
    let mounted = true;
    const promptForPush = async () => {
      try {
        if (typeof window === 'undefined') return;
        // Use native browser permission prompt; helper will avoid re-prompting
        await requestPermissionAndRegister();
      } catch (e) {
        // ignore non-fatal errors
      }
    };

    promptForPush();

    // Start listening for foreground messages so the dashboard can react to them
    try {
      listenForMessages();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('listenForMessages error', e);
    }

    return () => {
      mounted = false;
    };
  }, [user]);

  const cardConfig = useMemo(() => {
    const cardByKey = new Map(kpiCards.map((card) => [String(card.key || card.title || '').toLowerCase(), card]));

    const aliases = {
      openJobs: ['openjobs', 'open jobs', 'open', 'openedjobs'],
      delayedJobs: ['delayedjobs', 'delayed jobs', 'delay', 'delayed'],
      completedJobs: ['completedjobs', 'jobs completed', 'completed', 'done'],
      readyForDispatch: ['readyfordispatch', 'ready for dispatch', 'dispatch', 'ready']
    };

    return fallbackCards.map((fallback) => {
      const fallbackKey = fallback.key;
      const found =
        cardByKey.get(String(fallbackKey).toLowerCase()) || (aliases[fallbackKey] || []).map((alias) => cardByKey.get(alias)).find(Boolean) || null;

      const resolvedTitle = formatLabel(found?.title ?? found?.key ?? fallback.title ?? fallbackKey);

      const { key: _omitKey, ...fallbackNoKey } = fallback;

      return {
        ...fallbackNoKey,
        title: resolvedTitle,
        count: found?.count ?? fallback.count,
        percentage: found?.percentage ?? fallback.percentage,
        isLoss: found?.isLoss ?? fallback.isLoss,
        subtitle: formatLabel(found?.extra ?? fallback.subtitle ?? ''),
        color: found?.color ?? fallback.color,
        accent: fallback.accent,
        icon: fallback.icon
      };
    });
  }, [fallbackCards, kpiCards]);

  const handleOrderMenuClick = (event) => {
    setOrderMenuAnchor(event.currentTarget);
  };
  const handleOrderMenuClose = () => {
    setOrderMenuAnchor(null);
  };

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* row 1 */}
      <Grid sx={{ mb: -2.25 }} size={12}>
        <Typography variant="h5">Binding Operations Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">
          Overview of jobs, delays, material usage and delivery performance across branches.
        </Typography>
        {kpiError && (
          <Typography variant="caption" color="error">
            {kpiError}
          </Typography>
        )}
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }} onClick={() => navigate(cardConfig[0].link)} style={{ cursor: 'pointer' }}>
        <AnalyticEcommerce {...cardConfig[0]} count={kpiLoading ? '—' : String(cardConfig[0]?.count ?? '—')} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }} onClick={() => navigate(cardConfig[1].link)} style={{ cursor: 'pointer' }}>
        <AnalyticEcommerce
          {...cardConfig[1]}
          count={kpiLoading ? '—' : String(cardConfig[1]?.count ?? '—')}
          isLoss={cardConfig[1]?.isLoss}
          color={cardConfig[1]?.color}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }} onClick={() => navigate(cardConfig[2].link)} style={{ cursor: 'pointer' }}>
        <AnalyticEcommerce {...cardConfig[2]} count={kpiLoading ? '—' : String(cardConfig[2]?.count ?? '—')} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }} onClick={() => navigate(cardConfig[3].link)} style={{ cursor: 'pointer' }}>
        <AnalyticEcommerce {...cardConfig[3]} count={kpiLoading ? '—' : String(cardConfig[3]?.count ?? '—')} />
      </Grid>
      <Grid sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }} size={{ md: 8 }} />
      {/* row 2 */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <UniqueVisitorCard />
      </Grid>
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Grid>
            <Typography variant="h5">Throughput Overview</Typography>
          </Grid>
          <Grid />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <MonthlyBarChart />
        </MainCard>
        <div style={{ marginTop: 16 }}>
          <PlacementTypeAnalytics />
        </div>
      </Grid>
      {/* row 3 */}
      <Grid size={{ xs: 12, md: 12, lg: 12 }}>
        <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Grid>
            <Typography variant="h5">Recent Orders</Typography>
          </Grid>
          <Grid>
            <IconButton onClick={handleOrderMenuClick}>
              <EllipsisOutlined style={{ fontSize: '1.25rem' }} />
            </IconButton>
            <Menu
              id="fade-menu"
              slotProps={{ list: { 'aria-labelledby': 'fade-button' } }}
              anchorEl={orderMenuAnchor}
              onClose={handleOrderMenuClose}
              open={Boolean(orderMenuAnchor)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={handleOrderMenuClose}>Export as CSV</MenuItem>
              <MenuItem onClick={handleOrderMenuClose}>Export as Excel</MenuItem>
              <MenuItem onClick={handleOrderMenuClose}>Print Table</MenuItem>
            </Menu>
          </Grid>
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <OrdersTable />
        </MainCard>
      </Grid>
      {/* Analytics Report removed */}
      {/* Job in Hand analytics card removed */}
      {/* row 4 (Help & Support Chat removed) */}
    </Grid>
  );
}
