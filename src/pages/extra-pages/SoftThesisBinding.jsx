import React from 'react';
import { Box, Container, Grid, Typography, Paper, TextField, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import banner4 from 'assets/banner/banner4.jpg';
import { TopInfoBar, HeaderNav, FooterSection } from './PlaceOrder';

export default function SoftThesisBinding() {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'common.white' }}>
      <TopInfoBar />
      <HeaderNav pageTitle="What We Do" hideOrderButton={false} />

      {/* Hero */}
      <Box component="section" sx={{ position: 'relative', height: { xs: 160, md: 220 }, overflow: 'hidden' }}>
        <Box component="img" src={banner4} alt="soft-hero" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.35)' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, height: '100%' }}>
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <Box>
              <Typography sx={{ color: '#fff', fontSize: { xs: '1.6rem', md: '2.25rem' }, fontWeight: 600 }}>Soft Thesis Binding</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', mt: 1 }}>Home / What We Do / Soft Thesis Binding</Typography>
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
                Soft binding is an art form that requires precision, care, and attention to detail. At Dhar Brothers, we have perfected the craft of soft binding to offer you a solution that is both elegant and functional. Our soft binding service is designed to encase your academic works with finesse, providing a stylish and durable option for presenting your research.
              </Typography>

              <Typography sx={{ fontWeight: 700, mb: 1 }}>Sleek and Stylish Design</Typography>
              <Typography sx={{ color: 'text.secondary', mb: 2 }}>
                Soft bound books produced by Dhar Brothers are cut flush on the edge, giving them a sleek and contemporary look. Our soft binding technique ensures that your books are rigid enough to stand proudly on a bookshelf, while still retaining a lightweight and portable form.
              </Typography>

              <Typography sx={{ fontWeight: 700, mb: 1 }}>Exceptional Durability</Typography>
              <Typography sx={{ color: 'text.secondary', mb: 2 }}>
                Despite their soft cover, our bound books are built to last. With the capacity to encase up to approximately 500 pages, you can trust that your research will be securely protected for years to come. Our soft binding process ensures that your books withstand the test of time, preserving the integrity of your work for future generations to appreciate.
              </Typography>

              <Typography sx={{ fontWeight: 700, mb: 1 }}>Customization Options</Typography>
              <Typography sx={{ color: 'text.secondary', mb: 2 }}>
                At Dhar Brothers, we believe in giving you the freedom to express yourself. While we don't advise front board lettering for soft bound books, we offer a range of other customization options to make your book uniquely yours. From embossed lettering on the spine to decorative endpapers, you can add personal touches that enhance the aesthetic appeal of your bound book.
              </Typography>

              <Typography sx={{ fontWeight: 700, mb: 1 }}>Experience the Difference</Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                Experience the unparalleled quality and craftsmanship of Dhar Brothers' soft binding service for yourself. Trust us to transform your academic works into beautifully bound books that command attention and admiration.
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
