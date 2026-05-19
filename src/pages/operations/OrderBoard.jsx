import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { authorizedFetchRaw } from 'api/auth';
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
        <TableCell>Assigned Staff</TableCell>
        <TableCell>Date Assigned</TableCell>
        <TableCell>Expected Done</TableCell>
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

function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export default function OrderBoard() {
  const [stages, setStages] = useState([]);
  const [ordersByStage, setOrdersByStage] = useState({});
  const [pendingOrders, setPendingOrders] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [qrOrder, setQrOrder] = useState(null);
  const [designOrder, setDesignOrder] = useState(null);
  const [downloading, setDownloading] = useState({});
  const [downloadError, setDownloadError] = useState('');

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
          // const pending = await getOrdersByStatus('ORDER-PENDING');
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

  const navigate = useNavigate();

  const handleActionClick = (event /* row */, order) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order ?? null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    // keep selectedOrder until dialog opens; clear when menu fully closed
    setSelectedOrder(null);
  };

  const handleViewOrder = () => {
    if (!selectedOrder) {
      handleMenuClose();
      return;
    }

    const id = selectedOrder.orderId || selectedOrder.id || selectedOrder.orderNo || selectedOrder.code;
    if (id) {
      navigate(`/orders/view/${encodeURIComponent(String(id))}`);
    }
    handleMenuClose();
  };

  const openDesignDialog = () => {
    setDesignOrder(selectedOrder);
    handleMenuClose();
  };

  function getOrderFileUrl(order, type) {
    if (!order) return null;
    const map = {
      thesis: ['thesisUrl', 'thesisDocumentUrl', 'thesisDocument', 'thesis'],
      sinopsis: ['sinopsisUrl', 'sinopsisDocumentUrl', 'sinopsisDocument', 'sinopsis', 'synopsisUrl', 'synopsisDocument'],
      hardCoverDesign: ['hardCoverUrl', 'hardCover', 'hardCoverDesignUrl', 'hardCoverDesign'],
      softCoverDesign: ['softCoverUrl', 'softCover', 'softCoverDesignUrl', 'softCoverDesign']
    };

    const keys = map[type] || [];
    for (const k of keys) {
      const v = order[k];
      if (!v) continue;
      if (typeof v === 'string') return v;
      if (typeof v === 'object') {
        if (Array.isArray(v) && v.length) return v[0];
        if (v.url) return v.url;
      }
    }

    // fallback: maybe order.documents is an array with types
    if (Array.isArray(order.documents)) {
      const found = order.documents.find((d) => String(d.type ?? d.documentType ?? '').toLowerCase().includes(type.toLowerCase()));
      if (found) return found.url || found.filePath || found.path || null;
    }

    return null;
  }

  async function downloadByUrl(url, suggestedName) {
    if (!url) throw new Error('No URL');
    // absolute URL
    if (/^https?:\/\//i.test(url) || url.startsWith('//')) {
      // open in new tab to let browser handle auth/cors for external urls
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noreferrer';
      // attempt to set download filename (may be ignored for cross-origin)
      a.download = suggestedName || '';
      document.body.appendChild(a);
      a.click();
      a.remove();
      return;
    }

    // treat as internal path (starts with /) — use authorizedFetchRaw to get binary
    const path = url.startsWith('/') ? url : `/${url}`;
    const res = await authorizedFetchRaw(path, { method: 'GET' });
    const blob = await res.blob();

    let filename = suggestedName || 'download';
    const cd = res.headers.get('Content-Disposition');
    if (cd) {
      const m = /filename\*=UTF-8''([^;\n\r]+)/i.exec(cd) || /filename="?([^";]+)"?/i.exec(cd);
      if (m) filename = decodeURIComponent(m[1]);
    }

    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
  }

  const handleDownload = async (type) => {
    if (!designOrder) return;
    setDownloadError('');
    setDownloading((p) => ({ ...p, [type]: true }));
    try {
      const url = getOrderFileUrl(designOrder, type);
      if (!url) throw new Error('No file available for ' + type);
      const suggested = `${renderOrderId(designOrder)}-${type}.pdf`;
      await downloadByUrl(url, suggested);
    } catch (e) {
      console.error('[OrderBoard.download] Error', e);
      setDownloadError(e.message || String(e));
    } finally {
      setDownloading((p) => ({ ...p, [type]: false }));
    }
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
                            <TableCell>
                              <Typography variant="subtitle2">{order.assignedStaffName || '—'}</Typography>
                              {(order.assignedStaffEmail || order.assignedStaffPhone) && (
                                <Typography variant="caption" color="text.secondary">
                                  {[order.assignedStaffEmail, order.assignedStaffPhone].filter(Boolean).join(' • ')}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{formatDateTime(order.assignedDate)}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{formatDateTime(order.expectedDoneDate)}</Typography>
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
                    <MenuItem onClick={handleViewOrder}>View Order</MenuItem>
                    <MenuItem onClick={handleMenuClose}>Assign</MenuItem>
                    <MenuItem onClick={handleMenuClose}>Edit</MenuItem>
                    <MenuItem onClick={openDesignDialog}>Design Details</MenuItem>
                  </Menu>

                  <Dialog open={Boolean(designOrder)} onClose={() => setDesignOrder(null)} fullWidth maxWidth="sm">
                    <DialogTitle>Design Details — {designOrder ? renderOrderId(designOrder) : ''}</DialogTitle>
                    <DialogContent dividers>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', py: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleDownload('thesis')}
                          disabled={!getOrderFileUrl(designOrder, 'thesis') || Boolean(downloading.thesis)}
                        >
                          {downloading.thesis ? <CircularProgress size={16} color="inherit" /> : 'Thesis download'}
                        </Button>

                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleDownload('sinopsis')}
                          disabled={!getOrderFileUrl(designOrder, 'sinopsis') || Boolean(downloading.sinopsis)}
                        >
                          {downloading.sinopsis ? <CircularProgress size={16} color="inherit" /> : 'Sinopsis download'}
                        </Button>

                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleDownload('hardCoverDesign')}
                          disabled={!getOrderFileUrl(designOrder, 'hardCoverDesign') || Boolean(downloading.hardCoverDesign)}
                        >
                          {downloading.hardCoverDesign ? <CircularProgress size={16} color="inherit" /> : 'Hard Cover download'}
                        </Button>

                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleDownload('softCoverDesign')}
                          disabled={!getOrderFileUrl(designOrder, 'softCoverDesign') || Boolean(downloading.softCoverDesign)}
                        >
                          {downloading.softCoverDesign ? <CircularProgress size={16} color="inherit" /> : 'Soft Cover download'}
                        </Button>
                      </Box>
                      {downloadError && (
                        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                          {downloadError}
                        </Typography>
                      )}
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={() => setDesignOrder(null)}>Close</Button>
                    </DialogActions>
                  </Dialog>

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
