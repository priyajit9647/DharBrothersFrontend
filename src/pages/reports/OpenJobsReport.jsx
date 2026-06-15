// OpenJobsReport.jsx

import { useMemo, useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';

import MainCard from 'components/MainCard';
import useAccess from 'hooks/useAccess';
import { Search, Download, FileSpreadsheet } from 'lucide-react';
import { getOpenJobsReport, exportOpenJobs } from 'api/Reports&Insights';

const MOCK_DATA = [
  { jobId: 'JOB-2101', client: 'Tata Steel', branch: 'Kolkata', department: 'Printing', assignedTo: 'Rahul Sharma', stage: 'Production', sla: '12 hrs', priority: 'High', status: 'Open' },
  { jobId: 'JOB-2102', client: 'Reliance', branch: 'Mumbai', department: 'Packaging', assignedTo: 'Amit Das', stage: 'Dispatch', sla: '8 hrs', priority: 'Medium', status: 'In Progress' },
  { jobId: 'JOB-2103', client: 'Infosys', branch: 'Delhi', department: 'Binding', assignedTo: 'Priya Sen', stage: 'QC', sla: '5 hrs', priority: 'Critical', status: 'Open' },
  { jobId: 'JOB-2104', client: 'Wipro', branch: 'Bangalore', department: 'Lamination', assignedTo: 'Rakesh Gupta', stage: 'Cutting', sla: '18 hrs', priority: 'Low', status: 'Pending' }
];

// Column definitions with explicit widths
const COLUMNS = [
  { key: 'orderId',              label: 'Order ID',          width: 160, sortKey: 'orderId' },
  { key: 'orderName',            label: 'Order Name',        width: 200, sortKey: 'orderName' },
  { key: 'customerName',         label: 'Customer',          width: 150, sortKey: 'customerName' },
  { key: 'assignedStaffName',    label: 'Assigned Staff',    width: 150, sortKey: 'assignedStaffName' },
  { key: 'city',                 label: 'City',              width: 110, sortKey: 'city' },
  { key: 'pincode',              label: 'Pincode',           width: 90,  sortKey: 'pincode' },
  { key: 'totalAmount',          label: 'Amount',            width: 100, sortKey: 'totalAmount' },
  { key: 'expectedDeliveryDate', label: 'Expected Delivery', width: 170, sortKey: 'expectedDeliveryDate' },
  { key: 'status',               label: 'Status',            width: 140, sortKey: 'status' },
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

const statusStyle = (status) => {
  const map = {
    'ORDER-CREATED': { bg: '#eef2ff', color: '#1e40af' },
    'In Progress':   { bg: '#fffbeb', color: '#92400e' },
    'Open':          { bg: '#dcfce7', color: '#15803d' },
    'Pending':       { bg: '#fef9c3', color: '#854d0e' },
  };
  const s = map[status] ?? { bg: '#f3f4f6', color: '#6b7280' };
  return {
    padding: '3px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    background: s.bg,
    color: s.color,
    display: 'inline-block',
    whiteSpace: 'nowrap',
  };
};

export default function OpenJobsReport() {
  const [search, setSearch]       = useState('');
  const [sortField, setSortField] = useState('expectedDeliveryDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [data, setData]           = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [page, setPage]           = useState(0);
  const [size, setSize]           = useState(10);
  const [total, setTotal]         = useState(0);

  const handleSort = (field) => {
    if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('asc'); }
  };

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      setLoading(true); setError(null);
      try {
        const resp = await getOpenJobsReport({ page, size, sort: `${sortField},${sortOrder}` });
        if (!mounted) return;
        setData(Array.isArray(resp.items) ? resp.items : []);
        setTotal(Number(resp.total ?? 0));
      } catch (err) {
        console.error('Failed to fetch open jobs report', err);
        if (!mounted) return;
        setError(String(err?.message ?? err));
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
    const source = Array.isArray(data) && data.length ? data : MOCK_DATA;
    let filtered = source.filter((item) =>
      Object.values(item).join(' ').toLowerCase().includes(search.toLowerCase())
    );
    filtered.sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [search, sortField, sortOrder, data]);

  const exportCSV = () => {
    const source = filteredData.length ? filteredData : (data.length ? data : MOCK_DATA);
    const headers = Object.keys(source[0] || {}).join(',');
    const rows = source.map((row) => Object.values(row).join(','));
    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.setAttribute('download', 'open_jobs_report.csv');
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const exportExcel = async () => {
    try {
      const resp = await exportOpenJobs({ page, size, sort: `${sortField},${sortOrder}`, format: 'xlsx' });
      const blob = await resp.blob();
      const disposition = resp.headers.get ? resp.headers.get('content-disposition') || '' : '';
      let filename = 'open_jobs_report.xlsx';
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
            if (col.key === 'expectedDeliveryDate' && v) {
              const d = new Date(v);
              if (!Number.isNaN(d.getTime())) v = d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            }
            if (v == null) v = '';
            if (typeof v === 'object') v = JSON.stringify(v);
            obj[col.label] = v;
          });
          return obj;
        });
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Open Jobs');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.setAttribute('download', 'open_jobs_report.xlsx');
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      } catch (impErr) {
        console.error('Client-side export failed', impErr);
        alert('Export failed: ' + (impErr?.message || impErr) + '\nIf you are developing locally, install the xlsx package: npm i xlsx');
      }
    }
  };

  const totalOpen = total || (data.length || MOCK_DATA.length);
  const slaNear   = (Array.isArray(data) ? data : MOCK_DATA).filter((d) => Boolean(d.delayed)).length;

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span style={{ color: '#d1d5db', marginLeft: 4 }}>↕</span>;
    return <span style={{ color: '#2f6df6', marginLeft: 4 }}>{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  const { hasAccess } = useAccess();
  const canExportCsv = hasAccess('REPORT_EXPORT_CSV');
  const canExportXlsx = hasAccess('REPORT_EXPORT_EXCEL');

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      

      {/* Table card */}
      <Grid item xs={12}>
        <MainCard contentSX={{ p: 0, minHeight: '65vh' }} sx={{ width: '100%' }}>

          {/* Toolbar */}
          <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Search jobs..."
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
                <button onClick={() => exportExcel()} style={{ display: 'flex', gap: 6, alignItems: 'center', background: '#16a34a', color: '#fff', padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                  <FileSpreadsheet size={15} /> Export Excel
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div style={{ overflow: 'auto', width: '100%', maxHeight: 'calc(65vh - 110px)' }}>
            {loading && <div style={{ padding: 24, color: '#6b7280', fontSize: 14 }}>Loading open jobs…</div>}
            {error   && <div style={{ padding: '8px 20px', color: '#b91c1c', fontSize: 13 }}>⚠ Failed to load: {error}</div>}

            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: COLUMNS.reduce((s, c) => s + c.width, 0) }}>
              <colgroup>
                {COLUMNS.map((col) => <col key={col.key} style={{ width: col.width }} />)}
              </colgroup>

              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.sortKey)}
                      style={{
                        textAlign: 'left',
                        padding: '11px 14px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: 13,
                        color: '#374151',
                        position: 'sticky',
                        top: 0,
                        background: '#f8fafc',
                        zIndex: 2,
                        borderBottom: '2px solid #e5e7eb',
                        whiteSpace: 'nowrap',
                        userSelect: 'none',
                      }}
                    >
                      {col.label}<SortIcon field={col.sortKey} />
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredData.map((row, index) => (
                  <tr
                    key={index}
                    style={{ borderBottom: '1px solid #f3f4f6', background: index % 2 === 0 ? '#fff' : '#fafbfc' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f0f6ff'}
                    onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? '#fff' : '#fafbfc'}
                  >
                    {/* Order ID — truncated UUID with full title tooltip */}
                    <td style={{ ...cellStyle(COLUMNS[0].width) }} title={row.orderId}>
                      <span style={{ color: '#2f6df6', fontWeight: 600, fontFamily: 'monospace', fontSize: 12 }}>
                        {row.orderId ? row.orderId.slice(0, 13) + '…' : '-'}
                      </span>
                    </td>

                    <td style={cellStyle(COLUMNS[1].width)} title={row.orderName}>
                      {row.orderName ?? '-'}
                    </td>

                    <td style={cellStyle(COLUMNS[2].width)} title={row.customerName}>
                      {row.customerName ?? '-'}
                    </td>

                    <td style={cellStyle(COLUMNS[3].width)} title={row.assignedStaffName}>
                      {row.assignedStaffName?.trim() || '-'}
                    </td>

                    <td style={cellStyle(COLUMNS[4].width)}>
                      {row.city ?? '-'}
                    </td>

                    <td style={cellStyle(COLUMNS[5].width)}>
                      {row.pincode ?? '-'}
                    </td>

                    <td style={{ ...cellStyle(COLUMNS[6].width), fontWeight: 500 }}>
                      {row.totalAmount != null ? `₹${Number(row.totalAmount).toLocaleString('en-IN')}` : '-'}
                    </td>

                    <td style={cellStyle(COLUMNS[7].width)}>
                      {row.expectedDeliveryDate
                        ? new Date(row.expectedDeliveryDate).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : '-'}
                    </td>

                    <td style={cellStyle(COLUMNS[8].width)}>
                      <span style={statusStyle(row.status)}>{row.status ?? '-'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredData.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: 56, color: '#9ca3af', fontSize: 14 }}>No open jobs found.</div>
            )}
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ color: '#6b7280', fontSize: 13 }}>
              Showing {Math.min(filteredData.length, size)} of {total} items
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page <= 0}
                style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: page <= 0 ? '#f9fafb' : '#fff', color: page <= 0 ? '#d1d5db' : '#374151', cursor: page <= 0 ? 'not-allowed' : 'pointer', fontSize: 13 }}
              >
                ← Prev
              </button>
              <span style={{ color: '#374151', fontSize: 13, minWidth: 90, textAlign: 'center' }}>
                Page {page + 1} of {Math.max(1, Math.ceil(total / size))}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={(page + 1) * size >= total}
                style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: (page + 1) * size >= total ? '#f9fafb' : '#fff', color: (page + 1) * size >= total ? '#d1d5db' : '#374151', cursor: (page + 1) * size >= total ? 'not-allowed' : 'pointer', fontSize: 13 }}
              >
                Next →
              </button>
            </div>
          </div>

        </MainCard>
      </Grid>
    </Grid>
  );
}