import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

// project imports
import MainCard from 'components/MainCard';
import { fetchCustomerPortalData, updateCustomerDeliveryAddress, initiateCustomerPayment, submitDocumentApproval, submitCustomerFeedback, fetchCustomerNotifications, fetchCustomerOrders, listCustomerOrders, getCustomerOrder, changeOrderDeliveryAddress, changeOrderPickupBranch, listWebBranches } from 'api/customerPortal';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Snackbar from '@mui/material/Snackbar';

// ==============================|| CUSTOMER PORTAL - MAIN VIEW ||============================== //

const mockPortalData = {
  orderReference: 'DB-2026-00123',
  status: 'Ready for Approval',
  deliveryAddress: {
    name: 'John Doe',
    line1: '123, Green Park Residency',
    line2: 'Near City Library',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110016'
  },
  payments: [
    { id: 'P-001', date: '20 Mar 2026', mode: 'UPI', amount: '2,500', status: 'Received' },
    { id: 'P-002', date: '22 Mar 2026', mode: 'Card', amount: '1,200', status: 'Pending' }
  ],
  documents: [
    { version: 1, label: 'Draft Layout v1', uploadedOn: '18 Mar 2026', status: 'Superseded' },
    { version: 2, label: 'Revised Layout v2', uploadedOn: '20 Mar 2026', status: 'Superseded' },
    { version: 3, label: 'Final Layout v3', uploadedOn: '22 Mar 2026', status: 'Awaiting Approval' }
  ]
};
export default function CustomerPortal() {
  const navigate = useNavigate();
  const location = useLocation();

  const portalSession = location.state?.portalSession;

  const [portalData, setPortalData] = useState(mockPortalData);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [feedbackText, setFeedbackText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderListLoading, setOrderListLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  const [selectedPickupBranchId, setSelectedPickupBranchId] = useState(null);
  const [addressErrors, setAddressErrors] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const [addressDraft, setAddressDraft] = useState(() => {
    const sa = mockPortalData.deliveryAddress || {};
    return {
      shippingAddress1: sa.line1 || sa.address || '',
      shippingAddress2: sa.line2 || '',
      shippingCity: sa.city || '',
      shippingState: sa.state || '',
      shippingCountry: sa.country || '',
      shippingPincode: sa.pincode || ''
    };
  });

  const [addressMessage, setAddressMessage] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [approvalMessage, setApprovalMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const latestDocument = useMemo(() => {
    if (!portalData.documents?.length) return undefined;
    return portalData.documents[portalData.documents.length - 1];
  }, [portalData.documents]);

  useEffect(() => {
    let mounted = true;
    const token = portalSession?.portalToken;
    if (!token) {
      if (portalSession?.orderReference) {
        setPortalData((p) => ({ ...p, orderReference: portalSession.orderReference }));
      }
      return () => {
        mounted = false;
      };
    }

    setLoading(true);
    (async () => {
      try {
        const resp = await fetchCustomerPortalData({ portalToken: token });
        if (!mounted) return;
        setPortalData(resp || {});
        setOrders(resp?.orders || resp?.oldOrders || []);
        setNotifications(resp?.notifications || []);
      } catch (err) {
        if (mounted) setError(err?.message || 'Unable to load portal data');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [portalSession]);

  // Fetch simple list of orders (customer-facing) when portal session present
  useEffect(() => {
    let mounted = true;
    if (!portalSession) return undefined;

    (async () => {
      try {
        setOrderListLoading(true);
        const list = await listCustomerOrders();
        if (!mounted) return;
        setOrders(Array.isArray(list) ? list : []);
      } catch (err) {
        // non-fatal; keep existing orders if any
        // eslint-disable-next-line no-console
        console.error('Unable to fetch customer orders', err);
      } finally {
        if (mounted) setOrderListLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [portalSession]);

  useEffect(() => {
    const sourceAddress = portalData.deliveryAddress;
    if (sourceAddress) {
      setAddressDraft({
        shippingAddress1: sourceAddress.line1 || sourceAddress.address || '',
        shippingAddress2: sourceAddress.line2 || '',
        shippingCity: sourceAddress.city || '',
        shippingState: sourceAddress.state || '',
        shippingCountry: sourceAddress.country || '',
        shippingPincode: sourceAddress.pincode || ''
      });
    }
  }, [portalData.deliveryAddress]);

  if (!portalSession) {
    return (
      <Grid container rowSpacing={3} columnSpacing={2.75} sx={{ py: 4 }}>
        <Grid item xs={12}>
          <MainCard>
            <Stack spacing={2}>
              <Typography variant="h5">Customer Portal Session Expired</Typography>
              <Typography variant="body2" color="text.secondary">
                This one-time customer portal link has expired or was opened directly. Please return to the original message and request a new OTP.
              </Typography>
              <Box>
                <Button variant="contained" color="primary" onClick={() => navigate('/customer', { replace: true })} sx={{ borderRadius: '999px', textTransform: 'none', px: 2 }}>
                  Back to Customer Login
                </Button>
              </Box>
            </Stack>
          </MainCard>
        </Grid>
      </Grid>
    );
  }

  const handleAddressSubmit = async () => {
    // validate structured address fields
    const errors = {};
    if (!addressDraft.shippingAddress1 || !addressDraft.shippingAddress1.trim()) errors.shippingAddress1 = 'Address is required';
    if (!addressDraft.shippingCity || !addressDraft.shippingCity.trim()) errors.shippingCity = 'City is required';
    if (!addressDraft.shippingPincode || !addressDraft.shippingPincode.trim()) errors.shippingPincode = 'Pincode is required';
    setAddressErrors(errors);
    if (Object.keys(errors).length) {
      setSnackbarSeverity('error');
      setSnackbarMessage('Please fix address errors before submitting');
      setSnackbarOpen(true);
      return;
    }

    setBusy(true);
    setAddressMessage('');
    const token = portalSession?.portalToken;
    try {
      if (selectedOrder) {
        const id = selectedOrder.orderId || selectedOrder.orderReference || selectedOrder.ref;
        await changeOrderDeliveryAddress(id, { ...addressDraft });
        setAddressMessage('Your delivery address change request has been submitted for this order.');
        setSnackbarSeverity('success');
        setSnackbarMessage('Address change submitted');
        setSnackbarOpen(true);
        // refresh selected order and orders list
        const refreshed = await getCustomerOrder(id);
        setSelectedOrder(refreshed);
        try {
          const list = await listCustomerOrders();
          setOrders(Array.isArray(list) ? list : []);
        } catch (e) {
          // ignore
        }
      } else if (token) {
        // fallback for portal-level address update (server expects a single string)
        const joined = [addressDraft.shippingAddress1, addressDraft.shippingAddress2, `${addressDraft.shippingCity} ${addressDraft.shippingState || ''} ${addressDraft.shippingPincode || ''}`].filter(Boolean).join('\n');
        await updateCustomerDeliveryAddress({ portalToken: token, address: joined });
        setAddressMessage('Your delivery address change request has been submitted for this order.');
        setSnackbarSeverity('success');
        setSnackbarMessage('Address change submitted');
        setSnackbarOpen(true);
      } else {
        setAddressMessage('Address change requested. Please contact support to complete this change.');
      }
    } catch (error) {
      setAddressMessage(error?.message || 'Unable to submit address change. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarMessage(error?.message || 'Unable to submit address change');
      setSnackbarOpen(true);
    } finally {
      setBusy(false);
    }
  };

  const handleSelectOrder = async (o) => {
    const id = o?.orderId || o?.orderReference || o?.ref || o;
    if (!id) return;
    setOrderLoading(true);
    setSelectedOrder(null);
    try {
      const resp = await getCustomerOrder(id);
      setSelectedOrder(resp);
      // Populate structured address fields from response if available
      setAddressDraft({
        shippingAddress1: resp?.shippingAddress1 || resp?.shippingAddress || resp?.address || '',
        shippingAddress2: resp?.shippingAddress2 || '',
        shippingCity: resp?.shippingCity || '',
        shippingState: resp?.shippingState || '',
        shippingCountry: resp?.shippingCountry || '',
        shippingPincode: resp?.shippingPincode || resp?.pincode || ''
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Unable to load order', err);
      setApprovalMessage(err?.message || 'Unable to load order details');
    } finally {
      setOrderLoading(false);
    }
  };

  const openBranchDialog = async () => {
    setBranchesLoading(true);
    setBranchDialogOpen(true);
    try {
      const list = await listWebBranches();
      const filtered = (Array.isArray(list) ? list : []).filter((b) => b.branchType === 'LOOK_AND_FEEL_STORE');
      setBranches(filtered);
      setSelectedPickupBranchId((selectedOrder && (selectedOrder.pickupBranchId || selectedOrder.pickupBranch)) || null);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Unable to fetch branches', err);
      setApprovalMessage(err?.message || 'Unable to fetch branches');
    } finally {
      setBranchesLoading(false);
    }
  };

  const handleSubmitPickupBranch = async () => {
    if (!selectedOrder) return;
    const id = selectedOrder.orderId || selectedOrder.orderReference || selectedOrder.ref;
    if (!id) return;
    setBusy(true);
    try {
      await changeOrderPickupBranch(id, { pickupBranchId: selectedPickupBranchId });
      setApprovalMessage('Pickup branch updated successfully.');
      const refreshed = await getCustomerOrder(id);
      setSelectedOrder(refreshed);
      // refresh orders list
      try {
        const list = await listCustomerOrders();
        setOrders(Array.isArray(list) ? list : []);
      } catch (e) {
        // ignore
      }
      setBranchDialogOpen(false);
      setSnackbarSeverity('success');
      setSnackbarMessage('Pickup branch updated');
      setSnackbarOpen(true);
    } catch (err) {
      setApprovalMessage(err?.message || 'Unable to update pickup branch');
      setSnackbarSeverity('error');
      setSnackbarMessage(err?.message || 'Unable to update pickup branch');
      setSnackbarOpen(true);
    } finally {
      setBusy(false);
    }
  };

  const handleMakePayment = async () => {
    setBusy(true);
    setPaymentMessage('');
    const token = portalSession?.portalToken;
    try {
      if (token) {
        await initiateCustomerPayment({ portalToken: token });
        setPaymentMessage('Payment link has been initiated for the pending amount.');
      } else {
        setPaymentMessage('Unable to start payment without a valid portal session.');
      }
    } catch (error) {
      setPaymentMessage(error?.message || 'Unable to start payment. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleApprove = async (isApproved) => {
    setBusy(true);
    setApprovalMessage('');
    try {
      const token = portalSession?.portalToken;
      if (token && latestDocument) {
        await submitDocumentApproval({ portalToken: token, version: latestDocument.version, approved: !!isApproved });
        setApprovalMessage(isApproved ? 'Thank you. Your approval has been recorded.' : 'Your feedback has been recorded.');
      } else {
        setApprovalMessage(isApproved ? 'Approval recorded locally.' : 'Disapproval recorded locally.');
      }
    } catch (error) {
      setApprovalMessage(error?.message || 'Unable to submit your response. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitFeedback = async () => {
    setBusy(true);
    try {
      const token = portalSession?.portalToken;
      if (token) {
        await submitCustomerFeedback({ portalToken: token, feedback: feedbackText });
        setFeedbackText('');
        setApprovalMessage('Thank you for your feedback.');
      } else {
        setApprovalMessage('Feedback recorded locally. Contact support to ensure delivery.');
      }
    } catch (err) {
      setApprovalMessage(err?.message || 'Unable to submit feedback. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  return (
    <Box sx={{ backgroundColor: 'grey.100', minHeight: '100vh', px: { xs: 2, sm: 4 }, py: 6 }}>
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
        <Grid container rowSpacing={3} columnSpacing={2.75} sx={{ py: 0 }}>
          <Grid item xs={12}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Customer Order Portal</Typography>
                <Typography variant="body2" color="text.secondary">
                  One-time view for your Dhar Brothers orders. Review past orders, track current status, manage payments and delivery address, and send feedback.
                </Typography>
              </Box>
              <Stack spacing={1} sx={{ alignItems: { xs: 'flex-start', sm: 'flex-end' } }}>
                <Typography variant="subtitle2" color="text.secondary">Order Reference</Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Chip label={portalData.orderReference || portalSession.orderReference || mockPortalData.orderReference} color="warning" size="small" sx={{ fontWeight: 800, borderRadius: '999px' }} />
                  <Chip label={portalData.status || mockPortalData.status} color="warning" size="small" sx={{ fontWeight: 700 }} />
                </Stack>
              </Stack>
            </Stack>
          </Grid>

      {/* Left: Past Orders */}
      <Grid item xs={12} md={3}>
        <MainCard title="Your Orders">
          <List disablePadding>
            {(orders.length ? orders : [{ orderReference: portalData.orderReference, status: portalData.status }]).map((o, idx) => {
              const id = o.orderId || o.orderReference || o.ref;
              const isSelected = selectedOrder && (selectedOrder.orderId === id || selectedOrder.orderReference === id);
              return (
                <ListItem key={id || idx} disablePadding>
                  <ListItemButton sx={{ borderRadius: 1.5 }} selected={isSelected} onClick={() => handleSelectOrder(o)}>
                    <ListItemText
                      primary={<Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}><Typography variant="subtitle2">{id}</Typography></Stack>}
                      secondary={<Typography variant="caption" color="text.secondary">{o.currentStage || o.status || '—'}</Typography>}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </MainCard>
      </Grid>

      {/* Center: Order details, documents, status & feedback */}
      <Grid item xs={12} md={6}>
        <MainCard title={selectedOrder ? 'Order Details' : 'Order Overview'} contentSX={{ p: 2.5 }}>
          <Stack spacing={2.5}>
            {orderLoading && <Box><Typography>Loading order...</Typography></Box>}
            {selectedOrder && !orderLoading && (
              <Box sx={{ p: 1, bgcolor: 'grey.0', borderRadius: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>{selectedOrder.orderId}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Stage: {selectedOrder.currentStage || '—'}</Typography>
                <Typography variant="body2" color="text.secondary">Expected delivery: {selectedOrder.expectedDeliveryDate || '—'}</Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2">Shipping Address</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>{selectedOrder.shippingAddress || '—'}</Typography>
                </Box>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2">Pickup Branch</Typography>
                  <Typography variant="body2" color="text.secondary">{selectedOrder.branchName || selectedOrder.pickupBranchName || '—'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button variant="contained" size="small" sx={{ borderRadius: '999px', textTransform: 'none' }} onClick={() => { setAddressDraft(selectedOrder.shippingAddress || ''); }}>Edit Shipping Address</Button>
                  <Button variant="outlined" size="small" sx={{ borderRadius: '999px', textTransform: 'none' }} onClick={openBranchDialog}>Pick up from branch</Button>
                </Box>
              </Box>
            )}

            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Order Details</Typography>
              <Typography variant="body2" color="text.secondary">{portalData.notes || 'Order summary and specifications will appear here.'}</Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Order Current Status</Typography>
              <List disablePadding>
                {(portalData.statusHistory || [{ when: '', status: portalData.status }]).map((s, i) => (
                  <ListItem key={i} sx={{ px: 0 }}>
                    <ListItemText primary={<Typography variant="body2">{s.status}</Typography>} secondary={<Typography variant="caption" color="text.secondary">{s.when}</Typography>} />
                  </ListItem>
                ))}
              </List>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Document Versions</Typography>
              <List disablePadding>
                {(portalData.documents || []).map((doc) => (
                  <ListItem key={doc.version} disablePadding>
                    <ListItemButton sx={{ borderRadius: 1.5 }}>
                      <ListItemText
                        primary={<Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}><Typography variant="subtitle2">v{doc.version}</Typography><Typography variant="body2">{doc.label}</Typography></Stack>}
                        secondary={<Typography variant="caption" color="text.secondary">Uploaded on {doc.uploadedOn} • {doc.status}</Typography>}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>

              {latestDocument && (
                <Box sx={{ mt: 2.5 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Approve Latest Document</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Please review the latest version ({latestDocument.label}) and approve or request changes.</Typography>

                  {approvalMessage && <Alert severity="success" sx={{ mb: 1.5 }}>{approvalMessage}</Alert>}

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}>
                    <Button variant="contained" color="success" disabled={busy} onClick={() => handleApprove(true)} sx={{ borderRadius: '999px', textTransform: 'none', px: 2 }}>Approve Final Document</Button>
                    <Button variant="outlined" color="error" disabled={busy} onClick={() => handleApprove(false)} sx={{ borderRadius: '999px', textTransform: 'none' }}>Disapprove / Changes Required</Button>
                  </Stack>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Feedback</Typography>
                {approvalMessage && <Alert severity="info" sx={{ mb: 1 }}>{approvalMessage}</Alert>}
                <TextField fullWidth multiline rows={4} placeholder="Tell us how we did or request changes..." value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} />
                <Stack direction="row" sx={{ justifyContent: 'flex-end', mt: 1 }}>
                  <Button variant="contained" onClick={handleSubmitFeedback} disabled={busy || !feedbackText.trim()} sx={{ borderRadius: '999px', textTransform: 'none', px: 2 }}>Send Feedback</Button>
                </Stack>
              </Box>
            </Box>
          </Stack>
        </MainCard>
      </Grid>

      {/* Right: Delivery address, payments, notifications */}
      <Grid item xs={12} md={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MainCard title="Delivery Address" contentSX={{ p: 2.5 }}>
              <Stack spacing={1.5}>
                <Typography variant="body2" color="text.secondary">Confirm your delivery address for this order. Address changes are accepted for pending orders only.</Typography>

                {addressMessage && <Alert severity="success">{addressMessage}</Alert>}

                <TextField label="Delivery Address" multiline minRows={4} value={addressDraft} onChange={(event) => setAddressDraft(event.target.value)} fullWidth />

                <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
                  <Button variant="contained" color="primary" onClick={handleAddressSubmit} disabled={busy || (!(selectedOrder) && !(portalData.status || '').toLowerCase().includes('pending'))} sx={{ borderRadius: '999px', textTransform: 'none' }}>Submit Address Change</Button>
                </Stack>
              </Stack>
            </MainCard>
          </Grid>

          <Grid item xs={12}>
            <MainCard title="Payment History & Pending Dues" contentSX={{ p: 2.5 }}>
              <Stack spacing={1.5}>
                <List disablePadding>
                  {(portalData.payments || []).map((payment) => (
                    <ListItem key={payment.id} sx={{ px: 0 }}>
                      <ListItemText
                        primary={<Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}><Typography variant="body2">{payment.date}</Typography><Typography variant="subtitle2">₹ {payment.amount}</Typography></Stack>}
                        secondary={<Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', mt: 0.25 }}><Typography variant="caption" color="text.secondary">{payment.mode}</Typography><Typography variant="caption" color={payment.status === 'Received' ? 'success.main' : 'warning.main'}>{payment.status}</Typography></Stack>}
                      />
                    </ListItem>
                  ))}
                </List>

                {paymentMessage && <Alert severity="info">{paymentMessage}</Alert>}

                <Divider sx={{ my: 0.5 }} />

                <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
                  <Button variant="contained" color="warning" onClick={handleMakePayment} disabled={busy} sx={{ borderRadius: '999px', textTransform: 'none' }}>Make a Payment</Button>
                </Stack>
              </Stack>
            </MainCard>
          </Grid>

          <Grid item xs={12}>
            <MainCard title="Notifications" contentSX={{ p: 2.5 }}>
              <List disablePadding>
                {(notifications || []).slice(0, 6).map((n, i) => (
                  <ListItem key={n.id || i} sx={{ px: 0 }}>
                    <ListItemText primary={<Typography variant="body2">{n.title || n.message}</Typography>} secondary={<Typography variant="caption" color="text.secondary">{n.when || n.date}</Typography>} />
                  </ListItem>
                ))}
                {(!notifications || notifications.length === 0) && <Typography variant="caption" color="text.secondary">No notifications</Typography>}
              </List>
            </MainCard>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
      <Dialog open={branchDialogOpen} onClose={() => setBranchDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Select Pickup Branch</DialogTitle>
        <DialogContent>
          {branchesLoading ? (
            <Typography>Loading branches...</Typography>
          ) : (
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel id="pickup-branch-label">Branch</InputLabel>
              <Select
                labelId="pickup-branch-label"
                value={selectedPickupBranchId ?? ''}
                label="Branch"
                onChange={(e) => setSelectedPickupBranchId(e.target.value)}
              >
                {branches.map((b) => (
                  <MenuItem key={b.id} value={b.id}>{b.name} — {b.address}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBranchDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitPickupBranch} disabled={busy || !selectedPickupBranchId}>Submit</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      </Box>
    </Box>
  );
}
