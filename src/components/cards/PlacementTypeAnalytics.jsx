import React, { useEffect, useState } from 'react'

const defaultData = [
  { name: 'Online Placements', value: 0, color: '#2f6df6' },
  { name: 'Offline Placements', value: 0, color: '#10b981' }
]

export default function PlacementTypeAnalytics({ data = defaultData, title = 'Placement Type Analytics' }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30)
    return () => clearTimeout(t)
  }, [])

  const chartData = data.map((d) => ({ name: d.name, value: Number(d.value) || 0, color: d.color }))
  const total = chartData.reduce((s, d) => s + d.value, 0)

  // Compute lengths for two segments
  const R = 72
  const STROKE = 18
  const C = 2 * Math.PI * R

  const online = chartData[0] ?? { name: 'Online Placements', value: 0, color: '#2f6df6' }
  const offline = chartData[1] ?? { name: 'Offline Placements', value: 0, color: '#10b981' }

  const onlineFrac = total === 0 ? 0.5 : online.value / Math.max(total, 1)
  const offlineFrac = total === 0 ? 0.5 : offline.value / Math.max(total, 1)

  const onlineLen = onlineFrac * C
  const offlineLen = offlineFrac * C
  const gap = 6

  const onlineDash = `${Math.max(onlineLen - gap, 0)} ${Math.max(C - (onlineLen - gap), 0)}`
  const offlineDash = `${Math.max(offlineLen - gap, 0)} ${Math.max(C - (offlineLen - gap), 0)}`

  return (
    <div className="bg-white border border-gray-100 rounded-[16px] shadow-sm hover:shadow-md transition-shadow duration-200 p-4 md:p-6 w-full">
      <div className="flex items-start justify-between">
        <h3 className="text-sm md:text-base font-medium text-gray-800">{title}</h3>
      </div>

      <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center justify-start w-full md:w-auto">
          <div className="relative" style={{ width: 160, height: 160 }}>
            <svg viewBox="0 0 200 200" width="160" height="160" className="block">
              <g transform={`translate(100,100) rotate(-90)`}>
                <circle r={R} fill="transparent" stroke="#eef2f7" strokeWidth={STROKE} />

                <circle
                  r={R}
                  fill="transparent"
                  stroke={online.color}
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  style={{ strokeDasharray: mounted ? onlineDash : `0 ${C}`, transition: 'stroke-dasharray 700ms ease' }}
                />

                <circle
                  r={R}
                  fill="transparent"
                  stroke={offline.color}
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  style={{ strokeDasharray: mounted ? offlineDash : `0 ${C}`, strokeDashoffset: -onlineLen, transition: 'stroke-dasharray 700ms ease, stroke-dashoffset 700ms ease' }}
                />

                <circle r={R - STROKE / 2 - 6} fill="#fff" />
              </g>
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-2xl md:text-3xl font-bold text-gray-800">{total}</div>
              <div className="text-xs text-gray-500">Total Jobs</div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center md:items-center">
          <div className="w-full min-w-[160px]">
            <div className="flex flex-col gap-3 pl-4 md:pl-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: online.color }} />
                  <div className="text-sm text-gray-700 whitespace-nowrap">{online.name}</div>
                </div>
                <div className="text-sm text-gray-500 whitespace-nowrap">{online.value} ({total === 0 ? '0%' : Math.round((online.value / total) * 100) + '%'})</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: offline.color }} />
                  <div className="text-sm text-gray-700 whitespace-nowrap">{offline.name}</div>
                </div>
                <div className="text-sm text-gray-500 whitespace-nowrap">{offline.value} ({total === 0 ? '0%' : Math.round((offline.value / total) * 100) + '%'})</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { defaultData }
