import { useMemo, useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';

import MainCard from 'components/MainCard';
import useAccess from 'hooks/useAccess';
import { Search, Download, FileSpreadsheet } from 'lucide-react';
import { getGstReport } from 'api/Reports&Insights';
import { getBranches } from 'api/branch';
import * as XLSX from 'xlsx';

const COLUMNS = [
  { key: 'docNo', label: 'Invoice Number', width: 160 },
  { key: 'docDate', label: 'Invoice Date', width: 140 },
  { key: 'account', label: 'Account', width: 160 },
  { key: 'customerName', label: 'Customer Name', width: 200 },
  { key: 'addr1', label: 'Address 1', width: 180 },
  { key: 'addr2', label: 'Address 2', width: 160 },
  { key: 'addr3', label: 'Address 3', width: 140 },
  { key: 'pin', label: 'PIN', width: 90 },
  { key: 'city', label: 'City', width: 120 },
  { key: 'state', label: 'State', width: 120 },
  { key: 'gstNo', label: 'GST Number', width: 160 },
  { key: 'stateTin', label: 'State TIN', width: 140 },
  { key: 'phone', label: 'Phone', width: 120 },
  { key: 'mobile', label: 'Mobile', width: 120 },
  { key: 'panNo', label: 'PAN', width: 140 },
  { key: 'branch', label: 'Branch', width: 140 },
  { key: 'wareHouse', label: 'Warehouse', width: 140 },
  { key: 'itemGroup', label: 'Item Group', width: 140 },
  { key: 'maker', label: 'Maker', width: 140 },
  { key: 'item', label: 'Item', width: 200 },
  { key: 'serviceItem', label: 'Service Item', width: 160 },
  { key: 'hsnCode', label: 'HSN Code', width: 120 },
  { key: 'gstClass', label: 'GST Class', width: 120 },
  { key: 'codeType', label: 'Code Type', width: 120 },
  { key: 'igstPcn', label: 'IGST %', width: 100 },
  { key: 'sgstPcn', label: 'SGST %', width: 100 },
  { key: 'cgstPcn', label: 'CGST %', width: 100 },
  { key: 'uqc', label: 'UQC', width: 100 },
  { key: 'hsnDesc', label: 'HSN Description', width: 200 },
  { key: 'saleRate', label: 'Sale Rate', width: 100 },
  { key: 'qty', label: 'Qty', width: 80 },
  { key: 'unit', label: 'Unit', width: 80 },
  { key: 'rate', label: 'Rate', width: 100 },
  { key: 'cgstPercent', label: 'CGST % (line)', width: 100 },
  { key: 'cgstAmt', label: 'CGST Amount', width: 120 },
  { key: 'sgstPercent', label: 'SGST % (line)', width: 100 },
  { key: 'sgstAmt', label: 'SGST Amount', width: 120 },
  { key: 'amount', label: 'Amount', width: 120 },
  { key: 'taxableAmt', label: 'Taxable Amount', width: 120 },
  { key: 'iwDiscPerc', label: 'IW Disc %', width: 100 },
  { key: 'iwDiscAmount', label: 'IW Disc Amount', width: 120 },
  { key: 'oc1Amount', label: 'OC1 Amount', width: 120 },
  { key: 'oc2Addless', label: 'OC2 Add/Less', width: 120 },
  { key: 'oc3Amount', label: 'OC3 Amount', width: 120 },
  { key: 'oc4Amount', label: 'OC4 Amount', width: 120 },
  { key: 'oc5Amount', label: 'OC5 Amount', width: 120 },
  { key: 'oc6Amount', label: 'OC6 Amount', width: 120 },
  { key: 'tcsPercent', label: 'TCS %', width: 100 },
  { key: 'tcsAmt', label: 'TCS Amount', width: 120 },
  { key: 'roundOff', label: 'Round Off', width: 100 },
  { key: 'roAddless', label: 'RO Add/Less', width: 100 },
  { key: 'itemAmount', label: 'Item Amount', width: 120 },
  { key: 'billAmount', label: 'Invoice Total', width: 140 }
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

function formatDate(d) {
  if (!d) return '-';
  try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); } catch (e) { return d; }
}

export default function GstReports() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [branch, setBranch] = useState('');
  const [gstType, setGstType] = useState('All');
  const [search, setSearch] = useState('');

  const [branches, setBranches] = useState([]);

  const [sortField, setSortField] = useState('docDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { hasAccess } = useAccess();
  const canExportCsv = hasAccess('REPORT_EXPORT_CSV');
  const canExportXlsx = hasAccess('REPORT_EXPORT_EXCEL');

  useEffect(() => {
    let mounted = true;
    async function loadBranches() {
      try {
        const resp = await getBranches();
        if (!mounted) return;
        setBranches(Array.isArray(resp) ? resp : (resp?.items ?? resp?.data ?? []));
      } catch (err) {
        console.error('Failed to load branches', err);
      }
    }
    loadBranches();
    return () => { mounted = false; };
  }, []);

  const fetchData = async (opts = {}) => {
    setLoading(true); setError(null);
    try {
      // Convert date inputs to ISO strings; backend expects Date values.
      const sDate = fromDate ? new Date(fromDate) : new Date(0);
      const eDate = toDate ? new Date(toDate) : new Date();
      const params = {
        startDate: isNaN(sDate.getTime()) ? new Date(0).toISOString() : sDate.toISOString(),
        endDate: isNaN(eDate.getTime()) ? new Date().toISOString() : eDate.toISOString(),
        branch: branch || undefined,
        gstType: gstType === 'All' ? undefined : gstType,
        search: search || undefined,
        page: opts.page ?? page,
        size: opts.size ?? size,
        sort: `${sortField},${sortOrder}`
      };
      const resp = await getGstReport(params);

      // Normalize response items: convert snake_case keys to camelCase and provide fallbacks
      const rawItems = Array.isArray(resp) ? resp : (Array.isArray(resp?.items) ? resp.items : (resp?.items ?? resp?.data ?? []));
      const items = (Array.isArray(rawItems) ? rawItems : []).map((it) => {
        const normalized = { ...it };
        Object.keys(it).forEach((k) => {
          if (k.includes('_')) {
            const camel = k.replace(/_([a-z])/g, (_, ch) => ch.toUpperCase());
            if (!(camel in normalized)) normalized[camel] = it[k];
          }
        });
        // customerName fallbacks: prefer explicit fields if present
        normalized.customerName = normalized.customerName ?? normalized.customer_name ?? normalized.customerPurchase ?? normalized.customer ?? normalized.accountName ?? normalized.account ?? '';
        return normalized;
      });

      setData(items);
      setTotal(Number(resp.total ?? resp.totalItems ?? items.length));
    } catch (err) {
      console.error('Failed to fetch GST report', err);
      setError(String(err?.message ?? err));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => { setPage(0); fetchData({ page: 0 }); };
  const handleReset = () => { setFromDate(''); setToDate(''); setBranch(''); setGstType('All'); setSearch(''); setPage(0); fetchData({ page: 0 }); };

  useEffect(() => {
    fetchData({ page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredData = useMemo(() => {
    const source = Array.isArray(data) ? data : [];
    let list = source.filter((row) => {
      if (!search) return true;
      const hay = Object.values(row).join(' ').toLowerCase();
      return hay.includes(search.toLowerCase());
    });
    list.sort((a, b) => {
      const va = a[sortField];
      const vb = b[sortField];
      if (!va && !vb) return 0;
      if (!va) return 1;
      if (!vb) return -1;
      if (sortField === 'docDate') return (new Date(va) - new Date(vb)) * (sortOrder === 'asc' ? 1 : -1);
      if (va < vb) return sortOrder === 'asc' ? -1 : 1;
      if (va > vb) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [data, search, sortField, sortOrder]);
  // Totals calculation removed — summary cards are not displayed on this page.

  const exportCSV = () => {
    const source = filteredData.length ? filteredData : data;
    if (!source.length) return;
    const headers = COLUMNS.map((c) => c.label).join(',');
    const rows = source.map((r) => COLUMNS.map((c) => {
      let v = r[c.key];
      if (v == null || v === '') v = '';
      else if (c.key === 'docDate') v = r.docDate ? new Date(r.docDate).toISOString() : '';
      else if (typeof v === 'number') v = v;
      else {
        const n = Number(v);
        if (!Number.isNaN(n) && c.label.match(/(Amount|Amt|Rate|Total|Qty|Percent|Pcn|TCS|CGST|SGST|IGST|Taxable)/i)) v = n;
        else v = String(v).replace(/"/g, '""');
      }
      return typeof v === 'string' ? `"${v}"` : v;
    }).join(','));

    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.setAttribute('download', 'gst_reports.csv');
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const exportExcel = () => {
    const source = filteredData.length ? filteredData : data;
    if (!source.length) return;
    const sheetData = source.map((r) => {
      const obj = {};
      COLUMNS.forEach((c) => {
        const v = r[c.key];
        if (c.key === 'docDate') obj[c.label] = v ? new Date(v).toLocaleString() : '';
        else if (typeof v === 'number') obj[c.label] = v;
        else {
          const n = Number(v);
          obj[c.label] = (!Number.isNaN(n) && c.label.match(/(Amount|Amt|Rate|Total|Qty|Percent|Pcn|TCS|CGST|SGST|IGST|Taxable)/i)) ? n : (v ?? '');
        }
      });
      return obj;
    });
    const sheet = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, 'GST Reports');
    XLSX.writeFile(wb, 'gst_reports.xlsx');
  };

  const handleSort = (field) => {
    if (sortField === field) setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortOrder('asc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span style={{ color: '#d1d5db', marginLeft: 4 }}>↕</span>;
    return <span style={{ color: '#2f6df6', marginLeft: 4 }}>{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  const resetFilters = () => { setFromDate(''); setToDate(''); setBranch(''); setGstType('All'); setSearch(''); };

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      {/* Breadcrumbs removed to keep only the prominent page title */}
      {/* Page title and subtitle removed as requested */}

      <Grid item xs={12}>
        <MainCard contentSX={{ p: 0, minHeight: '65vh' }} sx={{ width: '100%' }}>

          <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input type="text" placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: '8px 12px 8px 34px', borderRadius: 8, border: '1px solid #e5e7eb', minWidth: 260, fontSize: 14 }} />
              </div>

              <div>
                <label style={{ fontSize: 12, color: '#6b7280', display: 'block' }}>From</label>
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#6b7280', display: 'block' }}>To</label>
                  <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                </div>

                <button onClick={() => { setPage(0); handleSearch(); }} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#2f6df6', color: '#fff' }}>Search</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {canExportCsv && <button onClick={exportCSV} style={{ display: 'flex', gap: 6, alignItems: 'center', background: '#2f6df6', color: '#fff', padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer' }}><Download size={15} /> Export Excel</button>}
              {canExportXlsx && <button onClick={exportExcel} style={{ display: 'flex', gap: 6, alignItems: 'center', background: '#16a34a', color: '#fff', padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer' }}><FileSpreadsheet size={15} /> Export Excel</button>}
            </div>
          </div>
          {/* Summary cards removed per request */}

          <div style={{ overflow: 'auto', width: '100%', maxHeight: 'calc(65vh - 110px)' }}>
            {loading && <div style={{ padding: 20, color: '#6b7280' }}>Loading GST data…</div>}
            {error && <div style={{ padding: '8px 20px', color: '#b91c1c' }}>⚠ Failed to load: {error}</div>}

            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: COLUMNS.reduce((s, c) => s + c.width, 0) }}>
              <colgroup>
                {COLUMNS.map((col) => <col key={col.key} style={{ width: col.width }} />)}
              </colgroup>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  {COLUMNS.map((col) => (
                    <th key={col.key} onClick={() => handleSort(col.key)} style={{ textAlign: 'left', padding: '11px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#374151', position: 'sticky', top: 0, background: '#f8fafc', zIndex: 2, borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap', userSelect: 'none' }}>
                      {col.label}<SortIcon field={col.key} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(page * size, (page + 1) * size).map((row, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f3f4f6', background: index % 2 === 0 ? '#fff' : '#fafbfc' }} onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'} onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? '#fff' : '#fafbfc'}>
                    {COLUMNS.map((col) => {
                      const raw = row[col.key];
                      let display = '-';
                      if (raw != null && raw !== '') {
                        if (col.key === 'docDate') display = formatDate(raw);
                        else if (typeof raw === 'number') display = raw.toLocaleString('en-IN', { maximumFractionDigits: 2 });
                        else {
                          const n = Number(raw);
                          if (!Number.isNaN(n) && col.label.match(/(Amount|Amt|Rate|Total|Qty|Percent|Pcn|TCS|CGST|SGST|IGST|Taxable)/i)) display = n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
                          else display = String(raw);
                        }
                      }

                      const cell = (
                        <td key={col.key} style={cellStyle(col.width)} title={String(raw ?? '')}>
                          {col.key === 'docNo' ? <span style={{ color: '#2f6df6', fontWeight: 600 }}>{display}</span> : display}
                        </td>
                      );

                      return cell;
                    })}
                  </tr>
                ))}

                {filteredData.length === 0 && !loading && (
                  <tr><td colSpan={COLUMNS.length} style={{ textAlign: 'center', padding: 56, color: '#9ca3af', fontSize: 14 }}>No GST records found for the selected filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ color: '#6b7280', fontSize: 13 }}>Showing {Math.min(filteredData.length - page * size, size)} of {total} items</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button onClick={() => { const np = Math.max(0, page - 1); setPage(np); fetchData({ page: np }); }} disabled={page <= 0} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: page <= 0 ? '#f9fafb' : '#fff', color: page <= 0 ? '#d1d5db' : '#374151', cursor: page <= 0 ? 'not-allowed' : 'pointer', fontSize: 13 }}>← Prev</button>
              <span style={{ color: '#374151', fontSize: 13, minWidth: 90, textAlign: 'center' }}>Page {page + 1} of {Math.max(1, Math.ceil(Math.max(total, filteredData.length) / size))}</span>
              <button onClick={() => { const np = page + 1; setPage(np); fetchData({ page: np }); }} disabled={(page + 1) * size >= Math.max(total, filteredData.length)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: (page + 1) * size >= Math.max(total, filteredData.length) ? '#f9fafb' : '#fff', color: (page + 1) * size >= Math.max(total, filteredData.length) ? '#d1d5db' : '#374151', cursor: (page + 1) * size >= Math.max(total, filteredData.length) ? 'not-allowed' : 'pointer', fontSize: 13 }}>Next →</button>
            </div>
          </div>

        </MainCard>
      </Grid>
    </Grid>
  );
}
