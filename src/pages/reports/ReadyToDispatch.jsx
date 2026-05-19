// ReadyToDispatch.jsx

import React, { useMemo, useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';
import { Search, Download, FileSpreadsheet, Truck, PackageCheck } from 'lucide-react';
import { getReadyToDispatchReport } from 'api/Reports&insights';

const MOCK_DATA = [
  { jobId: 'JOB-3101', client: 'Tata Steel', branch: 'Kolkata', department: 'Packaging', dispatchType: 'Courier', assignedDispatcher: 'Rahul Das', readyDate: '2026-05-15', priority: 'High', status: 'Ready' },
  { jobId: 'JOB-3102', client: 'Reliance', branch: 'Mumbai', department: 'Binding', dispatchType: 'Pickup', assignedDispatcher: 'Amit Sharma', readyDate: '2026-05-14', priority: 'Medium', status: 'Awaiting Pickup' },
  { jobId: 'JOB-3103', client: 'Infosys', branch: 'Delhi', department: 'Lamination', dispatchType: 'Courier', assignedDispatcher: 'Priya Sen', readyDate: '2026-05-13', priority: 'Critical', status: 'Ready' },
  { jobId: 'JOB-3104', client: 'Wipro', branch: 'Bangalore', department: 'Printing', dispatchType: 'Transport', assignedDispatcher: 'Rakesh Gupta', readyDate: '2026-05-12', priority: 'Low', status: 'Packed' },
];

const COLUMNS = [
  { key: 'jobId',               label: 'Job ID',             width: 120 },
  { key: 'client',              label: 'Client',             width: 140 },
  { key: 'branch',              label: 'Branch',             width: 120 },
  { key: 'department',          label: 'Department',         width: 130 },
  { key: 'dispatchType',        label: 'Dispatch Type',      width: 130 },
  { key: 'assignedDispatcher',  label: 'Dispatcher',         width: 150 },
  { key: 'readyDate',           label: 'Ready Date',         width: 120 },
  { key: 'priority',            label: 'Priority',           width: 110 },
  { key: 'status',              label: 'Status',             width: 140 },
];

const cellStyle = (width) => ({
  padding: '11px 14px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: width,
  width,
  minWidth: width,
  boxSizing: 'border-box',
});

const priorityStyle = (p) => {
  const map = { Critical: ['#fee2e2','#b91c1c'], High: ['#fff7ed','#c2410c'], Medium: ['#fffbeb','#92400e'], Low: ['#ecfccb','#166534'] };
  const [bg, color] = map[p] ?? ['#f3f4f6','#6b7280'];
  return { padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: bg, color, display: 'inline-block' };
};

const statusStyle = (s) => {
  const map = { Ready: ['#ecfdf5','#16a34a'], 'Awaiting Pickup': ['#fffbeb','#92400e'], Packed: ['#eef2ff','#1e40af'] };
  const [bg, color] = map[s] ?? ['#f3f4f6','#6b7280'];
  return { padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: bg, color, display: 'inline-block' };
};

const ReadyToDispatch = () => {
  const [search, setSearch]       = useState('');
  const [sortField, setSortField] = useState('readyDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [data, setData]           = useState([]);
  const [hasError, setHasError]   = useState(false); // ← key fix
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
      setLoading(true); setError(null); setHasError(false);
      try {
        const resp = await getReadyToDispatchReport({ page, size, sort: `${sortField},${sortOrder}` });
        if (!mounted) return;
        setData(Array.isArray(resp.items) ? resp.items : []); // ← real data, even if empty
        setTotal(Number(resp.total ?? 0));
      } catch (err) {
        console.error('Failed to fetch ready-to-dispatch report', err);
        if (!mounted) return;
        setError(String(err?.message ?? err));
        setHasError(true); // ← only use mock on real failure
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return () => { mounted = false; };
  }, [page, size, sortField, sortOrder]);

  const filteredData = useMemo(() => {
    const source = hasError ? MOCK_DATA : data; // ← never falls back unless error
    return source
      .filter((item) => Object.values(item).join(' ').toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
        if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [search, sortField, sortOrder, data, hasError]);

  // derive metric counts from live data (or mock on error)
  const source = hasError ? MOCK_DATA : data;
  const readyCount  = source.filter((d) => d.status === 'Ready').length;
  const packedCount = source.filter((d) => d.status === 'Packed').length;

  const exportCSV = () => {
    if (!filteredData.length) return;
    const headers = Object.keys(filteredData[0]).join(',');
    const rows = filteredData.map((row) => Object.values(row).join(','));
    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.setAttribute('download', 'ready_to_dispatch_report.csv');
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span style={{ color: '#d1d5db', marginLeft: 4 }}>↕</span>;
    return <span style={{ color: '#2f6df6', marginLeft: 4 }}>{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">Ready To Dispatch</Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor all orders and jobs ready for dispatch, courier, transport or customer pickup.
        </Typography>
      </Grid>

      {/* Metric cards — now driven by real data */}
      <Grid item xs={12}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e6f0ff', padding: '14px 20px', minWidth: 190 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Ready Orders</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#2f6df6' }}>{readyCount}</div>
              </div>
              <div style={{ background: '#eef6ff', padding: 10, borderRadius: 12 }}>
                <Truck style={{ color: '#2f6df6', width: 20, height: 20 }} />
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e6ffef', padding: '14px 20px', minWidth: 190 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Packed Jobs</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#16a34a' }}>{packedCount}</div>
              </div>
              <div style={{ background: '#ecfdf5', padding: 10, borderRadius: 12 }}>
                <PackageCheck style={{ color: '#16a34a', width: 20, height: 20 }} />
              </div>
            </div>
          </div>
        </div>
      </Grid>

      <Grid item xs={12}>
        <MainCard contentSX={{ p: 0, minHeight: '65vh' }} sx={{ width: '100%' }}>

          {/* Toolbar */}
          <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Search dispatch jobs..."
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

          {loading && <div style={{ padding: '10px 20px', color: '#6b7280', fontSize: 13 }}>Loading ready-to-dispatch…</div>}
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
                    <th key={col.key} onClick={() => handleSort(col.key)}
                      style={{ textAlign: 'left', padding: '11px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#374151', position: 'sticky', top: 0, background: '#f8fafc', zIndex: 2, borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap', userSelect: 'none' }}>
                      {col.label}<SortIcon field={col.key} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => (
                  <tr key={index}
                    style={{ borderBottom: '1px solid #f3f4f6', background: index % 2 === 0 ? '#fff' : '#fafbfc' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                    onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? '#fff' : '#fafbfc'}
                  >
                    <td style={cellStyle(COLUMNS[0].width)}>
                      <span style={{ color: '#2f6df6', fontWeight: 600 }}>{row.jobId ?? '-'}</span>
                    </td>
                    <td style={cellStyle(COLUMNS[1].width)} title={row.client}>{row.client ?? '-'}</td>
                    <td style={cellStyle(COLUMNS[2].width)}>{row.branch ?? '-'}</td>
                    <td style={cellStyle(COLUMNS[3].width)} title={row.department}>{row.department ?? '-'}</td>
                    <td style={cellStyle(COLUMNS[4].width)}>
                      {row.dispatchType
                        ? <span style={{ background: '#eef2ff', color: '#1e40af', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>{row.dispatchType}</span>
                        : '-'}
                    </td>
                    <td style={cellStyle(COLUMNS[5].width)} title={row.assignedDispatcher}>{row.assignedDispatcher ?? '-'}</td>
                    <td style={cellStyle(COLUMNS[6].width)}>
                      {row.readyDate ? new Date(row.readyDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
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
              <div style={{ textAlign: 'center', padding: 56, color: '#9ca3af', fontSize: 14 }}>No dispatch jobs found.</div>
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
};

export default ReadyToDispatch;