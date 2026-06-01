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

<<<<<<< HEAD
  const FALLBACK_SERVICES = [
    { id: 'f1', title: 'Hard Thesis Binding', shortDescription: 'Premium hard binding using traditional craftsmanship for lasting presentation.', image: banner1, displayOrder: 1, active: true },
    { id: 'f2', title: 'Soft Thesis Binding', shortDescription: 'Economical and elegant soft binding suitable for quick submissions.', image: banner2, displayOrder: 2, active: true },
    { id: 'f3', title: 'Synopsis', shortDescription: 'Professional synopsis formatting and printing to university standards.', image: banner3, displayOrder: 3, active: true },
    { id: 'f4', title: 'Thesis Printing', shortDescription: 'High-quality thesis printing with careful finishing and binding options.', image: banner1, displayOrder: 4, active: true }
  ];

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');

    (async () => {
      try {
        const data = await getPublicWebServices();
        const normalized = Array.isArray(data)
          ? data
              .map((item, idx) => ({
                id: item.id ?? item.serviceId ?? idx + 1,
                title: item.title || item.name || 'Untitled',
                shortDescription: item.shortDescription || item.description || '',
                image: item.image || item.design || null,
                displayOrder: item.displayOrder ?? item.order ?? idx,
                active: item.active === undefined ? true : !!item.active
              }))
              .filter((s) => s.active)
              .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
          : [];

        if (mounted) setServices(normalized.length ? normalized : FALLBACK_SERVICES);
      } catch (e) {
        // Log detailed error for debugging, but show a friendly message to users
        // eslint-disable-next-line no-console
        console.error('Failed to load public web services:', e);
        if (mounted) {
          // Show fallback content instead of an error message so the page remains useful
          setServices(FALLBACK_SERVICES);
          setError('');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);
=======
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [selectedService, setSelectedService] = useState(null);

  const handleOpen = (service) => setSelectedService(service);
  const handleClose = () => setSelectedService(null);
>>>>>>> 866f2eaab69e3b571a26ff19933a78d14792ce36

  return (
    <Box className="what-we-do" sx={{ minHeight: '100vh', bgcolor: 'common.white' }}>
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

<<<<<<< HEAD
      {/* Services grid */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 12 }, bgcolor: 'common.white' }}>
        <Typography sx={{ textAlign: 'center', fontSize: { xs: '1.6rem', md: '1.9rem' }, fontWeight: 700, mb: 4 }}>What We Do</Typography>

        {loading ? (
          <Grid container>
            <Grid item xs={12}>
              <Typography sx={{ color: 'text.secondary', textAlign: 'center' }}>Loading services...</Typography>
            </Grid>
          </Grid>
        ) : error ? (
          <Grid container>
            <Grid item xs={12}>
              <Typography color="error" sx={{ textAlign: 'center' }}>{error}</Typography>
            </Grid>
          </Grid>
        ) : services.length === 0 ? (
          <Grid container>
            <Grid item xs={12}>
              <Typography sx={{ color: 'text.secondary', textAlign: 'center' }}>No services configured yet.</Typography>
            </Grid>
          </Grid>
        ) : (
          <>
            <Grid container spacing={4}>
              {services.map((card, idx) => {
                const src = card.image
                  ? String(card.image).startsWith('http') || String(card.image).startsWith('data:')
                    ? card.image
                    : `data:image/*;base64,${card.image}`
                  : banner1;

                return (
                  <Grid item xs={12} sm={6} md={3} key={card.id || idx}>
                    <Box className="service-card">
                      <Box component="img" className="service-image" src={src} alt={card.title} />

                      <Box className="service-content">
                        <Typography className="service-title">{card.title}</Typography>
                        <Typography className="service-desc">{card.shortDescription}</Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Box className="service-line">
                          <Box sx={{ position: 'absolute', left: '50%', top: -20, transform: 'translateX(-50%)' }}>
                            <Box component="button" aria-label={`more-${idx}`} className="service-arrow">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 12h14M13 5l6 7-6 7" stroke="#111827" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
=======
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
>>>>>>> 866f2eaab69e3b571a26ff19933a78d14792ce36
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
