import React from 'react';
import { Box, Container, Grid, Typography, Stack } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import banner1 from 'assets/banner/banner1.jpg';
import banner2 from 'assets/banner/banner2.jpg';
import banner3 from 'assets/banner/banner3.jpg';
import { useEffect, useState } from 'react';
import { getPublicWebServices } from 'api/webServices';

// reuse header/footer pieces
import { HeaderNav, TopInfoBar, FooterSection } from './PlaceOrder';

export default function WhatWeDo() {
  const theme = useTheme();

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

  return (
    <Box className="what-we-do" sx={{ minHeight: '100vh', bgcolor: 'common.white' }}>
      <TopInfoBar />
      <HeaderNav pageTitle="What We Do" hideOrderButton={false} />

      {/* Hero / Breadcrumb */}
      <Box component="section" sx={{ position: 'relative', height: { xs: 180, md: 220 }, overflow: 'hidden' }}>
        <Box component="img" src={banner3} alt="what-we-do-hero" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.35)' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, height: '100%' }}>
          <Stack sx={{ height: '100%' }} justifyContent="center" alignItems="center">
            <Typography sx={{ color: '#fff', fontSize: { xs: '1.6rem', md: '2.25rem' }, fontWeight: 600 }}>What We Do</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', mt: 1 }}>Home / What We Do</Typography>
          </Stack>
        </Container>
      </Box>

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
            </Grid>
          </>
        )}
      </Container>

      {/* Footer / subscribe */}
      <FooterSection />
    </Box>
  );
}
