import { useState, useEffect, useMemo } from 'react';
import Grid from '@mui/material/Grid';
import MainCard from 'components/MainCard';
import { Search, Download, FileSpreadsheet } from 'lucide-react';
import { getCompanyCashCollection } from 'api/Reports&Insights';
import * as XLSX from 'xlsx';
import useAccess from 'hooks/useAccess';

// ─── Constants ────────────────────────────────────────────────────────────────

const PAYMENT_MODES = ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'PARTIAL'];

const DETAIL_COLUMNS = [
  { key: 'companyName',     label: 'Company Name',    width: 180 },
  { key: 'paymentMode',     label: 'Payment Mode',    width: 140 },
  { key: 'collectionDate',  label: 'Collection Date', width: 160 },
  { key: 'collectedBy',     label: 'Collected By',    width: 160 },
  { key: 'amount',          label: 'Amount (₹)',      width: 140 }
];

const SUMMARY_COLUMNS = [
  { key: 'companyName',  label: 'Company Name',  width: 200 },
  { key: 'orderCount',   label: 'Order Count',   width: 140 },
  { key: 'totalAmount',  label: 'Total Amount (₹)', width: 160 }
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(d) {
  if (!d) return '-';
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return d; }
}

function fmtAmt(v) {
  if (v == null || v === '') return '-';
  const n = Number(v);
  return isNaN(n) ? String(v) : n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const cellSx = (width) => ({
  padding: '11px 14px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: width,
  width,
  minWidth: width,
  boxSizing: 'border-box'
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function CompanyCashCollection() {
  const [startDate, setStartDate]       = useState('');
  const [endDate, setEndDate]           = useState('');
  const [paymentMode, setPaymentMode]   = useState('');
  const [activeTab, setActiveTab]       = useState('details'); // 'details' | 'summary' | 'paymentMode'

  const [page, setPage]   = useState(0);
  const [size]            = useState(10);
  const [sortField, setSortField] = useState('collectionDate');
  const [sortOrder, setSortOrder] = useState('desc');

  const [raw, setRaw]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const { hasAccess } = useAccess();
  const canExportCsv  = hasAccess('REPORT_EXPORT_CSV');
  const canExportXlsx = hasAccess('REPORT_EXPORT_EXCEL');

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchData = async (opts = {}) => {
    setLoading(true);
    setError(null);
    try {
      const sDate = startDate ? new Date(startDate).toISOString().split('T')[0] : undefined;
      const eDate = endDate   ? new Date(endDate).toISOString().split('T')[0]   : undefined;
      const resp = await getCompanyCashCollection({
        paymentMode: paymentMode || undefined,
        startDate: sDate,
        endDate: eDate,
        page: opts.page ?? page,
        size,
        sort: `${sortField},${sortOrder}`
      });
      setRaw(resp);
    } catch (err) {
      console.error('Failed to fetch cash collection report', err);
      setError(String(err?.message ?? err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData({ page: 0 }); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived data ─────────────────────────────────────────────────────────

  const summary         = useMemo(() => Array.isArray(raw?.summary) ? raw.summary : [], [raw]);
  const paymentModeSums = useMemo(() => Array.isArray(raw?.paymentModeSummary) ? raw.paymentModeSummary : [], [raw]);

  const detailsPage  = raw?.details ?? {};
  const detailRows   = useMemo(() => Array.isArray(detailsPage?.content) ? detailsPage.content : [], [detailsPage]);
  const totalPages   = Number(detailsPage?.totalPages ?? 1);
  const totalElements = Number(detailsPage?.totalElements ?? detailRows.length);

  // ── Sort for client-side tabs (summary & paymentMode) ────────────────────

  const sortedSummary = useMemo(() => {
    const list = [...summary];
    list.sort((a, b) => {
      const va = a[sortField]; const vb = b[sortField];
      if (va == null) return 1; if (vb == null) return -1;
      return (va < vb ? -1 : va > vb ? 1 : 0) * (sortOrder === 'asc' ? 1 : -1);
    });
    return list;
  }, [summary, sortField, sortOrder]);

  const sortedPaymentModes = useMemo(() => {
    return [...paymentModeSums];
  }, [paymentModeSums]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSearch = () => { setPage(0); fetchData({ page: 0 }); };
  const handleReset  = () => {
    setStartDate(''); setEndDate(''); setPaymentMode('');
    setPage(0);
    setTimeout(() => fetchData({ page: 0 }), 0);
  };
  const handleSort = (field) => {
    if (sortField === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('asc'); }
  };

  // ── Export helpers ───────────────────────────────────────────────────────

  const exportCurrentTabCSV = () => {
    let rows, cols, filename;
    if (activeTab === 'details') {
      cols = DETAIL_COLUMNS; rows = detailRows; filename = 'cash_collection_details.csv';
    } else if (activeTab === 'summary') {
      cols = SUMMARY_COLUMNS; rows = sortedSummary; filename = 'cash_collection_summary.csv';
    } else {
      cols = [
        { key: 'companyName', label: 'Company' },
        { key: 'paymentMode', label: 'Payment Mode' },
        { key: 'transactionCount', label: 'Transactions' },
        { key: 'amount', label: 'Amount' }
      ];
      rows = sortedPaymentModes; filename = 'cash_collection_by_mode.csv';
    }
    if (!rows.length) return;
    const headers = cols.map(c => c.label).join(',');
    const body = rows.map(r => cols.map(c => {
      const v = r[c.key] ?? '';
      return typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v;
    }).join(',')).join('\n');
    const blob = new Blob([[headers, body].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.setAttribute('download', filename);
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const exportCurrentTabExcel = () => {
    let rows, cols, sheetName, filename;
    if (activeTab === 'details') {
      cols = DETAIL_COLUMNS; rows = detailRows; sheetName = 'Details'; filename = 'cash_collection_details.xlsx';
    } else if (activeTab === 'summary') {
      cols = SUMMARY_COLUMNS; rows = sortedSummary; sheetName = 'Summary'; filename = 'cash_collection_summary.xlsx';
    } else {
      cols = [
        { key: 'companyName', label: 'Company' },
        { key: 'paymentMode', label: 'Payment Mode' },
        { key: 'transactionCount', label: 'Transactions' },
        { key: 'amount', label: 'Amount' }
      ];
      rows = sortedPaymentModes; sheetName = 'By Mode'; filename = 'cash_collection_by_mode.xlsx';
    }
    if (!rows.length) return;
    const data = rows.map(r => {
      const obj = {};
      cols.forEach(c => { obj[c.label] = r[c.key] ?? ''; });
      return obj;
    });
    const sheet = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, sheetName);
    XLSX.writeFile(wb, filename);
  };

  // ── Sort icon ────────────────────────────────────────────────────────────

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span style={{ color: '#d1d5db', marginLeft: 4 }}>↕</span>;
    return <span style={{ color: '#2f6df6', marginLeft: 4 }}>{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  // ── Grand totals strip ───────────────────────────────────────────────────

  const grandTotal = useMemo(
    () => summary.reduce((acc, r) => acc + Number(r.totalAmount ?? 0), 0),
    [summary]
  );
  const grandOrders = useMemo(
    () => summary.reduce((acc, r) => acc + Number(r.orderCount ?? 0), 0),
    [summary]
  );

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>

      {/* ── Summary KPI cards ── */}
      {summary.length > 0 && (
        <Grid item xs={12}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={kpiCard('#2f6df6')}>
              <div style={kpiLabel}>Total Collections</div>
              <div style={kpiValue}>₹{fmtAmt(grandTotal)}</div>
            </div>
            <div style={kpiCard('#16a34a')}>
              <div style={kpiLabel}>Total Orders</div>
              <div style={kpiValue}>{grandOrders.toLocaleString('en-IN')}</div>
            </div>
            <div style={kpiCard('#9333ea')}>
              <div style={kpiLabel}>Companies</div>
              <div style={kpiValue}>{summary.length}</div>
            </div>
          </div>
        </Grid>
      )}

      <Grid item xs={12}>
        <MainCard contentSX={{ p: 0, minHeight: '65vh' }} sx={{ width: '100%' }}>

          {/* ── Filters bar ── */}
          <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>

              <div>
                <label style={filterLabel}>Payment Mode</label>
                <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} style={selectSx}>
                  <option value="">All Modes</option>
                  {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

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

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={exportCurrentTabCSV} disabled={!canExportCsv}
                style={{ ...btnExport('#2f6df6'), opacity: canExportCsv ? 1 : 0.6, cursor: canExportCsv ? 'pointer' : 'not-allowed' }}>
                <Download size={14} style={{ marginRight: 4 }} />CSV
              </button>
              <button onClick={exportCurrentTabExcel} disabled={!canExportXlsx}
                style={{ ...btnExport('#16a34a'), opacity: canExportXlsx ? 1 : 0.6, cursor: canExportXlsx ? 'pointer' : 'not-allowed' }}>
                <FileSpreadsheet size={14} style={{ marginRight: 4 }} />Excel
              </button>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #e5e7eb', padding: '0 20px' }}>
            {[
              { key: 'details',     label: 'Transaction Details' },
              { key: 'summary',     label: 'Company Summary' },
              { key: 'paymentMode', label: 'By Payment Mode' }
            ].map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                style={{
                  padding: '10px 20px', border: 'none', background: 'transparent', cursor: 'pointer',
                  fontWeight: activeTab === t.key ? 700 : 400,
                  color: activeTab === t.key ? '#2f6df6' : '#6b7280',
                  borderBottom: activeTab === t.key ? '2px solid #2f6df6' : '2px solid transparent',
                  fontSize: 13, transition: 'all .15s'
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Status messages ── */}
          {loading && <div style={{ padding: 20, color: '#6b7280' }}>Loading cash collection data…</div>}
          {error   && <div style={{ padding: '10px 20px', color: '#b91c1c' }}>⚠ Failed to load: {error}</div>}

          {/* ══ TAB: Transaction Details ══ */}
          {activeTab === 'details' && (
            <>
              <div style={{ overflow: 'auto', width: '100%', maxHeight: 'calc(65vh - 130px)' }}>
                <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: DETAIL_COLUMNS.reduce((s, c) => s + c.width, 0) }}>
                  <colgroup>{DETAIL_COLUMNS.map(c => <col key={c.key} style={{ width: c.width }} />)}</colgroup>
                  <thead style={{ background: '#f8fafc' }}>
                    <tr>
                      {DETAIL_COLUMNS.map(col => (
                        <th key={col.key} onClick={() => handleSort(col.key)}
                          style={thSx}>
                          {col.label}<SortIcon field={col.key} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detailRows.map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                        onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafbfc'}>
                        <td style={cellSx(DETAIL_COLUMNS[0].width)}><span style={{ fontWeight: 600 }}>{row.companyName ?? '-'}</span></td>
                        <td style={cellSx(DETAIL_COLUMNS[1].width)}>
                          <span style={{ ...modeBadge(row.paymentMode) }}>{row.paymentMode ?? '-'}</span>
                        </td>
                        <td style={cellSx(DETAIL_COLUMNS[2].width)}>{fmt(row.collectionDate)}</td>
                        <td style={cellSx(DETAIL_COLUMNS[3].width)}>{row.collectedBy ?? '-'}</td>
                        <td style={{ ...cellSx(DETAIL_COLUMNS[4].width), textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>
                          ₹{fmtAmt(row.amount)}
                        </td>
                      </tr>
                    ))}
                    {detailRows.length === 0 && !loading && (
                      <tr><td colSpan={DETAIL_COLUMNS.length} style={emptyCell}>No transactions found for the selected filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ color: '#6b7280', fontSize: 13 }}>
                  {totalElements > 0 ? `${page * size + 1}–${Math.min((page + 1) * size, totalElements)} of ${totalElements} transactions` : '0 transactions'}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button onClick={() => { const np = Math.max(0, page - 1); setPage(np); fetchData({ page: np }); }}
                    disabled={page <= 0} style={pageBtn(page <= 0)}>← Prev</button>
                  <span style={{ color: '#374151', fontSize: 13, minWidth: 90, textAlign: 'center' }}>
                    Page {page + 1} of {Math.max(1, totalPages)}
                  </span>
                  <button onClick={() => { const np = page + 1; setPage(np); fetchData({ page: np }); }}
                    disabled={page + 1 >= totalPages} style={pageBtn(page + 1 >= totalPages)}>Next →</button>
                </div>
              </div>
            </>
          )}

          {/* ══ TAB: Company Summary ══ */}
          {activeTab === 'summary' && (
            <div style={{ overflow: 'auto', width: '100%', maxHeight: 'calc(65vh - 90px)' }}>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    {SUMMARY_COLUMNS.map(col => (
                      <th key={col.key} onClick={() => handleSort(col.key)} style={thSx}>
                        {col.label}<SortIcon field={col.key} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedSummary.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafbfc'}>
                      <td style={{ padding: '11px 14px', fontWeight: 600 }}>{row.companyName ?? '-'}</td>
                      <td style={{ padding: '11px 14px', textAlign: 'center' }}>{Number(row.orderCount ?? 0).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '11px 14px', textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>₹{fmtAmt(row.totalAmount)}</td>
                    </tr>
                  ))}
                  {sortedSummary.length === 0 && !loading && (
                    <tr><td colSpan={SUMMARY_COLUMNS.length} style={emptyCell}>No summary data found.</td></tr>
                  )}
                </tbody>
                {sortedSummary.length > 0 && (
                  <tfoot style={{ background: '#f1f5f9' }}>
                    <tr>
                      <td style={{ padding: '11px 14px', fontWeight: 700 }}>Grand Total</td>
                      <td style={{ padding: '11px 14px', textAlign: 'center', fontWeight: 700 }}>{grandOrders.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '11px 14px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>₹{fmtAmt(grandTotal)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}

          {/* ══ TAB: By Payment Mode ══ */}
          {activeTab === 'paymentMode' && (
            <div style={{ overflow: 'auto', width: '100%', maxHeight: 'calc(65vh - 90px)' }}>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    {[
                      { key: 'companyName',      label: 'Company' },
                      { key: 'paymentMode',       label: 'Payment Mode' },
                      { key: 'transactionCount',  label: 'Transactions' },
                      { key: 'amount',            label: 'Amount (₹)' }
                    ].map(col => (
                      <th key={col.key} style={thSx}>{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedPaymentModes.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafbfc'}>
                      <td style={{ padding: '11px 14px', fontWeight: 600 }}>{row.companyName ?? '-'}</td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={modeBadge(row.paymentMode)}>{row.paymentMode ?? '-'}</span>
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'center' }}>{Number(row.transactionCount ?? 0).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '11px 14px', textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>₹{fmtAmt(row.amount)}</td>
                    </tr>
                  ))}
                  {sortedPaymentModes.length === 0 && !loading && (
                    <tr><td colSpan={4} style={emptyCell}>No payment mode data found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

        </MainCard>
      </Grid>
    </Grid>
  );
}

// ─── Micro-styles ─────────────────────────────────────────────────────────────

const filterLabel = { fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 2 };
const inputSx  = { padding: 8, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 };
const selectSx = { padding: 8, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, minWidth: 140 };
const btnPrimary   = { display: 'flex', alignItems: 'center', padding: '8px 14px', borderRadius: 8, border: 'none', background: '#2f6df6', color: '#fff', cursor: 'pointer', fontSize: 13 };
const btnSecondary = { padding: '8px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', cursor: 'pointer', fontSize: 13 };
const btnExport = (bg) => ({ display: 'flex', alignItems: 'center', padding: '8px 14px', borderRadius: 8, border: 'none', background: bg, color: '#fff', fontSize: 13 });
const thSx = { textAlign: 'left', padding: '11px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#374151', position: 'sticky', top: 0, background: '#f8fafc', zIndex: 2, borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap', userSelect: 'none' };
const emptyCell = { textAlign: 'center', padding: 56, color: '#9ca3af', fontSize: 14 };
const kpiCard = (bg) => ({ background: bg, color: '#fff', padding: '16px 24px', borderRadius: 12, minWidth: 160, flex: '1 1 160px', maxWidth: 260 });
const kpiLabel = { fontSize: 12, opacity: 0.85, marginBottom: 4 };
const kpiValue = { fontSize: 22, fontWeight: 700 };
const pageBtn = (disabled) => ({ padding: '5px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: disabled ? '#f9fafb' : '#fff', color: disabled ? '#d1d5db' : '#374151', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 13 });

const MODE_COLORS = {
  CASH: { bg: '#dcfce7', color: '#16a34a' },
  UPI: { bg: '#dbeafe', color: '#2563eb' },
  CARD: { bg: '#fef9c3', color: '#ca8a04' },
  BANK_TRANSFER: { bg: '#ede9fe', color: '#7c3aed' },
  CHEQUE: { bg: '#fce7f3', color: '#db2777' },
  PARTIAL: { bg: '#ffedd5', color: '#ea580c' }
};

function modeBadge(mode) {
  const c = MODE_COLORS[mode] ?? { bg: '#f3f4f6', color: '#374151' };
  return { display: 'inline-block', padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: c.bg, color: c.color };
}
