import React from 'react';
import { Box, Container, Grid, Typography, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import banner1 from 'assets/banner/banner1.jpg';
import banner2 from 'assets/banner/banner2.jpg';
import banner3 from 'assets/banner/banner3.jpg';
import { useState } from 'react';

// reuse header/footer pieces
import { HeaderNav, TopInfoBar, FooterSection } from './PlaceOrder';

const DEFAULT_SERVICES = [
  {
    id: 1,
    title: 'Hard Thesis Binding',
    shortDescription:
      "At Dhar Brothers, we understand the significance of presenting your thesis or dissertation in a manner that reflects the dedication and rigor you've invested in your work.",
    image: banner1
  },
  {
    id: 2,
    title: 'Soft Thesis Binding',
    shortDescription:
      'Soft binding is an art form that requires precision, care, and attention to detail. We offer reliable soft binding services for a professional finish.',
    image: banner2
  },
  {
    id: 3,
    title: 'Synopsis',
    shortDescription:
      'Our Synopsis Service condenses the essence of your research into a clear and concise document suitable for submissions and reviews.',
    image: banner3
  },
  {
    id: 4,
    title: 'Thesis Binding',
    shortDescription:
      'Dhar Brothers is proud to present Thesis on Demand, a convenient and streamlined service designed to simplify the process of thesis submission.',
    image: banner1
  }
];

export default function WhatWeDo() {
  const theme = useTheme();

  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [selectedService, setSelectedService] = useState(null);

  const handleOpen = (service) => setSelectedService(service);
  const handleClose = () => setSelectedService(null);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'common.white' }}>
      <TopInfoBar />
      <HeaderNav pageTitle="What We Do" hideOrderButton={false} />

      {/* Hero / Breadcrumb */}
      <Box component="section" sx={{ position: 'relative', height: { xs: 260, md: 320 }, overflow: 'hidden' }}>
        <Box component="img" src={banner3} alt="what-we-do-hero" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.35)' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, height: '100%' }}>
          <Stack sx={{ height: '100%' }} justifyContent="center" alignItems="center">
            <Typography sx={{ color: '#fff', fontSize: { xs: '1.6rem', md: '2.25rem' }, fontWeight: 600 }}>What We Do</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', mt: 1 }}>Home / What We Do</Typography>
          </Stack>
        </Container>
      </Box>

      {/* Services grid (static demo layout matching reference) */}
      <Container
  maxWidth="xl"
  sx={{
    py: { xs: 8, md: 12 },
    px: { xs: 3, md: 6 },
    bgcolor: '#f7f7f7'
  }}
>

        <Grid container spacing={4}>
          {services.map((card) => (
            <Grid item xs={12} sm={6} md={3} key={card.id}>
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ mb: 2 }}>
                  <Box component="img" src={card.image} alt={card.title} sx={{ width: '100%', height: { xs: 180, md: 200 }, objectFit: 'cover', display: 'block' }} />
                </Box>
                <Box sx={{ px: { xs: 0, md: 0 }, flex: 1 }}>
                  <Typography sx={{ fontFamily: 'serif', fontSize: { xs: '0.98rem', md: '1.02rem' }, fontWeight: 600, mb: 0.75 }}>{card.title}</Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.78rem', lineHeight: 1.85, mt: 1 }}>{card.shortDescription}</Typography>
                </Box>
                <Box sx={{ mt: 2.5, display: 'flex', justifyContent: 'center' }}>
                  <Box sx={{ width: '75%', height: 1, borderBottom: `2px dashed ${alpha(theme.palette.divider, 0.5)}`, position: 'relative' }}>
                    <Box sx={{ position: 'absolute', left: '50%', top: -18, transform: 'translateX(-50%)' }}>
                      <Box
                        component="button"
                        onClick={() => handleOpen(card)}
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          border: `2px dashed ${alpha(theme.palette.divider, 0.9)}`,
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: 'common.white',
                          cursor: 'pointer',
                          boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
                          transition: 'transform 150ms ease',
                          '&:hover': { transform: 'translateY(-3px)' }
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 12h14M13 5l6 7-6 7" stroke="#111827" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Service detail dialog */}
        <Dialog open={!!selectedService} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>{selectedService?.title}</DialogTitle>
          <DialogContent dividers>
            {selectedService && (
              <Box>
                <Box component="img" src={selectedService.image} alt={selectedService.title} sx={{ width: '100%', height: 260, objectFit: 'cover', mb: 2 }} />
                <Typography sx={{ color: 'text.secondary', whiteSpace: 'pre-line' }}>{selectedService.shortDescription}</Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>

      {/* Footer / subscribe */}
      <FooterSection />
    </Box>
  );
}
