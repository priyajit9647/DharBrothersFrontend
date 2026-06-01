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
    <Box className="contact-page" sx={{ minHeight: '100vh', bgcolor: 'common.white' }}>
      <TopInfoBar />
      <HeaderNav pageTitle="Order Thesis Online" hideOrderButton={false} />

      {/* Hero */}
      <Box sx={{ position: 'relative', height: { xs: 160, md: 220 }, color: '#fff', overflow: 'hidden' }}>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${banner})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
          <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.62)' }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 4, height: '100%' }}>
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, height: '100%' }}>
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <Box>
                <Typography sx={{ color: '#fff', fontSize: { xs: '1.6rem', md: '2.25rem' }, fontWeight: 700 }}>Contact Us</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', mt: 1 }}>Home / Contact us</Typography>
              </Box>
            </Box>
          </Container>
        </Container>
      </Box>

      {/* Content */}
      <Box component="section" sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="stretch" sx={{ columnGap: { md: '72px' } }}>
            <Grid item xs={12} md={5} sx={{ display: 'flex', alignItems: 'stretch' }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, md: 3 },
                  border: '1px solid rgba(0,0,0,0.06)',
                  borderRadius: 1,
                  width: '100%',
                  maxWidth: 340,
                  mx: { xs: 'auto', md: 0 },
                  mt: { xs: 2, md: 0 }
                }}
                className="contact-form-paper"
              >
                <Box>
                  <Typography sx={{ fontFamily: "'Playfair Display', serif", fontSize: { xs: '1.6rem', md: '1.9rem' }, fontWeight: 400, letterSpacing: '1px', mb: 1 }}>Get In Touch</Typography>
                  <Box sx={{ width: 56, height: 3, bgcolor: '#14a0a5', mb: 3 }} />

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <TextField
                      variant="outlined"
                      fullWidth
                      size="small"
                      placeholder="Name"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 }, '& .MuiOutlinedInput-input': { padding: '10px 12px' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e6e6e6' } }}
                    />
                    <TextField
                      variant="outlined"
                      fullWidth
                      size="small"
                      placeholder="Phone"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 }, '& .MuiOutlinedInput-input': { padding: '10px 12px' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e6e6e6' } }}
                    />
                    <TextField
                      variant="outlined"
                      fullWidth
                      size="small"
                      placeholder="Email"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 }, '& .MuiOutlinedInput-input': { padding: '10px 12px' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e6e6e6' } }}
                    />
                    <TextField
                      variant="outlined"
                      fullWidth
                      size="small"
                      placeholder="Message"
                      multiline
                      rows={2}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 }, '& .MuiOutlinedInput-input': { padding: '10px 12px' }, '& .MuiOutlinedInput-root textarea': { minHeight: 70, maxHeight: 120 }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e6e6e6' } }}
                    />
                  </Box>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Button variant="contained" sx={{ width: 160, bgcolor: '#f5e8a8', color: '#1f2937', borderRadius: 0, textTransform: 'none' }}>Submit</Button>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={7} sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <Box sx={{ bgcolor: '#14a0a5', color: 'common.white', py: { xs: 4, md: 6 }, px: { xs: 2, md: 6 }, position: 'relative', overflow: 'hidden' }}>
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

      {/* Map Section - full width responsive iframe */}
      <Box component="section" sx={{ width: '100%' }}>
        <Box sx={{ height: { xs: 240, md: 420 }, width: '100%', overflow: 'hidden' }}>
          <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
            <iframe
              title="Dhar Brothers Location"
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d29475.74531345845!2d88.363998!3d22.561587!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a02764429336925%3A0xd61d390562b35e37!2sDhar%20Brothers!5e0!3m2!1sen!2sin!4v1780286811166!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Box>
        </Box>
      </Box>

      <FooterSection />
    </Box>
  );
}
