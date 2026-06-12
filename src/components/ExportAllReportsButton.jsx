import React, { useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import {
  getDelayedJobs,
  getReadyToDispatchReport,
  getOpenJobsReport,
  getCompleteJobsReport,
  getSalesReport,
  getGstReport,
  getTodayDueTasks,
} from 'api/Reports&Insights';

export default function ExportAllReportsButton({ style }) {
  const [loading, setLoading] = useState(false);

  const handleExportAll = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const tasks = [
        { name: 'Delayed Jobs', fn: getDelayedJobs },
        { name: 'Ready To Dispatch', fn: getReadyToDispatchReport },
        { name: 'Open Jobs', fn: getOpenJobsReport },
        { name: 'Completed Jobs', fn: getCompleteJobsReport },
        { name: 'Sales', fn: getSalesReport },
        { name: 'GST', fn: getGstReport },
        { name: "Today's Due Tasks", fn: getTodayDueTasks },
      ];

      const promises = tasks.map((t) => t.fn({ page: 0, size: 1000 }));
      const settled = await Promise.allSettled(promises);

      const sheets = [];
      for (let i = 0; i < settled.length; i += 1) {
        const r = settled[i];
        const name = tasks[i].name;
        if (r.status !== 'fulfilled') {
          // skip failed report but keep going
          // eslint-disable-next-line no-console
          console.warn(`${name} fetch failed`, r.reason);
          continue;
        }
        const res = r.value;
        const items = Array.isArray(res) ? res : res?.items ?? res?.content ?? res?.data ?? [];
        if (!items || items.length === 0) continue;

        const rows = items.map((item) => {
          const out = {};
          Object.keys(item).forEach((k) => {
            let v = item[k];
            if (v == null) out[k] = '';
            else if (typeof v === 'object') out[k] = JSON.stringify(v);
            else out[k] = v;
          });
          return out;
        });

        sheets.push({ name: String(name).slice(0, 31), rows });
      }

      if (sheets.length === 0) {
        alert('No report data available to export');
        return;
      }

      const mod = await import('xlsx');
      const XLSX = mod.default || mod;
      const wb = XLSX.utils.book_new();
      sheets.forEach((s) => {
        const ws = XLSX.utils.json_to_sheet(s.rows);
        XLSX.utils.book_append_sheet(wb, ws, s.name);
      });
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reports_insights_all.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('ExportAllReports failed', err);
      alert('Export failed: ' + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExportAll}
      disabled={loading}
      style={{ display: 'flex', gap: 6, alignItems: 'center', background: '#0ea5a8', color: '#fff', padding: '8px 14px', borderRadius: 8, border: 'none', cursor: loading ? 'wait' : 'pointer', fontSize: 13, fontWeight: 500, marginLeft: 8, ...(style || {}) }}
    >
      <FileSpreadsheet size={15} /> {loading ? 'Exporting…' : 'Export All'}
    </button>
  );
}
