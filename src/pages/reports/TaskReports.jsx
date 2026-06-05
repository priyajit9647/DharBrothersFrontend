import React, { useMemo, useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';
import useAccess from 'hooks/useAccess';
import { getTodayDueTasks } from 'api/Reports&Insights';
import { Search, Download, FileSpreadsheet } from 'lucide-react';

// ==============================|| BMS - TASK REPORTS ||============================== //

const COLUMNS = [
  { key: 'orderId', label: 'Order ID', width: 140 },
  { key: 'orderNumber', label: 'Order No.', width: 120 },
  { key: 'customerName', label: 'Customer', width: 180 },
  { key: 'mobile', label: 'Mobile', width: 130 },
  { key: 'branchName', label: 'Branch', width: 140 },
  { key: 'processStage', label: 'Stage', width: 160 },
  { key: 'bindingType', label: 'Binding', width: 140 },
  { key: 'totalPages', label: 'Pages', width: 100 },
  { key: 'expectedDeliveryDate', label: 'Expected Delivery', width: 160 },
  { key: 'deliveryLocation', label: 'Delivery Location', width: 200 },
  { key: 'assignedStaff', label: 'Assigned Staff', width: 160 },
  { key: 'comments', label: 'Comments', width: 260 }
];

const MOCK_DATA = [
  {
    orderId: 'ORD-9001',
    orderNumber: '2026/9001',
    customerName: 'Sumitra Das',
    mobile: '9876543210',
    branchName: 'Behala',
    processStage: 'Printing',
    bindingType: 'Hard Binding',
    totalPages: 320,
    expectedDeliveryDate: '2026-05-29T06:37:42.217Z',
    comments: 'High priority; use glossy paper',
    deliveryLocation: 'Lenin Sarani',
    assignedStaff: 'Sanchali Ghosh'
  },
  {
    orderId: 'ORD-9002',
    orderNumber: '2026/9002',
    customerName: 'Priyanka Mukherjee',
    mobile: '9123456780',
    branchName: 'Park Street',
    processStage: 'Binding',
    bindingType: 'Perfect Binding',
    totalPages: 128,
    expectedDeliveryDate: '2026-05-30T08:00:00.000Z',
    comments: 'Include pocket',
    deliveryLocation: 'Park Street Office',
    assignedStaff: 'Wilson Peter Minz'
  }
];

const cellStyle = (width) => ({
  padding: '11px 14px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: width,
  width,
  minWidth: width,
  boxSizing: 'border-box'
});

export default function TaskReports() {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('expectedDeliveryDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [total, setTotal] = useState(0);

  const handleSort = (field) => {
    if (sortField === field) setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortOrder('asc'); }
  };

  const filteredData = useMemo(() => {
    const source = hasError ? MOCK_DATA : data;
    return source
      .filter((row) => Object.values(row).join(' ').toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        const va = a[sortField];
        const vb = b[sortField];
        if (va == null && vb == null) return 0;
        if (va == null) return 1;
        if (vb == null) return -1;
        if (sortField === 'expectedDeliveryDate') {
          return (new Date(va) - new Date(vb)) * (sortOrder === 'asc' ? 1 : -1);
        }
        if (va < vb) return sortOrder === 'asc' ? -1 : 1;
        if (va > vb) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [data, search, sortField, sortOrder]);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      setLoading(true);
      setError(null);
      setHasError(false);
      try {
        const resp = await getTodayDueTasks({ page, size, sort: `${sortField},${sortOrder}` });
        if (!mounted) return;
        setData(Array.isArray(resp.items) ? resp.items : (resp.items ?? []));
        setTotal(Number(resp.total ?? 0));
      } catch (err) {
        console.error('Failed to fetch today due tasks', err);
        if (!mounted) return;
        setError(String(err?.message ?? err));
        setHasError(true);
        setData(MOCK_DATA);
        setTotal(MOCK_DATA.length);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return () => { mounted = false; };
  }, [page, size, sortField, sortOrder]);

  const exportCSV = () => {
    const source = filteredData.length ? filteredData : data;
    if (!source.length) return;
    const headers = COLUMNS.map((c) => c.key).join(',');
    const rows = source.map((r) => COLUMNS.map((c) => {
      const v = r[c.key];
      if (c.key === 'expectedDeliveryDate') return v ? new Date(v).toISOString() : '';
      return typeof v === 'string' ? `"${(v || '').replace(/"/g, '""')}"` : (v ?? '');
    }).join(','));
    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.setAttribute('download', 'task_reports.csv');
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span style={{ color: '#d1d5db', marginLeft: 6 }}>↕</span>;
    return <span style={{ color: '#2f6df6', marginLeft: 6 }}>{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  const { hasAccess } = useAccess();
  const canExportCsv = hasAccess('REPORT_EXPORT_CSV');
  const canExportXlsx = hasAccess('REPORT_EXPORT_EXCEL');

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">Task Reports</Typography>
        <Typography variant="body2" color="text.secondary">
          Task-level report showing orders, assigned staff, expected delivery and notes.
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard contentSX={{ p: 0, minHeight: '65vh' }} sx={{ width: '100%' }}>

          <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Search tasks (order id, customer, staff)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ padding: '8px 12px 8px 34px', borderRadius: 8, border: '1px solid #e5e7eb', minWidth: 320, fontSize: 14, outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {canExportCsv && (
                <button onClick={exportCSV} style={{ display: 'flex', gap: 6, alignItems: 'center', background: '#2f6df6', color: '#fff', padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                  <Download size={15} /> Export CSV
                </button>
              )}
              {canExportXlsx && (
                <button style={{ display: 'flex', gap: 6, alignItems: 'center', background: '#16a34a', color: '#fff', padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                  <FileSpreadsheet size={15} /> Export Excel
                </button>
              )}
            </div>
          </div>

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
                {filteredData.slice(page * size, (page + 1) * size).map((row, index) => (
                  <tr key={index}
                    style={{ borderBottom: '1px solid #f3f4f6', background: index % 2 === 0 ? '#fff' : '#fafbfc' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f0f9ff'}
                    onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? '#fff' : '#fafbfc'}
                  >
                    <td style={cellStyle(COLUMNS[0].width)}>
                      <span style={{ color: '#2f6df6', fontWeight: 600 }}>{row.orderId ?? '-'}</span>
                    </td>
                    <td style={cellStyle(COLUMNS[1].width)}>{row.orderNumber ?? '-'}</td>
                    <td style={cellStyle(COLUMNS[2].width)} title={row.customerName}>{row.customerName ?? '-'}</td>
                    <td style={cellStyle(COLUMNS[3].width)}>{row.mobile ?? '-'}</td>
                    <td style={cellStyle(COLUMNS[4].width)}>{row.branchName ?? '-'}</td>
                    <td style={cellStyle(COLUMNS[5].width)}>{row.processStage ?? '-'}</td>
                    <td style={cellStyle(COLUMNS[6].width)}>{row.bindingType ?? '-'}</td>
                    <td style={cellStyle(COLUMNS[7].width)}>{row.totalPages != null ? row.totalPages.toLocaleString() : '-'}</td>
                    <td style={cellStyle(COLUMNS[8].width)}>{row.expectedDeliveryDate ? new Date(row.expectedDeliveryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</td>
                    <td style={cellStyle(COLUMNS[9].width)} title={row.deliveryLocation}>{row.deliveryLocation ?? '-'}</td>
                    <td style={cellStyle(COLUMNS[10].width)} title={row.assignedStaff}>{row.assignedStaff ?? '-'}</td>
                    <td style={cellStyle(COLUMNS[11].width)} title={row.comments}>{row.comments ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredData.length === 0 && (
              <div style={{ textAlign: 'center', padding: 56, color: '#9ca3af', fontSize: 14 }}>No task reports found.</div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ color: '#6b7280', fontSize: 13 }}>
              Showing {Math.min(filteredData.length - page * size, size)} of {filteredData.length} items
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page <= 0}
                style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: page <= 0 ? '#f9fafb' : '#fff', color: page <= 0 ? '#d1d5db' : '#374151', cursor: page <= 0 ? 'not-allowed' : 'pointer', fontSize: 13 }}>
                ← Prev
              </button>
              <span style={{ color: '#374151', fontSize: 13, minWidth: 90, textAlign: 'center' }}>
                Page {page + 1} of {Math.max(1, Math.ceil(filteredData.length / size))}
              </span>
              <button onClick={() => setPage((p) => p + 1)} disabled={(page + 1) * size >= filteredData.length}
                style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: (page + 1) * size >= filteredData.length ? '#f9fafb' : '#fff', color: (page + 1) * size >= filteredData.length ? '#d1d5db' : '#374151', cursor: (page + 1) * size >= filteredData.length ? 'not-allowed' : 'pointer', fontSize: 13 }}>
                Next →
              </button>
            </div>
          </div>

        </MainCard>
      </Grid>
    </Grid>
  );
}
