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
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
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
import { FileSpreadsheet } from 'lucide-react';

import { getProcessStages } from 'api/processStage';
import { getOrdersByStatus } from 'api/orders';
import { authorizedFetchRaw } from 'api/auth';
import ShippingQrModal from 'components/ShippingQrModal';
import AssignUserDialog from 'components/AssignUserDialog';

// ==============================|| ORDER BOARD (TABLE VIEW) ||============================== //

// (Summary tiles removed — header simplified)

function OrdersTableHead() {
  return (
    <TableHead>
      <TableRow>
        <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', width: 48, p: 1 }} />
        <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', width: 110, whiteSpace: 'nowrap' }}>Order #</TableCell>
        <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', width: 150, whiteSpace: 'nowrap' }}>Customer</TableCell>
        <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', width: 160, whiteSpace: 'nowrap' }}>University</TableCell>
        <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', width: 150, whiteSpace: 'nowrap' }}>Department</TableCell>
        <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', width: 130, whiteSpace: 'nowrap' }}>Stage</TableCell>
        <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', width: 150, whiteSpace: 'nowrap' }}>Assigned Staff</TableCell>
        <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', width: 140, whiteSpace: 'nowrap' }}>Date Assigned</TableCell>
        <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', width: 140, whiteSpace: 'nowrap' }}>Expected Done</TableCell>
        <TableCell align="right" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', width: 90, whiteSpace: 'nowrap' }}>Amount</TableCell>
        <TableCell align="center" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', width: 100, whiteSpace: 'nowrap' }}>Payment</TableCell>
      </TableRow>
    </TableHead>
  );
}

function renderOrderId(order) {
  return order.orderNumber ?? '—';
}

function getUniversityName(order) {
  return (
    order.universityName ||
    (order.university && (order.university.name || order.universityName)) ||
    order.university?.name ||
    null
  );
}

function getUniversityDept(order) {
  return (
    order.departmentName || null
  );
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
  const [searchByStage, setSearchByStage] = useState({});
  const [pendingOrders, setPendingOrders] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [qrOrder, setQrOrder] = useState(null);
  const [designOrder, setDesignOrder] = useState(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);
  const [downloading, setDownloading] = useState({});
  const [downloadError, setDownloadError] = useState('');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        // Use fixed board stages (requested by UI) instead of dynamic process stages
        const stagesData = await getProcessStages();
        const normalized = (Array.isArray(stagesData) ? stagesData : [])
          .filter((stage) => stage?.active !== false && stage?.stageName)
          .sort((a, b) => (a.sequenceNo || 0) - (b.sequenceNo || 0))
          .map((stage) => stage.stageName);

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
          if (mounted) setPendingOrders([]);
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

  const handleOpenAssign = () => {
    setAssignTarget(selectedOrder);
    setAssignOpen(true);
    setAnchorEl(null);
  };

  const handleAssigned = ({ user, dateAssigned }) => {
    // update the local UI to show assigned staff immediately
    if (!assignTarget) return;

    setOrdersByStage((prev) => {
      const map = { ...prev };
      Object.keys(map).forEach((stage) => {
        const items = map[stage]?.items || [];
        const idx = items.findIndex((o) => String(renderOrderId(o)) === String(renderOrderId(assignTarget)));
        if (idx >= 0) {
          const updated = {
            ...items[idx],
            assignedStaffName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.userName || user.email || '' : items[idx].assignedStaffName,
            assignedStaffEmail: user?.email || items[idx].assignedStaffEmail,
            assignedStaffPhone: user?.mobile || user?.phone || items[idx].assignedStaffPhone,
            assignedDate: dateAssigned || new Date().toISOString()
          };
          const newItems = items.slice();
          newItems[idx] = updated;
          map[stage] = { ...(map[stage] || {}), items: newItems };
        }
      });
      return map;
    });

    setAssignOpen(false);
    setAssignTarget(null);
    setSelectedOrder(null);
  };

  const handleViewOrder = () => {
    if (!selectedOrder) {
      handleMenuClose();
      return;
    }

    const id = selectedOrder.orderId || selectedOrder.id || selectedOrder.orderNo || selectedOrder.code;
    if (id) {
      // Navigate to admin-only order details page
      navigate(`/admin/orders/view/${encodeURIComponent(String(id))}`);
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

  const exportStageToCsv = (stageName) => {
    const group = ordersByStage[stageName] || { items: [] };
    const rows = group.items || [];
    const query = String(searchByStage[stageName] || '').trim().toLowerCase();
    const filteredRows = query
      ? rows.filter((order) => {
          const id = String(renderOrderId(order) || '').toLowerCase();
          const name = String((order.firstName || '') + ' ' + (order.lastName || '') || (order.customer?.name || '') || '').toLowerCase();
          const email = String(order.customerEmail || order.customer?.email || '').toLowerCase();
          const phone = String(order.customerPhone || order.customer?.phone || '').toLowerCase();
          return id.includes(query) || name.includes(query) || email.includes(query) || phone.includes(query);
        })
      : rows;

    const headers = ['Order ID', 'Customer', 'University', 'Department', 'Stage', 'Assigned Staff', 'Date Assigned', 'Expected Done', 'Amount', 'Payment'];
    const csvRows = [headers.join(',')];

    for (const o of filteredRows) {
      const cols = [
        `"${(renderOrderId(o) ?? '').toString().replace(/"/g, '""')}"`,
        `"${((o.firstName || '') + ' ' + (o.lastName || '')).trim() || (o.customer?.name || '')}".replace(/"/g, '""')`,
        `"${(getUniversityName(o) || '').toString().replace(/"/g, '""')}"`,
        `"${(getUniversityDept(o) || '').toString().replace(/"/g, '""')}"`,
        `"${(o.orderStageName || o.stageName || o.stage || '').toString().replace(/"/g, '""')}"`,
        `"${(o.assignedStaffName || '').toString().replace(/"/g, '""')}"`,
        `"${(formatDateTime(o.assignedDate) || '').toString().replace(/"/g, '""')}"`,
        `"${(formatDateTime(o.expectedDoneDate) || '').toString().replace(/"/g, '""')}"`,
        `"${o.totalAmount != null ? Number(o.totalAmount).toFixed(2) : ''}"`,
        `"${(o.paymentStatus || '').toString().replace(/"/g, '""')}"`
      ];
      csvRows.push(cols.join(','));
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${stageName.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75} alignItems="stretch">
      <Grid item xs={12}>
        <Grid container alignItems="center" spacing={2}>
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
            const query = String(searchByStage[stageName] || '').trim().toLowerCase();
            const filteredRows = query
              ? rows.filter((order) => {
                  const id = String(renderOrderId(order) || '').toLowerCase();
                  const name = String((order.firstName || '') + ' ' + (order.lastName || '') || (order.customer?.name || '') || '').toLowerCase();
                  const email = String(order.customerEmail || order.customer?.email || '').toLowerCase();
                  const phone = String(order.customerPhone || order.customer?.phone || '').toLowerCase();
                  return id.includes(query) || name.includes(query) || email.includes(query) || phone.includes(query);
                })
              : rows;
            return (
              <Grid item xs={12} md={6} lg={4} key={stageName} sx={{ display: 'flex' }}>
                <MainCard content={false} sx={{ minHeight: 200, display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ flex: '1 1 auto' }}>
                        <Typography variant="h6">{stageName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {rows.length} orders
                        </Typography>
                      </Box>
                      <Box sx={{ flex: '0 0 320px' }}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Search orders..."
                            variant="outlined"
                            value={searchByStage[stageName] || ''}
                            onChange={(e) => setSearchByStage((s) => ({ ...s, [stageName]: e.target.value }))}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SearchOutlined style={{ fontSize: 18, color: 'inherit' }} />
                                </InputAdornment>
                              ),
                              'aria-label': 'search-orders'
                            }}
                            sx={(theme) => ({
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1.5,
                                backgroundColor: theme.palette.mode === 'light' ? '#fff' : theme.palette.background.paper,
                                '& fieldset': {
                                  borderColor: theme.palette.mode === 'light' ? theme.palette.grey[300] : theme.palette.grey[700],
                                  borderWidth: 1.6
                                },
                                '&:hover fieldset': { borderColor: theme.palette.primary.main },
                                '&.Mui-focused fieldset': {
                                  borderColor: theme.palette.primary.dark,
                                  boxShadow: `0 0 0 8px ${theme.palette.primary.main}33`
                                }
                              },
                              '& .MuiInputAdornment-root svg': {
                                color: theme.palette.primary.main
                              }
                            })}
                          />

                          <Tooltip title="Export CSV (Excel)">
                            <IconButton
                              onClick={() => exportStageToCsv(stageName)}
                              aria-label={`export-${stageName}`}
                              sx={(theme) => ({
                                width: 42,
                                height: 42,
                                bgcolor: 'transparent',
                                color: theme.palette.success.contrastText,
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg,#16a34a,#22c55e)',
                                boxShadow: '0 5px 14px rgba(34,197,94,0.24)',
                                '&:hover': {
                                  background: 'linear-gradient(135deg,#15803d,#16a34a)',
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 8px 18px rgba(34,197,94,0.34)'
                                }
                              })}
                            >
                              <FileSpreadsheet size={16} style={{ color: '#fff' }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  <TableContainer sx={{ px: 2, overflowX: 'auto', flex: 1 }}>
                    <Table size="small" aria-labelledby={`orders-${stageName}`} sx={{ tableLayout: 'fixed', minWidth: 1372 }}>
                      <colgroup>
                        <col style={{ width: '48px' }} />
                        <col style={{ width: '110px' }} />
                        <col style={{ width: '150px' }} />
                        <col style={{ width: '160px' }} />
                        <col style={{ width: '150px' }} />
                        <col style={{ width: '130px' }} />
                        <col style={{ width: '150px' }} />
                        <col style={{ width: '140px' }} />
                        <col style={{ width: '140px' }} />
                        <col style={{ width: '90px' }} />
                        <col style={{ width: '100px' }} />
                      </colgroup>
                      <OrdersTableHead />
                      <TableBody>
                        {filteredRows.map((order) => (
                          <TableRow
                            hover
                            tabIndex={-1}
                            key={renderOrderId(order)}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                          >
                            <TableCell sx={{ width: 48, px: 1 }}>
                              <Tooltip title="Actions" arrow placement="top">
                                <IconButton
                                  onClick={(e) => handleActionClick(e, order)}
                                  size="small"
                                  aria-label="Order actions"
                                  sx={(theme) => ({
                                    width: 34,
                                    height: 34,
                                    borderRadius: '10px',
                                    border: '1px solid',
                                    borderColor: theme.palette.mode === 'light' ? '#e5e7eb' : theme.palette.divider,
                                    bgcolor: theme.palette.mode === 'light' ? '#f8fafc' : theme.palette.background.paper,
                                    color: theme.palette.text.secondary,
                                    transition: 'all 0.18s ease',
                                    '&:hover': {
                                      bgcolor: theme.palette.primary.lighter || 'rgba(37,99,235,0.08)',
                                      borderColor: theme.palette.primary.main,
                                      color: theme.palette.primary.main,
                                      transform: 'translateY(-1px)',
                                      boxShadow: '0 4px 12px rgba(37,99,235,0.14)'
                                    }
                                  })}
                                >
                                  <EllipsisOutlined style={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                            <TableCell sx={{ overflow: 'hidden' }}>
                              <Typography variant="subtitle2" noWrap title={renderOrderId(order)}>{renderOrderId(order)}</Typography>
                            </TableCell>
                            <TableCell sx={{ overflow: 'hidden' }}>
                              <Typography variant="subtitle2" noWrap title={
                                order.firstName || order.lastName
                                  ? `${order.firstName ?? ''} ${order.lastName ?? ''}`.trim()
                                  : (order.customer?.name ?? order.customerName ?? '—')
                              }>
                                {order.firstName || order.lastName
                                  ? `${order.firstName ?? ''} ${order.lastName ?? ''}`.trim()
                                  : (order.customer?.name ?? order.customerName ?? '—')}
                              </Typography>
                              {(order.customerPhone || order.customerEmail) && (
                                <Typography variant="caption" color="text.secondary" noWrap title={[order.customerPhone, order.customerEmail].filter(Boolean).join(' • ')}>
                                  {[order.customerPhone, order.customerEmail].filter(Boolean).join(' • ')}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell sx={{ overflow: 'hidden' }}>
                              <Typography variant="body2" noWrap title={getUniversityName(order) ?? '—'}>{getUniversityName(order) ?? '—'}</Typography>
                            </TableCell>
                            <TableCell sx={{ overflow: 'hidden' }}>
                              <Typography variant="body2" noWrap title={getUniversityDept(order) ?? '—'}>{getUniversityDept(order) ?? '—'}</Typography>
                            </TableCell>
                            <TableCell sx={{ overflow: 'hidden' }}>
                              <Typography variant="body2" noWrap title={order.orderStageName ?? order.stageName ?? order.stage ?? stageName}>{order.orderStageName ?? order.stageName ?? order.stage ?? stageName}</Typography>
                            </TableCell>
                            <TableCell sx={{ overflow: 'hidden' }}>
                              <Typography variant="subtitle2" noWrap title={order.assignedStaffName || '—'}>{order.assignedStaffName || '—'}</Typography>
                              {(order.assignedStaffEmail || order.assignedStaffPhone) && (
                                <Typography variant="caption" color="text.secondary" noWrap title={[order.assignedStaffEmail, order.assignedStaffPhone].filter(Boolean).join(' • ')}>
                                  {[order.assignedStaffEmail, order.assignedStaffPhone].filter(Boolean).join(' • ')}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell sx={{ overflow: 'hidden' }}>
                              <Typography variant="body2" noWrap>{formatDateTime(order.assignedDate)}</Typography>
                            </TableCell>
                            <TableCell sx={{ overflow: 'hidden' }}>
                              <Typography variant="body2" noWrap>{formatDateTime(order.expectedDoneDate)}</Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ overflow: 'hidden' }}>
                              <Typography variant="body2" noWrap>
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
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                    slotProps={{
                      paper: {
                        elevation: 4,
                        sx: {
                          mt: 0.5,
                          minWidth: 160,
                          borderRadius: '10px',
                          border: '1px solid',
                          borderColor: 'divider',
                          '& .MuiMenuItem-root': {
                            fontSize: '0.875rem',
                            py: 1,
                            px: 2,
                            gap: 1
                          }
                        }
                      }
                    }}
                  >
                    <MenuItem onClick={handleViewOrder}>View Order</MenuItem>
                    <MenuItem onClick={handleOpenAssign}>Assign</MenuItem>
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
                  <AssignUserDialog open={assignOpen} onClose={() => { setAssignOpen(false); setAssignTarget(null); }} order={assignTarget} onAssigned={handleAssigned} />
                </MainCard>
              </Grid>
            );
          })}
        </>
      )}
    </Grid>
  );
}