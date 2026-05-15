import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import MainCard from 'components/MainCard';
// Dot component removed (unused)

// icons
import EllipsisOutlined from '@ant-design/icons/EllipsisOutlined';

import { getProcessStages } from 'api/processStage';
import { getOrdersByStatus } from 'api/orders';
import ShippingQrModal from 'components/ShippingQrModal';

// ==============================|| ORDER BOARD (TABLE VIEW) ||============================== //

// (Summary tiles removed — header simplified)

function OrdersTableHead() {
  return (
    <TableHead>
      <TableRow>
        <TableCell />
        <TableCell>Order #</TableCell>
        <TableCell>Customer</TableCell>
        <TableCell>Stage</TableCell>
        <TableCell align="right">Amount</TableCell>
        <TableCell align="center">Payment</TableCell>
      </TableRow>
    </TableHead>
  );
}

function renderOrderId(order) {
  return order.orderId ?? order.orderNo ?? order.id ?? order.code ?? '—';
}

function paymentStatusColor(status) {
  if (!status) return 'default';
  const s = String(status).toLowerCase();
  if (s.includes('success')) return 'success';
  if (s.includes('fail') || s.includes('failed') || s.includes('error')) return 'error';
  if (s.includes('pending')) return 'warning';
  return 'default';
}

export default function OrderBoard() {
  const [stages, setStages] = useState([]);
  const [ordersByStage, setOrdersByStage] = useState({});
  const [pendingOrders, setPendingOrders] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [anchorEl, setAnchorEl] = useState(null);
  const [qrOrder, setQrOrder] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const ps = await getProcessStages();
        const normalized = Array.isArray(ps) ? ps.map((s) => (typeof s === 'string' ? s : (s.stageName ?? s.name))).filter(Boolean) : [];
        if (!mounted) return;
        setStages(normalized);

        // Fetch orders per stage in parallel
        const results = await Promise.all(
          normalized.map(async (stageName) => {
            try {
              const data = await getOrdersByStatus(stageName);
              return { stageName, items: Array.isArray(data) ? data : [] };
            } catch (e) {
              return { stageName, error: e.message || 'Failed to load' };
            }
          })
        );

        // Fetch explicit admin pending orders list (ORDER-PENDING)
        setPendingLoading(true);
        try {
          const pending = await getOrdersByStatus('ORDER-PENDING');
          if (mounted) setPendingOrders(Array.isArray(pending) ? pending : []);
        } catch (e) {
          console.warn('Failed to load ORDER-PENDING:', e?.message || e);
        } finally {
          if (mounted) setPendingLoading(false);
        }

        if (!mounted) return;
        const map = {};
        results.forEach((r) => {
          map[r.stageName] = { items: r.items || [], error: r.error || null };
        });
        setOrdersByStage(map);
      } catch (e) {
        if (!mounted) return;
        setError(e.message || 'Failed to load order board');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const handleActionClick = (event /* row */) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleShowQr = async (order) => {
    // open modal and let it fetch the base64 via shared service
    console.log('[OrderBoard.handleShowQr] QR button clicked, order:', order);
    const id = order?.orderId ?? order?.id ?? order?.orderNo ?? order?.code;
    console.log('[OrderBoard.handleShowQr] Order id:', id);
    setQrOrder(order);
  };

  const handleCloseQr = () => {
    console.log('[OrderBoard.handleCloseQr] Closing QR modal');
    setQrOrder(null);
  };

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid item xs={12}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5">Order Board</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Central view of orders — grouped by process stage.
            </Typography>
          </Grid>

          {/* header summary cards removed as requested */}
        </Grid>
      </Grid>

      {loading && (
        <Grid item xs={12}>
          <MainCard content={false}>
            <Box sx={{ p: 3 }}>Loading order board...</Box>
          </MainCard>
        </Grid>
      )}

      {error && (
        <Grid item xs={12}>
          <Typography color="error">{error}</Typography>
        </Grid>
      )}

      {!loading && !error && (
        <>
          <Grid item xs={12}>
            <MainCard content={false} sx={{ mb: 2 }}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6">Recent Pending Orders</Typography>
                <Typography variant="caption" color="text.secondary">
                  Admin pending queue (ORDER-PENDING)
                </Typography>
              </Box>

              {pendingLoading ? (
                <Box sx={{ p: 3 }}>Loading pending orders...</Box>
              ) : (
                <TableContainer sx={{ px: 2 }}>
                  <Table size="small" aria-labelledby={`orders-pending`} sx={{ tableLayout: 'fixed' }}>
                    <OrdersTableHead />
                    <TableBody>
                      {pendingOrders && pendingOrders.length > 0 ? (
                        pendingOrders.slice(0, 12).map((order) => {
                          // Debug logs and safe stage extraction
                          // eslint-disable-next-line no-console
                          console.log('Order:', order);
                          // eslint-disable-next-line no-console
                          console.log('Stage:', order?.stage);
                          // eslint-disable-next-line no-console
                          console.log('Status:', order?.status);
                          const rowStage = order?.stage || order?.status || order?.orderStageName || order?.stageName || '';
                          const readyVariants = ['READY_TO_DISPATCH', 'READY-TO-DISPATCH', 'READY_FOR_DISPATCH'];
                          const isReady = readyVariants.includes(String(rowStage).toUpperCase());
                          console.log(
                            '[OrderBoard.PendingOrders] Order:',
                            renderOrderId(order),
                            'rowStage:',
                            rowStage,
                            'isReady:',
                            isReady
                          );

                          return (
                            <TableRow
                              hover
                              tabIndex={-1}
                              key={renderOrderId(order)}
                              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                              <TableCell>
                                <IconButton size="small" onClick={(e) => handleActionClick(e, order)}>
                                  <EllipsisOutlined style={{ fontSize: '1rem' }} />
                                </IconButton>
                                {isReady && (
                                  <IconButton size="small" onClick={() => handleShowQr(order)} title="Show QR" sx={{ ml: 0.5 }}>
                                    <Typography variant="caption">QR</Typography>
                                  </IconButton>
                                )}
                              </TableCell>
                              <TableCell>
                                <Typography variant="subtitle2">{renderOrderId(order)}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="subtitle2">
                                  {order?.firstName || order?.lastName
                                    ? `${order?.firstName ?? ''} ${order?.lastName ?? ''}`.trim()
                                    : (order?.customer?.name ?? order?.customerName ?? '—')}
                                </Typography>
                                {(order?.customerPhone || order?.customerEmail) && (
                                  <Typography variant="caption" color="text.secondary">
                                    {[order?.customerPhone, order?.customerEmail].filter(Boolean).join(' • ')}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {order?.orderStageName ?? order?.stageName ?? order?.stage ?? order?.status ?? 'N/A'}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2">
                                  {order?.totalAmount != null ? Number(order.totalAmount).toFixed(2) : '—'}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={order?.paymentStatus ?? '—'}
                                  color={paymentStatusColor(order?.paymentStatus)}
                                  size="small"
                                  variant={paymentStatusColor(order?.paymentStatus) === 'default' ? 'outlined' : 'filled'}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6}>
                            <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                              No pending orders
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </MainCard>
          </Grid>
          {stages.map((stageName) => {
            const group = ordersByStage[stageName] || { items: [], error: null };
            const rows = group.items || [];
            return (
              <Grid item xs={12} md={6} lg={4} key={stageName}>
                <MainCard content={false} sx={{ minHeight: 200 }}>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6">{stageName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {rows.length} orders
                    </Typography>
                  </Box>

                  <TableContainer sx={{ px: 2 }}>
                    <Table size="small" aria-labelledby={`orders-${stageName}`} sx={{ tableLayout: 'fixed' }}>
                      <OrdersTableHead />
                      <TableBody>
                        {rows.map((order) => (
                          <TableRow
                            hover
                            tabIndex={-1}
                            key={renderOrderId(order)}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                          >
                            <TableCell>
                              <IconButton size="small" onClick={(e) => handleActionClick(e, order)}>
                                <EllipsisOutlined style={{ fontSize: '1rem' }} />
                              </IconButton>
                            </TableCell>
                            <TableCell>
                              <Typography variant="subtitle2">{renderOrderId(order)}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="subtitle2">
                                {order.firstName || order.lastName
                                  ? `${order.firstName ?? ''} ${order.lastName ?? ''}`.trim()
                                  : (order.customer?.name ?? order.customerName ?? '—')}
                              </Typography>
                              {(order.customerPhone || order.customerEmail) && (
                                <Typography variant="caption" color="text.secondary">
                                  {[order.customerPhone, order.customerEmail].filter(Boolean).join(' • ')}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{order.orderStageName ?? order.stageName ?? order.stage ?? stageName}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">
                                {order.totalAmount != null ? Number(order.totalAmount).toFixed(2) : '—'}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={order.paymentStatus ?? '—'}
                                color={paymentStatusColor(order.paymentStatus)}
                                size="small"
                                variant={paymentStatusColor(order.paymentStatus) === 'default' ? 'outlined' : 'filled'}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  >
                    <MenuItem onClick={handleMenuClose}>View Order</MenuItem>
                    <MenuItem onClick={handleMenuClose}>Assign</MenuItem>
                    <MenuItem onClick={handleMenuClose}>Edit</MenuItem>
                  </Menu>

                  {qrOrder && <ShippingQrModal open={Boolean(qrOrder)} onClose={handleCloseQr} order={qrOrder} />}
                </MainCard>
              </Grid>
            );
          })}
        </>
      )}
    </Grid>
  );
}
