import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

// project imports
import Logo from 'components/logo';
import AuthFooter from 'components/cards/AuthFooter';
import AuthBackground from 'sections/auth/AuthBackground';
import { customerLogin } from 'api/customerPortal';

// ==============================|| CUSTOMER PORTAL - OTP ENTRY ||============================== //

export default function CustomerPortalEntry() {
  const navigate = useNavigate();

  const [orderReference, setOrderReference] = useState('');
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('request'); // 'request' | 'verify'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleRequestOtp = async (event) => {
    event.preventDefault();
    setError('');
    setInfo('');

    if (!orderReference.trim() || !contact.trim()) {
      setError('Please enter your Order ID and registered email / mobile.');
      return;
    }
    setLoading(true);
    try {
      const resp = await customerLogin({ orderId: orderReference.trim(), mobileNumber: contact.trim() });

      // If backend returned a portal/session/token, open portal immediately.
      if (resp && (resp.portalToken || resp.token || resp.accessToken || resp.portalSession)) {
        const portalSession = resp.portalSession || { portalToken: resp.portalToken || resp.token || resp.accessToken, orderReference: orderReference.trim(), contact: contact.trim() };
        navigate('/customer/portal', { state: { portalSession }, replace: true });
        return;
      }

      // Otherwise assume OTP was sent and continue to verification step.
      setStep('verify');
      setInfo(resp?.message || 'An OTP has been sent to your registered contact. Please enter it below to continue.');
    } catch (e) {
      setError(e?.message || 'Unable to request OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setError('');

    if (!otp.trim()) {
      setError('Please enter the OTP you received.');
      return;
    }
    setLoading(true);
    try {
      const resp = await customerLogin({ orderId: orderReference.trim(), mobileNumber: contact.trim(), otp: otp.trim() });

      // If backend returns portal/session/token, navigate to portal
      if (resp && (resp.portalToken || resp.token || resp.accessToken || resp.portalSession)) {
        const portalSession = resp.portalSession || { portalToken: resp.portalToken || resp.token || resp.accessToken, orderReference: orderReference.trim(), contact: contact.trim() };
        navigate('/customer/portal', { state: { portalSession }, replace: true });
        return;
      }

      // Some backends may simply return success — open portal with order details
      if (resp && (resp.success || resp.message)) {
        const portalSession = { orderReference: orderReference.trim(), contact: contact.trim() };
        navigate('/customer/portal', { state: { portalSession }, replace: true });
        return;
      }

      setError('Invalid or expired OTP. Please request a new one.');
    } catch (e) {
      setError(e?.message || 'Invalid or expired OTP. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  const isRequestStep = step === 'request';

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <AuthBackground />

      <Box
        sx={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ px: 3, pt: 3 }}>
          <Logo to="/" logoHeight={64} />
        </Box>

        <Grid
          container
          justifyContent="center"
          alignItems="center"
          sx={{
            flexGrow: 1,
            px: { xs: 2, sm: 3 },
            py: { xs: 3, sm: 4 },
            backdropFilter: 'blur(6px)',
            backgroundColor: 'rgba(255,255,255,0.3)'
          }}
        >
          <Grid item xs={12} md={7} lg={6} xl={5}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                p: { xs: 2.5, sm: 3, md: 4 },
                backgroundColor: 'rgba(255,255,255,0.96)',
                boxShadow: (theme) => theme.vars.customShadows.z1
              }}
            >
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="h4" sx={{ mb: 0.5 }}>
                    Customer Order Portal
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    View your order details, delivery address, payment history and approve final documents using a one-time secure link.
                  </Typography>
                </Box>

                {error && <Alert severity="error">{error}</Alert>}
                {info && !error && <Alert severity="info">{info}</Alert>}

                <Box component="form" onSubmit={isRequestStep ? handleRequestOtp : handleVerifyOtp} noValidate>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Order ID / Reference"
                        value={orderReference}
                        onChange={(event) => setOrderReference(event.target.value)}
                        disabled={!isRequestStep}
                        required
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Registered Email or Mobile"
                        helperText="We will send an OTP to this contact for verification."
                        value={contact}
                        onChange={(event) => setContact(event.target.value)}
                        disabled={!isRequestStep}
                        required
                      />
                    </Grid>

                    {!isRequestStep && (
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="One Time Password (OTP)"
                          value={otp}
                          onChange={(event) => setOtp(event.target.value)}
                          required
                        />
                      </Grid>
                    )}

                    <Grid item xs={12}>
                      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        {!isRequestStep && (
                          <Button
                            color="secondary"
                            variant="text"
                            disabled={loading}
                            onClick={() => {
                              setStep('request');
                              setOtp('');
                              setInfo('');
                            }}
                          >
                            Change details / Resend OTP
                          </Button>
                        )}

                        <Box sx={{ flexGrow: 1 }} />

                        <Button
                          type="submit"
                          variant="contained"
                          color="warning"
                          sx={{ px: 4 }}
                          disabled={loading}
                        >
                          {isRequestStep ? 'Send OTP' : 'Verify & Open Portal'}
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ p: 3 }}>
          <AuthFooter />
        </Box>
      </Box>
    </Box>
  );
}
