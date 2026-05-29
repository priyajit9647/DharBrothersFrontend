import React from 'react';
import { Box, Container, Grid, Typography, Paper, Stack, Button } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

import banner1 from 'assets/banner/banner1.jpg';
import banner2 from 'assets/banner/banner2.jpg';
import banner3 from 'assets/banner/banner3.jpg';
import avatar1 from 'assets/images/users/avatar-1.png';
import avatar2 from 'assets/images/users/avatar-2.png';
import avatar3 from 'assets/images/users/avatar-3.png';
import avatar4 from 'assets/images/users/avatar-4.png';

// reuse header/footer pieces
import { HeaderNav, TopInfoBar, FooterSection } from './PlaceOrder';

export default function About() {
  const theme = useTheme();

  const StatsCard = ({ value, label, IconSvg }) => (
    <Box sx={{ position: 'relative', pt: 4, display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ position: 'absolute', top: 0, transform: 'translateY(-50%)' }}>
        <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#14a0a5', display: 'grid', placeItems: 'center', boxShadow: '0 6px 18px rgba(20,160,165,0.12)' }}>
          {IconSvg ? <IconSvg /> : null}
        </Box>
      </Box>

      <Paper elevation={1} sx={{ width: 220, pt: 6, pb: 3, px: 2, textAlign: 'center', borderRadius: 1 }}>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</Typography>
        <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', mt: 1 }}>{label}</Typography>
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'common.white' }}>
      <TopInfoBar />
      <HeaderNav pageTitle="Order Thesis Online" hideOrderButton={false} />

      {/* Hero */}
      <Box component="section" sx={{ position: 'relative', height: { xs: 200, md: 220 }, overflow: 'hidden' }}>
        <Box component="img" src={banner3} alt="about-hero" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.35)' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, height: '100%' }}>
          <Stack sx={{ height: '100%' }} justifyContent="center" alignItems="center">
            <Typography sx={{ color: '#fff', fontSize: { xs: '1.6rem', md: '2.25rem' }, fontWeight: 600 }}>About Us</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', mt: 1 }}>Home / About Us</Typography>
          </Stack>
        </Container>
      </Box>

      {/* Main content */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box component="img" src={banner2} alt="books" sx={{ width: '100%', boxShadow: 3, maxWidth: 540, mx: 'auto' }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography sx={{ fontFamily: 'serif', fontSize: { xs: '1.6rem', md: '2.25rem' }, fontWeight: 400, mb: 1 }}>Who We Are</Typography>

            <Box sx={{ width: 84, height: 3, bgcolor: '#14a0a5', mb: 3 }} />

            <Typography sx={{ color: 'text.secondary', fontSize: '0.95rem', lineHeight: 1.9, mb: 2 }}>
              We, Dhar Brothers, had a humble start back in the 1930s and today we take pride in saying that we have reached the pinnacle of thesis/dissertation composing, printing and binding. Our works have been submitted to all major universities around the globe. We have a happy customer base of over a thousand to our credit. We have an experience of more than 85 years in the thesis/dissertation printing and binding.
            </Typography>

            <Typography sx={{ color: 'text.secondary', fontSize: '0.95rem', lineHeight: 1.9 }}>
              We compete with the best in the world in terms of thesis printing and binding and our work has often been appreciated for being leagues ahead of our global competitors. We are currently trying to redefine the age-old practice of binding by skillfully balancing modern technology and human touch. The blend of the traditional and the new is what makes us who we are today. Our employees undergo a rigorous training before they are chosen for the job. Then, they bring to you the highest level of craftsmanship. Our raw materials are all sourced internationally to provide a gamut of the best of the best.
            </Typography>
          </Grid>
        </Grid>

        {/* stats boxes */}
        <Grid container spacing={3} sx={{ mt: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              value="1930"
              label="Year Since Established"
              IconSvg={() => (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 21V7a1 1 0 011-1h16v15" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 6h-6v4h6V6z" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              value="9"
              label="Clients in How Many Countries/States/Cities"
              IconSvg={() => (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2v4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 18v4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4.9 4.9l2.8 2.8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16.3 16.3l2.8 2.8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              value="90"
              label="Years/Hours of Experience of All Employee N"
              IconSvg={() => (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12a5 5 0 100-10 5 5 0 000 10z" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              value="500000"
              label="Total units Sold"
              IconSvg={() => (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1v22" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M17 5H9a4 4 0 000 8h6a4 4 0 010 8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            />
          </Grid>
        </Grid>
      </Container>

      {/* Trust Scene 1930 */}
      <Box sx={{ py: { xs: 4, md: 6 }, bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <Typography sx={{ textAlign: 'center', fontSize: '1.5rem', fontFamily: 'serif', mb: 3 }}>Trust Scene 1930</Typography>
          <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto', py: 2 }}>
            {[avatar1, avatar2, avatar3, avatar4].map((src, idx) => (
              <Box key={idx} sx={{ minWidth: 200 }}>
                <Paper elevation={0} sx={{ p: 1, border: '1px solid #eee' }}>
                  <Box component="img" src={src} alt={`trust-${idx}`} sx={{ width: '100%', height: 160, objectFit: 'cover' }} />
                </Paper>
                <Typography sx={{ mt: 1, fontSize: '0.9rem' }}>{['Rashmohan Dhar','Hiralal Dhar','Mr. Kishore Dhar','Mr. Abhradip Dhar'][idx]}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Mission & Vision */}
      <Box sx={{ position: 'relative', py: { xs: 6, md: 10 } }}>
        <Box component="img" src={banner1} alt="mission-bg" sx={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', objectFit: 'cover' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 4, maxWidth: 520, mx: { xs: 0, md: 'auto' } }}>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 1 }}>Our Mission</Typography>
                <Typography sx={{ color: 'text.secondary' }}>Dhar Brothers' mission is to redefine printing and binding standards, ensuring scholars receive nothing but the best for their academic endeavours.</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 4, maxWidth: 520, mx: { xs: 0, md: 'auto' } }}>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 1 }}>Our Vision</Typography>
                <Typography sx={{ color: 'text.secondary' }}>Dhar Brothers' vision is to uphold its legacy of excellence in thesis/dissertation composing, printing, and binding.</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <FooterSection />
    </Box>
  );
}
