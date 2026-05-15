import { alpha, useTheme } from '@mui/material/styles';
import { Box, Chip, Skeleton, Stack, Typography } from '@mui/material';

export const defaultData = {
  onlineCount: 24,
  offlineCount: 16,
  onlineLabel: 'Online Placements',
  offlineLabel: 'Offline Placements',
  onlineColor: '#2f6df6',
  offlineColor: '#10b981'
};

const formatPercent = (value, total) => {
  const safeTotal = Math.max(Number(total) || 0, 0);
  if (!safeTotal) return '0%';
  return `${Math.round(((Number(value) || 0) / safeTotal) * 100)}%`;
};

const getDonutDash = (value, total, circumference, gap) => {
  if (!total || total <= 0) {
    return `0 ${circumference}`;
  }
  const ratio = Math.max(0, Math.min(1, Number(value) / total));
  const length = ratio * circumference;
  return `${Math.max(length - gap, 0)} ${Math.max(circumference - (length - gap), 0)}`;
};

export default function PlacementAnalyticsCard({
  title = 'Placement Type Analytics',
  onlineCount = 0,
  offlineCount = 0,
  totalCount,
  onlineLabel = 'Online Placements',
  offlineLabel = 'Offline Placements',
  onlineColor = defaultData.onlineColor,
  offlineColor = defaultData.offlineColor,
  loading = false,
  sx = {}
}) {
  const theme = useTheme();
  const total = totalCount != null ? Number(totalCount) : Number(onlineCount || 0) + Number(offlineCount || 0);
  const safeTotal = Math.max(total, 0);
  const onlineValue = Math.max(Number(onlineCount) || 0, 0);
  const offlineValue = Math.max(Number(offlineCount) || 0, 0);
  const onlinePercent = safeTotal ? Math.round((onlineValue / safeTotal) * 100) : 0;
  const offlinePercent = safeTotal ? Math.round((offlineValue / safeTotal) * 100) : 0;
  const chartRadius = 86;
  const chartStroke = 18;
  const gap = 6;
  const circumference = 2 * Math.PI * chartRadius;
  const onlineDash = getDonutDash(onlineValue, safeTotal, circumference, gap);
  const offlineDash = getDonutDash(offlineValue, safeTotal, circumference, gap);
  const onlineLen = safeTotal ? (onlineValue / safeTotal) * circumference : 0;

  if (loading) {
    return (
      <Box
        component="section"
        sx={{
          minWidth: 0,
          width: '100%',
          borderRadius: 3,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[1],
          p: { xs: 2.5, sm: 3 },
          ...sx
        }}
      >
        <Stack spacing={2}>
          <Skeleton variant="text" width={180} height={30} />
          <Skeleton variant="rectangular" width="100%" height={220} sx={{ borderRadius: 3 }} />
          <Stack direction="row" spacing={1}>
            <Skeleton variant="rectangular" width={120} height={32} sx={{ borderRadius: 99 }} />
            <Skeleton variant="rectangular" width={120} height={32} sx={{ borderRadius: 99 }} />
          </Stack>
        </Stack>
      </Box>
    );
  }

  if (!safeTotal) {
    return (
      <Box
        component="section"
        sx={{
          minWidth: 0,
          width: '100%',
          borderRadius: 3,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[1],
          p: { xs: 2.5, sm: 3 },
          ...sx
        }}
      >
        <Stack spacing={1.5} alignItems="center" justifyContent="center" sx={{ py: 6 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            No placement data is available yet. Connect your placement feed or refresh the dashboard to see updated metrics.
          </Typography>
        </Stack>
      </Box>
    );
  }

  const segments = [
    { label: onlineLabel, count: onlineValue, percent: onlinePercent, color: onlineColor },
    { label: offlineLabel, count: offlineValue, percent: offlinePercent, color: offlineColor }
  ];

  return (
    <Box
      component="section"
      sx={{
        minWidth: 0,
        width: '100%',
        borderRadius: 3,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[1],
        p: { xs: 2.5, sm: 3 },
        ...sx
      }}
    >
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
            {title}
          </Typography>
          <Chip
            label="Placement mix"
            size="small"
            sx={{
              height: 28,
              color: theme.palette.text.secondary,
              borderColor: theme.palette.divider,
              bgcolor: alpha(theme.palette.action.selected, 0.08)
            }}
          />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '260px minmax(0, 1fr)' },
            gap: 3,
            alignItems: 'center'
          }}
        >
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: 260,
              minHeight: 260,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.04)
            }}
          >
            <Box component="svg" viewBox="0 0 240 240" sx={{ width: '100%', height: 'auto' }}>
              <g transform="translate(120,120) rotate(-90)">
                <circle
                  cx="0"
                  cy="0"
                  r={chartRadius}
                  fill="transparent"
                  stroke={alpha(theme.palette.grey[500], 0.12)}
                  strokeWidth={chartStroke}
                />

                <circle
                  cx="0"
                  cy="0"
                  r={chartRadius}
                  fill="transparent"
                  stroke={onlineColor}
                  strokeWidth={chartStroke}
                  strokeLinecap="round"
                  strokeDasharray={onlineDash}
                  style={{ transition: 'stroke-dasharray 700ms ease' }}
                />

                <circle
                  cx="0"
                  cy="0"
                  r={chartRadius}
                  fill="transparent"
                  stroke={offlineColor}
                  strokeWidth={chartStroke}
                  strokeLinecap="round"
                  strokeDasharray={offlineDash}
                  strokeDashoffset={-onlineLen}
                  style={{ transition: 'stroke-dasharray 700ms ease, stroke-dashoffset 700ms ease' }}
                />
              </g>
            </Box>

            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                pointerEvents: 'none'
              }}
            >
              <Stack spacing={0.5} alignItems="center">
                <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1 }}>
                  {safeTotal}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Jobs
                </Typography>
              </Stack>
            </Box>
          </Box>

          <Stack spacing={2} sx={{ width: '100%' }}>
            {segments.map((segment) => (
              <Box
                key={segment.label}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  py: 1.5,
                  px: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.grey[100], 0.8)
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: segment.color }} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {segment.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {segment.count} jobs
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {segment.percent}%
                  </Typography>
                  <Chip
                    label={formatPercent(segment.count, safeTotal)}
                    size="small"
                    sx={{
                      bgcolor: alpha(segment.color, 0.14),
                      color: segment.color,
                      fontWeight: 700,
                      height: 28,
                      borderRadius: 1.5
                    }}
                  />
                </Box>
              </Box>
            ))}

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                pt: 1,
                mt: 1,
                borderTop: `1px solid ${theme.palette.divider}`
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                Total placements
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {safeTotal}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
