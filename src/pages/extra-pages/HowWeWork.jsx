import React from 'react';
import { Box, Container, Grid, Typography, Stack } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import banner1 from 'assets/banner/banner1.jpg';
import banner2 from 'assets/banner/banner2.jpg';
import banner3 from 'assets/banner/banner3.jpg';

// reuse header/footer pieces
import { HeaderNav, TopInfoBar, FooterSection } from './PlaceOrder';

function VideoThumb({ src, alt }) {
  const theme = useTheme();

  return (
    <Box sx={{ position: 'relative', borderRadius: 1, overflow: 'hidden', boxShadow: theme.vars?.customShadows?.z1 || '0 1px 3px rgba(0,0,0,0.12)' }}>
      <Box component="img" src={src} alt={alt} sx={{ width: '100%', height: { xs: 180, md: 220 }, objectFit: 'cover', display: 'block' }} />

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          pointerEvents: 'none'
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: 'rgba(0,0,0,0.45)',
            display: 'grid',
            placeItems: 'center',
            color: '#fff'
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5v14l11-7L8 5z" fill="#fff" />
          </svg>
        </Box>
      </Box>

      <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
        <Box sx={{ height: 8, bgcolor: alpha('#000', 0.18) }} />
      </Box>
    </Box>
  );
}

const SECTIONS = [
  {
    title: 'Digital Hard Thesis Binding',
    desc:
      'Digital Hard Thesis Binding: this kind of binding refers to a process where the cover of the thesis or dissertation features multiple colours, either through the use of different coloured materials or through printed design. It allows the documents to stand out and be customised as per the author\'s preferences.',
    img: banner1
  },
  {
    title: 'Hard Binding with Jacket/Dust Cover',
    desc:
      'Hard Binding with Jacket/Dust Cover: a removable jacket-like cover that wraps around the hard-bound thesis. It can be customised with the title, author\'s name, institution, logo and other relevant information.',
    img: banner2
  },
  {
    title: 'Hard Binding',
    desc:
      'Hard Binding: hard-bound books are rigid, durable for long-term storage and come with a premium finish. Preferred by universities for final submission, these bindings offer protection and a professional presentation.',
    img: banner3
  },
  {
    title: 'Paperback Binding',
    desc: 'Paperback Binding: used as temporary binding but is strong enough for a longer timeline, commonly used for synopsis or pre-submission copies.',
    img: banner1
  },
  {
    title: 'Soft Binding',
    desc:
      'Soft Binding: soft-board books are cut flush on the edge and are rigid enough to stand on a bookshelf, available in a variety of covers and lettering styles.',
    img: banner2
  }
];

export default function HowWeWork() {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'common.white' }}>
      <TopInfoBar />
      <HeaderNav pageTitle="How We Work" hideOrderButton={false} />

      <Box component="section" sx={{ position: 'relative', height: { xs: 160, md: 220 }, overflow: 'hidden' }}>
        <Box component="img" src={banner3} alt="how-we-work-hero" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.35)' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, height: '100%' }}>
          <Stack sx={{ height: '100%' }} justifyContent="center" alignItems="center">
            <Typography sx={{ color: '#fff', fontSize: { xs: '1.6rem', md: '2.25rem' }, fontWeight: 600 }}>How We Work</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', mt: 1 }}>Home / How We Work</Typography>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography sx={{ textAlign: 'center', fontSize: { xs: '1.4rem', md: '1.9rem' }, fontWeight: 700, mb: 4 }}>How We Work</Typography>

        <Box>
          {SECTIONS.map((section, idx) => (
            <Grid container spacing={4} alignItems="center" key={section.title} sx={{ mb: 6 }}>
              <Grid item xs={12} md={6} sx={{ order: idx % 2 === 0 ? 1 : 2 }}>
                <VideoThumb src={section.img} alt={section.title} />
              </Grid>

              <Grid item xs={12} md={6} sx={{ order: idx % 2 === 0 ? 2 : 1 }}>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, mb: 1 }}>{section.title}</Typography>
                <Typography sx={{ color: 'text.secondary', lineHeight: 1.9 }}>{section.desc}</Typography>
              </Grid>
            </Grid>
          ))}
        </Box>
      </Container>

      <FooterSection />
    </Box>
  );
}
