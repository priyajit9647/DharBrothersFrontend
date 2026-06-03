import React from 'react';
import { Box, Container, Grid, Typography, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import banner4 from 'assets/banner/banner4.jpg';
import banner5 from 'assets/banner/banner5.jpg';
import banner6 from 'assets/banner/banner6.jpg';
import banner7 from 'assets/banner/banner7.jpg';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// reuse header/footer pieces
import { HeaderNav, TopInfoBar, FooterSection } from './PlaceOrder';

const DEFAULT_SERVICES = [
  {
    id: 1,
    title: 'Hard Thesis Binding',
    shortDescription:
      "At Dhar Brothers, we understand the significance of presenting your thesis or dissertation in a manner that reflects the dedication and rigor you've invested in your work.",
    image: banner4,
    path: '/what-we-do/hard-thesis-binding'
  },
  {
    id: 2,
    title: 'Soft Thesis Binding',
    shortDescription:
      'Soft binding is an art form that requires precision, care, and attention to detail. We offer reliable soft binding services for a professional finish.',
    image: banner5,
    path: '/what-we-do/soft-thesis-binding'
  },
  {
    id: 3,
    title: 'Synopsis',
    shortDescription:
      'Our Synopsis Service condenses the essence of your research into a clear and concise document suitable for submissions and reviews.',
    image: banner6,
    path: '/what-we-do/synopsis'
  },
  {
    id: 4,
    title: 'Thesis Binding',
    shortDescription:
      'Dhar Brothers is proud to present Thesis on Demand, a convenient and streamlined service designed to simplify the process of thesis submission.',
    image: banner7,
    path: '/what-we-do/thesis-binding'
  }
];

export default function WhatWeDo() {
  const theme = useTheme();
  const [services] = useState(DEFAULT_SERVICES);
  const navigate = useNavigate();

  return (
    <Box className="what-we-do" sx={{ minHeight: '100vh', bgcolor: 'common.white' }}>
      <TopInfoBar />
      <HeaderNav pageTitle="What We Do" hideOrderButton={false} />

      {/* Hero / Breadcrumb - align with other pages */}
      <Box
        component="section"
        sx={{
          position: 'relative',
          minHeight: { xs: 200, md: 260 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color: 'common.white',
          backgroundImage: `linear-gradient(0deg, rgba(27, 24, 20, 0.38), rgba(27, 24, 20, 0.38)), url(${banner7})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Stack justifyContent="center" alignItems="center" sx={{ py: 3 }}>
            <Typography sx={{ color: '#fff', fontSize: { xs: '1.6rem', md: '2.25rem' }, fontWeight: 600 }}>What We Do</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', mt: 1 }}>Home / What We Do</Typography>
          </Stack>
        </Container>
      </Box>

      {/* Services grid (static demo layout) */}
      <Container
        maxWidth="xl"
        sx={{
          py: { xs: 8, md: 12 },
          px: { xs: 3, md: 6 },
          bgcolor: '#f7f7f7'
        }}
      >
        <Grid container spacing={4} alignItems="stretch">
          {services.map((card) => (
            <Grid item xs={12} sm={6} md={6} lg={4} xl={3} key={card.id} sx={{ display: 'flex' }}>
              <Box
                onClick={() => navigate(card.path)}
                role="button"
                tabIndex={0}
                sx={{ display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer', outline: 'none' }}
              >
                <Box sx={{ mb: 2 }}>
                  <Box
                    component="img"
                    src={card.image}
                    alt={card.title}
                    sx={{
                      width: '100%',
                      aspectRatio: '4 / 3',
                      minHeight: { xs: 100, md: 120 },
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
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
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(card.path);
                        }}
                        aria-label={`Open ${card.title}`}
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

        {/* navigation handled via react-router; cards link to individual pages */}
      </Container>

      {/* Footer / subscribe */}
      <FooterSection />
    </Box>
  );
}