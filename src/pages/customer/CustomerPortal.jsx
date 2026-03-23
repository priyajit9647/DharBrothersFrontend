import { useLocation, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';

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
    if (!mockPortalData.documents?.length) return undefined;
    return mockPortalData.documents[mockPortalData.documents.length - 1];
  }, []);

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

    // TODO: Call backend API to update delivery address for this order.
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setAddressMessage('Your delivery address change request has been submitted for this order.');
    } catch (error) {
      setAddressMessage('Unable to submit address change. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleMakePayment = async () => {
    setBusy(true);
    setPaymentMessage('');

    // TODO: Redirect to payment gateway / initiate payment intent.
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setPaymentMessage('Payment link has been initiated for the pending amount.');
    } catch (error) {
      setPaymentMessage('Unable to start payment. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleApprove = async (isApproved) => {
    setBusy(true);
    setApprovalMessage('');

    // TODO: Call backend API to record approval / disapproval for the latest version.
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setApprovalMessage(
        isApproved
          ? 'Thank you. Your approval has been recorded and the job will move to the next stage.'
          : 'Your feedback has been recorded. Our team will review the changes requested.'
      );
    } catch (error) {
      setApprovalMessage('Unable to submit your response. Please try again.');
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
              One-time view for your Dhar Brothers order. You can review delivery address, payments and document versions shared by our team.
            </Typography>
          </Box>
          <Stack spacing={1} sx={{ alignItems: { xs: 'flex-start', sm: 'flex-end' } }}>
            <Typography variant="subtitle2" color="text.secondary">
              Order Reference
            </Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="h6">{portalSession.orderReference || mockPortalData.orderReference}</Typography>
              <Chip label={mockPortalData.status} color="warning" size="small" />
            </Stack>
          </Stack>
        </Stack>
      </Grid>

      {/* Left column: Order overview & documents */}
      <Grid item xs={12} md={7}>
        <MainCard title="Order Overview" contentSX={{ p: 2.5 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                Order Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This section can show job type, binding preferences, quantity and promised delivery date once wired with live data from the backend.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Document Versions Shared by Dhar Brothers
              </Typography>
              <List disablePadding>
                {mockPortalData.documents.map((doc) => (
                  <ListItem key={doc.version} disablePadding>
                    <ListItemButton sx={{ borderRadius: 1.5 }}>
                      <ListItemText
                        primary={
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <Typography variant="subtitle2">v{doc.version}</Typography>
                            <Typography variant="body2">{doc.label}</Typography>
                          </Stack>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            Uploaded on {doc.uploadedOn} 
                            {' \/ '}
                            {doc.status}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>

              {latestDocument && (
                <Box sx={{ mt: 2.5 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Approve Latest Document
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Please review the latest version shared with you ({latestDocument.label}). Approving confirms that the layout and details are
                    correct as per your requirement.
                  </Typography>

                  {approvalMessage && (
                    <Alert severity="success" sx={{ mb: 1.5 }}>
                      {approvalMessage}
                    </Alert>
                  )}

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}>
                    <Button
                      variant="contained"
                      color="success"
                      disabled={busy}
                      onClick={() => handleApprove(true)}
                    >
                      Approve Final Document
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      disabled={busy}
                      onClick={() => handleApprove(false)}
                    >
                      Disapprove / Changes Required
                    </Button>
                  </Stack>
                </Box>
              )}
            </Box>
          </Stack>
        </MainCard>
      </Grid>

      {/* Right column: Delivery address & payments */}
      <Grid item xs={12} md={5}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MainCard title="Delivery Address" contentSX={{ p: 2.5 }}>
              <Stack spacing={1.5}>
                <Typography variant="body2" color="text.secondary">
                  Confirm your delivery address for this order. You can request a change below; our team will review and update you.
                </Typography>

                {addressMessage && (
                  <Alert severity="success">{addressMessage}</Alert>
                )}

                <TextField
                  label="Delivery Address"
                  multiline
                  minRows={4}
                  value={addressDraft}
                  onChange={(event) => setAddressDraft(event.target.value)}
                  fullWidth
                />

                <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
                  <Button variant="contained" color="primary" onClick={handleAddressSubmit} disabled={busy}>
                    Submit Address Change
                  </Button>
                </Stack>
              </Stack>
            </MainCard>
          </Grid>

          <Grid item xs={12}>
            <MainCard title="Payment History & Pending Dues" contentSX={{ p: 2.5 }}>
              <Stack spacing={1.5}>
                <List disablePadding>
                  {mockPortalData.payments.map((payment) => (
                    <ListItem key={payment.id} sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body2">{payment.date}</Typography>
                            <Typography variant="subtitle2">₹ {payment.amount}</Typography>
                          </Stack>
                        }
                        secondary={
                          <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', mt: 0.25 }}>
                            <Typography variant="caption" color="text.secondary">
                              {payment.mode}
                            </Typography>
                            <Typography variant="caption" color={payment.status === 'Received' ? 'success.main' : 'warning.main'}>
                              {payment.status}
                            </Typography>
                          </Stack>
                        }
                      />
                    </ListItem>
                  ))}
                </List>

                {paymentMessage && (
                  <Alert severity="info">{paymentMessage}</Alert>
                )}

                <Divider sx={{ my: 0.5 }} />

                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    To clear pending dues or make an additional payment, click the button below. A secure payment link / gateway will be opened.
                  </Typography>
                </Stack>

                <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
                  <Button variant="contained" color="warning" onClick={handleMakePayment} disabled={busy}>
                    Make a Payment
                  </Button>
                </Stack>
              </Stack>
            </MainCard>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
