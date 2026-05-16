import React from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

const defaultData = [
  { key: 'whatsapp', label: 'WhatsApp Order Count', count: 24, percent: 60, color: '#22c55e' },
  { key: 'email', label: 'Email Order Count', count: 16, percent: 40, color: '#2563eb' },
  { key: 'website', label: 'Website Order Count', count: 0, percent: 0, color: '#9333ea' }
]

export default function PlacementTypeAnalytics({ data = defaultData }) {
  const items = Array.isArray(data) ? data : defaultData
  const total = items.reduce((s, it) => s + (Number(it.count) || 0), 0)

  // Donut geometry (increased size)
  const R = 72
  const STROKE = 18
  const C = 2 * Math.PI * R

  let offset = 0

  return (
    <Paper elevation={1} sx={{ p: 2, borderRadius: 3, bgcolor: 'background.paper' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Placement Type Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Overview of jobs by placement type
          </Typography>
        </Box>
        <Button variant="outlined" size="small">This Month</Button>
      </Box>

      <Grid container spacing={1} alignItems="center">
        <Grid item xs={12} md={7}>
          <Box sx={{ bgcolor: '#f7f9fc', borderRadius: 3, p: 2, display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ position: 'relative', width: 240, height: 240 }}>
              <svg viewBox="0 0 320 320" width="240" height="240">
                <g transform="translate(160,160) rotate(-90)">
                  <circle r={R} fill="transparent" stroke="#eef3fb" strokeWidth={STROKE} />
                  {items.map((it) => {
                    const frac = total === 0 ? 0 : (Number(it.count) || 0) / total
                    const len = frac * C
                    const dash = `${Math.max(len - 4, 0)} ${Math.max(C - (len - 4), 0)}`
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
                  <circle r={R - STROKE / 2 - 6} fill="#ffffff" />
                </g>
              </svg>

              <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ fontSize: 38, fontWeight: 800 }}>{total}</Typography>
                <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>Total Orders</Typography>
              </Box>
            </Box>
          </Box>
          <Box display="flex" gap={2} mt={1} justifyContent="center">
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: items[0].color }} />
              <Typography sx={{ fontSize: 13 }}><strong style={{ color: items[0].color }}>{items[0].percent}%</strong> WhatsApp</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: items[1].color }} />
              <Typography sx={{ fontSize: 13 }}><strong style={{ color: items[1].color }}>{items[1].percent}%</strong> Email</Typography>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={5}>
          <Box display="flex" flexDirection="column" gap={1}>
            {items.map((it) => (
              <Paper key={it.key} variant="outlined" sx={{ p: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 2 }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box sx={{ width: 48, height: 48, borderRadius: 1.5, bgcolor: `${it.color}10`, border: `1px solid ${it.color}20`, display: 'grid', placeItems: 'center' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      {it.key === 'whatsapp' && <path d="M20.5 3.5C18.2 1.1 15.2 0 12 0 5.4 0 0 5.4 0 12c0 2 0.5 3.9 1.5 5.6L0 24l6.7-1.8C9.6 23.5 10.8 24 12 24c6.6 0 12-5.4 12-12 0-3.2-1.1-6.2-3.5-8.5z" fill={it.color} opacity="0.12" />}
                      {it.key === 'email' && <path d="M2 6.5V18a1.5 1.5 0 0 0 1.5 1.5h17A1.5 1.5 0 0 0 22 18V6.5L12 13 2 6.5z" fill={it.color} opacity="0.16" />}
                      {it.key === 'website' && <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" fill={it.color} opacity="0.12" />}
                    </svg>
                  </Box>

                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>{it.label}</Typography>
                    <Typography sx={{ fontSize: 18, fontWeight: 800, color: it.color }}>{it.count}</Typography>
                  </Box>
                </Box>

                <Box sx={{ bgcolor: `${it.color}14`, color: it.color, px: 1.5, py: 0.5, borderRadius: 2, fontWeight: 700 }}>{it.percent}%</Box>
              </Paper>
            ))}

            <Paper variant="outlined" sx={{ mt: 1, p: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 2 }}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: '#eef7ff', display: 'grid', placeItems: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24"><path d="M3 11h4v8H3zM10 6h4v13h-4zM17 2h4v17h-4z" fill="#1E64FF"/></svg>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>Total Orders Across All Channels</Typography>
                  <Typography variant="body2" color="text.secondary">Across all channels</Typography>
                </Box>
              </Box>
              <Typography sx={{ fontSize: 20, fontWeight: 800, color: items[0].color }}>{total}</Typography>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  )
}

export { defaultData }
