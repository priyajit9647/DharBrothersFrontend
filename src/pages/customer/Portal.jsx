import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Avatar from '@mui/material/Avatar';

import MainCard from 'components/MainCard';

import HistoryOutlined from '@ant-design/icons/HistoryOutlined';
import EnvironmentOutlined from '@ant-design/icons/EnvironmentOutlined';
import { alpha } from '@mui/material/styles';

function StatusChip({ label }) {
  const key = String(label || '').toLowerCase();
  const variant = key.includes('approve') || key.includes('approved')
    ? 'success'
    : key.includes('pending') || key.includes('ready')
    ? 'warning'
    : key.includes('review')
    ? 'info'
    : 'default';
  return (
    <Chip
      label={label}
      color={variant}
      size="small"
      sx={{ fontWeight: 700, borderRadius: '999px', textTransform: 'none', px: 1, height: 28 }}
    />
  );
}

export default function CustomerPortal() {
  // UI-only state for small interactions (do not change business logic)
  const [remarks, setRemarks] = useState('');
  const [remarksError, setRemarksError] = useState(false);

  const orderRef = 'ORD-2026-00123';
  const status = 'Ready for Approval';

  const overview = { items: 3, pages: 24, size: 'A4', notes: 'Final document ready for review — duplex color printing.' };

  const versions = [
    { version: 'v1', date: '2026-05-10', status: 'approved' },
    { version: 'v2', date: '2026-05-12', status: 'pending' },
    { version: 'v3', date: '2026-05-13', status: 'review' }
  ];

  const delivery = { name: 'John Doe', address: '123 Main St, Suite 4', city: 'Metropolis', pincode: '123456' };

  const payments = [
    { id: 'PAY-001', date: '2026-05-01', amount: 100.0, status: 'Paid' },
    { id: 'PAY-002', date: '2026-05-12', amount: 50.0, status: 'Pending' }
  ];

  const handleApprove = () => {
    // UI-only: visual confirmation; business flows unchanged
    console.log('Approve clicked');
  };

  const handleDisapprove = () => {
    if (!remarks.trim()) {
      setRemarksError(true);
      return;
    }
    setRemarksError(false);
    console.log('Disapprove clicked with remarks:', remarks);
  };

  return (
    <Box sx={{ backgroundColor: 'grey.100', minHeight: '100vh', px: { xs: 2, sm: 4 }, py: 6 }}>
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
        <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <MainCard content={false} sx={{ boxShadow: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: { xs: 2, sm: 3 }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '0.2px' }}>Customer Order Portal</Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 0.75, flexWrap: 'wrap' }}>
                    <Chip label={orderRef} color="warning" sx={{ fontWeight: 800, borderRadius: '999px', px: 1.5 }} />
                    <StatusChip label={status} />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5, display: { xs: 'none', sm: 'block' } }}>One-time view for your Dhar Brothers orders. Review past orders, manage payments and delivery address.</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mt: { xs: 1, sm: 0 } }}>
                  <Button variant="outlined" size="small" sx={{ borderRadius: '999px', textTransform: 'none' }}>Download PDF</Button>
                  <Button variant="contained" size="small" sx={{ borderRadius: '999px', textTransform: 'none', px: 2 }}>Contact Support</Button>
                </Box>
              </Box>
            </Box>
          </MainCard>
        </Grid>

        {/* Sequence: Order Overview (full width) */}
        <Grid item xs={12}>
          <MainCard
            title="Order Overview"
            contentSX={{ p: 0 }}
            sx={{
              boxShadow: 2,
              borderRadius: 3,
              transition: 'all 180ms ease',
              '&:hover': { boxShadow: 6, transform: 'translateY(-3px)' }
            }}
          >
            <Grid container>
              <Grid item xs={12} md={7}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>{overview.notes}</Typography>

                  <Grid container spacing={1}>
                    <Grid item xs={4} sm={4}>
                      <Box sx={{ bgcolor: 'grey.50', p: 1.25, borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">Items</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{overview.items}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4} sm={4}>
                      <Box sx={{ bgcolor: 'grey.50', p: 1.25, borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">Pages</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{overview.pages}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4} sm={4}>
                      <Box sx={{ bgcolor: 'grey.50', p: 1.25, borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">Size</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{overview.size}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              <Grid item xs={12} md={5}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Document Version History</Typography>

                  <Box sx={{ position: 'relative', pl: 3, mb: 2, '::before': { content: '""', position: 'absolute', left: 14, top: 12, bottom: 12, width: 4, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12) } }}>
                    {versions.map((v, idx) => (
                      <Box key={v.version} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', mb: 2 }}>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: idx === versions.length - 1 ? 'primary.main' : 'grey.300' }}>
                          <HistoryOutlined style={{ color: idx === versions.length - 1 ? '#fff' : undefined }} />
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 700 }}>{v.version} • {v.date}</Typography>
                          <Box sx={{ mt: 0.5 }}><StatusChip label={v.status} /></Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  <Typography variant="subtitle2" sx={{ mt: 1, mb: 1, fontWeight: 700 }}>Payment History & Pending Dues</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Payment ID</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payments.map((p) => (
                        <TableRow key={p.id} sx={{ bgcolor: p.status === 'Pending' ? (theme) => alpha(theme.palette.warning.main, 0.12) : 'inherit' }}>
                          <TableCell>{p.id}</TableCell>
                          <TableCell>{p.date}</TableCell>
                          <TableCell align="right">{p.amount.toFixed(2)}</TableCell>
                          <TableCell align="center"><Chip label={p.status} color={p.status === 'Paid' ? 'success' : 'warning'} size="small" /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Button variant="contained" color="primary">Make a Payment</Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </MainCard>
        </Grid>

        {/* Sequence: Approval Actions (full width) */}
        <Grid item xs={12}>
          <MainCard
            title="Approval Actions"
            contentSX={{ p: 2 }}
            sx={{ boxShadow: 2, borderRadius: 3, transition: 'all 180ms ease', '&:hover': { boxShadow: 6, transform: 'translateY(-3px)' } }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Review the final document and take action.</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Button variant="contained" color="success" fullWidth sx={{ fontWeight: 700 }} onClick={handleApprove}>Approve Final Document</Button>
              <Button variant="outlined" color="warning" fullWidth onClick={handleDisapprove}>Disapprove / Changes Required</Button>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Optional remarks or changes required..."
              value={remarks}
              onChange={(e) => { setRemarks(e.target.value); if (remarksError) setRemarksError(false); }}
              error={remarksError}
              helperText={remarksError ? 'Please provide remarks when disapproving' : ''}
            />
          </MainCard>
        </Grid>

        {/* Sequence: Delivery Address (full width) */}
        <Grid item xs={12}>
          <MainCard title="Delivery Address" contentSX={{ p: 2 }} sx={{ mt: 2, boxShadow: 2, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <EnvironmentOutlined style={{ fontSize: 28, color: '#1976d2' }} />
              <Box>
                <Typography sx={{ fontWeight: 700 }}>{delivery.name}</Typography>
                <Typography variant="body2" color="text.secondary">{delivery.address}</Typography>
                <Typography variant="body2" color="text.secondary">{delivery.city} • {delivery.pincode}</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button variant="contained">Submit Address Change</Button>
            </Box>
          </MainCard>
        </Grid>
      </Grid>
      </Box>
    </Box>
  );
}
