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
import { getCustomerPortalSession } from 'utils/authTokens';
import { fetchCustomerPortalData, updateCustomerDeliveryAddress, updateCustomerPortalOrderDeliveryAddress, initiateCustomerPayment, submitDocumentApproval, submitCustomerFeedback, fetchCustomerNotifications, fetchCustomerOrders, listCustomerOrders, getCustomerOrder, changeOrderDeliveryAddress, changeOrderPickupBranch, reInitiateCustomerPayment, listWebBranches } from 'api/customerPortal';
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

  const initialPortalSession = location.state?.portalSession || getCustomerPortalSession();
  const [portalSession, setPortalSession] = useState(initialPortalSession);

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
      shippingName: sa.name || '',
      shippingPhone: sa.phone || '',
      shippingAddress1: sa.line1 || sa.address || '',
      shippingAddress2: sa.line2 || '',
      shippingCity: sa.city || '',
      shippingState: sa.state || '',
      shippingCountry: sa.country || '',
      shippingPincode: sa.pincode || ''
    };
  });

  const [addressMessage, setAddressMessage] = useState('');
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [approvalMessage, setApprovalMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [paymentBusy, setPaymentBusy] = useState(false);

  const latestDocument = useMemo(() => {
    if (!portalData.documents?.length) return undefined;
    return portalData.documents[portalData.documents.length - 1];
  }, [portalData.documents]);

  const isOrderPaymentInit = (order) => {
    if (!order) return false;
    const value = String(order.paymentStatus || order.paymentState || order.status || order.payment?.status || '').trim().toUpperCase();
    return value === 'INIT';
  };

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
      // Determine order id if available
      const potentialId = (selectedOrder && (selectedOrder.orderId || selectedOrder.orderReference || selectedOrder.ref)) || portalSession?.orderId || portalSession?.orderReference || portalData?.orderId || portalData?.orderReference;
      const payloadForPut = {
        fullName: addressDraft.shippingName || addressDraft.shippingFullName || addressDraft.name || '',
        phone: addressDraft.shippingPhone || addressDraft.phone || '',
        addressLine1: addressDraft.shippingAddress1,
        addressLine2: addressDraft.shippingAddress2,
        city: addressDraft.shippingCity,
        state: addressDraft.shippingState,
        pincode: addressDraft.shippingPincode
      };

      if (token && potentialId) {
        // Use portal PUT endpoint
        await updateCustomerPortalOrderDeliveryAddress(potentialId, payloadForPut);
        // Refresh portal data and orders so UI shows updated address
        try {
          const refreshedPortal = await fetchCustomerPortalData({ portalToken: token });
          setPortalData(refreshedPortal || {});
          setOrders(refreshedPortal?.orders || refreshedPortal?.oldOrders || []);
        } catch (e) {
          // ignore
        }
        try {
          const refreshedOrder = await getCustomerOrder(potentialId);
          if (refreshedOrder) setSelectedOrder(refreshedOrder);
        } catch (e) {
          // ignore
        }
        setAddressMessage('Your delivery address change request has been submitted for this order.');
        setSnackbarSeverity('success');
        setSnackbarMessage('Address change submitted');
        setSnackbarOpen(true);
        setAddressDialogOpen(false);
      } else if (selectedOrder) {
        // Fallback: call existing change order endpoint
        const id = selectedOrder.orderId || selectedOrder.orderReference || selectedOrder.ref;
        await changeOrderDeliveryAddress(id, { ...addressDraft });
        const refreshed = await getCustomerOrder(id);
        setSelectedOrder(refreshed);
        try {
          const list = await listCustomerOrders();
          setOrders(Array.isArray(list) ? list : []);
        } catch (e) {
          // ignore
        }
        setAddressMessage('Your delivery address change request has been submitted for this order.');
        setSnackbarSeverity('success');
        setSnackbarMessage('Address change submitted');
        setSnackbarOpen(true);
        setAddressDialogOpen(false);
      } else if (token) {
        // legacy portal-level endpoint expects a single string
        const joined = [addressDraft.shippingAddress1, addressDraft.shippingAddress2, `${addressDraft.shippingCity} ${addressDraft.shippingState || ''} ${addressDraft.shippingPincode || ''}`].filter(Boolean).join('\n');
        await updateCustomerDeliveryAddress({ portalToken: token, address: joined });
        setAddressMessage('Your delivery address change request has been submitted for this order.');
        setSnackbarSeverity('success');
        setSnackbarMessage('Address change submitted');
        setSnackbarOpen(true);
        setAddressDialogOpen(false);
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
    setPaymentBusy(true);
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
      setPaymentBusy(false);
    }
  };

  const handleReInitiatePayment = async () => {
    if (!selectedOrder) {
      setPaymentMessage('Please select an order before retrying payment.');
      return;
    }

    const orderId = selectedOrder.orderId || selectedOrder.orderReference || selectedOrder.ref;
    if (!orderId) {
      setPaymentMessage('Unable to determine order ID for payment retry.');
      return;
    }

    setPaymentBusy(true);
    setPaymentMessage('');
    try {
      await reInitiateCustomerPayment(orderId);
      setPaymentMessage('Payment re-initiation request has been sent successfully.');
      const refreshed = await getCustomerOrder(orderId);
      setSelectedOrder(refreshed);
      try {
        const list = await listCustomerOrders();
        setOrders(Array.isArray(list) ? list : []);
      } catch (listError) {
        // ignore silently, keep current list
      }
    } catch (error) {
      setPaymentMessage(error?.message || 'Unable to retry payment. Please try again.');
    } finally {
      setPaymentBusy(false);
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
    <Box sx={{ backgroundColor: '#f5f6f7', minHeight: '100vh', py: { xs: 3, md: 4 } }}>
      {/* ===================== HEADER SECTION (Full Width) ===================== */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 3, md: 5 },
          px: { xs: 2, md: 4 },
          borderRadius: { xs: 0, md: 2 },
          mb: { xs: 3, md: 4 },
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}
      >
        <Box sx={{ width: '100%', mx: 'auto' }}>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                Customer Order Portal
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.95, maxWidth: 600 }}>
                One-time view for your Dhar Brothers orders. Review past orders, track current status, manage payments and delivery address, and send feedback.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, alignItems: 'flex-start' }}>
              <Stack spacing={1} sx={{ alignItems: { xs: 'flex-start', md: 'flex-end' } }}>
                <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Order Reference</Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Chip
                    label={portalData.orderReference || portalSession.orderReference || mockPortalData.orderReference}
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.25)',
                      color: 'white',
                      fontWeight: 700,
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)'
                    }}
                    size="small"
                  />
                  <Chip
                    label={portalData.status || mockPortalData.status}
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 600,
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)'
                    }}
                    size="small"
                  />
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* ===================== MAIN CONTENT AREA ===================== */}
      <Box sx={{ width: '100%', mx: 'auto', px: { xs: 2, md: 4 } }}>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* LEFT SECTION: Your Orders + Order Overview */}
          <Grid item xs={12} lg={7}>
            <Stack spacing={{ xs: 2, md: 3 }}>
              {/* ============ YOUR ORDERS ============ */}
              <Box
                sx={{
                  backgroundColor: 'white',
                  borderRadius: 2,
                  p: { xs: 2, md: 3 },
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                  }
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1a1a1a' }}>
                  Your Orders
                </Typography>
                <List disablePadding sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                  {(orders.length ? orders : [{ orderReference: portalData.orderReference, status: portalData.status }]).map((o, idx) => {
                    const id = o.orderId || o.orderReference || o.ref;
                    const isSelected = selectedOrder && (selectedOrder.orderId === id || selectedOrder.orderReference === id);
                    return (
                      <ListItem key={id || idx} disablePadding>
                        <ListItemButton
                          sx={{
                            borderRadius: 1.5,
                            backgroundColor: isSelected ? 'rgba(102, 126, 234, 0.08)' : 'rgba(0,0,0,0.02)',
                            border: isSelected ? '1.5px solid #667eea' : '1px solid rgba(0,0,0,0.06)',
                            p: 1.5,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: isSelected ? 'rgba(102, 126, 234, 0.12)' : 'rgba(0,0,0,0.04)',
                              borderColor: '#667eea'
                            }
                          }}
                          selected={isSelected}
                          onClick={() => handleSelectOrder(o)}
                        >
                          <ListItemText
                            primary={
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                                {id}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                                {o.currentStage || o.status || '—'}
                              </Typography>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              </Box>

              {/* ============ ORDER OVERVIEW ============ */}
              <Box
                sx={{
                  backgroundColor: 'white',
                  borderRadius: 2,
                  p: { xs: 2, md: 3 },
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                  }
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1a1a1a' }}>
                  {selectedOrder ? 'Order Details' : 'Order Overview'}
                </Typography>

                {orderLoading ? (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">Loading order...</Typography>
                  </Box>
                ) : selectedOrder ? (
                  <Stack spacing={2.5}>
                    {/* Order Header */}
                    <Box sx={{ pb: 2, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#667eea', textTransform: 'uppercase', fontSize: '0.75rem', mb: 0.5 }}>
                        Order ID
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                        {selectedOrder.orderId}
                      </Typography>
                    </Box>

                    {/* Stage & Delivery Date */}
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>
                            Current Stage
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5, color: '#1a1a1a' }}>
                            {selectedOrder.currentStage || '—'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>
                            Expected Delivery
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5, color: '#1a1a1a' }}>
                            {selectedOrder.expectedDeliveryDate || '—'}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Shipping Address */}
                    <Box sx={{ p: 1.5, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 1.5, border: '1px solid rgba(0,0,0,0.06)' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#1a1a1a' }}>
                        Shipping Address
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                        {selectedOrder.shippingAddress || '—'}
                      </Typography>
                    </Box>

                    {/* Pickup Branch */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75, color: '#1a1a1a' }}>
                        Pickup Branch
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {selectedOrder.branchName || selectedOrder.pickupBranchName || '—'}
                      </Typography>
                    </Box>

                    {/* Action Buttons */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 1 }}>
                      <Button
                        variant="contained"
                        sx={{
                          borderRadius: '999px',
                          textTransform: 'none',
                          fontWeight: 600,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          py: 1
                        }}
                        onClick={() => {
                          setAddressDraft((prev) => ({
                            shippingName: (selectedOrder && (selectedOrder.shippingName || selectedOrder.name)) || prev.shippingName || '',
                            shippingPhone: (selectedOrder && (selectedOrder.shippingPhone || selectedOrder.phone)) || prev.shippingPhone || '',
                            shippingAddress1: selectedOrder?.shippingAddress1 || selectedOrder?.shippingAddress || '',
                            shippingAddress2: selectedOrder?.shippingAddress2 || '',
                            shippingCity: selectedOrder?.shippingCity || '',
                            shippingState: selectedOrder?.shippingState || '',
                            shippingCountry: selectedOrder?.shippingCountry || '',
                            shippingPincode: selectedOrder?.shippingPincode || selectedOrder?.pincode || ''
                          }));
                          setAddressDialogOpen(true);
                        }}
                      >
                        Edit Shipping Address
                      </Button>
                      <Button
                        variant="outlined"
                        sx={{
                          borderRadius: '999px',
                          textTransform: 'none',
                          fontWeight: 600,
                          py: 1,
                          borderColor: '#667eea',
                          color: '#667eea',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)'
                          }
                        }}
                        onClick={openBranchDialog}
                      >
                        Pick up from branch
                      </Button>
                      {isOrderPaymentInit(selectedOrder) && (
                        <Button
                          variant="outlined"
                          sx={{
                            borderRadius: '999px',
                            textTransform: 'none',
                            fontWeight: 600,
                            py: 1,
                            borderColor: '#ff9800',
                            color: '#ff9800',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 152, 0, 0.08)'
                            }
                          }}
                          onClick={handleReInitiatePayment}
                          disabled={paymentBusy}
                        >
                          {paymentBusy ? 'Retrying payment...' : 'Retry INIT payment'}
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                ) : (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">Select an order to view details</Typography>
                  </Box>
                )}
              </Box>
            </Stack>
          </Grid>

          {/* RIGHT SECTION: Delivery Address + Notifications */}
          <Grid item xs={12} lg={5}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2, alignItems: 'stretch' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'white',
                  borderRadius: 2,
                  p: { xs: 2, md: 2.5 },
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                  },
                  minHeight: { md: '100%' }
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: '#1a1a1a' }}>
                  Delivery Address
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                  Confirm your delivery address for this order. Address changes are accepted for pending orders only.
                </Typography>
                {portalData.deliveryAddress ? (
                  <Box sx={{ p: 1.5, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 1, mb: 1.5, border: '1px solid rgba(0,0,0,0.06)', flexGrow: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                      {portalData.deliveryAddress.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', whiteSpace: 'pre-line', mt: 0.5, lineHeight: 1.5 }}>
                      {[portalData.deliveryAddress.line1, portalData.deliveryAddress.line2, portalData.deliveryAddress.city, portalData.deliveryAddress.state, portalData.deliveryAddress.pincode]
                        .filter(Boolean)
                        .join(', ')}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ p: 1.5, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 1, mb: 1.5, flexGrow: 1 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      No address on file
                    </Typography>
                  </Box>
                )}
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: '#667eea',
                    color: '#667eea',
                    '&:hover': {
                      backgroundColor: 'rgba(102, 126, 234, 0.08)'
                    }
                  }}
                  onClick={() => {
                    const da = portalData.deliveryAddress || {};
                    setAddressDraft({
                      shippingName: da.name || '',
                      shippingPhone: da.phone || '',
                      shippingAddress1: da.line1 || da.address || '',
                      shippingAddress2: da.line2 || '',
                      shippingCity: da.city || '',
                      shippingState: da.state || '',
                      shippingCountry: da.country || '',
                      shippingPincode: da.pincode || ''
                    });
                    setAddressDialogOpen(true);
                  }}
                >
                  Update Address
                </Button>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'white',
                  borderRadius: 2,
                  p: { xs: 2, md: 2.5 },
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: '2px solid rgba(102, 126, 234, 0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                  },
                  minHeight: { md: '100%' }
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: '#1a1a1a' }}>
                  Notifications
                </Typography>
                {notifications && notifications.length > 0 ? (
                  <Stack spacing={1} sx={{ flexGrow: 1 }}>
                    {notifications.slice(0, 5).map((notif, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          p: 1,
                          backgroundColor: 'rgba(102, 126, 234, 0.05)',
                          borderRadius: 1,
                          borderLeft: '3px solid #667eea'
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#667eea', display: 'block', mb: 0.25 }}>
                          {notif.title || 'Update'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
                          {notif.message || notif.body || 'New notification'}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textAlign: 'center', py: 2, flexGrow: 1 }}>
                    No notifications
                  </Typography>
                )}
              </Box>
            </Box>

            <Stack spacing={2} sx={{ mt: 2 }}>
              {/* ============ PAYMENT HISTORY ============ */}
              <Box
                sx={{
                  backgroundColor: 'white',
                  borderRadius: 2,
                  p: { xs: 2, md: 2.5 },
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                  }
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: '#1a1a1a' }}>
                  Payment History
                </Typography>
                {portalData.payments && portalData.payments.length > 0 ? (
                  <Stack spacing={1}>
                    {portalData.payments.map((p, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          p: 1,
                          backgroundColor: 'rgba(0,0,0,0.02)',
                          borderRadius: 1,
                          border: '1px solid rgba(0,0,0,0.06)'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                            ₹ {p.amount}
                          </Typography>
                          <Chip
                            label={p.status}
                            size="small"
                            color={p.status === 'Received' ? 'success' : 'warning'}
                            variant="filled"
                            sx={{ height: '18px', fontSize: '0.7rem' }}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          {p.date} • {p.mode}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textAlign: 'center', py: 2 }}>
                    No payment records
                  </Typography>
                )}
              </Box>

              {/* ============ PENDING DUES ============ */}
              <Box
                sx={{
                  backgroundColor: 'white',
                  borderRadius: 2,
                  p: { xs: 2, md: 2.5 },
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.05) 0%, rgba(255, 193, 7, 0.05) 100%)',
                  border: '1px solid rgba(255, 152, 0, 0.1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(255, 152, 0, 0.1)'
                  }
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: '#1a1a1a' }}>
                  Pending Dues
                </Typography>
                {portalData.payments && portalData.payments.some((p) => p.status === 'Pending') ? (
                  <Stack spacing={1}>
                    {portalData.payments
                      .filter((p) => p.status === 'Pending')
                      .map((p, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            p: 1.5,
                            backgroundColor: 'rgba(255, 152, 0, 0.08)',
                            borderRadius: 1,
                            borderLeft: '3px solid #ff9800'
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                                ₹ {p.amount}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                Due: {p.date}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 600,
                        backgroundColor: '#ff9800',
                        mt: 1,
                        '&:hover': {
                          backgroundColor: '#fb8c00'
                        }
                      }}
                      onClick={handleMakePayment}
                      disabled={paymentBusy}
                    >
                      {paymentBusy ? 'Processing...' : 'Make a Payment'}
                    </Button>
                    {isOrderPaymentInit(selectedOrder) && (
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        sx={{
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontWeight: 600,
                          borderColor: '#667eea',
                          color: '#667eea',
                          mt: 1,
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)'
                          }
                        }}
                        onClick={handleReInitiatePayment}
                        disabled={paymentBusy}
                      >
                        {paymentBusy ? 'Retrying payment...' : 'Retry INIT Payment'}
                      </Button>
                    )}
                    {paymentMessage && (
                      <Alert severity="info" sx={{ mt: 1, borderRadius: 1 }}>
                        {paymentMessage}
                      </Alert>
                    )}
                  </Stack>
                ) : (
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textAlign: 'center', py: 2 }}>
                    No pending dues
                  </Typography>
                )}
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* ===================== DIALOGS & SNACKBARS ===================== */}
      <Dialog open={addressDialogOpen} onClose={() => setAddressDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Delivery Address</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Full name" fullWidth value={addressDraft.shippingName || ''} onChange={(e) => setAddressDraft((s) => ({ ...s, shippingName: e.target.value }))} />
            <TextField label="Phone" fullWidth value={addressDraft.shippingPhone || ''} onChange={(e) => setAddressDraft((s) => ({ ...s, shippingPhone: e.target.value }))} />
            <TextField label="Address line 1" fullWidth value={addressDraft.shippingAddress1 || ''} onChange={(e) => setAddressDraft((s) => ({ ...s, shippingAddress1: e.target.value }))} error={!!addressErrors.shippingAddress1} helperText={addressErrors.shippingAddress1} />
            <TextField label="Address line 2" fullWidth value={addressDraft.shippingAddress2 || ''} onChange={(e) => setAddressDraft((s) => ({ ...s, shippingAddress2: e.target.value }))} />
            <Stack direction="row" spacing={1}>
              <TextField label="City" fullWidth value={addressDraft.shippingCity || ''} onChange={(e) => setAddressDraft((s) => ({ ...s, shippingCity: e.target.value }))} error={!!addressErrors.shippingCity} helperText={addressErrors.shippingCity} />
              <TextField label="State" fullWidth value={addressDraft.shippingState || ''} onChange={(e) => setAddressDraft((s) => ({ ...s, shippingState: e.target.value }))} />
              <TextField label="Pincode" sx={{ width: 140 }} value={addressDraft.shippingPincode || ''} onChange={(e) => setAddressDraft((s) => ({ ...s, shippingPincode: e.target.value }))} error={!!addressErrors.shippingPincode} helperText={addressErrors.shippingPincode} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddressDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddressSubmit} disabled={busy}>Submit</Button>
        </DialogActions>
      </Dialog>

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
  );
}
