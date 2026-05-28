import React from 'react';
import { Box, Container, Stack, Typography, Button, Grid, Paper, TextField } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

import banner1 from 'assets/banner/banner1.jpg';
import banner2 from 'assets/banner/banner2.jpg';
import banner3 from 'assets/banner/banner3.jpg';
import headerLogo from 'assets/logo/hader-logo.png';

// reuse the public header pieces from PlaceOrder (visual header only)
import { TopInfoBar, HeaderNav } from './PlaceOrder';

export default function HomeReplica() {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'common.white' }}>
      <TopInfoBar />
      <HeaderNav pageTitle="Order Thesis Online" hideOrderButton={false} />

      {/* Hero */}
      <Box
        component="section"
        sx={{
          position: 'relative',
          height: { xs: 420, md: 520 },
          backgroundImage: `url(${banner1})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#fff',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.55)' }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, height: '100%' }}>
          <Stack sx={{ height: '100%' }} justifyContent="center">
            <Box sx={{ maxWidth: 760 }}>
              <Typography
                sx={{
                  display: 'inline-block',
                  borderBottom: `3px solid ${alpha(theme.palette.warning.lighter || '#f5e8a8', 1)}`,
                  pb: 0.5,
                  fontSize: { xs: '0.8rem', md: '0.95rem' },
                  letterSpacing: 1.5,
                  color: 'rgba(255,255,255,0.85)'
                }}
              >
                Pioneers in Thesis Composition
              </Typography>

              <Typography
                sx={{
                  fontSize: { xs: '2rem', md: '3.75rem' },
                  fontWeight: 700,
                  lineHeight: 1.02,
                  mt: 2,
                  letterSpacing: 0.5
                }}
              >
                Setting Global Standards
                <br />
                Since the 1930s
              </Typography>

              <Typography sx={{ fontSize: { xs: '1.6rem', md: '2.2rem' }, mt: 1.5, letterSpacing: 6 }}>
                DHARBROTHERS
              </Typography>

              <Box sx={{ mt: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button
                  component={RouterLink}
                  to="/order"
                  sx={{
                    px: 3,
                    py: 1.25,
                    bgcolor: '#f5e8a8',
                    color: '#1f2937',
                    boxShadow: 'none',
                    borderRadius: 0,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#f2df7f' }
                  }}
                >
                  Order Thesis Online
                </Button>

                <Button
                  component={RouterLink}
                  to="/contact"
                  sx={{
                    color: 'rgba(255,255,255,0.9)',
                    textTransform: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.25)',
                    fontSize: '0.95rem'
                  }}
                >
                  Need Help? Contact Us
                </Button>
              </Box>
            </Box>
          </Stack>
        </Container>

        {/* simple dots */}
        <Box sx={{ position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#fff' }} />
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.5)' }} />
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.5)' }} />
        </Box>
      </Box>

      {/* About */}
      <Box component="section" sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Typography sx={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 700, mb: 3 }}>About Dhar Brothers</Typography>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 6 },
              border: '1px solid #efeef0',
              position: 'relative'
            }}
          >
            <Typography sx={{ color: 'text.secondary', fontSize: '0.95rem', lineHeight: 1.9 }}>
              We, Dhar Brothers, had a humble start back in the 1930s and today we take pride in saying that we have reached the
              pinnacle of thesis/dissertation composing, printing and binding. Our works have been submitted to all major universities around the globe.
              We have a happy customer base of over a thousand to our credit.
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                component={RouterLink}
                to="/about"
                sx={{ px: 3, py: 1.1, bgcolor: '#f5e8a8', color: '#1f2937', borderRadius: 0, boxShadow: 'none', fontWeight: 600 }}
              >
                Know More
              </Button>
            </Box>
          </Paper>

          <Grid container spacing={2} sx={{ mt: 3 }}>
            {['Year Since Established', 'Clients in How Many Countries/States/Cities', 'Years/Hours of Experience of All Employee N', 'Total units Sold'].map((label, idx) => (
              <Grid item xs={12} md={3} key={label}>
                <Box sx={{ p: 2, textAlign: 'center', border: '1px solid #f1f1f1', bgcolor: 'common.white' }}>
                  <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>{label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Our Services */}
      <Box component="section" sx={{ bgcolor: '#f3f3f3', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Typography sx={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 700, mb: 3 }}>Our Services</Typography>

          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={3}>
              <Box sx={{ borderRight: { md: '1px solid #e6e6e6' }, pr: { md: 3 } }}>
                <Stack spacing={2}>
                  {['Hard Thesis Binding', 'Soft Thesis Binding', 'Synopsis', 'Soft Thesis Binding', 'Synopsis', 'Thesis Binding'].map((item, i) => (
                    <Typography key={item} sx={{ fontSize: i === 0 ? '1rem' : '0.95rem', color: i === 0 ? 'text.primary' : 'text.secondary' }}>
                      {item}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Box component="img" src={banner2} alt="service" sx={{ width: '100%', maxWidth: 480, display: 'block', mx: 'auto' }} />
              </Box>
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography sx={{ mb: 2 }}>At Dhar Brothers, we understand the significance of presenting your thesis or dissertation in a manner that reflects the dedication and rigor you've...</Typography>
              <Stack spacing={2}>
                <Button sx={{ bgcolor: '#f5e8a8', color: '#1f2937', borderRadius: 0, boxShadow: 'none' }}>Know More</Button>
                <Button sx={{ bgcolor: '#f5e8a8', color: '#1f2937', borderRadius: 0, boxShadow: 'none' }}>Know More</Button>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box component="section" sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Typography sx={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 700, mb: 3 }}>Customer Saying</Typography>

          <Grid container spacing={3}>
            {[1, 2, 3].map((i) => (
              <Grid item xs={12} md={4} key={i}>
                <Paper sx={{ p: 3, minHeight: 180 }} elevation={0}>
                  <Typography sx={{ fontSize: '0.95rem', color: 'text.secondary', mb: 2 }}>
                    Absolute mind blowing experience. totally professional. spellbound seeing the hospitality and care with which they handled your thesis and guide you.
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#0ea5a4', color: '#fff', display: 'grid', placeItems: 'center' }}>S</Box>
                    <Typography sx={{ fontWeight: 600 }}>swaatriya chakrabarty</Typography>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Get In Touch */}
      <Box component="section" sx={{ py: { xs: 6, md: 10 }, bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <Box sx={{ position: 'relative' }}>
            <Box sx={{ bgcolor: '#14a0a5', height: 220, width: '100%', position: 'absolute', left: 0, top: 30, zIndex: 0 }} />

            <Grid container spacing={3} sx={{ position: 'relative', zIndex: 2 }}>
              <Grid item xs={12} md={6}>
                <Box component="img" src={banner3} alt="contact" sx={{ width: '100%', boxShadow: 3 }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 4, maxWidth: 480, mx: { xs: 0, md: 'auto' } }}>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, mb: 2 }}>Get In Touch</Typography>
                  <Stack spacing={2}>
                    <TextField size="small" placeholder="Name" />
                    <TextField size="small" placeholder="Phone" />
                    <TextField size="small" placeholder="Email" />
                    <TextField size="small" placeholder="Message" multiline rows={4} />
                    <Button sx={{ bgcolor: '#f5e8a8', color: '#1f2937', borderRadius: 0 }}>Submit</Button>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* Footer (simplified) */}
      <Box component="footer" sx={{ bgcolor: '#0ea5a4', color: '#fff', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box component="img" src={headerLogo} alt="logo" sx={{ maxWidth: 160 }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography>Home | What We Do | About Us | Testimonials</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography>Call: + ( 91 ) 983 006 6537</Typography>
              <Typography>Email: contactus@dharbrothers.com</Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
