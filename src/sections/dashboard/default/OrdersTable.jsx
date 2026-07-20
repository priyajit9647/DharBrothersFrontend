import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';

import { getRecentOrders, sendPaymentLink, adminCashPayment, getOrderPaymentStatus } from 'api/orders';

const headCells = [
  {
    id: 'action',
    align: 'center',
    disablePadding: false,
    label: 'Action'
  },
  {
    id: 'order_no',
    align: 'left',
    disablePadding: false,
    label: 'Order #'
  },
  {
    id: 'order_name',
    align: 'left',
    disablePadding: false,
    label: 'Order Name'
  },
  {
    id: 'status',
    align: 'center',
    disablePadding: false,
    label: 'Payment Status'
  },
  {
    id: 'mobile',
    align: 'center',
    disablePadding: false,
    label: 'Customer Mobile'
  },
  {
    id: 'email',
    align: 'center',
    disablePadding: false,
    label: 'Customer Email'
  },
  {
    id: 'quantity',
    align: 'right',
    disablePadding: false,
    label: 'Qty'
  },
  {
    id: 'amount',
    align: 'right',
    disablePadding: false,
    label: 'Amount'
  },
  {
    id: 'createdDate',
    align: 'left',
    disablePadding: false,
    label: 'Created'
  }
];

// ==============================|| ORDER TABLE - HEADER ||============================== //

function OrderTableHead({ order, orderBy }) {
  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

function getStatusMeta(status) {
  const normalized = String(status ?? '').toUpperCase();

  if (normalized.includes('PENDING')) {
    return { color: 'warning', label: 'Pending' };
  }

  if (normalized.includes('COMPLETED')) {
    return { color: 'success', label: 'Completed' };
  }

  if (normalized.includes('DELIVERED')) {
    return { color: 'info', label: 'Delivered' };
  }

  if (normalized.includes('READY')) {
    return { color: 'primary', label: 'Ready for Dispatch' };
  }

   if (normalized === 'PAYMENT_INIT_FAILED') {
    return { color: 'warning', label: 'Payment gateway Failed. Please call support.' };
  }

  if (normalized.includes('CANCEL') || normalized.includes('FAILED') || normalized.includes('REJECTED')) {
    return { color: 'error', label: 'Failed' };
  }

  return { color: 'default', label: status ? String(status) : 'Unknown' };
}

function getOrderId(order) {
  return order?.orderNumber ?? order?.orderId ?? order?.orderNo ?? order?.id ?? order?.code ?? 'N/A';
}

function getOrderLabel(order) {
  return order?.orderName ?? order?.title ?? order?.name ?? 'N/A';
}

function getCustomerMobile(order) {
  return order?.customerMobileNo ?? order?.mobile ?? 'N/A';
}

function getCustomerEmail(order) {
  return order?.customerEmail ?? order?.email ?? 'N/A';
}

function getStatusLabel(order) {
  return order?.paymentStatus ?? order?.paymentState ?? order?.status ?? order?.stage ?? order?.orderStageName ?? 'Unknown';
}

function getQuantity(order) {
  return order?.totalQuantity ?? order?.quantity ?? '—';
}

function formatAmount(amount) {
  if (amount == null || amount === '') {
    return '—';
  }

  const value = Number(amount);
  if (!Number.isFinite(value)) {
    return `₹${String(amount)}`;
  }

  return `₹${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

// ==============================|| ORDER TABLE ||============================== //

export default function OrderTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState({});

  // Cash payment dialog state
  const [cashDialog, setCashDialog] = useState({ open: false, orderId: null });
  const [cashAmount, setCashAmount] = useState('');
  const [cashRemarks, setCashRemarks] = useState('');
  const [cashSubmitting, setCashSubmitting] = useState(false);
  const [cashError, setCashError] = useState('');

  // Toast state
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const showToast = (message, severity = 'success') => setToast({ open: true, message, severity });
  const handleToastClose = () => setToast((t) => ({ ...t, open: false }));

  // Payment status dialog state
  const [statusDialog, setStatusDialog] = useState({ open: false, loading: false, data: null, error: '' });

  const handleOpenStatusDialog = async (trackingNumber) => {
    setStatusDialog({ open: true, loading: true, data: null, error: '' });
    try {
      const data = await getOrderPaymentStatus(trackingNumber);
      setStatusDialog({ open: true, loading: false, data, error: '' });
    } catch (err) {
      setStatusDialog({ open: true, loading: false, data: null, error: err?.message || 'Failed to fetch payment status.' });
    }
  };

  const handleCloseStatusDialog = () => setStatusDialog({ open: false, loading: false, data: null, error: '' });

  const handleOpenCashDialog = (trackingNumber, amount) => {
    setCashDialog({ open: true, orderId: trackingNumber, loading: false });
    setCashAmount(amount != null ? String(amount) : '');
    setCashRemarks('');
    setCashError('');
  };

  const handleCloseCashDialog = () => {
    if (cashSubmitting) return;
    setCashDialog({ open: false, orderId: null });
  };

  const handleCashPaymentSubmit = async () => {
    const amount = parseFloat(cashAmount);
    if (!cashAmount || isNaN(amount) || amount <= 0) {
      setCashError('Please enter a valid amount greater than 0.');
      return;
    }
    setCashError('');
    setCashSubmitting(true);
    try {
      await adminCashPayment(cashDialog.orderId, { amount, remarks: cashRemarks });
      setCashDialog({ open: false, orderId: null });
      showToast('Cash payment recorded successfully.', 'success');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Cash payment failed:', err);
      const msg = err?.message || 'Failed to record cash payment. Please try again.';
      setCashError(msg);
      showToast(msg, 'error');
    } finally {
      setCashSubmitting(false);
    }
  };

  useEffect(() => {
    let active = true;

    const loadRecentOrders = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await getRecentOrders({
          page: 0,
          size: 10,
          sort: ['createdDate,DESC']
        });

        if (!active) return;

        setOrders(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        if (!active) return;

        console.error(fetchError);
        setError('Failed to load recent orders');
        setOrders([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadRecentOrders();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Box>
      <TableContainer
        sx={{
          width: '100%',
          position: 'relative',
          display: 'block',
          maxWidth: '100%',
          overflow: 'auto',
          maxHeight: { xs: '50vh', md: '60vh' },
          '& td, & th': { whiteSpace: 'nowrap' }
        }}
      >
        <Table aria-labelledby="recent-orders-table">
          <OrderTableHead order="asc" orderBy="order_no" />
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Stack alignItems="center" justifyContent="center" sx={{ py: 3 }}>
                    <CircularProgress size={24} />
                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                      Loading recent orders...
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            )}

            {!loading && error && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography color="error">{error}</Typography>
                </TableCell>
              </TableRow>
            )}

            {!loading && !error && orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography color="text.secondary">No recent orders found.</Typography>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              !error &&
              orders.map((row, index) => {
                const labelId = `recent-order-row-${index}`;
                const statusMeta = getStatusMeta(getStatusLabel(row));
                const orderId = getOrderId(row);
                // Use trackingNumber (UUID) as the orderId for the cash payment endpoint
                const orderApiId = row?.trackingNumber;
                const isSending = Boolean(sending[orderApiId]);

                const handleSendPaymentLink = async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!orderApiId) return;
                  setSending((s) => ({ ...s, [orderApiId]: true }));
                  try {
                    await sendPaymentLink(orderApiId);
                    // Optional: show success toast/notification
                    // eslint-disable-next-line no-console
                    console.log(`Payment link sent for order ${orderApiId}`);
                  } catch (err) {
                    // Optional: show error toast/notification
                    // eslint-disable-next-line no-console
                    console.error(`Failed to send payment link for order ${orderApiId}:`, err);
                  } finally {
                    setSending((s) => ({ ...s, [orderApiId]: false }));
                  }
                };

                return (
                  <TableRow
                    hover
                    role="checkbox"
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                    tabIndex={-1}
                    key={`${orderId}-${index}`}
                  >
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="Send payment link to customer">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={handleSendPaymentLink}
                            disabled={isSending}
                          >
                            {isSending ? <CircularProgress size={16} /> : 'Send Link'}
                          </Button>
                        </Tooltip>
                        <Tooltip title="Record cash payment">
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            onClick={(e) => {
                              e.stopPropagation();
                              const defaultAmount = row.totalAmount ?? row.amount ?? row.netAmount;
                              handleOpenCashDialog(orderApiId, defaultAmount);
                            }}
                          >
                            Cash
                          </Button>
                        </Tooltip>
                        <Tooltip title="Check online payment status">
                          <Button
                            size="small"
                            variant="outlined"
                            color="info"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenStatusDialog(orderApiId);
                            }}
                          >
                            Payment Status
                          </Button>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                    <TableCell component="th" id={labelId} scope="row">
                      <Link color="secondary" underline="hover">
                        {orderId}
                      </Link>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <Typography variant="body2" noWrap>
                        {getOrderLabel(row)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={statusMeta.label} color={statusMeta.color} size="small" variant="soft" />
                    </TableCell>
                    <TableCell align="right">{getCustomerMobile(row)}</TableCell>
                    <TableCell align="right">{getCustomerEmail(row)}</TableCell>
                    <TableCell align="right">{getQuantity(row)}</TableCell>
                    <TableCell align="right">{formatAmount(row.totalAmount ?? row.amount ?? row.netAmount)}</TableCell>
                    <TableCell>{formatDate(row.createdDate ?? row.createdAt ?? row.orderDate)}</TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Cash Payment Dialog */}
      <Dialog open={cashDialog.open} onClose={handleCloseCashDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Record Cash Payment</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Amount"
              type="number"
              slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
              value={cashAmount}
              onChange={(e) => setCashAmount(e.target.value)}
              fullWidth
              required
              autoFocus
              disabled={cashSubmitting}
            />
            <TextField
              label="Remarks"
              value={cashRemarks}
              onChange={(e) => setCashRemarks(e.target.value)}
              fullWidth
              multiline
              rows={2}
              disabled={cashSubmitting}
            />
            {cashError && (
              <Typography variant="caption" color="error">
                {cashError}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCashDialog} disabled={cashSubmitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleCashPaymentSubmit}
            disabled={cashSubmitting}
          >
            {cashSubmitting ? <CircularProgress size={18} /> : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Status Dialog */}
      <Dialog open={statusDialog.open} onClose={handleCloseStatusDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Online Payment Status</DialogTitle>
        <DialogContent>
          {statusDialog.loading && (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 3 }}>
              <CircularProgress size={28} />
              <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
                Fetching payment status...
              </Typography>
            </Stack>
          )}
          {!statusDialog.loading && statusDialog.error && (
            <Alert severity="error" sx={{ mt: 1 }}>{statusDialog.error}</Alert>
          )}
          {!statusDialog.loading && statusDialog.data && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">Payment Status</Typography>
                <Chip
                  label={statusDialog.data.paymentStatus || '—'}
                  color={
                    String(statusDialog.data.paymentStatus || '').toUpperCase().includes('COMPLET') ||
                    String(statusDialog.data.paymentStatus || '').toUpperCase().includes('SUCCESS')
                      ? 'success'
                      : String(statusDialog.data.paymentStatus || '').toUpperCase().includes('FAIL') ||
                        String(statusDialog.data.paymentStatus || '').toUpperCase().includes('CANCEL')
                      ? 'error'
                      : 'warning'
                  }
                  size="small"
                />
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">Due Amount</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {statusDialog.data.dueAmount != null
                    ? `₹${Number(statusDialog.data.dueAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : '—'}
                </Typography>
              </Stack>
              {statusDialog.data.paymentLink && (
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  href={statusDialog.data.paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  fullWidth
                >
                  Open Payment Link
                </Button>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Toast notifications */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleToastClose} severity={toast.severity} variant="filled" sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

OrderTableHead.propTypes = { order: PropTypes.any, orderBy: PropTypes.string };
