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
import { fetchCustomerPortalData, updateCustomerDeliveryAddress, initiateCustomerPayment, submitDocumentApproval, submitCustomerFeedback, fetchCustomerNotifications, fetchCustomerOrders } from 'api/customerPortal';

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

  const [addressDraft, setAddressDraft] = useState(() => {
    const sourceAddress = mockPortalData.deliveryAddress;
    return [
      sourceAddress.name,
      sourceAddress.line1,
      sourceAddress.line2,
      `${sourceAddress.city}, ${sourceAddress.state} - ${sourceAddress.pincode}`
    ]
      .filter(Boolean)
      .join('\n');
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

  useEffect(() => {
    const sourceAddress = portalData.deliveryAddress;
    if (sourceAddress) {
      setAddressDraft([
        sourceAddress.name,
        sourceAddress.line1,
        sourceAddress.line2,
        `${sourceAddress.city}, ${sourceAddress.state} - ${sourceAddress.pincode}`
      ].filter(Boolean).join('\n'));
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
                <Button variant="contained" color="primary" onClick={() => navigate('/customer', { replace: true })}>
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
    setBusy(true);
    setAddressMessage('');
    const token = portalSession?.portalToken;
    try {
      if (token) {
        await updateCustomerDeliveryAddress({ portalToken: token, address: addressDraft });
        setAddressMessage('Your delivery address change request has been submitted for this order.');
      } else {
        setAddressMessage('Address change requested. Please contact support to complete this change.');
      }
    } catch (error) {
      setAddressMessage(error?.message || 'Unable to submit address change. Please try again.');
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

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75} sx={{ py: 4 }}>
      <Grid item xs={12}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
          <Box>
            <Typography variant="h5">Customer Order Portal</Typography>
            <Typography variant="body2" color="text.secondary">
              One-time view for your Dhar Brothers orders. Review past orders, track current status, manage payments and delivery address, and send feedback.
            </Typography>
          </Box>
          <Stack spacing={1} sx={{ alignItems: { xs: 'flex-start', sm: 'flex-end' } }}>
            <Typography variant="subtitle2" color="text.secondary">Order Reference</Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="h6">{portalData.orderReference || portalSession.orderReference || mockPortalData.orderReference}</Typography>
              <Chip label={portalData.status || mockPortalData.status} color="warning" size="small" />
            </Stack>
          </Stack>
        </Stack>
      </Grid>

      {/* Left: Past Orders */}
      <Grid item xs={12} md={3}>
        <MainCard title="Your Orders">
          <List disablePadding>
            {(orders.length ? orders : [{ orderReference: portalData.orderReference, status: portalData.status }]).map((o, idx) => (
              <ListItem key={o.orderReference || idx} disablePadding>
                <ListItemButton sx={{ borderRadius: 1.5 }} onClick={() => { /* could show switch to this order */ }}>
                  <ListItemText
                    primary={<Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}><Typography variant="subtitle2">{o.orderReference || o.ref}</Typography></Stack>}
                    secondary={<Typography variant="caption" color="text.secondary">{o.status || '—'}</Typography>}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </MainCard>
      </Grid>

      {/* Center: Order details, documents, status & feedback */}
      <Grid item xs={12} md={6}>
        <MainCard title="Order Overview" contentSX={{ p: 2.5 }}>
          <Stack spacing={2.5}>
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
                    <Button variant="contained" color="success" disabled={busy} onClick={() => handleApprove(true)}>Approve Final Document</Button>
                    <Button variant="outlined" color="error" disabled={busy} onClick={() => handleApprove(false)}>Disapprove / Changes Required</Button>
                  </Stack>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Feedback</Typography>
                {approvalMessage && <Alert severity="info" sx={{ mb: 1 }}>{approvalMessage}</Alert>}
                <TextField fullWidth multiline rows={4} placeholder="Tell us how we did or request changes..." value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} />
                <Stack direction="row" sx={{ justifyContent: 'flex-end', mt: 1 }}>
                  <Button variant="contained" onClick={handleSubmitFeedback} disabled={busy || !feedbackText.trim()}>Send Feedback</Button>
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
                  <Button variant="contained" color="primary" onClick={handleAddressSubmit} disabled={busy || !(portalData.status || '').toLowerCase().includes('pending')}>Submit Address Change</Button>
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
                  <Button variant="contained" color="warning" onClick={handleMakePayment} disabled={busy}>Make a Payment</Button>
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
  );
}
