import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import MainCard from 'components/MainCard';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';
import { listCustomerOrders } from 'api/customerPortal';

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
  const theme = useTheme();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);

  const orderRef = 'ORD-2026-00123';
  const status = 'Ready for Approval';

  useEffect(() => {
    let mounted = true;
    setOrdersLoading(true);

    (async () => {
      try {
        const resp = await listCustomerOrders();
        const data = Array.isArray(resp) ? resp : resp?.data || resp?.orders || [];

        // Move the first 'Order-Created' to the top
        const idx = (data || []).findIndex((o) => o?.currentStage === 'Order-Created');
        const ordered = Array.from(data || []);
        if (idx > -1) {
          const [item] = ordered.splice(idx, 1);
          ordered.unshift(item);
        }

        if (mounted) setOrders(ordered);
      } catch (err) {
        if (mounted) setOrdersError(err?.message || 'Unable to load orders');
      } finally {
        if (mounted) setOrdersLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

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

        {/* Order List (full width) */}
        <Grid item xs={12}>
          <MainCard
            title="Order List"
            contentSX={{ p: 0 }}
            sx={{ boxShadow: 2, borderRadius: 3, transition: 'all 120ms ease' }}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Your Orders</Typography>

              {ordersLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : ordersError ? (
                <Box sx={{ p: 2 }}>
                  <Typography color="error">{ordersError}</Typography>
                </Box>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Stage</TableCell>
                      <TableCell>Expected Delivery</TableCell>
                      <TableCell>Shipping Address</TableCell>
                      <TableCell>Branch</TableCell>
                      <TableCell align="right">Pages</TableCell>
                      <TableCell align="center">Payment</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">No orders found</TableCell>
                      </TableRow>
                    ) : (
                      orders.map((o, idx) => {
                        const stage = o.currentStage;
                        const sx =
                          stage === 'Order-Created'
                            ? { bgcolor: (theme) => alpha(theme.palette.success.main, 0.12) }
                            : stage === 'Order-Complete'
                            ? { bgcolor: 'grey.100', color: 'text.secondary' }
                            : stage === 'Ready-To-Dispatch'
                            ? { bgcolor: (theme) => alpha(theme.palette.info.main, 0.12) }
                            : {};

                        return (
                          <TableRow key={o.orderId || idx} sx={sx}>
                            <TableCell>{o.orderId}</TableCell>
                            <TableCell><StatusChip label={o.currentStage} /></TableCell>
                            <TableCell>{o.expectedDeliveryDate}</TableCell>
                            <TableCell>{o.shippingAddress}</TableCell>
                            <TableCell>{o.branchName}</TableCell>
                            <TableCell align="right">{o.totalPages ?? '-'}</TableCell>
                            <TableCell align="center"><Chip label={o.paymentStatus || '-'} size="small" /></TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              )}
            </Box>
          </MainCard>
        </Grid>

        {/* Removed additional sections; only Order List is shown per request */}
      </Grid>
      </Box>
    </Box>
  );
}
