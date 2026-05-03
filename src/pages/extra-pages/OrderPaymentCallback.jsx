import { useMemo } from 'react';

import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { Link as RouterLink, useLocation } from 'react-router-dom';

import banner2 from 'assets/banner/banner2.jpg';

import { FooterSection, HeaderNav, TopInfoBar } from './PlaceOrder';

export default function OrderPaymentCallback() {
  const theme = useTheme();
  const location = useLocation();

  const queryEntries = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return Array.from(params.entries());
  }, [location.search]);

  const paymentStatus = useMemo(() => getPaymentStatus(queryEntries), [queryEntries]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f7f2' }}>
      <TopInfoBar />
      <HeaderNav />
      <CallbackHero />

      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="md">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 0,
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.12)}`,
              boxShadow: theme.vars.customShadows.z1
            }}
          >
            <Stack spacing={2.5} alignItems="flex-start">
              <Stack spacing={1.25} alignItems="flex-start">
                <Chip label={paymentStatus.badgeLabel} color={paymentStatus.badgeColor} sx={{ borderRadius: 0, fontWeight: 600 }} />
                <Typography sx={{ fontSize: { xs: '1.4rem', md: '1.75rem' }, fontWeight: 600 }}>{paymentStatus.title}</Typography>
              </Stack>
              <Typography sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                {paymentStatus.description}
              </Typography>

              <Box
                sx={{
                  width: '100%',
                  p: 2.5,
                  bgcolor: alpha(paymentStatus.accent, 0.06),
                  border: `1px solid ${alpha(paymentStatus.accent, 0.18)}`
                }}
              >
                <Stack spacing={1.25}>
                  <Typography sx={{ fontWeight: 600 }}>{paymentStatus.infoTitle}</Typography>
                  <Typography sx={{ color: 'text.secondary', lineHeight: 1.8 }}>{paymentStatus.infoText}</Typography>
                  {paymentStatus.secondaryText ? (
                    <Typography sx={{ color: 'text.secondary', lineHeight: 1.8 }}>{paymentStatus.secondaryText}</Typography>
                  ) : null}
                </Stack>
              </Box>

              <Box
                sx={{
                  width: '100%',
                  p: 2.5,
                  bgcolor: alpha(theme.palette.info.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.16)}`
                }}
              >
                <Stack spacing={1.25}>
                  <Typography sx={{ fontWeight: 600 }}>Customer portal access</Typography>
                  <Typography sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                    You can log in to your customer portal using your registered mobile number or email and verify access with OTP.
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                    Inside the portal you can check the latest order status, payment state and order progress{paymentStatus.isFailure ? ', and retry the payment again if this payment attempt failed.' : '.'}
                  </Typography>
                </Stack>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                {paymentStatus.isFailure ? (
                  <Button component={RouterLink} to="/customer" variant="contained" sx={{ borderRadius: 0 }}>
                    Login and Retry Payment
                  </Button>
                ) : (
                  <Button component={RouterLink} to="/customer" variant="contained" sx={{ borderRadius: 0 }}>
                    Track in Customer Portal
                  </Button>
                )}
                <Button component={RouterLink} to="/order" variant="outlined" sx={{ borderRadius: 0 }}>
                  Back to Order Page
                </Button>
              </Stack>

              <Divider flexItem />

              <Box
                sx={{
                  width: '100%',
                  p: 2.5,
                  bgcolor: alpha(theme.palette.info.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.16)}`
                }}
              >
                <Typography sx={{ fontWeight: 600, mb: 1.5 }}>Callback Details</Typography>

                {queryEntries.length ? (
                  <Stack spacing={1.25}>
                    {queryEntries.map(([key, value]) => (
                      <Box key={`${key}-${value}`} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                        <Typography sx={{ minWidth: 140, fontWeight: 600, color: 'text.primary' }}>{key}</Typography>
                        <Typography sx={{ color: 'text.secondary', wordBreak: 'break-word' }}>{value || '-'}</Typography>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography sx={{ color: 'text.secondary' }}>
                    No callback parameters were found in the URL. If payment was not completed, log in to the customer portal and retry the payment from there.
                  </Typography>
                )}
              </Box>
            </Stack>
          </Paper>
        </Container>
      </Box>

      <FooterSection />
    </Box>
  );
}

function CallbackHero() {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: { xs: 220, md: 260 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: 'common.white',
        backgroundImage: `linear-gradient(0deg, rgba(27, 24, 20, 0.38), rgba(27, 24, 20, 0.38)), url(${banner2})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={1} alignItems="center">
          <Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 400, letterSpacing: 0.4 }}>
            Payment Callback
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', letterSpacing: 0.5 }}>Home / Order / Payment Callback</Typography>
        </Stack>
      </Container>
    </Box>
  );
}

function getPaymentStatus(queryEntries) {
  const resultValue =
    queryEntries.find(([key]) => key.toLowerCase() === 'result')?.[1]?.trim().toLowerCase() || '';
  const values = queryEntries.map(([key, value]) => `${key}=${value}`.toLowerCase());
  const combined = values.join(' ');

  const successWords = ['success', 'successful', 'paid', 'captured', 'completed', 'ok'];
  const failureWords = ['fail', 'failed', 'failure', 'error', 'cancel', 'cancelled', 'declined', 'abort'];
  const pendingWords = ['pending', 'processing', 'initiated', 'awaiting'];

  const hasWord = (words) => words.some((word) => combined.includes(word));

  if (resultValue === 'failed') {
    return {
      badgeLabel: 'Payment Failed',
      badgeColor: 'error',
      title: 'Your payment was not completed',
      description:
        'The payment gateway returned a failed response for this order. Your order is not confirmed as paid yet.',
      infoTitle: 'What you should do next',
      infoText:
        'Log in to your customer portal using your registered mobile number or email, verify with OTP, check the order status and make the payment again from the portal.',
      secondaryText: 'If the amount was deducted but this page still shows a failure, contact Dhar Brothers support before retrying the payment.',
      accent: '#d32f2f',
      isFailure: true
    };
  }

  if (resultValue === 'success') {
    return {
      badgeLabel: 'Payment Success',
      badgeColor: 'success',
      title: 'Your payment was received successfully',
      description: 'The payment gateway returned a successful response. Dhar Brothers can now continue processing your order.',
      infoTitle: 'What happens next',
      infoText:
        'You can log in to your customer portal using your registered mobile number or email and OTP to check the latest order and payment status at any time.',
      secondaryText: '',
      accent: '#2e7d32',
      isFailure: false
    };
  }

  if (hasWord(failureWords)) {
    return {
      badgeLabel: 'Payment Failed',
      badgeColor: 'error',
      title: 'Your payment was not completed',
      description:
        'The payment gateway returned a failed or cancelled response for this order. Your order is not confirmed as paid yet.',
      infoTitle: 'What you should do next',
      infoText:
        'Log in to your customer portal using your registered mobile number or email, verify with OTP, review the order status and start the payment again from the pending payment section.',
      secondaryText: 'If the amount was deducted but this page still shows a failure, contact Dhar Brothers support before retrying the payment.',
      accent: '#d32f2f',
      isFailure: true
    };
  }

  if (hasWord(successWords)) {
    return {
      badgeLabel: 'Payment Success',
      badgeColor: 'success',
      title: 'Your payment was received successfully',
      description: 'The payment gateway returned a successful response. Dhar Brothers can now continue processing your order.',
      infoTitle: 'What happens next',
      infoText:
        'You can keep this page for reference or log in to the customer portal later using your registered mobile number or email and OTP to track the order and future updates.',
      secondaryText: '',
      accent: '#2e7d32',
      isFailure: false
    };
  }

  return {
    badgeLabel: hasWord(pendingWords) ? 'Payment Pending' : 'Payment Update',
    badgeColor: 'warning',
    title: hasWord(pendingWords) ? 'Your payment is still being processed' : 'Payment response received',
    description: hasWord(pendingWords)
      ? 'The payment gateway has not marked this order as successful or failed yet. The status may update shortly.'
      : 'The payment gateway returned a response, but the final result could not be identified from the callback values.',
    infoTitle: 'Recommended next step',
    infoText: 'Please log in to the customer portal to check the latest payment status before attempting another payment.',
    secondaryText: 'If the order still shows unpaid after some time, you can retry payment from the customer portal.',
    accent: '#ed6c02',
    isFailure: false
  };
}