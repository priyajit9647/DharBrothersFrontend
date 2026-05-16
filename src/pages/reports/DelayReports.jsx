// DelayReports.jsx

import React, { useMemo, useState } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';
import { Download, FileSpreadsheet, Search, AlertTriangle } from 'lucide-react';

const delayReportsData = [
  { jobId: 'JOB-1001', client: 'Tata Steel', branch: 'Kolkata', department: 'Printing', stage: 'Production', expectedDate: '2026-05-10', delayedDays: 5, priority: 'High', status: 'Delayed' },
  { jobId: 'JOB-1002', client: 'Reliance', branch: 'Delhi', department: 'Binding', stage: 'Dispatch', expectedDate: '2026-05-12', delayedDays: 2, priority: 'Medium', status: 'Pending' },
  { jobId: 'JOB-1003', client: 'Infosys', branch: 'Mumbai', department: 'Packaging', stage: 'QC', expectedDate: '2026-05-09', delayedDays: 7, priority: 'Critical', status: 'Delayed' },
  { jobId: 'JOB-1004', client: 'Wipro', branch: 'Bangalore', department: 'Lamination', stage: 'Cutting', expectedDate: '2026-05-11', delayedDays: 1, priority: 'Low', status: 'In Progress' }
];

export default function DelayReports() {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('delayedDays');
  const [sortOrder, setSortOrder] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredData = useMemo(() => {
    let filtered = delayReportsData.filter((item) =>
      Object.values(item).join(' ').toLowerCase().includes(search.toLowerCase())
    );

    filtered.sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [search, sortField, sortOrder]);

  const exportCSV = () => {
    const headers = Object.keys(delayReportsData[0]).join(',');
    const rows = delayReportsData.map((row) => Object.values(row).join(','));
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'delay_reports.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: 8, top: 8, color: '#9ca3af' }} />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ padding: '8px 12px 8px 32px', borderRadius: 8, border: '1px solid #e5e7eb', minWidth: 260 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={exportCSV} style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#2f6df6', color: '#fff', padding: '8px 12px', borderRadius: 8, border: 'none' }}>
                  <Download size={16} />
                  Export CSV
                </button>

                <button style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#16a34a', color: '#fff', padding: '8px 12px', borderRadius: 8, border: 'none' }}>
                  <FileSpreadsheet size={16} />
                  Export Excel
                </button>
              </div>
            </div>
          </div>

          <div style={{ overflow: 'auto', width: '100%', maxHeight: 'calc(65vh - 100px)' }}>
            <table style={{ width: '100%', minWidth: 900, fontSize: 14, borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                <tr>
                  {['JobId', 'Client', 'Branch', 'Department', 'Stage', 'Expected Date', 'Delayed Days', 'Priority', 'Status'].map((column) => (
                    <th key={column} onClick={() => handleSort(column)} style={{ textAlign: 'left', padding: '12px 16px', cursor: 'pointer', fontWeight: 600, position: 'sticky', top: 0, background: '#f8fafc', zIndex: 2 }}>
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredData.map((row, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 16px', color: '#2f6df6', fontWeight: 600, whiteSpace: 'nowrap' }}>{row.jobId}</td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>{row.client}</td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>{row.branch}</td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>{row.department}</td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>{row.stage}</td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>{row.expectedDate}</td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}><span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 8px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>{row.delayedDays} Days</span></td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{ padding: '4px 8px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: row.priority === 'Critical' ? '#fee2e2' : row.priority === 'High' ? '#fff7ed' : row.priority === 'Medium' ? '#fffbeb' : '#ecfccb', color: row.priority === 'Critical' ? '#b91c1c' : row.priority === 'High' ? '#c2410c' : row.priority === 'Medium' ? '#92400e' : '#166534' }}>{row.priority}</span>
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{ padding: '4px 8px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: row.status === 'Delayed' ? '#fee2e2' : row.status === 'Pending' ? '#fffbeb' : '#eef2ff', color: row.status === 'Delayed' ? '#b91c1c' : row.status === 'Pending' ? '#92400e' : '#1e40af' }}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredData.length === 0 && (
              <div style={{ textAlign: 'center', padding: 56, color: '#9ca3af' }}>No delay reports found.</div>
            )}
          </div>
        </MainCard>
      </Grid>
    </Grid>
  );
}