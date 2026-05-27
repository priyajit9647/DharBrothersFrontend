import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';

import MainCard from 'components/MainCard';
import { Search, Download, FileSpreadsheet } from 'lucide-react';

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
  const [search, setSearch] = useState('');
  const [page] = useState(0);
  const size = 10;
  const total = 0;

  // No real data shown per requirements — keep table empty
  const exportCSV = () => {
    // intentionally non-functional for now
  };

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
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
              <Button variant="contained" color="primary" onClick={() => {}} startIcon={<Search size={14} />}>
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
              <button onClick={exportCSV} style={{ display: 'flex', gap: 6, alignItems: 'center', background: '#2f6df6', color: '#fff', padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                <Download size={15} /> Export CSV
              </button>
              <button onClick={() => {}} style={{ display: 'flex', gap: 6, alignItems: 'center', background: '#16a34a', color: '#fff', padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                <FileSpreadsheet size={15} /> Export Excel
              </button>
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
                {/* Intentionally no rows per requirements */}
              </tbody>
            </table>

            <div style={{ textAlign: 'center', padding: 56, color: '#9ca3af', fontSize: 14 }}>No sales data available.</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ color: '#6b7280', fontSize: 13 }}>Showing 0 of 0 items</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', color: '#d1d5db', cursor: 'not-allowed', fontSize: 13 }}>← Prev</button>
              <span style={{ color: '#374151', fontSize: 13, minWidth: 90, textAlign: 'center' }}>Page 1 of 1</span>
              <button style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', color: '#d1d5db', cursor: 'not-allowed', fontSize: 13 }}>Next →</button>
            </div>
          </div>

        </MainCard>
      </Grid>
    </Grid>
  );
}
