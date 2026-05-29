import React from 'react';
import { Box, Container, Grid, Typography, Paper, TextField, Stack, Button, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { alpha, useTheme } from '@mui/material/styles';
import { MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';

import banner from 'assets/banner/banner3.jpg';
import { TopInfoBar, HeaderNav, FooterSection } from './PlaceOrder';

export default function ContactPage() {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'common.white' }}>
      <TopInfoBar />
      <HeaderNav pageTitle="Contact Us" hideOrderButton={true} />

      {/* Hero */}
      <Box sx={{ position: 'relative', height: { xs: 220, md: 300 }, color: '#fff', overflow: 'hidden' }}>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${banner})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.45)' }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 4, height: '100%' }}>
          <Stack sx={{ height: '100%' }} justifyContent="center">
            <Typography sx={{ fontSize: { xs: '1.6rem', md: '2.1rem' }, fontWeight: 700 }}>Contact Us</Typography>
            <Box component="nav" aria-label="breadcrumb" sx={{ mt: 1 }}>
              <RouterLink to="/home" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none' }}>Home</RouterLink>
              <Typography component="span" sx={{ ml: 1, color: 'rgba(255,255,255,0.85)' }}>/ Contact us</Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Content */}
      <Box component="section" sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="flex-start">
            <Grid item xs={12} md={5}>
              <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, border: `1px solid ${alpha(theme.palette.secondary.main, 0.08)}` }}>
                <Typography sx={{ fontSize: '2rem', fontWeight: 700, mb: 1 }}>Get In Touch</Typography>
                <Box sx={{ width: 60, height: 3, bgcolor: 'secondary.main', mb: 3 }} />

                <Stack spacing={2} sx={{ mt: 1 }}>
                  <TextField variant="outlined" fullWidth size="small" placeholder="Name" />
                  <TextField variant="outlined" fullWidth size="small" placeholder="Phone" />
                  <TextField variant="outlined" fullWidth size="small" placeholder="Email" />
                  <TextField variant="outlined" fullWidth size="small" placeholder="Message" multiline rows={6} />
                  <Button sx={{ width: 140, bgcolor: '#f5e8a8', color: '#1f2937', borderRadius: 0 }}>Submit</Button>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={7}>
              <Box sx={{ bgcolor: '#159aa1', color: 'common.white', py: 4, px: { xs: 2, md: 6 }, position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ maxWidth: 700, mx: 'auto' }}>
                  <Paper elevation={0} sx={{ bgcolor: 'transparent', border: '1px solid rgba(255,255,255,0.18)' }}>
                    <Stack divider={<Divider sx={{ borderColor: 'rgba(255,255,255,0.25)' }} />} spacing={0}>
                      <Box sx={{ py: 6, textAlign: 'center' }}>
                        <Box sx={{ width: 64, height: 64, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.4)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                          <MailOutlined style={{ color: '#fff', fontSize: 20 }} />
                        </Box>
                        <Typography sx={{ fontWeight: 700 }}>contactus@dharbrothers.com</Typography>
                      </Box>

                      <Box sx={{ py: 6, textAlign: 'center' }}>
                        <Box sx={{ width: 64, height: 64, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.4)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                          <PhoneOutlined style={{ color: '#fff', fontSize: 20 }} />
                        </Box>
                        <Typography sx={{ fontWeight: 700 }}>+ (91) 983 006 6537</Typography>
                      </Box>

                      <Box sx={{ py: 6, textAlign: 'center' }}>
                        <Box sx={{ width: 64, height: 64, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.4)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                          <EnvironmentOutlined style={{ color: '#fff', fontSize: 20 }} />
                        </Box>
                        <Typography sx={{ fontWeight: 700, mb: 1 }}>79, Lenin Sarani Rd, near COMMERCIAL POINT, Maula Ali, Taltala, Kolkata, West Bengal 700013</Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <FooterSection />
    </Box>
  );
}
