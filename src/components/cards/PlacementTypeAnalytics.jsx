import React, { useMemo, useState } from 'react'
import getPlacementTypeAnalytics from 'api/placementType';
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Divider from '@mui/material/Divider'

const defaultData = [
  { key: 'whatsapp', label: 'WhatsApp Order Count', count: 24, percent: 60, color: '#22c55e' },
  { key: 'email', label: 'Email Order Count', count: 16, percent: 40, color: '#2563eb' },
  { key: 'website', label: 'Website Order Count', count: 0, percent: 0, color: '#9333ea' }
]

export default function PlacementTypeAnalytics({ data = defaultData }) {

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [itemsData, setItemsData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const colorFallbacks = ['#2563eb', '#22c55e', '#9333ea', '#f97316', '#ef4444', '#06b6d4'];

  function normalizePlacementResponse(resp) {
    if (!resp) return [];

    // If response is array of items
    if (Array.isArray(resp)) {
      return resp.map((it, idx) => {
        const key = String(it.key ?? it.id ?? it.type ?? `item-${idx}`);
        const label = String(it.label ?? it.name ?? key);
        const count = Number(it.count ?? it.value ?? it.total ?? 0) || 0;
        return { key, label, count };
      });
    }

    // If response is an object map { whatsapp: 12, email: 5 }
    if (typeof resp === 'object') {
      return Object.entries(resp).map(([k, v]) => ({ key: k, label: String(k), count: Number(v) || 0 }));
    }

    return [];
  }

  async function handleApply() {
    setError(null);
    setLoading(true);
    try {
      const payload = {};
      if (startDate) payload.startDate = new Date(startDate).toISOString();
      if (endDate) payload.endDate = new Date(endDate).toISOString();

      const resp = await getPlacementTypeAnalytics(payload);
      const normalized = [
  {
    key: 'whatsapp',
    label: 'WhatsApp Order Count',
    count: Number(resp?.whatsapp?.count || 0),
    percent: Number(resp?.whatsapp?.percentage || 0),
    color: '#22c55e'
  },
  {
    key: 'email',
    label: 'Email Order Count',
    count: Number(resp?.email?.count || 0),
    percent: Number(resp?.email?.percentage || 0),
    color: '#2563eb'
  },
  {
    key: 'website',
    label: 'Website Order Count',
    count: Number(resp?.website?.count || 0),
    percent: Number(resp?.website?.percentage || 0),
    color: '#9333ea'
  }
];

setItemsData({
  items: normalized,
  totalOrders: Number(resp?.totalOrders || 0)
});
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

 const items = Array.isArray(itemsData?.items)
  ? itemsData.items
  : defaultData;

  const total = useMemo(() => {
  return Number(
    itemsData?.totalOrders ||
    data?.totalOrders ||
    0
  );
}, [itemsData, data]);

  // Donut Chart Geometry
  const R = 72
  const STROKE = 18
  const C = 2 * Math.PI * R

  let offset = 0

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 5,
        background: '#ffffff',
        border: '1px solid #edf2f7',
        boxShadow: '0 8px 30px rgba(0,0,0,0.05)'
      }}
    >

      {/* HEADER */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
        mb={3}
      >

        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: '#111827'
            }}
          >
            Placement Type Analytics
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: '#6b7280',
              mt: 0.5
            }}
          >
            Track all placement channels with date-wise analytics
          </Typography>
        </Box>

        {/* FILTERS */}
        <Box
          display="flex"
          gap={1.5}
          alignItems="center"
          flexWrap="wrap"
        >

          <TextField
            size="small"
            type="date"
            label="Start Date"
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            sx={{
              minWidth: 160,
              bgcolor: '#fff'
            }}
          />

          <TextField
            size="small"
            type="date"
            label="End Date"
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            sx={{
              minWidth: 160,
              bgcolor: '#fff'
            }}
          />

          <Button
            variant="contained"
            onClick={handleApply}
            disabled={loading}
            sx={{
              height: 40,
              px: 3,
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 700,
              background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
              boxShadow: 'none'
            }}
          >
            {loading ? 'Loading...' : 'Apply'}
          </Button>

        </Box>

        {error ? (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        ) : null}

      </Box>

      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>

        {/* DONUT CHART */}
        <Grid item xs={12} md={5}>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              bgcolor: '#f8fafc',
              border: '1px solid #edf2f7',
              height: '100%'
            }}
          >

            <Box display="flex" justifyContent="center">

              <Box sx={{ position: 'relative', width: 240, height: 240 }}>

                <svg viewBox="0 0 320 320" width="240" height="240">

                  <g transform="translate(160,160) rotate(-90)">

                    <circle
                      r={R}
                      fill="transparent"
                      stroke="#e5e7eb"
                      strokeWidth={STROKE}
                    />

                    {items.map((it) => {

                      const frac =
                        total === 0
                          ? 0
                          : (Number(it.count) || 0) / total

                      const len = frac * C

                      const dash = `${Math.max(len - 4, 0)}
                      ${Math.max(C - (len - 4), 0)}`

                      const circle = (
                        <circle
                          key={it.key}
                          r={R}
                          fill="transparent"
                          stroke={it.color}
                          strokeWidth={STROKE}
                          strokeLinecap="round"
                          strokeDasharray={dash}
                          strokeDashoffset={-offset}
                        />
                      )

                      offset += len

                      return circle
                    })}

                    <circle
                      r={R - STROKE / 2 - 6}
                      fill="#fff"
                    />

                  </g>

                </svg>

                {/* CENTER */}
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >

                  <Typography
                    sx={{
                      fontSize: 42,
                      fontWeight: 800,
                      color: '#111827'
                    }}
                  >
                    {total}
                  </Typography>

                  <Typography
                    sx={{
                      color: '#6b7280',
                      fontWeight: 500
                    }}
                  >
                    Total Orders
                  </Typography>

                </Box>

              </Box>

            </Box>

          </Paper>

        </Grid>

        {/* RIGHT ANALYTICS */}
        <Grid item xs={12} md={7}>

          <Grid container spacing={2}>

            {items.map((it) => (

              <Grid item xs={12} sm={6} key={it.key}>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    border: '1px solid #edf2f7',
                    transition: '0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.06)'
                    }
                  }}
                >

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >

                    <Box>

                      <Typography
                        sx={{
                          fontSize: 14,
                          color: '#6b7280',
                          mb: 1
                        }}
                      >
                        {it.label}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 32,
                          fontWeight: 800,
                          color: it.color
                        }}
                      >
                        {it.count}
                      </Typography>

                    </Box>

                    <Box
                      sx={{
                        width: 58,
                        height: 58,
                        borderRadius: 3,
                        bgcolor: `${it.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >

                      <Typography
                        sx={{
                          fontWeight: 800,
                          color: it.color
                        }}
                      >
                        {it.percent}%
                      </Typography>

                    </Box>

                  </Box>

                </Paper>

              </Grid>

            ))}

            {/* TOTAL CARD */}
            <Grid item xs={12}>

              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  background:
                    'linear-gradient(135deg,#2563eb,#1e40af)',
                  color: '#fff'
                }}
              >

                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >

                  <Box>

                    <Typography
                      sx={{
                        fontSize: 16,
                        opacity: 0.9
                      }}
                    >
                      Total Orders Across All Channels
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 38,
                        fontWeight: 800,
                        mt: 1
                      }}
                    >
                      {total}
                    </Typography>

                  </Box>

                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      borderRadius: '50%',
                      bgcolor: 'rgba(255,255,255,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 30
                    }}
                  >
                    📊
                  </Box>

                </Box>

              </Paper>

            </Grid>

          </Grid>

        </Grid>

      </Grid>

    </Paper>
  )
}

export { defaultData }