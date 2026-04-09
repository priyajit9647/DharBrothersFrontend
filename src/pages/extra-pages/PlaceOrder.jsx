import { useMemo, useState } from 'react';

import { CloudUploadOutlined, EnvironmentOutlined, FacebookFilled, InstagramOutlined, MailOutlined, PhoneOutlined, TwitterOutlined } from '@ant-design/icons';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import Logo from 'components/logo';

import banner2 from 'assets/banner/banner2.jpg';

const steps = ['Upload Documents', 'Binding Type', 'Hard Print Details', 'Soft Print Details', 'Synopsis Details', 'Order Summary'];
const navItems = ['Home', 'About Us', 'What We Do', 'How We Work', 'Testimonial', 'Price', 'Faq', 'Contact Us'];
const stepGroups = ['Upload File', 'Document Details'];
const socialIcons = [FacebookFilled, TwitterOutlined, InstagramOutlined];

const stepTitles = {
  1: 'Binding Type',
  2: 'Hard Print Details',
  3: 'Soft Print Details',
  4: 'Synopsis Details',
  5: 'Order Summary'
};

export default function PlaceOrder() {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);

  const stepGroupIndex = activeStep === 0 ? 0 : 1;
  const currentTitle = useMemo(() => stepTitles[activeStep] || 'Upload Documents', [activeStep]);

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f7f2' }}>
      <TopInfoBar />
      <HeaderNav />
      <HeroBanner />

      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Paper
            elevation={0}
            sx={{
              overflow: 'hidden',
              borderRadius: 0,
              bgcolor: 'common.white',
              boxShadow: theme.vars.customShadows.z1,
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.12)}`
            }}
          >
            <Box sx={{ px: { xs: 2, md: 6 }, pt: { xs: 3, md: 4 } }}>
              <ProgressHeader activeIndex={stepGroupIndex} />
            </Box>

            <Box sx={{ px: { xs: 2, md: 6 }, pt: { xs: 1, md: 2 }, pb: { xs: 3, md: 4 } }}>
              {activeStep === 0 ? <UploadStep /> : <DetailStep title={currentTitle} stepIndex={activeStep} />}

              <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
                {activeStep > 0 && (
                  <Button
                    onClick={handleBack}
                    variant="outlined"
                    sx={{
                      minWidth: 110,
                      borderRadius: 0,
                      borderColor: alpha(theme.palette.secondary.main, 0.24),
                      color: 'text.primary'
                    }}
                  >
                    Back
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  variant="contained"
                  sx={{
                    minWidth: 110,
                    borderRadius: 0,
                    bgcolor: theme.palette.warning.lighter,
                    color: theme.palette.text.primary,
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: theme.palette.warning.light,
                      boxShadow: 'none'
                    }
                  }}
                >
                  {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Container>
      </Box>

      <FooterSection />
    </Box>
  );
}

function TopInfoBar() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        bgcolor: 'common.white',
        borderBottom: `1px solid ${alpha(theme.palette.secondary.main, 0.12)}`
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 1.5, md: 2 }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          sx={{ py: 1.5 }}
        >
          <HeaderInfo icon={EnvironmentOutlined} text="79, Lenin Sarani Rd, near COMMERCIAL POINT Kolkata, West Bengal 700013" />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1.5, sm: 3 }}>
            <HeaderInfo icon={PhoneOutlined} text="+ ( 91 ) 983 006 6537" />
            <HeaderInfo icon={MailOutlined} text="contactus@dharbrothers.com" />
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

function HeaderInfo({ icon: Icon, text }) {
  const theme = useTheme();

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box
        sx={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          color: theme.palette.info.main,
          border: `1px solid ${alpha(theme.palette.info.main, 0.22)}`
        }}
      >
        <Icon style={{ fontSize: 12 }} />
      </Box>
      <Typography variant="caption" sx={{ fontSize: '0.72rem', color: 'text.secondary', letterSpacing: 0.15 }}>
        {text}
      </Typography>
    </Stack>
  );
}

function HeaderNav() {
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: 'common.white' }}>
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', lg: 'center' }}
          spacing={{ xs: 2, lg: 3 }}
          sx={{ py: 2.5 }}
        >
          <Stack direction="row" spacing={3} alignItems="center" sx={{ width: '100%', justifyContent: { xs: 'space-between', lg: 'flex-start' } }}>
            <Logo to="/" logoHeight={58} />
            <Typography sx={{ display: { xs: 'none', md: 'block' }, fontSize: '0.82rem', fontWeight: 600, letterSpacing: 0.8 }}>
              LOGIN
            </Typography>
          </Stack>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 1.25, md: 2.2 }}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            sx={{ width: '100%', justifyContent: 'flex-end' }}
          >
            {navItems.map((item) => (
              <Typography
                key={item}
                sx={{
                  fontSize: '0.76rem',
                  fontWeight: 500,
                  color: 'text.primary',
                  cursor: 'default',
                  whiteSpace: 'nowrap'
                }}
              >
                {item}
              </Typography>
            ))}

            <Button
              variant="contained"
              sx={{
                ml: { md: 1 },
                px: 3,
                py: 1.4,
                borderRadius: 0,
                bgcolor: theme.palette.warning.lighter,
                color: theme.palette.text.primary,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: theme.palette.warning.light,
                  boxShadow: 'none'
                }
              }}
            >
              Order Thesis Online
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

function HeroBanner() {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: { xs: 220, md: 280 },
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
      <Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 400, letterSpacing: 0.4 }}>
        Order Thesis Online
      </Typography>
    </Box>
  );
}

function ProgressHeader({ activeIndex }) {
  const theme = useTheme();

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto', mb: 3 }}>
      <Box sx={{ position: 'relative', px: { xs: 2, md: 3 }, pb: 1.25 }}>
        <Box
          sx={{
            position: 'absolute',
            top: 7,
            left: 24,
            right: 24,
            height: 2,
            bgcolor: alpha(theme.palette.secondary.main, 0.22)
          }}
        />
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          {stepGroups.map((label, index) => {
            const isActive = index === activeIndex;

            return (
              <Stack key={label} alignItems={index === 0 ? 'flex-start' : 'flex-end'} spacing={1} sx={{ position: 'relative', zIndex: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: isActive ? theme.palette.info.main : alpha(theme.palette.info.main, 0.38)
                  }}
                />
                <Typography
                  sx={{
                    fontSize: { xs: '0.8rem', md: '0.88rem' },
                    color: isActive ? theme.palette.info.main : 'text.secondary',
                    fontWeight: 500
                  }}
                >
                  {label}
                </Typography>
              </Stack>
            );
          })}
        </Stack>
      </Box>
    </Box>
  );
}

function UploadStep() {
  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden'
        }}
      >
        <Grid container>
          <Grid item xs={12} md={6}>
            <UploadCard title="UPLOAD THESIS DOCUMENT" showError />
          </Grid>
          <Grid item xs={12} md={6} sx={{ borderLeft: { md: '1px solid' }, borderColor: 'divider' }}>
            <UploadCard title="UPLOAD SYNOPSIS DOCUMENT (Optional)" />
          </Grid>
        </Grid>
      </Paper>

      <Box
        sx={{
          mt: 0,
          px: { xs: 2, md: 2.5 },
          py: 2.5,
          bgcolor: '#f7f7f5',
          borderLeft: (theme) => `3px solid ${theme.palette.info.main}`
        }}
      >
        <Typography sx={{ fontSize: '1rem', fontWeight: 500, mb: 1.25 }}>Additional Information</Typography>
        <Box component="ol" sx={{ m: 0, pl: 2.25, color: 'text.primary' }}>
          <Typography component="li" sx={{ fontSize: '0.82rem', mb: 0.75 }}>
            Upload only one thesis per order
          </Typography>
          <Typography component="li" sx={{ fontSize: '0.82rem' }}>
            We prefer pdf.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function UploadCard({ title, showError = false }) {
  const theme = useTheme();

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 }, textAlign: 'center' }}>
      <Typography sx={{ fontSize: { xs: '1.15rem', md: '1.55rem' }, lineHeight: 1.15, fontWeight: 700, mb: 4 }}>
        {title}
      </Typography>

      <Box
        sx={{
          width: '100%',
          maxWidth: 300,
          minHeight: 208,
          mx: 'auto',
          border: `2px dashed ${alpha(theme.palette.secondary.main, 0.18)}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          py: 3.5,
          bgcolor: 'common.white'
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            bgcolor: theme.palette.info.main,
            color: 'common.white',
            mb: 2
          }}
        >
          <CloudUploadOutlined style={{ fontSize: 22 }} />
        </Box>

        <Typography sx={{ fontSize: '0.83rem', letterSpacing: 0.5 }}>DROP YOUR FILE HERE</Typography>
        <Typography color="text.secondary" sx={{ fontSize: '0.8rem' }}>
          or click to select
        </Typography>
      </Box>

      <Box sx={{ mt: 2.5 }}>
        {showError && (
          <Typography sx={{ fontSize: '0.84rem', color: 'error.main', mb: 0.5 }}>*Please upload a pdf.</Typography>
        )}
        <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>Maximum size allowed is 512MB.</Typography>
        <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>Supported formats are: pdf</Typography>
        <Typography sx={{ mt: 0.75, fontSize: '0.84rem', color: 'info.main', textDecoration: 'underline' }}>Convert Doc to Pdf here</Typography>
      </Box>
    </Box>
  );
}

function DetailStep({ title, stepIndex }) {
  const theme = useTheme();

  return (
    <Box sx={{ py: { xs: 1, md: 2 } }}>
      <Typography sx={{ fontSize: { xs: '1.35rem', md: '1.8rem' }, fontWeight: 700, mb: 1.5 }}>{title}</Typography>
      <Typography sx={{ maxWidth: 720, color: 'text.secondary', fontSize: '0.94rem', mb: 3 }}>
        Continue the order flow with the same visual language. This section keeps the public-site layout from the upload screen while exposing the next step in the thesis ordering journey.
      </Typography>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 0,
              border: '1px solid',
              borderColor: 'divider',
              minHeight: 260
            }}
          >
            <Typography sx={{ fontSize: '0.8rem', letterSpacing: 1.2, color: 'text.secondary', textTransform: 'uppercase', mb: 1.25 }}>
              Step {stepIndex + 1} of {steps.length}
            </Typography>
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 600, mb: 1.5 }}>Section details will be placed here</Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', lineHeight: 1.7 }}>
              Use this area for the corresponding fields, selections, and pricing inputs. The page styling remains aligned with the uploaded reference: light backgrounds, thin dividers, muted text, and cyan and pale-gold accents.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 0,
              border: '1px solid',
              borderColor: 'divider',
              minHeight: 260,
              bgcolor: alpha(theme.palette.warning.lighter, 0.22)
            }}
          >
            <Typography sx={{ fontSize: '1rem', fontWeight: 600, mb: 1.25 }}>Order Snapshot</Typography>
            <Stack spacing={1.25}>
              {steps.slice(0, stepIndex + 1).map((step) => (
                <Box key={step} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                  <Typography sx={{ fontSize: '0.88rem' }}>{step}</Typography>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: theme.palette.info.main }} />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

function FooterSection() {
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: 'common.white', borderTop: `1px solid ${alpha(theme.palette.secondary.main, 0.12)}` }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ py: { xs: 5, md: 6 } }}>
          <Grid item xs={12} md={3}>
            <Logo to="/" logoHeight={82} />
            <Typography sx={{ mt: 1.5, maxWidth: 220, color: 'text.secondary', fontSize: '0.88rem' }}>
              A binding commitment since 1930.
            </Typography>
            <Stack direction="row" spacing={1.25} sx={{ mt: 3 }}>
              {socialIcons.map((Icon, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: '#121212',
                    color: 'common.white'
                  }}
                >
                  <Icon style={{ fontSize: 16 }} />
                </Box>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FooterLinkList items={['Home', 'What We Do', 'About Us']} />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FooterLinkList items={['Testimonials', 'Faq', 'Contact us']} />
          </Grid>

          <Grid item xs={12} md={2}>
            <Stack spacing={2}>
              <FooterContact icon={PhoneOutlined} title="Call" value="+ ( 91 ) 983 006 6537" />
              <FooterContact icon={MailOutlined} title="Email" value="contactus@dharbrothers.com" />
              <FooterContact icon={EnvironmentOutlined} title="Address" value="79, Lenin Sarani Rd, near COMMERCIAL POINT, Maula Ali, Taltala, Kolkata, West Bengal 700013" />
            </Stack>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography sx={{ fontSize: '1.35rem', fontWeight: 600, mb: 2 }}>Subscribe For The Latest News</Typography>
            <TextField
              fullWidth
              variant="standard"
              placeholder="Email"
              slotProps={{
                input: {
                  disableUnderline: false
                }
              }}
            />
            <Button
              fullWidth
              variant="contained"
              sx={{
                mt: 2.5,
                borderRadius: 0,
                bgcolor: theme.palette.warning.lighter,
                color: theme.palette.text.primary,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: theme.palette.warning.light,
                  boxShadow: 'none'
                }
              }}
            >
              Submit
            </Button>
          </Grid>
        </Grid>
      </Container>

      <Box sx={{ bgcolor: 'info.main', color: 'common.white', py: 2 }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
            <Typography sx={{ fontSize: '0.82rem' }}>© 2024 DHAR PRINTERS AND GENERAL ORDER SUPPLIERS | All Rights Reserved</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.75, sm: 2.5 }}>
              <Typography sx={{ fontSize: '0.82rem' }}>Terms and Conditions</Typography>
              <Typography sx={{ fontSize: '0.82rem' }}>Privacy Policy</Typography>
              <Typography sx={{ fontSize: '0.82rem' }}>Refund Policy</Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}

function FooterLinkList({ items }) {
  return (
    <Stack spacing={1.5}>
      {items.map((item) => (
        <Typography key={item} sx={{ fontSize: '0.95rem', color: 'text.primary' }}>
          {item}
        </Typography>
      ))}
    </Stack>
  );
}

function FooterContact({ icon: Icon, title, value }) {
  const theme = useTheme();

  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          border: `1px solid ${alpha(theme.palette.info.main, 0.22)}`,
          color: theme.palette.info.main,
          flexShrink: 0
        }}
      >
        <Icon style={{ fontSize: 16 }} />
      </Box>
      <Box>
        <Typography sx={{ fontSize: '0.92rem', fontWeight: 600 }}>{title}</Typography>
        <Typography sx={{ fontSize: '0.84rem', color: 'text.secondary', lineHeight: 1.6 }}>{value}</Typography>
      </Box>
    </Stack>
  );
}
