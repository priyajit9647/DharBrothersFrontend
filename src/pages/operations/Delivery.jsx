import { useEffect, useState } from 'react';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import EllipsisOutlined from '@ant-design/icons/EllipsisOutlined';

import MainCard from 'components/MainCard';

import { getOrdersByStatus } from 'api/orders';
import ShippingQrModal from 'components/ShippingQrModal';

// ==============================|| OPERATIONS - DELIVERY (Order Board) ||============================== //

function paymentStatusColor(status) {
  if (!status) return 'default';
  const s = String(status).toLowerCase();
  if (s.includes('success')) return 'success';
  if (s.includes('fail') || s.includes('failed') || s.includes('error')) return 'error';
  if (s.includes('pending')) return 'warning';
  return 'default';
}

function isReadyToDispatchStage(stage) {
  if (!stage) return false;
  const normalized = String(stage).trim().replace(/[-_\s]+/g, ' ').toLowerCase();
  return /(ready\s*(to|for)\s*dispatch)/.test(normalized);
}

function StageCard({ title, rows = [] }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [qrOrder, setQrOrder] = useState(null);
  const [qrType, setQrType] = useState('shipping');

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setActiveRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveRow(null);
  };

  const handleView = () => {
    // TODO: wire to order view route/modal
    console.log('View order', activeRow);
    handleMenuClose();
  };

  const handleAssign = () => {
    // TODO: open assign dialog
    console.log('Assign order', activeRow);
    handleMenuClose();
  };

  const handleEdit = () => {
    // TODO: open edit dialog
    console.log('Edit order', activeRow);
    handleMenuClose();
  };

  const handleShowQr = async (order, type = 'shipping') => {
    console.log('[Delivery.StageCard.handleShowQr] QR button clicked, order:', order, 'type:', type);
    const id = order?.orderId ?? order?.id ?? order?.orderNo ?? order?.code;
    console.log('[Delivery.StageCard.handleShowQr] Order id:', id);
    setQrType(type === 'feedback' ? 'feedback' : 'shipping');
    setQrOrder(order);
  };

  const handleCloseQr = () => {
    console.log('[Delivery.StageCard.handleCloseQr] Closing QR modal');
    setQrOrder(null);
    setQrType('shipping');
  };

  return (
    <Box sx={{ mb: 1, width: '100%' }}>
      <MainCard title={`${String(title).toUpperCase()}`} contentSX={{ p: 0 }} sx={{ width: '100%' }}>
        <Grid container alignItems="center" sx={{ px: 2, pt: 1, pb: 0 }}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              {rows.length} orders
            </Typography>
          </Grid>
        </Grid>

        <TableContainer
          component={Paper}
          sx={{
            boxShadow: 'none',
            borderTop: '1px solid',
            borderColor: 'divider',
            maxHeight: { xs: '60vh', md: 'calc(100vh - 220px)' },
            overflow: 'auto',
            width: '100%'
          }}
        >
          <Table size="small" aria-label={`${title} table`} sx={{ '& td, & th': { whiteSpace: 'normal' } }}>
            <TableHead sx={{ position: 'sticky', top: 0, zIndex: 2, backgroundColor: 'background.paper' }}>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell sx={{ width: 56 }} />
                <TableCell sx={{ width: 300, fontWeight: 700 }}>ORDER #</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>CUSTOMER</TableCell>
                <TableCell sx={{ width: 180, fontWeight: 700 }}>STAGE</TableCell>
                <TableCell align="right" sx={{ width: 120, fontWeight: 700 }}>
                  AMOUNT
                </TableCell>
                <TableCell align="center" sx={{ width: 140, fontWeight: 700 }}>
                  PAYMENT
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No orders
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r, _idx) => (
                  <TableRow key={r.orderId || `${title}-${_idx}`} hover>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, r)}
                        aria-controls={`row-menu-${_idx}`}
                        aria-haspopup="true"
                      >
                        <EllipsisOutlined style={{ fontSize: '0.9rem' }} />
                      </IconButton>
                      {/* show QR buttons for ready-to-dispatch rows */}
                      {isReadyToDispatchStage(r.stage) && (
                        <Box sx={{ display: 'inline-flex', flexDirection: 'column', gap: 0.5, ml: 0.5 }}>
                          {console.log('[Delivery.StageCard] QR buttons showing for order:', r.orderId, 'stage:', r.stage)}
                          <Button type="button" size="small" variant="outlined" onClick={() => handleShowQr(r, 'shipping')}>
                            Shipping QR
                          </Button>
                          <Button type="button" size="small" variant="outlined" onClick={() => handleShowQr(r, 'feedback')}>
                            Feedback QR
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300, wordBreak: 'break-word' }}>
                      <Typography sx={{ fontSize: '0.95rem' }}>{r.orderId}</Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 420 }}>
                      <Typography sx={{ fontSize: '0.95rem', fontWeight: 600 }}>{r.customerName}</Typography>
                      <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                        {[r.customerContact, r.customerEmail].filter(Boolean).join(' • ')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.95rem' }}>{r.stage}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontSize: '0.95rem' }}>
                        {Number.isFinite(Number(r.amount)) ? Number(r.amount).toFixed(2) : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={String(r.payment ?? '—').toUpperCase()} color={paymentStatusColor(r.payment)} size="small" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Menu
          id="row-actions-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={handleView}>View Order</MenuItem>
          <MenuItem onClick={handleAssign}>Assign</MenuItem>
          <MenuItem onClick={handleEdit}>Edit</MenuItem>
        </Menu>
        {qrOrder && (
          <ShippingQrModal open={Boolean(qrOrder)} onClose={handleCloseQr} order={qrOrder} initialType={qrType} />
        )}
      </MainCard>
    </Box>
  );
}

function JobsStyleCard({ title, rows = [] }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setActiveRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveRow(null);
  };

  return (
    <Box sx={{ mb: 1, width: '100%' }}>
      <MainCard sx={{ width: '100%' }} content={false}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="caption" color="text.secondary">
            {rows.length} orders
          </Typography>
        </Box>

        <TableContainer sx={{ width: '100%', overflowX: 'auto', display: 'block', maxWidth: '100%', px: 2 }}>
          <Table size="small" aria-label={`${title} jobs-style table`} sx={{ width: '100%', tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 56 }} />
                {/* distribute remaining columns evenly */}
                <TableCell sx={{ width: '20%' }}>ORDER #</TableCell>
                <TableCell sx={{ width: '20%' }}>CUSTOMER</TableCell>
                <TableCell sx={{ width: '20%' }}>STAGE</TableCell>
                <TableCell align="right" sx={{ width: '20%' }}>
                  AMOUNT
                </TableCell>
                <TableCell align="center" sx={{ width: '20%' }}>
                  PAYMENT
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No orders
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r, idx) => (
                  <TableRow key={r.orderId || `${title}-${idx}`} hover>
                    <TableCell>
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, r)}>
                        <EllipsisOutlined style={{ fontSize: '0.9rem' }} />
                      </IconButton>
                    </TableCell>
                    <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <Typography sx={{ fontSize: '0.95rem' }}>{r.orderId}</Typography>
                    </TableCell>
                    <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <Typography sx={{ fontSize: '0.95rem', fontWeight: 600 }}>{r.customerName}</Typography>
                      <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                        {[r.customerContact, r.customerEmail].filter(Boolean).join(' • ')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.95rem' }}>{r.stage}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontSize: '0.95rem' }}>
                        {Number.isFinite(Number(r.amount)) ? Number(r.amount).toFixed(2) : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={String(r.payment ?? '—').toUpperCase()} color={paymentStatusColor(r.payment)} size="small" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={handleMenuClose}>View Order</MenuItem>
          <MenuItem onClick={handleMenuClose}>Assign</MenuItem>
          <MenuItem onClick={handleMenuClose}>Edit</MenuItem>
        </Menu>
      </MainCard>
    </Box>
  );
}

export default function DeliveryDispatch() {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Only load orders for the explicit Ready-To-Dispatch stage
        const stageName = 'Ready-To-Dispatch';
        try {
          const data = await getOrdersByStatus(stageName);
          const items = Array.isArray(data) ? data : (data?.items ?? data?.data ?? []);
          const rows = items.map((o) => ({
            orderId: o.orderId ?? o.orderNo ?? o.id ?? o.code ?? '',
            customerName: o.customer?.name ?? (`${o.firstName ?? ''} ${o.lastName ?? ''}`.trim() || o.customerName || '—'),
            customerContact: o.customerPhone ?? o.customer?.phone ?? o.customerContact ?? '',
            customerEmail: o.customerEmail ?? o.customer?.email ?? o.email ?? '',
            stage: o.orderStageName ?? o.stageName ?? o.stage ?? stageName,
            amount: Number(o.totalAmount ?? o.amount ?? o.grandTotal ?? 0),
            payment: o.paymentStatus ?? o.payment ?? '—'
          }));

          if (!mounted) return;
          setStages([{ name: stageName, rows }]);
        } catch (e) {
          console.error('[Delivery.load] Error loading Ready-To-Dispatch:', e);
          if (!mounted) return;
          setStages([]);
        }
      } catch (e) {
        if (!mounted) return;
        setError(e.message || 'Failed to load orders');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Grid
      container
      rowSpacing={0}
      columnSpacing={0}
      sx={{
        height: '100vh',
        overflow: 'auto',
        px: 0,
        py: 0,
        // offset parent layout padding so content stretches full available width
        ml: { xs: -2, sm: -3 },
        mr: { xs: -2, sm: -3 }
      }}
    >
      <Grid item xs={12} sx={{ px: 2, pt: 1, pb: 0 }}>
        <Typography variant="h5">Delivery & Dispatch</Typography>
      </Grid>

      {loading && (
        <Grid item xs={12}>
          <MainCard content={false}>
            <Typography sx={{ p: 3 }}>Loading order board...</Typography>
          </MainCard>
        </Grid>
      )}

      {error && (
        <Grid item xs={12}>
          <Typography color="error">{error}</Typography>
        </Grid>
      )}

      {!loading &&
        !error &&
        stages.map((s) => (
          <Grid item xs={12} key={s.name} sx={{ px: 0 }}>
            {String(s.name).toUpperCase() === 'ORDER-PENDING' ? (
              <JobsStyleCard title={s.name} rows={s.rows} />
            ) : (
              <StageCard title={s.name} rows={s.rows} />
            )}
          </Grid>
        ))}
    </Grid>
  );
}
