import React from 'react';
import { Box, Container, Grid, Typography, Stack } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import banner3 from 'assets/banner/banner3.jpg';
import video1 from 'assets/videos/video-1.mp4';
import video2 from 'assets/videos/video-2.mp4';
import video3 from 'assets/videos/video-3.mp4';
import video4 from 'assets/videos/video-4.mp4';
import video5 from 'assets/videos/video-5.mp4';

// reuse header/footer pieces
import { HeaderNav, TopInfoBar, FooterSection } from './PlaceOrder';

function VideoPlayer({ src, alt }) {
  const theme = useTheme();

  return (
    <Box sx={{ position: 'relative', borderRadius: 1, overflow: 'hidden', boxShadow: theme.vars?.customShadows?.z1 || '0 1px 3px rgba(0,0,0,0.12)' }}>
      <Box
        component="video"
        src={src}
        controls
        sx={{
          width: '100%',
          height: { xs: 260, md: 360 },
          objectFit: 'contain',
          display: 'block',
          bgcolor: '#fff'
        }}
        aria-label={alt}
      />
    </Box>
  );
}

const SECTIONS = [
  {
    title: 'Digital Hard Thesis Binding',
    desc:
      'Digital Hard Thesis Binding: Digital hard thesis binding refers to a binding process where the cover of the thesis on dissertation features multiple colours, either through the use of different coloured materials or through printed design. This type of binding allows the documents to stand out and can be customised as per the author’s preferences. Besides the striking appearance, the binding maintains the durability and professional look of traditional hard binding, ensuring the proper protection of the document suitable for submission and long term storage.',
    video: video1
  },
  {
    title: 'Hard Binding with Jacket/Dust Cover',
    desc:
      'Hard Binding with JacketDust Cover In this binding process, there is a removable jacket-like cover that wraps around the hard-bound thesis. It can be customised with the title, author’s name, institution, logo, images and other relevant information. The jacket not only adds an extra layer of protection but also enhances its visual appearance. This jacket protects the hard cover from dust, scratches and other potential damage, keeping the thesis in pristine condition. Moreover, this binding offers the durability of hard binding with the added customisable and protective layer of a jacket, resulting in a professional and grander finished product.',
    video: video2
  },
  {
    title: 'Hard Binding',
    desc:
      'Hard Binding: Hard-bound books are rigid, durable for long-term storage and come with a premium finishing. These books have a hard cover, often made of cloth, synthetic or a similarly sturdy material, available in a wide variety of colours and lettering on the spine and arm can also house front-board lettering. This type of binding involves encasing up to approximately 500 pages, with its edges curved throughout. The cover typically comprises the title of the thesis, the author’s name and the year of submission. Hard binding is often preferred by the universities for the final submission as it ensures well protection and can withstand frequent handling over the passage of time.',
    video: video3
  },
  {
    title: 'Paperback Binding',
    desc: 'Paperback Binding: Paperback binding is used as temporary binding, but is strong and striking enough for a longer timeline. This kind of binding is used mainly for synopsis or pre-submission copy or any other ordinary report, comprising upto 300 pages.',
    video: video4
  },
  {
    title: 'Soft Binding',
    desc:
      'Soft Binding: Soft-board books are cut flush on the edge and are rigid enough to stand on a bookshelf, encasing up to approximately 500 pages. The covers of these books are made of cloth or synthetic materials available in a wide variety of colours and lettering on the spine along with front board.',
    video: video5
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

        <Box>
          {SECTIONS.map((section, idx) => (
            <Grid container spacing={6} alignItems="flex-start" key={section.title} sx={{ mb: 6 }}>
              {/* VIDEO (50%) */}
              <Grid item xs={12} md={6} sx={{ order: 1 }}>
                <VideoPlayer src={section.video} alt={section.title} />
              </Grid>

              {/* CONTENT (50%) */}
              <Grid
                item
                xs={12}
                md={6}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  pt: { xs: 2, md: 0 },
                  height: '100%'
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    fontSize: { xs: '1.6rem', md: '2rem' }
                  }}
                >
                  {section.title}
                </Typography>

                <Typography
                  sx={{
                    fontSize: '1rem',
                    lineHeight: 1.9,
                    color: 'text.secondary',
                    maxWidth: { xs: '100%', md: '560px' },
                    textAlign: 'left'
                  }}
                >
                  {section.desc}
                </Typography>
              </Grid>
            </Grid>
          ))}
        </Box>
      </Container>

      <FooterSection />
    </Box>
  );
}
