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

        if (mounted) setServices(normalized);
      } catch (e) {
        if (mounted) setError(e.message || 'Failed to load services');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'common.white' }}>
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
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 }, bgcolor: 'common.white' }}>
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
            {/* Row 1: Images */}
            <Grid container spacing={4} alignItems="stretch" sx={{ mb: 2 }}>
              {services.map((card, idx) => {
                const src = card.image
                  ? String(card.image).startsWith('http') || String(card.image).startsWith('data:')
                    ? card.image
                    : `data:image/*;base64,${card.image}`
                  : banner1;

                return (
                  <Grid item xs={12} sm={6} md={3} key={`img-${card.id || idx}`}>
                    <Box component="img" src={src} alt={card.title} sx={{ width: '100%', height: { xs: 160, md: 220 }, objectFit: 'cover', display: 'block', borderRadius: 0 }} />
                  </Grid>
                );
              })}
            </Grid>

            {/* Row 2: Titles */}
            <Grid container spacing={4} sx={{ mb: 1 }}>
              {services.map((card, idx) => (
                <Grid item xs={12} sm={6} md={3} key={`title-${card.id || idx}`}>
                  <Typography sx={{ fontFamily: 'serif', fontSize: { xs: '1rem', md: '1.05rem' }, fontWeight: 600, mb: 1 }}>{card.title}</Typography>
                </Grid>
              ))}
            </Grid>

            {/* Row 3: Descriptions */}
            <Grid container spacing={4} sx={{ mb: 2 }}>
              {services.map((card, idx) => (
                <Grid item xs={12} sm={6} md={3} key={`desc-${card.id || idx}`}>
                  <Typography sx={{ color: 'text.secondary', fontSize: { xs: '0.9rem', md: '0.95rem' }, lineHeight: 1.85 }}>{card.shortDescription}</Typography>
                </Grid>
              ))}
            </Grid>

            {/* Row 4: Dashed arrow buttons */}
            <Grid container spacing={4}>
              {services.map((card, idx) => (
                <Grid item xs={12} sm={6} md={3} key={`arrow-${card.id || idx}`}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Box sx={{ width: '70%', height: 1, borderBottom: `2px dashed ${theme.palette.divider}`, position: 'relative' }}>
                      <Box sx={{ position: 'absolute', left: '50%', top: -20, transform: 'translateX(-50%)' }}>
                        <Box
                          component="button"
                          aria-label={`more-${idx}`}
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            border: `2px dashed ${theme.palette.divider}`,
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: 'common.white',
                            cursor: 'pointer',
                            boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
                            transition: 'transform 150ms ease',
                            '&:hover': { transform: 'translateY(-3px)' }
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12h14M13 5l6 7-6 7" stroke="#111827" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>

      {/* Footer / subscribe */}
      <FooterSection />
    </Box>
  );
}
