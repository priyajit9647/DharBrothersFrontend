import { useState, useEffect, useRef } from 'react'
import getPlacementTypeAnalytics from 'api/placementType'
import MainCard from 'components/MainCard'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'

// ─── Channel config ───────────────────────────────────────────────────────────
const CHANNELS = [
  { key: 'whatsapp', label: 'WhatsApp', icon: '💬', color: '#16a34a', light: '#dcfce7' },
  { key: 'email',   label: 'Email',    icon: '📧', color: '#2563eb', light: '#dbeafe' },
  { key: 'website', label: 'Website',  icon: '🌐', color: '#7c3aed', light: '#ede9fe' }
]

const R = 68, STROKE = 16, C = 2 * Math.PI * R

// ─── Donut ────────────────────────────────────────────────────────────────────
function DonutChart({ items, total }) {
  let offset = 0
  return (
    <Box sx={{ position: 'relative', width: 200, height: 200, mx: 'auto' }}>
      <svg viewBox="0 0 280 280" width="200" height="200">
        <g transform="translate(140,140) rotate(-90)">
          <circle r={R} fill="none" stroke="#f1f5f9" strokeWidth={STROKE} />
          {items.map((ch) => {
            const len  = total > 0 ? (ch.count / total) * C : 0
            const gap  = len > 6 ? 3 : 0
            const dash = `${Math.max(len - gap, 0)} ${C}`
            const el   = (
              <circle key={ch.key} r={R} fill="none"
                stroke={ch.color} strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                style={{ transition: 'stroke-dasharray .5s ease' }}
              />
            )
            offset += len
            return el
          })}
          <circle r={R - STROKE / 2 - 2} fill="#fff" />
        </g>
      </svg>
      <Box sx={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center'
      }}>
        <Typography sx={{ fontSize: 36, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
          {total}
        </Typography>
        <Typography sx={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, mt: 0.3, letterSpacing: 0.5 }}>
          TOTAL
        </Typography>
      </Box>
    </Box>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ ch, total }) {
  const pct = total > 0 ? Math.round((ch.count / total) * 100) : 0

  return (
    <Box sx={{
      p: 1.5, borderRadius: 3,
      border: '1.5px solid', borderColor: `${ch.color}25`,
      bgcolor: ch.light,
      height: '100%',
      transition: 'box-shadow .2s',
      '&:hover': { boxShadow: `0 4px 16px ${ch.color}20` }
    }}>
      {/* icon + % badge */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{
          width: 32, height: 32, borderRadius: 2,
          bgcolor: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
        }}>
          {ch.icon}
        </Box>
        <Box sx={{ px: 1, py: 0.2, borderRadius: 99, bgcolor: `${ch.color}18` }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: ch.color }}>
            {pct}%
          </Typography>
        </Box>
      </Box>

      {/* count */}
      <Typography sx={{ fontSize: 28, fontWeight: 800, color: ch.color, lineHeight: 1, mb: 0.4 }}>
        {ch.count}
      </Typography>

      {/* label */}
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>
        {ch.label}
      </Typography>

      {/* bar */}
      <Box sx={{ mt: 1.2, height: 3, borderRadius: 99, bgcolor: `${ch.color}20`, overflow: 'hidden' }}>
        <Box sx={{
          height: '100%', borderRadius: 99, bgcolor: ch.color,
          width: `${Math.min(pct, 100)}%`, transition: 'width .5s ease'
        }} />
      </Box>
    </Box>
  )
}

// ─── Date input ───────────────────────────────────────────────────────────────
function DateInput({ label, value, onChange, max }) {
  return (
    <Box sx={{ flex: 1, minWidth: 130 }}>
      <Typography sx={{
        fontSize: 11, fontWeight: 700, color: '#94a3b8',
        letterSpacing: 0.8, textTransform: 'uppercase', mb: 0.6
      }}>
        {label}
      </Typography>
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1,
        px: 1.5, height: 38,
        bgcolor: '#f8fafc',
        border: '1.5px solid', borderColor: value ? '#2563eb' : '#e2e8f0',
        borderRadius: 2,
        transition: 'border-color .15s',
        '&:focus-within': { borderColor: '#2563eb', bgcolor: '#fff', boxShadow: '0 0 0 3px #dbeafe' }
      }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <rect x="1" y="2" width="14" height="13" rx="2" stroke="#94a3b8" strokeWidth="1.4"/>
          <path d="M5 1v2M11 1v2M1 6h14" stroke="#94a3b8" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <input
          type="date"
          value={value}
          max={max}
          onChange={(e) => onChange(e.target.value)}
          style={{
            border: 'none', outline: 'none', background: 'transparent',
            fontSize: 13, fontWeight: 500, color: '#0f172a',
            width: '100%', cursor: 'pointer', fontFamily: 'inherit'
          }}
        />
      </Box>
    </Box>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <Box sx={{ py: 6, textAlign: 'center' }}>
      <Typography sx={{ fontSize: 40, mb: 1.5 }}>📅</Typography>
      <Typography sx={{ fontWeight: 700, color: '#475569', fontSize: 15 }}>
        Select a date range
      </Typography>
      <Typography sx={{ color: '#94a3b8', fontSize: 13, mt: 0.5 }}>
        Pick start and end dates to load placement analytics
      </Typography>
    </Box>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PlacementTypeAnalytics() {
  const today = new Date().toISOString().slice(0, 10)

  const [startDate, setStartDate] = useState('')
  const [endDate,   setEndDate]   = useState('')
  const [data,      setData]      = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)

  const lastQuery  = useRef('')
  const reqIdRef   = useRef(0)

  useEffect(() => {
    let alive = true

    async function load() {
      if (!startDate || !endDate) return

      const s = new Date(startDate), e = new Date(endDate)
      if (isNaN(s) || isNaN(e)) return
      if (s > e) { setError('Start date cannot be after end date'); return }

      const q = `${startDate}|${endDate}`
      if (q === lastQuery.current) return

      setError(null)
      setLoading(true)
      const id = ++reqIdRef.current

      try {
        const resp = await getPlacementTypeAnalytics({
          startDate: s.toISOString(),
          endDate:   e.toISOString()
        })
        if (!alive || reqIdRef.current !== id) return

        const total = Number(resp?.totalOrders ?? 0)
        const items = CHANNELS.map((ch) => ({
          ...ch,
          count:   Number(resp?.[ch.key]?.count      ?? 0),
          percent: Number(resp?.[ch.key]?.percentage ?? 0)
        }))

        setData({ items, total })
        lastQuery.current = q
      } catch (err) {
        if (!alive || reqIdRef.current !== id) return
        setError(err?.message || 'Something went wrong')
      } finally {
        if (alive && reqIdRef.current === id) setLoading(false)
      }
    }

    load()
    return () => { alive = false }
  }, [startDate, endDate])

  const items = data?.items ?? []
  const total = data?.total ?? 0

  return (
    <MainCard content={false}>
      <Box sx={{ p: { xs: 2, md: 3 } }}>

        {/* ── Header row ── */}
        <Box sx={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2.5
        }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
              Placement Type Analytics
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.3 }}>
              Orders by channel — WhatsApp · Email · Website
            </Typography>
          </Box>

          {/* ── Date range ── */}
          <Stack direction="row" alignItems="flex-end" spacing={1} flexWrap="wrap">
            <DateInput
              label="From"
              value={startDate}
              max={today}
              onChange={(v) => { setStartDate(v); lastQuery.current = '' }}
            />
            <Box sx={{ pb: 0.5, color: '#cbd5e1', fontSize: 18, fontWeight: 300 }}>—</Box>
            <DateInput
              label="To"
              value={endDate}
              max={today}
              onChange={(v) => { setEndDate(v); lastQuery.current = '' }}
            />
            {loading && (
              <Box sx={{ pb: 0.8, pl: 0.5 }}>
                <CircularProgress size={20} thickness={4} />
              </Box>
            )}
          </Stack>
        </Box>

        {/* error */}
        {error && (
          <Box sx={{
            mb: 2, px: 2, py: 1.2, borderRadius: 2,
            bgcolor: '#fef2f2', border: '1px solid #fecaca'
          }}>
            <Typography sx={{ fontSize: 13, color: '#dc2626', fontWeight: 500 }}>
              ⚠ {error}
            </Typography>
          </Box>
        )}

        <Divider sx={{ mb: 3 }} />

        {/* ── Content ── */}
        {!data ? (
          <EmptyState />
        ) : (
          <Grid container spacing={3} alignItems="center">

            {/* Donut + legend */}
            <Grid item xs={12} sm={5}>
              <DonutChart items={items} total={total} />

              <Stack spacing={0.8} sx={{ mt: 2.5, px: 1 }}>
                {items.map((ch) => (
                  <Box key={ch.key} sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: 99, bgcolor: ch.color, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 12, color: '#64748b', flex: 1 }}>{ch.label}</Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{ch.count}</Typography>
                    <Typography sx={{ fontSize: 11, color: '#94a3b8', minWidth: 32, textAlign: 'right' }}>
                      {total > 0 ? Math.round((ch.count / total) * 100) : 0}%
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Grid>

            {/* Stat cards */}
            <Grid item xs={12} sm={7}>
              {/* 3 cards in one row */}
              <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                {items.map((ch) => (
                  <Grid item xs={4} key={ch.key}>
                    <StatCard ch={ch} total={total} />
                  </Grid>
                ))}
              </Grid>

              {/* total banner — full width below */}
              <Box sx={{
                p: 2, borderRadius: 3,
                background: 'linear-gradient(120deg, #1e40af 0%, #2563eb 100%)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <Box>
                  <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: 500, mb: 0.3 }}>
                    All Channels Combined
                  </Typography>
                  <Typography sx={{ fontSize: 30, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                    {total}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: 28 }}>📊</Typography>
              </Box>
            </Grid>

          </Grid>
        )}

      </Box>
    </MainCard>
  )
}
