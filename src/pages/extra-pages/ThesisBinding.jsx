import React from 'react';
import { Box, Container, Grid, Typography, Paper, TextField, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import banner4 from 'assets/banner/banner4.jpg';
import { TopInfoBar, HeaderNav, FooterSection } from './PlaceOrder';

export default function ThesisBinding() {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'common.white' }}>
      <TopInfoBar />
      <HeaderNav pageTitle="What We Do" hideOrderButton={false} />

      {/* Hero */}
      <Box component="section" sx={{ position: 'relative', height: { xs: 160, md: 220 }, overflow: 'hidden' }}>
        <Box component="img" src={banner4} alt="thesis-hero" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.35)' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, height: '100%' }}>
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <Box>
              <Typography sx={{ color: '#fff', fontSize: { xs: '1.6rem', md: '2.25rem' }, fontWeight: 600 }}>Thesis Binding</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', mt: 1 }}>Home / What We Do / Thesis Binding</Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Content */}
      <Box component="section" sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="flex-start" sx={{ columnGap: { md: '72px' } }}>
            <Grid item xs={12} md={8}>
              <Typography sx={{ color: 'text.secondary', mb: 2 }}>
                Dhar Brothers is proud to present Thesis on Demand, a convenient and streamlined service designed to simplify the process of thesis submission. Whether you're a student, researcher, or academic professional, Thesis on Demand offers a seamless solution for converting your thesis to PDF format and placing your order with ease.
              </Typography>

              <Typography sx={{ fontWeight: 700, mb: 1 }}>Step 1: Convert Your Thesis to PDF Format</Typography>
              <Typography sx={{ color: 'text.secondary', mb: 2 }}>
                Converting your thesis to PDF format is the first step in the thesis submission process. This ensures that the layout of all pages and photos remains consistent, regardless of the computer or device used to view the document. With PDF format, you can rest assured that your content, information, and photos will be preserved exactly as intended.
              </Typography>

              <Typography sx={{ fontWeight: 700, mb: 1 }}>Step 2: Fill in the Order Form</Typography>
              <Typography sx={{ color: 'text.secondary', mb: 2 }}>
                Once your thesis is converted to PDF format, the next step is to fill in the order form. Our order form is designed to gather all the necessary information to process your thesis printing and binding request efficiently. Provide your contact details, thesis specifications, and any additional requirements you may have, and our team will take care of the rest.
              </Typography>

              <Typography sx={{ fontWeight: 700, mb: 1 }}>Experience the Convenience of Thesis on Demand</Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                With Thesis on Demand, you can say goodbye to the hassle of traditional thesis submission methods. Our streamlined process eliminates the need for multiple steps and ensures a smooth and efficient experience from start to finish. Whether you're submitting your thesis for academic purposes or professional publication, Thesis on Demand offers a convenient solution that fits your needs.
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: '1px solid rgba(0,0,0,0.06)', borderRadius: 1, width: '100%', maxWidth: 480, mx: 'auto', mt: { xs: 3, md: 4 } }}>
                <Typography sx={{ fontFamily: "'Playfair Display', serif", fontSize: { xs: '1.6rem', md: '1.9rem' }, fontWeight: 400, letterSpacing: '1px', mb: 1 }}>Enquire Now</Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField variant="outlined" fullWidth size="small" placeholder="Name" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 }, '& .MuiOutlinedInput-input': { padding: '10px 12px' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e6e6e6' } }} />
                  <TextField variant="outlined" fullWidth size="small" placeholder="Phone" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 }, '& .MuiOutlinedInput-input': { padding: '10px 12px' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e6e6e6' } }} />
                  <TextField variant="outlined" fullWidth size="small" placeholder="Email" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 }, '& .MuiOutlinedInput-input': { padding: '10px 12px' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e6e6e6' } }} />
                  <TextField variant="outlined" fullWidth size="small" placeholder="Message" multiline rows={3} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 }, '& .MuiOutlinedInput-input': { padding: '10px 12px' }, '& .MuiOutlinedInput-root textarea': { minHeight: 70, maxHeight: 140 }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e6e6e6' } }} />
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Button variant="contained" sx={{ width: '100%', bgcolor: '#f5e8a8', color: '#1f2937', borderRadius: 0, textTransform: 'none' }}>Submit</Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <FooterSection />
    </Box>
  );
}
