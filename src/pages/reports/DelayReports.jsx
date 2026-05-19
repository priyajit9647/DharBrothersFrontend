// DelayReports.jsx

import React, { useMemo, useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';
import { Download, FileSpreadsheet, Search } from 'lucide-react';
import { getDelayedJobs } from 'api/Reports&insights';

const MOCK_DATA = [
  { jobId: 'JOB-1001', client: 'Tata Steel', branch: 'Kolkata', department: 'Printing', stage: 'Production', expectedDate: '2026-05-10', delayedDays: 5, priority: 'High', status: 'Delayed' },
  { jobId: 'JOB-1002', client: 'Reliance', branch: 'Delhi', department: 'Binding', stage: 'Dispatch', expectedDate: '2026-05-12', delayedDays: 2, priority: 'Medium', status: 'Pending' },
  { jobId: 'JOB-1003', client: 'Infosys', branch: 'Mumbai', department: 'Packaging', stage: 'QC', expectedDate: '2026-05-09', delayedDays: 7, priority: 'Critical', status: 'Delayed' },
  { jobId: 'JOB-1004', client: 'Wipro', branch: 'Bangalore', department: 'Lamination', stage: 'Cutting', expectedDate: '2026-05-11', delayedDays: 1, priority: 'Low', status: 'In Progress' }
];

const COLUMNS = [
  { key: 'jobId',        label: 'Job ID',        width: 120, sortKey: 'jobId' },
  { key: 'client',       label: 'Client',         width: 140, sortKey: 'client' },
  { key: 'branch',       label: 'Branch',         width: 120, sortKey: 'branch' },
  { key: 'department',   label: 'Department',     width: 130, sortKey: 'department' },
  { key: 'stage',        label: 'Stage',          width: 120, sortKey: 'stage' },
  { key: 'expectedDate', label: 'Expected Date',  width: 140, sortKey: 'expectedDate' },
  { key: 'delayedDays',  label: 'Delayed Days',   width: 120, sortKey: 'delayedDays' },
  { key: 'priority',     label: 'Priority',       width: 110, sortKey: 'priority' },
  { key: 'status',       label: 'Status',         width: 120, sortKey: 'status' },
];

const cellStyle = (width) => ({
  padding: '11px 14px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: width,
  width: width,
  minWidth: width,
  boxSizing: 'border-box',
});

const priorityStyle = (priority) => {
  const map = {
    Critical: { bg: '#fee2e2', color: '#b91c1c' },
    High:     { bg: '#fff7ed', color: '#c2410c' },
    Medium:   { bg: '#fffbeb', color: '#92400e' },
    Low:      { bg: '#ecfccb', color: '#166534' },
  };
  const s = map[priority] ?? { bg: '#f3f4f6', color: '#6b7280' };
  return { padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: s.bg, color: s.color, display: 'inline-block' };
};

const statusStyle = (status) => {
  const map = {
    Delayed:     { bg: '#fee2e2', color: '#b91c1c' },
    Pending:     { bg: '#fffbeb', color: '#92400e' },
    'In Progress': { bg: '#eef2ff', color: '#1e40af' },
  };
  const s = map[status] ?? { bg: '#f3f4f6', color: '#6b7280' };
  return { padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: s.bg, color: s.color, display: 'inline-block' };
};

export default function DelayReports() {
  const [search, setSearch]       = useState('');
  const [sortField, setSortField] = useState('delayedDays');
  const [sortOrder, setSortOrder] = useState('desc');
  const [data, setData]           = useState([]);       // real API data
  const [hasError, setHasError]   = useState(false);   // ← track error separately
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [page, setPage]           = useState(0);
  const [size]                    = useState(10);
  const [total, setTotal]         = useState(0);

  const handleSort = (field) => {
    if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('asc'); }
  };

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      setLoading(true);
      setError(null);
      setHasError(false);
      try {
        const resp = await getDelayedJobs({ page, size, sort: `${sortField},${sortOrder}` });
        if (!mounted) return;
        // ← always set real data; empty array is valid
        setData(Array.isArray(resp.items) ? resp.items : []);
        setTotal(Number(resp.total ?? 0));
      } catch (err) {
        console.error('Failed to fetch delayed jobs', err);
        if (!mounted) return;
        setError(String(err?.message ?? err));
        setHasError(true);          // ← only fall back to mock on actual error
        setData(MOCK_DATA);
        setTotal(MOCK_DATA.length);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return () => { mounted = false; };
  }, [page, size, sortField, sortOrder]);

  const filteredData = useMemo(() => {
    // ← use real data always; mock only if API errored
    const source = hasError ? MOCK_DATA : data;
    return source
      .filter((item) =>
        Object.values(item).join(' ').toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
        if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [search, sortField, sortOrder, data, hasError]);

  const exportCSV = () => {
    const source = filteredData.length ? filteredData : (data.length ? data : MOCK_DATA);
    const headers = Object.keys(source[0] || {}).join(',');
    const rows = source.map((row) => Object.values(row).join(','));
    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.setAttribute('download', 'delay_reports.csv');
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span style={{ color: '#d1d5db', marginLeft: 4 }}>↕</span>;
    return <span style={{ color: '#2f6df6', marginLeft: 4 }}>{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">Delay Reports</Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor delayed jobs beyond expected timelines with advanced reporting and exports.
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard contentSX={{ p: 0, minHeight: '65vh' }} sx={{ width: '100%' }}>

          {/* Toolbar */}
          <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Search reports..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ padding: '8px 12px 8px 34px', borderRadius: 8, border: '1px solid #e5e7eb', minWidth: 260, fontSize: 14, outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={exportCSV} style={{ display: 'flex', gap: 6, alignItems: 'center', background: '#2f6df6', color: '#fff', padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                <Download size={15} /> Export CSV
              </button>
              <button style={{ display: 'flex', gap: 6, alignItems: 'center', background: '#16a34a', color: '#fff', padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                <FileSpreadsheet size={15} /> Export Excel
              </button>
            </div>
          </div>

          {/* Status banners */}
          {loading && <div style={{ padding: '10px 20px', color: '#6b7280', fontSize: 13 }}>Loading delay reports…</div>}
          {error   && <div style={{ padding: '8px 20px', color: '#b91c1c', fontSize: 13 }}>⚠ Failed to load: {error} — showing sample data</div>}

          {/* Table */}
          <div style={{ overflow: 'auto', width: '100%', maxHeight: 'calc(65vh - 110px)' }}>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: COLUMNS.reduce((s, c) => s + c.width, 0) }}>
              <colgroup>
                {COLUMNS.map((col) => <col key={col.key} style={{ width: col.width }} />)}
              </colgroup>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  {COLUMNS.map((col) => (
                    <th key={col.key} onClick={() => handleSort(col.sortKey)}
                      style={{ textAlign: 'left', padding: '11px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#374151', position: 'sticky', top: 0, background: '#f8fafc', zIndex: 2, borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap', userSelect: 'none' }}>
                      {col.label}<SortIcon field={col.sortKey} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => (
                  <tr key={index}
                    style={{ borderBottom: '1px solid #f3f4f6', background: index % 2 === 0 ? '#fff' : '#fafbfc' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? '#fff' : '#fafbfc'}
                  >
                    <td style={{ ...cellStyle(COLUMNS[0].width) }}>
                      <span style={{ color: '#2f6df6', fontWeight: 600 }}>{row.jobId ?? '-'}</span>
                    </td>
                    <td style={cellStyle(COLUMNS[1].width)} title={row.client}>{row.client ?? '-'}</td>
                    <td style={cellStyle(COLUMNS[2].width)}>{row.branch ?? '-'}</td>
                    <td style={cellStyle(COLUMNS[3].width)} title={row.department}>{row.department ?? '-'}</td>
                    <td style={cellStyle(COLUMNS[4].width)}>{row.stage ?? '-'}</td>
                    <td style={cellStyle(COLUMNS[5].width)}>
                      {row.expectedDate ? new Date(row.expectedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    <td style={cellStyle(COLUMNS[6].width)}>
                      {row.delayedDays != null
                        ? <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>{row.delayedDays} Days</span>
                        : '-'}
                    </td>
                    <td style={cellStyle(COLUMNS[7].width)}>
                      {row.priority ? <span style={priorityStyle(row.priority)}>{row.priority}</span> : '-'}
                    </td>
                    <td style={cellStyle(COLUMNS[8].width)}>
                      {row.status ? <span style={statusStyle(row.status)}>{row.status}</span> : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredData.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: 56, color: '#9ca3af', fontSize: 14 }}>No delay reports found.</div>
            )}
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ color: '#6b7280', fontSize: 13 }}>
              Showing {Math.min(filteredData.length, size)} of {total} items
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page <= 0}
                style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: page <= 0 ? '#f9fafb' : '#fff', color: page <= 0 ? '#d1d5db' : '#374151', cursor: page <= 0 ? 'not-allowed' : 'pointer', fontSize: 13 }}>
                ← Prev
              </button>
              <span style={{ color: '#374151', fontSize: 13, minWidth: 90, textAlign: 'center' }}>
                Page {page + 1} of {Math.max(1, Math.ceil(total / size))}
              </span>
              <button onClick={() => setPage((p) => p + 1)} disabled={(page + 1) * size >= total}
                style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: (page + 1) * size >= total ? '#f9fafb' : '#fff', color: (page + 1) * size >= total ? '#d1d5db' : '#374151', cursor: (page + 1) * size >= total ? 'not-allowed' : 'pointer', fontSize: 13 }}>
                Next →
              </button>
            </div>
          </div>

        </MainCard>
      </Grid>
    </Grid>
  );
}