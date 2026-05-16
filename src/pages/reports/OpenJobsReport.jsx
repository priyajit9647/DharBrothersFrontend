// OpenJobsReport.jsx

import React, { useMemo, useState } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';
import { Search, Download, FileSpreadsheet, BriefcaseBusiness, Clock3 } from 'lucide-react';

const openJobsData = [
  { jobId: 'JOB-2101', client: 'Tata Steel', branch: 'Kolkata', department: 'Printing', assignedTo: 'Rahul Sharma', stage: 'Production', sla: '12 hrs', priority: 'High', status: 'Open' },
  { jobId: 'JOB-2102', client: 'Reliance', branch: 'Mumbai', department: 'Packaging', assignedTo: 'Amit Das', stage: 'Dispatch', sla: '8 hrs', priority: 'Medium', status: 'In Progress' },
  { jobId: 'JOB-2103', client: 'Infosys', branch: 'Delhi', department: 'Binding', assignedTo: 'Priya Sen', stage: 'QC', sla: '5 hrs', priority: 'Critical', status: 'Open' },
  { jobId: 'JOB-2104', client: 'Wipro', branch: 'Bangalore', department: 'Lamination', assignedTo: 'Rakesh Gupta', stage: 'Cutting', sla: '18 hrs', priority: 'Low', status: 'Pending' }
];

export default function OpenJobsReport() {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('jobId');
  const [sortOrder, setSortOrder] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredData = useMemo(() => {
    let filtered = openJobsData.filter((item) =>
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
    const headers = Object.keys(openJobsData[0]).join(',');
    const rows = openJobsData.map((row) => Object.values(row).join(','));
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'open_jobs_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Typography variant="h5">Open Jobs Report</Typography>
        <Typography variant="body2" color="text.secondary">
          Track all active and ongoing jobs with SLA monitoring, team assignment and real-time status.
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e6f0ff', padding: 16, minWidth: 180 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Total Open Jobs</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#2f6df6' }}>124</div>
              </div>
              <div style={{ background: '#eef6ff', padding: 8, borderRadius: 12 }}>
                <BriefcaseBusiness style={{ color: '#2f6df6', width: 18, height: 18 }} />
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #fff0e6', padding: 16, minWidth: 180 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>SLA Near Deadline</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#f97316' }}>18</div>
              </div>
              <div style={{ background: '#fff7ed', padding: 8, borderRadius: 12 }}>
                <Clock3 style={{ color: '#f97316', width: 18, height: 18 }} />
              </div>
            </div>
          </div>
        </div>
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
                    placeholder="Search jobs..."
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
                  {['JobId', 'Client', 'Branch', 'Department', 'Assigned To', 'Stage', 'SLA', 'Priority', 'Status'].map((column) => (
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
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>{row.assignedTo}</td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>{row.stage}</td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}><span style={{ background: '#eef2ff', color: '#1e40af', padding: '4px 8px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>{row.sla}</span></td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{ padding: '4px 8px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: row.priority === 'Critical' ? '#fee2e2' : row.priority === 'High' ? '#fff7ed' : row.priority === 'Medium' ? '#fffbeb' : '#ecfccb', color: row.priority === 'Critical' ? '#b91c1c' : row.priority === 'High' ? '#c2410c' : row.priority === 'Medium' ? '#92400e' : '#166534' }}>{row.priority}</span>
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{ padding: '4px 8px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: row.status === 'Open' ? '#eef2ff' : row.status === 'In Progress' ? '#fffbeb' : '#f3f4f6', color: row.status === 'Open' ? '#1e40af' : row.status === 'In Progress' ? '#92400e' : '#6b7280' }}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredData.length === 0 && (
              <div style={{ textAlign: 'center', padding: 56, color: '#9ca3af' }}>No open jobs found.</div>
            )}
          </div>
        </MainCard>
      </Grid>
    </Grid>
  );
}