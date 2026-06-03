import React from 'react';
import { Box, Container, Grid, Typography, Paper, TextField, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import banner4 from 'assets/banner/banner4.jpg';
import { TopInfoBar, HeaderNav, FooterSection } from './PlaceOrder';

export default function Synopsis() {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'common.white' }}>
      <TopInfoBar />
      <HeaderNav pageTitle="What We Do" hideOrderButton={false} />

      {/* Hero */}
      <Box component="section" sx={{ position: 'relative', height: { xs: 160, md: 220 }, overflow: 'hidden' }}>
        <Box component="img" src={banner4} alt="synopsis-hero" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.35)' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, height: '100%' }}>
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <Box>
              <Typography sx={{ color: '#fff', fontSize: { xs: '1.6rem', md: '2.25rem' }, fontWeight: 600 }}>Synopsis</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', mt: 1 }}>Home / What We Do / Synopsis</Typography>
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
                At Dhar Brothers, we understand the importance of succinctly summarizing complex scholarly works. Our Synopsis Service offers a professional solution for condensing the essence of your research into a clear and concise format.
              </Typography>

              <Typography sx={{ fontWeight: 700, mb: 1 }}>Tailored Summaries for Academic Excellence</Typography>
              <Typography sx={{ color: 'text.secondary', mb: 2 }}>
                Our experienced team specializes in crafting synopsis summaries that capture the essence of your thesis, dissertation, or research paper. Whether you need a comprehensive overview or a focused abstract, we tailor our summaries to meet your specific requirements and academic standards.
              </Typography>

              <Typography sx={{ fontWeight: 700, mb: 1 }}>Clarity and Precision in Every Word</Typography>
              <Typography sx={{ color: 'text.secondary', mb: 2 }}>
                With meticulous attention to detail, we ensure that every word in our synopsis summaries contributes to a clear and coherent representation of your research. We prioritize clarity, precision, and accuracy, allowing readers to grasp the key concepts and findings of your work at a glance.
              </Typography>

              <Typography sx={{ fontWeight: 700, mb: 1 }}>Professional Presentation for Maximum Impact</Typography>
              <Typography sx={{ color: 'text.secondary', mb: 2 }}>
                A well-crafted synopsis can be a powerful tool for communicating the significance of your research to colleagues, peers, and stakeholders. Our Synopsis Service ensures that your summary is professionally presented, with attention to formatting, structure, and language to maximize its impact and effectiveness.
              </Typography>

              <Typography sx={{ fontWeight: 700, mb: 1 }}>Streamlined Process for Convenience</Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                Submitting your work for synopsis summarization is simple and straightforward with Dhar Brothers. Just provide us with the necessary details of your research, and our team will take care of the rest. We strive to deliver high-quality synopsis summaries in a timely manner, allowing you to focus on your academic pursuits with confidence.
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
