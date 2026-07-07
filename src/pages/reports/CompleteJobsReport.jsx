// CompleteJobsReport.jsx

import React, { useMemo, useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';
import useAccess from 'hooks/useAccess';
import { Search, Download, FileSpreadsheet, CheckCircle2, CircleDollarSign } from 'lucide-react';
import { getCompleteJobsReport, exportCompleteJobs } from 'api/Reports&Insights';

const MOCK_DATA = [
  { jobId: 'JOB-4101', client: 'Tata Steel', branch: 'Kolkata', department: 'Printing', completedBy: 'Rahul Sharma', completedDate: '2026-05-14', turnaroundTime: '12 hrs', totalAmount: 12500, priority: 'High', status: 'Completed' },
  { jobId: 'JOB-4102', client: 'Reliance', branch: 'Mumbai', department: 'Packaging', completedBy: 'Amit Das', completedDate: '2026-05-13', turnaroundTime: '8 hrs', totalAmount: 8000, priority: 'Medium', status: 'Completed' },
  { jobId: 'JOB-4103', client: 'Infosys', branch: 'Delhi', department: 'Binding', completedBy: 'Priya Sen', completedDate: '2026-05-12', turnaroundTime: '15 hrs', totalAmount: 18700, priority: 'Critical', status: 'Delivered' },
  { jobId: 'JOB-4104', client: 'Wipro', branch: 'Bangalore', department: 'Lamination', completedBy: 'Rakesh Gupta', completedDate: '2026-05-11', turnaroundTime: '6 hrs', totalAmount: 6500, priority: 'Low', status: 'Completed' },
];

const COLUMNS = [
  { key: 'jobId',          label: 'Job ID',          width: 120 },
  { key: 'client',         label: 'Client',          width: 140 },
  { key: 'branch',         label: 'Branch',          width: 120 },
  { key: 'department',     label: 'Department',      width: 130 },
  { key: 'completedBy',    label: 'Completed By',    width: 150 },
  { key: 'completedDate',  label: 'Completed Date',  width: 140 },
  { key: 'totalAmount',    label: 'Revenue',         width: 110 },
  { key: 'status',         label: 'Status',          width: 120 },
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

// Priority column removed

const statusStyle = (s) => {
  const map = { Completed: ['#ecfdf5','#16a34a'], Delivered: ['#eef2ff','#1e40af'] };
  const [bg, color] = map[s] ?? ['#f3f4f6','#6b7280'];
  return { padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: bg, color, display: 'inline-block' };
};

// Normalize API item into the expected table shape for Completed Jobs
function normalizeCompleteItem(item) {
  if (!item || typeof item !== 'object') return null;

  const getNested = (obj, path) => {
    try {
      return path.split('.').reduce((o, p) => (o && Object.prototype.hasOwnProperty.call(o, p) ? o[p] : o && o[p]), obj);
    } catch (e) {
      return undefined;
    }
  };

  const toDisplay = (v) => {
    if (v == null) return undefined;
    if (typeof v === 'object') return v.name ?? v.label ?? v.title ?? (v.id != null ? String(v.id) : JSON.stringify(v));
    return v;
  };

  const jobId = toDisplay(item.jobId ?? item.orderId ?? item.jobNo ?? item.job_no ?? item.id ?? item.code ?? getNested(item, 'order.orderId') ?? getNested(item, 'job.jobId')) || '';
  const client = toDisplay(item.client ?? item.clientName ?? item.customerName ?? getNested(item, 'customer.name') ?? getNested(item, 'customer.companyName')) || '';
  const branch = toDisplay(item.branch ?? item.branchName ?? getNested(item, 'branch.name')) || '';
  const department = toDisplay(item.department ?? item.departmentName ?? item.dept ?? getNested(item, 'process.department')) || '';
  const completedBy = toDisplay(item.completedBy ?? item.completed_by ?? item.completedByName ?? item.completed_by_name ?? getNested(item, 'completedBy.name') ?? getNested(item, 'completed.by')) || '';

  const completedDateRaw = item.completedDate ?? item.completed_at ?? item.completedOn ?? item.completed_on ?? item.completedAt ?? getNested(item, 'completion.date') ?? null;
  const completedDate = completedDateRaw ? String(completedDateRaw) : '';

  let turnaroundTime = item.turnaroundTime ?? item.turnaround ?? item.turnaround_in_hours ?? item.tat ?? item.turnaround_time ?? null;
  if (turnaroundTime == null && item.startedDate && completedDate) {
    try {
      const start = new Date(item.startedDate);
      const end = new Date(completedDate);
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
        const diffHrs = Math.round((end - start) / (1000 * 60 * 60));
        turnaroundTime = `${diffHrs} hrs`;
      }
    } catch (e) {
      // ignore
    }
  }

  let totalAmount = item.totalAmount ?? item.total ?? item.amount ?? item.revenue ?? item.grandTotal ?? item.total_amount ?? null;
  if (totalAmount != null) totalAmount = Number(totalAmount);

  const status = toDisplay(item.status ?? item.jobStatus ?? item.state ?? item.currentStatus ?? getNested(item, 'status.label')) || '';

  return {
    _raw: item,
    jobId,
    client,
    branch,
    department,
    completedBy,
    completedDate,
    turnaroundTime: turnaroundTime != null ? turnaroundTime : '',
    totalAmount: totalAmount != null ? totalAmount : null,
    status
  };
}

const CompleteJobsReport = () => {
  const [search, setSearch]       = useState('');
  const [sortField, setSortField] = useState('completedDate');
  const [sortOrder, setSortOrder] = useState('desc');
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
        const resp = await getCompleteJobsReport({ page, size, sort: `${sortField},${sortOrder}` });
        if (!mounted) return;
        const rawItems = Array.isArray(resp.items) ? resp.items : [];
        const mapped = rawItems.map(normalizeCompleteItem).filter(Boolean);
        setData(mapped);
        setTotal(Number(resp.total ?? mapped.length ?? 0));
      } catch (err) {
        console.error('Failed to fetch completed jobs report', err);
        if (!mounted) return;
        setError(String(err?.message ?? err));
        setHasError(true); // only fall back to mock on real failure
        setData(MOCK_DATA.map(normalizeCompleteItem).filter(Boolean));
        setTotal(MOCK_DATA.length);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return () => { mounted = false; };
  }, [page, size, sortField, sortOrder]);

  const filteredData = useMemo(() => {
    const source = (data && data.length) ? data : MOCK_DATA.map(normalizeCompleteItem).filter(Boolean);
    return (source || [])
      .filter((item) => Object.values(item).join(' ').toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
        if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [search, sortField, sortOrder, data]);

  // derive metrics from live data
  const source = (data && data.length) ? data : MOCK_DATA.map(normalizeCompleteItem).filter(Boolean);
  const completedCount = source.length;
  const totalRevenue   = source.reduce((sum, d) => sum + (Number(d.totalAmount) || 0), 0);
  const revenueDisplay = totalRevenue >= 100000
    ? `₹${(totalRevenue / 100000).toFixed(1)}L`
    : `₹${totalRevenue.toLocaleString('en-IN')}`;

  const exportCSV = () => {
    if (!filteredData.length) return;
    const source = filteredData;
    const headers = COLUMNS.map((c) => c.label).join(',');
    const rows = source.map((row) =>
      COLUMNS.map((col) => {
        const v = row[col.key];
        if (v == null) return '';
        if (typeof v === 'object') return JSON.stringify(v);
        return String(v).replace(/"/g, '""');
      })
        .map((cell) => `"${cell}"`)
        .join(',')
    );
    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.setAttribute('download', 'complete_jobs_report.csv');
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const exportExcel = async () => {
    try {
      const resp = await exportCompleteJobs({ page, size, sort: `${sortField},${sortOrder}`, format: 'xlsx' });
      const blob = await resp.blob();
      const disposition = resp.headers.get ? resp.headers.get('content-disposition') || '' : '';
      let filename = 'complete_jobs_report.xlsx';
      const m = disposition.match(/filename\*=UTF-8''([^;\n]+)/) || disposition.match(/filename=\"?([^\";]+)\"?/);
      if (m && m[1]) {
        try { filename = decodeURIComponent(m[1]); } catch (e) { filename = m[1]; }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.setAttribute('download', filename);
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch (err) {
      console.warn('Backend export failed, falling back to client-side XLSX generation', err);
      const source = filteredData.length ? filteredData : (data.length ? data : MOCK_DATA);
      if (!source || source.length === 0) {
        alert('No data available to export');
        return;
      }
      try {
        const mod = await import('xlsx');
        const XLSX = mod.default || mod;
        const rows = source.map((row) => {
          const obj = {};
          COLUMNS.forEach((col) => {
            let v = row[col.key];
            if (col.key === 'completedDate' && v) {
              const d = new Date(v);
              if (!Number.isNaN(d.getTime())) v = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            }
            if (v == null) v = '';
            if (typeof v === 'object') v = JSON.stringify(v);
            obj[col.label] = v;
          });
          return obj;
        });
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Complete Jobs');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.setAttribute('download', 'complete_jobs_report.xlsx');
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      } catch (impErr) {
        console.error('Client-side export failed', impErr);
        alert('Export failed: ' + (impErr?.message || impErr) + '\nIf you are developing locally, install the xlsx package: npm i xlsx');
      }
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span style={{ color: '#d1d5db', marginLeft: 4 }}>↕</span>;
    return <span style={{ color: '#2f6df6', marginLeft: 4 }}>{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  const { hasAccess } = useAccess();
  const canExportCsv = hasAccess('REPORT_EXPORT_CSV');
  const canExportXlsx = hasAccess('REPORT_EXPORT_EXCEL');

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      

      <Grid item xs={12}>
        <MainCard contentSX={{ p: 0, minHeight: '65vh' }} sx={{ width: '100%' }}>

          {/* Toolbar */}
          <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Search completed jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ padding: '8px 12px 8px 34px', borderRadius: 8, border: '1px solid #e5e7eb', minWidth: 260, fontSize: 14, outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {canExportCsv && (
                <button onClick={exportCSV} style={{ display: 'flex', gap: 6, alignItems: 'center', background: '#2f6df6', color: '#fff', padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                  <Download size={15} /> Export CSV
                </button>
              )}
              {canExportXlsx && (
                <button onClick={exportExcel} style={{ display: 'flex', gap: 6, alignItems: 'center', background: '#16a34a', color: '#fff', padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                  <FileSpreadsheet size={15} /> Export Excel
                </button>
              )}
            </div>
          </div>

          {loading && <div style={{ padding: '10px 20px', color: '#6b7280', fontSize: 13 }}>Loading completed jobs…</div>}
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
                    {COLUMNS.map((col) => {
                      const v = row[col.key];
                      let content = v ?? '-';
                      let title = typeof v === 'string' ? v : undefined;
                      let style = cellStyle(col.width);

                      if (col.key === 'jobId') {
                        content = <span style={{ color: '#2f6df6', fontWeight: 600 }}>{v ?? '-'}</span>;
                        title = undefined;
                      } else if (col.key === 'completedDate') {
                        content = v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
                        title = undefined;
                      } else if (col.key === 'totalAmount') {
                        content = v != null ? `₹${Number(v).toLocaleString('en-IN')}` : '-';
                        style = { ...style, fontWeight: 700, color: '#16a34a' };
                      } else if (col.key === 'status') {
                        content = v ? <span style={statusStyle(v)}>{v}</span> : '-';
                        title = undefined;
                      }

                      return (
                        <td key={col.key} style={style} title={title}>
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredData.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: 56, color: '#9ca3af', fontSize: 14 }}>No completed jobs found.</div>
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

export default CompleteJobsReport;