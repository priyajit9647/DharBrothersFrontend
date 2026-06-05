import { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';

import MainCard from 'components/MainCard';
import useAccess from 'hooks/useAccess';
import { Search, Download, FileSpreadsheet } from 'lucide-react';
import Loader from 'components/Loader';
import { getSalesReport, exportSalesReport } from 'api/Reports&Insights';

const COLUMNS = [
  { key: 'customerId', label: 'Customer ID', width: 120 },
  { key: 'month', label: 'Month', width: 120 },
  { key: 'year', label: 'Year', width: 90 },
  { key: 'state', label: 'State', width: 160 },
  { key: 'pincode', label: 'Pincode', width: 120 },
  { key: 'university', label: 'University', width: 300 },
  { key: 'orderAmount', label: 'Order Amount', width: 140 },
  { key: 'totalTime', label: 'Total Time Taken', width: 160 },
  { key: 'newPhase', label: 'New Phase', width: 140 },
  { key: 'designPhase', label: 'Design Phase', width: 140 },
  { key: 'printingTime', label: 'Printing Time', width: 140 },
  { key: 'bindingTime', label: 'Binding Time', width: 140 },
  { key: 'dispatchTime', label: 'Dispatch Time', width: 140 },
  { key: 'customerRating', label: 'Customer Rating', width: 120 }
];

const cellStyle = (width) => ({
  padding: '11px 14px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: width,
  width: width,
  minWidth: width,
  boxSizing: 'border-box'
});

export default function SalesReport() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [orderId, setOrderId] = useState('');
  
  const [page, setPage] = useState(0);
  const size = 10;
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  // No real data shown per requirements — keep table empty
  const getFilterParams = () => ({
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    state: stateVal || undefined,
    customerId: customerId || undefined,
    orderNumber: orderId || undefined
  });

  const exportFile = async (format = 'csv') => {
    if (exporting) return;
    setExporting(true);
    setError(null);
    try {
      const params = { ...getFilterParams(), format };
      const response = await exportSalesReport(params);

      // Inspect content type to decide how to handle the response
      const contentType = (response.headers.get('content-type') || '').toLowerCase();

      // Helper to trigger download from a blob
      const downloadBlob = (blob, filename) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => window.URL.revokeObjectURL(url), 5000);
      };

      // Default filename
      let filename = `sales-report.${format === 'xlsx' ? 'xlsx' : 'csv'}`;

      // Try to extract filename from headers
      try {
        const cd = response.headers.get('content-disposition') || response.headers.get('Content-Disposition') || '';
        const m = cd.match(/filename\*?=([^;]+)/i);
        if (m && m[1]) {
          let name = m[1].trim();
          name = name.replace(/^UTF-8''/i, '').replace(/^["']|["']$/g, '');
          filename = decodeURIComponent(name);
        }
      } catch (e) {
        // ignore
      }

      if (contentType.includes('application/json')) {
        // Server returned a JSON payload; it may contain a string (url or base64)
        const json = await response.json();

        // If the JSON itself is a string
        let payloadString = null;
        if (typeof json === 'string') payloadString = json;
        else if (json && typeof json === 'object') {
          // find first string value
          const val = Object.values(json).find((v) => typeof v === 'string');
          if (val) payloadString = val;
        }

        if (!payloadString) throw new Error('Export endpoint returned unexpected JSON payload');

        // If payloadString is a URL, just open it
        if (/^https?:\/\//i.test(payloadString)) {
          window.open(payloadString, '_blank');
        } else if (/^data:/i.test(payloadString)) {
          // data URI -> convert to blob
          const parts = payloadString.split(',');
          const meta = parts[0];
          const isBase64 = /;base64$/.test(meta);
          const mime = meta.split(':')[1].split(';')[0] || (format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv');
          const content = parts[1] || '';
          const byteString = isBase64 ? atob(content) : decodeURIComponent(content);
          const ia = new Uint8Array(byteString.length);
          for (let i = 0; i < byteString.length; i += 1) ia[i] = byteString.charCodeAt(i);
          downloadBlob(new Blob([ia], { type: mime }), filename);
        } else {
          // Assume raw base64 string -> decode
          const b64 = payloadString.replace(/\s+/g, '');
          try {
            const byteString = atob(b64);
            const ia = new Uint8Array(byteString.length);
            for (let i = 0; i < byteString.length; i += 1) ia[i] = byteString.charCodeAt(i);
            const mime = format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv';
            downloadBlob(new Blob([ia], { type: mime }), filename);
          } catch (e) {
            // fallback: open as text in new tab
            const text = String(payloadString);
            const blob = new Blob([text], { type: 'text/plain' });
            downloadBlob(blob, filename);
          }
        }
      } else if (contentType.includes('text') || contentType === '') {
        // plain text response (maybe a URL)
        const text = await response.text();
        if (/^https?:\/\//i.test(text.trim())) {
          window.open(text.trim(), '_blank');
        } else {
          // download as file
          const blob = new Blob([text], { type: contentType || 'text/plain' });
          downloadBlob(blob, filename);
        }
      } else {
        // binary stream -> blob
        const blob = await response.blob();
        downloadBlob(blob, filename);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Export failed', err);
      setError(err?.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const fetchData = async (p = page) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: p,
        size,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        state: stateVal || undefined,
        customerId: customerId || undefined,
        orderNumber: orderId || undefined,
        
      };

      const res = await getSalesReport(params);
      setItems(Array.isArray(res.items) ? res.items : []);
      setTotal(Number(res.total || 0));
      setPage(Number(res.page ?? p));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load sales report', err);
      setError(err?.message || 'Failed to load sales report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { hasAccess } = useAccess();
  const canExportCsv = hasAccess('REPORT_EXPORT_CSV');
  const canExportXlsx = hasAccess('REPORT_EXPORT_EXCEL');

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      {(loading || exporting) && <Loader />}
      <Grid item xs={12}>
        <Typography variant="h5">Sales Report</Typography>
        <Typography variant="body2" color="text.secondary">
          Sales reporting with filters and export options.
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard title="Filter Report" contentSX={{ p: 2 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ minWidth: 180 }}>
              <TextField
                label="From Date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                fullWidth
              />
            </div>
            <div style={{ minWidth: 180 }}>
              <TextField
                label="To Date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                fullWidth
              />
            </div>
            <div style={{ minWidth: 180 }}>
              <TextField
                label="State"
                select
                size="small"
                value={stateVal}
                onChange={(e) => setStateVal(e.target.value)}
                fullWidth
              >
                <MenuItem value="">Select</MenuItem>
              </TextField>
            </div>
            <div style={{ minWidth: 180 }}>
              <TextField
                label="Customer ID"
                size="small"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                fullWidth
              />
            </div>
            <div style={{ minWidth: 180 }}>
              <TextField
                label="Order ID"
                size="small"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                fullWidth
              />
            </div>
            <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
              <Button variant="contained" color="primary" onClick={() => { setPage(0); fetchData(0); }} startIcon={<Search size={14} />}>
                Search
              </Button>
            </div>
          </div>
        </MainCard>
      </Grid>

      <Grid item xs={12}>
        <MainCard contentSX={{ p: 0, minHeight: '60vh' }} sx={{ width: '100%' }}>
          <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Typography variant="h6" sx={{ m: 0 }}>Sales Report</Typography>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {canExportCsv && (
                <button onClick={() => exportFile('csv')} style={{ display: 'flex', gap: 6, alignItems: 'center', background: '#2f6df6', color: '#fff', padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                  <Download size={15} /> Export CSV
                </button>
              )}
              {canExportXlsx && (
                <button onClick={() => exportFile('xlsx')} style={{ display: 'flex', gap: 6, alignItems: 'center', background: '#16a34a', color: '#fff', padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                  <FileSpreadsheet size={15} /> Export Excel
                </button>
              )}
            </div>
          </div>

          <div style={{ overflow: 'auto', width: '100%', maxHeight: 'calc(60vh - 110px)' }}>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: COLUMNS.reduce((s, c) => s + c.width, 0) }}>
              <colgroup>
                {COLUMNS.map((col) => <col key={col.key} style={{ width: col.width }} />)}
              </colgroup>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  {COLUMNS.map((col) => (
                    <th key={col.key} style={{ textAlign: 'left', padding: '11px 14px', fontWeight: 600, fontSize: 13, color: '#374151', position: 'sticky', top: 0, background: '#f8fafc', zIndex: 2, borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap' }}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items && items.length > 0
                  ? items.map((row, rIdx) => (
                      <tr key={row.orderNumber ?? row.customerId ?? rIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        {COLUMNS.map((col) => {
                          let value = '';
                          switch (col.key) {
                            case 'customerId':
                              value = row.customerId ?? '';
                              break;
                            case 'month':
                              value = row.month ?? '';
                              break;
                            case 'year':
                              value = row.year ?? '';
                              break;
                            case 'state':
                              value = row.state ?? '';
                              break;
                            case 'pincode':
                              value = row.pincode ?? '';
                              break;
                            case 'university':
                              value = row.university ?? '';
                              break;
                            case 'orderAmount':
                              value = typeof row.orderAmount === 'number' ? row.orderAmount.toFixed(2) : row.orderAmount ?? '';
                              break;
                            case 'totalTime':
                              value = row.totalTimeTaken ?? row.totalTime ?? '';
                              break;
                            case 'newPhase':
                              value = row.newPhaseTime ?? row.newPhase ?? '';
                              break;
                            case 'designPhase':
                              value = row.designPhaseTime ?? row.designPhase ?? '';
                              break;
                            case 'printingTime':
                              value = row.printingTime ?? '';
                              break;
                            case 'bindingTime':
                              value = row.bindingTime ?? '';
                              break;
                            case 'dispatchTime':
                              value = row.dispatchTime ?? '';
                              break;
                            case 'customerRating':
                              value = row.customerRating ?? '';
                              break;
                            default:
                              value = row[col.key] ?? '';
                          }

                          return (
                            <td key={col.key} style={cellStyle(col.width)}>
                              {value}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 56 }}>
                <Typography>Loading sales data...</Typography>
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: 56, color: '#ef4444', fontSize: 14 }}>{error}</div>
            ) : items && items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 56, color: '#9ca3af', fontSize: 14 }}>No sales data available.</div>
            ) : null}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ color: '#6b7280', fontSize: 13 }}>
              {total === 0 ? 'Showing 0 of 0 items' : `Showing ${page * size + 1} - ${Math.min((page + 1) * size, total)} of ${total} items`}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {(() => {
                const totalPages = Math.max(1, Math.ceil(total / size));
                const isFirst = page <= 0;
                const isLast = page >= totalPages - 1;
                const btnStyle = (enabled) => ({ padding: '5px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: enabled ? '#fff' : '#f9fafb', color: enabled ? '#374151' : '#d1d5db', cursor: enabled ? 'pointer' : 'not-allowed', fontSize: 13 });

                return (
                  <>
                    <button
                      onClick={() => {
                        if (isFirst) return;
                        const next = page - 1;
                        setPage(next);
                        fetchData(next);
                      }}
                      style={btnStyle(!isFirst)}
                      disabled={isFirst}
                    >
                      ← Prev
                    </button>
                    <span style={{ color: '#374151', fontSize: 13, minWidth: 90, textAlign: 'center' }}>{`Page ${page + 1} of ${totalPages}`}</span>
                    <button
                      onClick={() => {
                        if (isLast) return;
                        const next = page + 1;
                        setPage(next);
                        fetchData(next);
                      }}
                      style={btnStyle(!isLast)}
                      disabled={isLast}
                    >
                      Next →
                    </button>
                  </>
                );
              })()}
            </div>
          </div>

        </MainCard>
      </Grid>
    </Grid>
  );
}
