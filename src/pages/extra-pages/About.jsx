import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Typography, Paper, Stack, Button } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

import banner1 from 'assets/banner/banner1.jpg';
import banner2 from 'assets/banner/banner2.jpg';
import banner3 from 'assets/banner/banner3.jpg';
import avatar1 from 'assets/images/users/avatar-1.png';
import avatar2 from 'assets/images/users/avatar-4.png';
import avatar3 from 'assets/images/users/avatar-3.png';
import avatar4 from 'assets/images/users/avatar-4.png';

// reuse header/footer pieces
import { HeaderNav, TopInfoBar, FooterSection } from './PlaceOrder';

const testimonialsData = [
  { name: 'Suparna Biswas', initial: 'S', rating: 4, text: 'Best place for thesis biding, they are highly professional, very sincere to their work, service is really very good. Thank you Dhar brothers team.' },
  { name: 'sonai barman', initial: 's', rating: 5, text: "I'm really impressed. They are simply the best, very prompt service, specially in pandemic situation. They delivered book at my house, wow, speachless." },
  { name: 'Mr Mazician', initial: 'M', rating: 5, text: 'Very nice place for thesis printing. Very professional, systematic and with modern printing machines. All the staffs are knowledgeable and helpful.' },
  { name: 'Rakesh Das', initial: 'R', rating: 4, text: "It's one of the famous printing place in Kolkata. They are very professional. Any kind of binding and printing is done here." },
  { name: 'Akash bose', initial: 'A', rating: 5, text: 'The behavior of all the staff members is very friendly and polite. They are experts in editing, binding, printing your thesis.' },
  { name: 'Srijit Ghosh', initial: 'S', rating: 5, text: 'One of the best places for thesis binding. Their quality is top notch with on time delivery.' }
];

function TestimonialsSlider() {
  const [index, setIndex] = useState(0);
  const [perPage, setPerPage] = useState(3);

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w < 700) setPerPage(1);
      else if (w < 1100) setPerPage(2);
      else setPerPage(3);
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const slides = [];
  for (let i = 0; i < testimonialsData.length; i += perPage) {
    slides.push(testimonialsData.slice(i, i + perPage));
  }

  useEffect(() => {
    const t = setInterval(() => setIndex((s) => (s + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <Box>
      <Box sx={{ overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', transition: 'transform 450ms ease', width: `${slides.length * 100}%`, transform: `translateX(-${(index * 100) / slides.length}%)` }}>
          {slides.map((slide, sIdx) => (
            <Box key={sIdx} sx={{ width: `${100 / slides.length}%`, display: 'flex', gap: 3, px: 1, boxSizing: 'border-box' }}>
              {slide.map((t, i) => (
                <Paper key={i} elevation={0} sx={{ flex: 1, border: '1px solid #eee', p: 3, minHeight: 180 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                    <Box>
                      {Array.from({ length: 5 }).map((_, ii) => (
                        <Box key={ii} component="span" sx={{ color: ii < t.rating ? '#ffb400' : '#ddd', fontSize: 18, ml: 0.5 }}>★</Box>
                      ))}
                    </Box>
                  </Box>
                  <Typography sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 2, fontSize: '0.95rem' }}>{t.text}</Typography>
                  <Box sx={{ borderTop: '1px solid #eee', pt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: '#14a0a5', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700 }}>{t.initial}</Box>
                    <Typography sx={{ fontWeight: 700 }}>{t.name}</Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          ))}
        </Box>
      </Box>

      {/* dots */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 1 }}>
        {slides.map((_, i) => (
          <Box key={i} onClick={() => setIndex(i)} sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: i === index ? '#14a0a5' : '#000', opacity: i === index ? 1 : 0.25, cursor: 'pointer' }} />
        ))}
      </Box>
    </Box>
  );
}

export default function About() {
  const theme = useTheme();

  const StatsCard = ({ value, label, IconSvg }) => (
    <Box sx={{ position: 'relative', pt: 4, display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ position: 'absolute', top: 0, transform: 'translateY(-50%)' }}>
        <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#14a0a5', display: 'grid', placeItems: 'center', boxShadow: '0 6px 18px rgba(20,160,165,0.12)' }}>
          {IconSvg ? <IconSvg /> : null}
        </Box>
      </Box>

      <Paper elevation={1} sx={{ width: '100%', pt: 6, pb: 3, px: 2, textAlign: 'center', borderRadius: 1 }}>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</Typography>
        <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', mt: 1 }}>{label}</Typography>
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'common.white' }}>
      <TopInfoBar />
      <HeaderNav pageTitle="Order Thesis Online" hideOrderButton={false} />

      {/* Hero */}
      <Box component="section" sx={{ position: 'relative', height: { xs: 200, md: 220 }, overflow: 'hidden' }}>
        <Box component="img" src={banner3} alt="about-hero" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.35)' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, height: '100%' }}>
          <Stack sx={{ height: '100%' }} justifyContent="center" alignItems="center">
            <Typography sx={{ color: '#fff', fontSize: { xs: '1.6rem', md: '2.25rem' }, fontWeight: 600 }}>About Us</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', mt: 1 }}>Home / About Us</Typography>
          </Stack>
        </Container>
      </Box>

      {/* Main content - Who We Are with large left image and right text/stats */}
      <Box sx={{ bgcolor: 'common.white' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                <Box component="img" src={banner2} alt="books" sx={{ width: { xs: '80%', md: '100%' }, maxWidth: 520, borderRadius: 2, boxShadow: 6 }} />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography sx={{ fontFamily: 'serif', fontSize: { xs: '1.6rem', md: '2.25rem' }, fontWeight: 400, mb: 1 }}>Who We Are</Typography>
              <Box sx={{ width: 84, height: 3, bgcolor: '#14a0a5', mb: 3 }} />

              <Typography sx={{ color: 'text.secondary', fontSize: '0.95rem', lineHeight: 1.9, mb: 2 }}>
                We, Dhar Brothers, had a humble start back in the 1930s and today we take pride in saying that we have reached the pinnacle of thesis/dissertation composing, printing and binding. Our works have been submitted to all major universities around the globe. We have a happy customer base of over a thousand to our credit. We have an experience of more than 85 years in the thesis/dissertation printing and binding.
              </Typography>

              <Typography sx={{ color: 'text.secondary', fontSize: '0.95rem', lineHeight: 1.9, mb: 4 }}>
                We compete with the best in the world in terms of thesis printing and binding and our work has often been appreciated for being leagues ahead of our global competitors. We are currently trying to redefine the age-old practice of binding by skillfully balancing modern technology and human touch.
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <StatsCard
                    value="1930"
                    label="Year Since Established"
                    IconSvg={() => (
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 21V7a1 1 0 011-1h16v15" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M21 6h-6v4h6V6z" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <StatsCard
                    value="9"
                    label="Clients in How Many Countries/States/Cities"
                    IconSvg={() => (
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2v4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 18v4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M4.9 4.9l2.8 2.8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M16.3 16.3l2.8 2.8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <StatsCard
                    value="90"
                    label="Years/Hours of Experience of All Employee N"
                    IconSvg={() => (
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12a5 5 0 100-10 5 5 0 000 10z" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M21 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <StatsCard
                    value="500000"
                    label="Total units Sold"
                    IconSvg={() => (
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 1v22" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M17 5H9a4 4 0 000 8h6a4 4 0 010 8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Trust Scene 1930 */}
      <Box sx={{ py: { xs: 4, md: 6 }, bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <Typography sx={{ textAlign: 'center', fontSize: '1.6rem', fontFamily: 'serif', mb: 1 }}>Trust Scene 1930</Typography>
          <Box sx={{ width: 64, height: 3, bgcolor: '#14a0a5', mx: 'auto', mb: 4 }} />

          <Grid container spacing={4}>
            {[avatar1, avatar2, avatar3, avatar4].map((src, idx) => (
              <Grid key={idx} item xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    textAlign: 'center',
                    transition: 'transform 240ms ease, box-shadow 240ms ease',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.12)'
                    }
                  }}
                >
                  <Paper elevation={0} sx={{ p: 0, borderRadius: 2, overflow: 'hidden' }}>
                    <Box component="img" src={src} alt={`trust-${idx}`} sx={{ width: '100%', height: { xs: 260, md: 300 }, objectFit: 'cover', display: 'block' }} />
                  </Paper>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                    <Typography sx={{ mt: 1, fontSize: '0.98rem', fontWeight: 600 }}>{['Rashmohan Dhar','Hiralal Dhar','Mr. Kishore Dhar','Mr. Abhradip Dhar'][idx]}</Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: '1.15rem' }}>→</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Mission & Vision with full-width background and overlapping cards */}
      <Box
        sx={{
          position: 'relative',
          py: { xs: 6, md: 10 },
          backgroundImage: `url(${banner1})`,
          backgroundSize: 'cover',
          backgroundPosition: { xs: 'center', md: 'left center' }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center" sx={{ py: { xs: 2, md: 6 } }}>
              <Grid item xs={12} md={6}>
                {/* empty column to show left image */}
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', alignItems: 'stretch', px: { xs: 0, md: 4 } }}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: { xs: 4, md: 6 },
                      width: { xs: '100%', md: 440 },
                      textAlign: 'center',
                      borderRadius: 1,
                      boxShadow: '0 14px 50px rgba(0,0,0,0.12)',
                      transform: { md: 'translateX(-40px)' }
                    }}
                  >
                    <Typography sx={{ fontSize: { xs: '1.4rem', md: '1.9rem' }, fontWeight: 400, mb: 1 }}>Our Mission</Typography>
                    <Box sx={{ width: 64, height: 3, bgcolor: '#14a0a5', mx: 'auto', mb: 3 }} />
                    <Typography sx={{ color: 'text.secondary', mx: 'auto', maxWidth: 380, lineHeight: 1.9 }}>
                      Dhar Brothers' mission is to redefine printing and binding standards, ensuring scholars receive nothing but the best for their academic endeavours. With a legacy of innovation spanning generations, we are committed to delivering unparalleled quality and service.
                    </Typography>
                  </Paper>

                  <Paper
                    elevation={3}
                    sx={{
                      p: { xs: 4, md: 6 },
                      width: { xs: '100%', md: 440 },
                      textAlign: 'center',
                      borderRadius: 1,
                      boxShadow: '0 14px 50px rgba(0,0,0,0.08)',
                      transform: { md: 'translateX(-20px)' }
                    }}
                  >
                    <Typography sx={{ fontSize: { xs: '1.4rem', md: '1.9rem' }, fontWeight: 400, mb: 1 }}>Our Vision</Typography>
                    <Box sx={{ width: 64, height: 3, bgcolor: '#14a0a5', mx: 'auto', mb: 3 }} />
                    <Typography sx={{ color: 'text.secondary', mx: 'auto', maxWidth: 380, lineHeight: 1.9 }}>
                      Dhar Brothers' vision is to uphold its legacy of excellence in thesis/dissertation composing, printing, and binding. With over 85 years of experience, we strive to set global standards by blending traditional craftsmanship with modern technology.
                    </Typography>
                  </Paper>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>

      {/* Customer Saying / Testimonials slider */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <Typography sx={{ textAlign: 'center', fontSize: '1.5rem', fontFamily: 'serif', mb: 3 }}>Customer Saying</Typography>
          <Box sx={{ width: '100%', overflow: 'hidden', position: 'relative' }}>
            <TestimonialsSlider />
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <FooterSection />
    </Box>
  );
}
