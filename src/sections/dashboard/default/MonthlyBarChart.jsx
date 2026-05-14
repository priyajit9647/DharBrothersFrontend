import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

// material-ui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import { BarChart } from '@mui/x-charts/BarChart';
import { getThroughputAnalytics } from 'api/dashboard';
import { useAuth } from 'hooks/useAuth';

const DEFAULT_DAYS = 7;

function resolveBranchId(user) {
  return user?.branchId ?? user?.branch?.id ?? user?.branch?.branchId ?? user?.profile?.branchId ?? null;
}

function normalizePoint(item, index) {
  if (item == null) {
    return { label: `Day ${index + 1}`, value: 0 };
  }

  if (typeof item === 'number') {
    return { label: `Day ${index + 1}`, value: item };
  }

  if (typeof item === 'string') {
    const numericValue = Number(item);
    return {
      label: `Day ${index + 1}`,
      value: Number.isNaN(numericValue) ? 0 : numericValue
    };
  }

  const label = item.label ?? item.date ?? item.day ?? item.createdDate ?? item.createdAt ?? item.bucket ?? `Day ${index + 1}`;
  const rawValue = item.value ?? item.count ?? item.jobs ?? item.totalJobs ?? item.processedJobs ?? item.total ?? item.quantity ?? 0;
  const numericValue = Number(rawValue);

  return {
    label: String(label),
    value: Number.isNaN(numericValue) ? 0 : numericValue
  };
}

// ==============================|| MONTHLY BAR CHART ||============================== //

export default function MonthlyBarChart({ branchId: branchIdProp, days = DEFAULT_DAYS }) {
  const theme = useTheme();
  const { user } = useAuth();
  const branchId = branchIdProp ?? resolveBranchId(user);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadThroughput = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await getThroughputAnalytics({ branchId, days });

        if (!active) return;

        const normalized = Array.isArray(data) ? data.map(normalizePoint).filter(Boolean) : [];
        setPoints(normalized);
      } catch (fetchError) {
        if (!active) return;

        setError(fetchError?.message || 'Failed to load throughput analytics');
        setPoints([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadThroughput();

    return () => {
      active = false;
    };
  }, [branchId, days]);

  const labels = useMemo(() => points.map((point) => point.label), [points]);
  const values = useMemo(() => points.map((point) => point.value), [points]);
  const total = useMemo(() => values.reduce((sum, value) => sum + (Number(value) || 0), 0), [values]);

  return (
    <Stack sx={{ gap: 1 }}>
      <Box sx={{ p: 3, pb: 0 }}>
        <Stack sx={{ gap: 1 }}>
          <Typography variant="h6" color="text.secondary">
            Jobs processed in last {days} days
          </Typography>
          <Typography variant="h3">{loading ? '—' : total.toLocaleString()}</Typography>
          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}
        </Stack>
      </Box>
      <BarChart
        hideLegend
        height={320}
        series={[{ data: values, label: 'Throughput' }]}
        xAxis={[{ data: labels, scaleType: 'band', tickSize: 7, disableLine: true, categoryGapRatio: 0.4 }]}
        yAxis={[{ position: 'none' }]}
        slotProps={{ bar: { rx: 5, ry: 5 } }}
        axisHighlight={{ x: 'none' }}
        margin={{ left: 20, right: 20 }}
        colors={[theme.vars.palette.info.light]}
        sx={{
          '& .MuiBarElement-root:hover': { opacity: 0.6 },
          '& .MuiChartsAxis-root.MuiChartsAxis-directionX .MuiChartsAxis-tick': { stroke: 'transparent' }
        }}
      />
    </Stack>
  );
}

MonthlyBarChart.propTypes = {
  branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  days: PropTypes.number
};
