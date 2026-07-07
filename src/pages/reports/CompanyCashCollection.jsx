import { useState, useEffect, useMemo } from 'react';
import Grid from '@mui/material/Grid';
import MainCard from 'components/MainCard';
import { Search, Download, FileSpreadsheet } from 'lucide-react';
import { getCompanyCashCollection } from 'api/Reports&Insights';
import * as XLSX from 'xlsx';
import useAccess from 'hooks/useAccess';

// ─── Constants ────────────────────────────────────────────────────────────────

const PAYMENT_MODES = ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'PARTIAL'];

/**
 * Actual API response shape (array of branch objects):
 * {
 *   id, branchId, beanchName, orderId, orderCount,
 *   totalAmount, totalOnline, totalOnlineCount,
 *   totalCash, totalCashCount
 * }
 */
const COLUMNS = [
  { key: 'beanchName',       label: 'Branch',            width: 200 },
  { key: 'orderCount',       label: 'Orders',            width: 100 },
  { key: 'totalAmount',      label: 'Total Amount (₹)',  width: 160 },
  { key: 'totalOnline',      label: 'Online (₹)',        width: 150 },
  { key: 'totalOnlineCount', label: 'Online Txns',       width: 120 },
  { key: 'totalCash',        label: 'Cash (₹)',          width: 150 },
  { key: 'totalCashCount',   label: 'Cash Txns',         width: 120 }
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtAmt(v) {
  if (v == null || v === '') return '-';
  const n = Number(v);
  return isNaN(n) ? String(v) : n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtCount(v) {
  if (v == null || v === '') return '-';
  const n = Number(v);
  return isNaN(n) ? String(v) : n.toLocaleString('en-IN');
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CompanyCashCollection() {
  const [startDate, setStartDate]     = useState('');
  const [endDate, setEndDate]         = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [search, setSearch]           = useState('');

  const [sortField, setSortField] = useState('totalAmount');
  const [sortOrder, setSortOrder] = useState('desc');

  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const { hasAccess } = useAccess();
  const canExportCsv  = hasAccess('REPORT_EXPORT_CSV');
  const canExportXlsx = hasAccess('REPORT_EXPORT_EXCEL');

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const sDate = startDate ? new Date(startDate).toISOString().split('T')[0] : undefined;
      const eDate = endDate   ? new Date(endDate).toISOString().split('T')[0]   : undefined;
      const resp = await getCompanyCashCollection({
        paymentMode: paymentMode || undefined,
        startDate: sDate,
        endDate: eDate
      });
      // API returns a plain array
      const list = Array.isArray(resp) ? resp : (resp?.data ?? resp?.content ?? resp?.items ?? []);
      setRows(list);
    } catch (err) {
      console.error('Failed to fetch cash collection report', err);
      setError(String(err?.message ?? err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => fetchData();
  const handleReset  = () => {
    setStartDate(''); setEndDate(''); setPaymentMode(''); setSearch('');
    setTimeout(fetchData, 0);
  };

  // ── Sort + filter (client-side) ──────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = [...rows];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        String(r.beanchName ?? '').toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      const va = a[sortField]; const vb = b[sortField];
      if (va == null) return 1; if (vb == null) return -1;
      const dir = sortOrder === 'asc' ? 1 : -1;
      if (typeof va === 'number') return (va - vb) * dir;
      return String(va).localeCompare(String(vb)) * dir;
    });
    return list;
  }, [rows, search, sortField, sortOrder]);

  const handleSort = (field) => {
    if (sortField === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('desc'); }
  };

  // ── Grand totals ─────────────────────────────────────────────────────────

  const totals = useMemo(() => filtered.reduce((acc, r) => ({
    orderCount:       acc.orderCount       + Number(r.orderCount       ?? 0),
    totalAmount:      acc.totalAmount      + Number(r.totalAmount      ?? 0),
    totalOnline:      acc.totalOnline      + Number(r.totalOnline      ?? 0),
    totalOnlineCount: acc.totalOnlineCount + Number(r.totalOnlineCount ?? 0),
    totalCash:        acc.totalCash        + Number(r.totalCash        ?? 0),
    totalCashCount:   acc.totalCashCount   + Number(r.totalCashCount   ?? 0)
  }), { orderCount: 0, totalAmount: 0, totalOnline: 0, totalOnlineCount: 0, totalCash: 0, totalCashCount: 0 }), [filtered]);

  // ── Export ───────────────────────────────────────────────────────────────

  const exportCSV = () => {
    if (!filtered.length) return;
    const headers = COLUMNS.map(c => c.label).join(',');
    const body = filtered.map(r => COLUMNS.map(c => {
      const v = r[c.key] ?? '';
      return typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v;
    }).join(',')).join('\n');
    const blob = new Blob([[headers, body].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.setAttribute('download', 'cash_collection.csv');
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const exportExcel = () => {
    if (!filtered.length) return;
    const data = filtered.map(r => {
      const obj = {};
      COLUMNS.forEach(c => { obj[c.label] = r[c.key] ?? ''; });
      return obj;
    });
    const sheet = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, 'Cash Collection');
    XLSX.writeFile(wb, 'cash_collection.xlsx');
  };

  // ── Sort icon ────────────────────────────────────────────────────────────

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span style={{ color: '#d1d5db', marginLeft: 4 }}>↕</span>;
    return <span style={{ color: '#2f6df6', marginLeft: 4 }}>{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>

      {/* ── KPI Cards ── */}
      {filtered.length > 0 && (
        <Grid item xs={12}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={kpiCard('#2f6df6')}>
              <div style={kpiLabel}>Total Collection</div>
              <div style={kpiValue}>₹{fmtAmt(totals.totalAmount)}</div>
              <div style={kpiSub}>{fmtCount(totals.orderCount)} orders · {filtered.length} branches</div>
            </div>
            <div style={kpiCard('#16a34a')}>
              <div style={kpiLabel}>Online Collection</div>
              <div style={kpiValue}>₹{fmtAmt(totals.totalOnline)}</div>
              <div style={kpiSub}>{fmtCount(totals.totalOnlineCount)} transactions</div>
            </div>
            <div style={kpiCard('#ea580c')}>
              <div style={kpiLabel}>Cash Collection</div>
              <div style={kpiValue}>₹{fmtAmt(totals.totalCash)}</div>
              <div style={kpiSub}>{fmtCount(totals.totalCashCount)} transactions</div>
            </div>
          </div>
        </Grid>
      )}

      <Grid item xs={12}>
        <MainCard contentSX={{ p: 0, minHeight: '55vh' }} sx={{ width: '100%' }}>

          {/* ── Filters bar ── */}
          <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>

              {/* Search */}
              <div>
                <label style={filterLabel}>Branch Search</label>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                  <input
                    type="text"
                    placeholder="Search branch…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ ...inputSx, paddingLeft: 32, minWidth: 200 }}
                  />
                </div>
              </div>

              {/* Payment Mode */}
              <div>
                <label style={filterLabel}>Payment Mode</label>
                <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} style={selectSx}>
                  <option value="">All Modes</option>
                  {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {/* Dates */}
              <div>
                <label style={filterLabel}>From Date</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputSx} />
              </div>
              <div>
                <label style={filterLabel}>To Date</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={inputSx} />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleSearch} style={btnPrimary}>
                  <Search size={14} style={{ marginRight: 4 }} />Search
                </button>
                <button onClick={handleReset} style={btnSecondary}>Reset</button>
              </div>
            </div>

            {/* Export */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={exportCSV}
                disabled={!canExportCsv}
                title={!canExportCsv ? 'No permission to export CSV' : 'Export CSV'}
                style={{ ...btnExport('#2f6df6'), opacity: canExportCsv ? 1 : 0.6, cursor: canExportCsv ? 'pointer' : 'not-allowed' }}
              >
                <Download size={14} style={{ marginRight: 4 }} />CSV
              </button>
              <button
                onClick={exportExcel}
                disabled={!canExportXlsx}
                title={!canExportXlsx ? 'No permission to export Excel' : 'Export Excel'}
                style={{ ...btnExport('#16a34a'), opacity: canExportXlsx ? 1 : 0.6, cursor: canExportXlsx ? 'pointer' : 'not-allowed' }}
              >
                <FileSpreadsheet size={14} style={{ marginRight: 4 }} />Excel
              </button>
            </div>
          </div>

          {/* ── Status ── */}
          {loading && <div style={{ padding: 20, color: '#6b7280' }}>Loading cash collection data…</div>}
          {error   && <div style={{ padding: '10px 20px', color: '#b91c1c' }}>⚠ Failed to load: {error}</div>}

          {/* ── Table ── */}
          <div style={{ overflow: 'auto', width: '100%', maxHeight: 'calc(55vh - 60px)' }}>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  <th style={{ ...thSx, width: 48, textAlign: 'center' }}>#</th>
                  {COLUMNS.map(col => (
                    <th key={col.key} onClick={() => handleSort(col.key)} style={{ ...thSx, width: col.width }}>
                      {col.label}<SortIcon field={col.key} />
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filtered.map((row, i) => (
                  <tr
                    key={row.id ?? i}
                    style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafbfc'}
                  >
                    <td style={{ padding: '11px 14px', textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>{i + 1}</td>
                    <td style={{ padding: '11px 14px', fontWeight: 600 }}>{row.beanchName ?? '-'}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'center' }}>{fmtCount(row.orderCount)}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', fontWeight: 700, color: '#1d4ed8' }}>₹{fmtAmt(row.totalAmount)}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', color: '#16a34a', fontWeight: 600 }}>₹{fmtAmt(row.totalOnline)}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'center', color: '#16a34a' }}>{fmtCount(row.totalOnlineCount)}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', color: '#ea580c', fontWeight: 600 }}>₹{fmtAmt(row.totalCash)}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'center', color: '#ea580c' }}>{fmtCount(row.totalCashCount)}</td>
                  </tr>
                ))}

                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={COLUMNS.length + 1} style={{ textAlign: 'center', padding: 56, color: '#9ca3af', fontSize: 14 }}>
                      No cash collection data found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>

              {/* Grand total footer */}
              {filtered.length > 0 && (
                <tfoot style={{ background: '#f1f5f9', borderTop: '2px solid #e5e7eb' }}>
                  <tr>
                    <td style={{ padding: '11px 14px', fontWeight: 700, textAlign: 'center', color: '#374151' }} />
                    <td style={{ padding: '11px 14px', fontWeight: 700 }}>Total ({filtered.length} branches)</td>
                    <td style={{ padding: '11px 14px', textAlign: 'center', fontWeight: 700 }}>{fmtCount(totals.orderCount)}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', fontWeight: 700, color: '#1d4ed8' }}>₹{fmtAmt(totals.totalAmount)}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>₹{fmtAmt(totals.totalOnline)}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'center', fontWeight: 700, color: '#16a34a' }}>{fmtCount(totals.totalOnlineCount)}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', fontWeight: 700, color: '#ea580c' }}>₹{fmtAmt(totals.totalCash)}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'center', fontWeight: 700, color: '#ea580c' }}>{fmtCount(totals.totalCashCount)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

        </MainCard>
      </Grid>
    </Grid>
  );
}

// ─── Micro-styles ─────────────────────────────────────────────────────────────

const filterLabel = { fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 2 };
const inputSx     = { padding: 8, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 };
const selectSx    = { padding: 8, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, minWidth: 140 };
const btnPrimary  = { display: 'flex', alignItems: 'center', padding: '8px 14px', borderRadius: 8, border: 'none', background: '#2f6df6', color: '#fff', cursor: 'pointer', fontSize: 13 };
const btnSecondary = { padding: '8px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', cursor: 'pointer', fontSize: 13 };
const btnExport   = (bg) => ({ display: 'flex', alignItems: 'center', padding: '8px 14px', borderRadius: 8, border: 'none', background: bg, color: '#fff', fontSize: 13 });
const thSx        = { textAlign: 'left', padding: '11px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#374151', position: 'sticky', top: 0, background: '#f8fafc', zIndex: 2, borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap', userSelect: 'none' };
const kpiCard     = (bg) => ({ background: bg, color: '#fff', padding: '16px 24px', borderRadius: 12, minWidth: 180, flex: '1 1 180px', maxWidth: 280 });
const kpiLabel    = { fontSize: 12, opacity: 0.85, marginBottom: 4 };
const kpiValue    = { fontSize: 22, fontWeight: 700 };
const kpiSub      = { fontSize: 11, opacity: 0.75, marginTop: 4 };
