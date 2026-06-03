import React from 'react';
import { Box, Container, Grid, Typography, Paper, TextField, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import banner4 from 'assets/banner/banner4.jpg';
import { TopInfoBar, HeaderNav, FooterSection } from './PlaceOrder';

export default function HardThesisBinding() {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'common.white' }}>
      <TopInfoBar />
      <HeaderNav pageTitle="What We Do" hideOrderButton={false} />

      {/* Hero */}
      <Box component="section" sx={{ position: 'relative', height: { xs: 160, md: 220 }, overflow: 'hidden' }}>
        <Box component="img" src={banner4} alt="hard-hero" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.35)' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, height: '100%' }}>
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <Box>
              <Typography sx={{ color: '#fff', fontSize: { xs: '1.6rem', md: '2.25rem' }, fontWeight: 600 }}>Hard Thesis Binding</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', mt: 1 }}>Home / What We Do / Hard Thesis Binding</Typography>
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
                At Dhar Brothers, we understand the significance of presenting your thesis or dissertation in a manner that reflects the dedication and rigor you've invested in your research. Our hard binding service is meticulously crafted to elevate your work to the pinnacle of professionalism and durability.
              </Typography>

              <Typography sx={{ fontWeight: 700, mb: 1 }}>Craftsmanship That Stands the Test of Time</Typography>
              <Typography sx={{ color: 'text.secondary', mb: 2 }}>
                With over 85 years of experience in the thesis and dissertation printing and binding industry, Dhar Brothers has honed its craft to perfection. Our hard binding service embodies the timeless tradition of quality craftsmanship, where every detail is meticulously attended to with precision and care.
              </Typography>

              <Typography sx={{ fontWeight: 700, mb: 1 }}>Uncompromising Quality</Typography>
              <Typography sx={{ color: 'text.secondary', mb: 2 }}>
                When you entrust your thesis to Dhar Brothers for hard binding, you can rest assured that only the finest materials and techniques will be utilized in the process. From premium-grade cover materials to archival-quality binding glue, we spare no expense in ensuring the longevity and integrity of your work.
              </Typography>

              <Typography sx={{ fontWeight: 700, mb: 1 }}>Customization to Suit Your Style</Typography>
              <Typography sx={{ color: 'text.secondary', mb: 2 }}>
                We understand that every thesis is unique, and we offer a range of customization options to suit your individual preferences. Choose from a variety of cover materials, colors, and finishing touches to create a bespoke binding that reflects your personality and professionalism.
              </Typography>

              <Typography sx={{ fontWeight: 700, mb: 1 }}>Durability That Endures</Typography>
              <Typography sx={{ color: 'text.secondary', mb: 2 }}>
                A well-bound thesis is not just a testament to your academic achievement; it's a lasting legacy that will be cherished for years to come. Our hard binding service is designed to withstand the rigours of time, ensuring that your work remains pristine and intact for future generations to admire.
              </Typography>

              <Typography sx={{ fontWeight: 700, mb: 1 }}>Expertise You Can Trust</Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                Our team of skilled craftsmen undergoes rigorous training to uphold the highest standards of quality and precision. With their expert guidance and attention to detail, your thesis will receive the care and attention it deserves, from the moment it arrives at our facility to the day it is proudly displayed on your bookshelf.
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
